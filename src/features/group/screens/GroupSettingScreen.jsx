import React, { useMemo, useRef, useState } from "react";
import { ScrollView, Share, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import AppText from "../../../shared/components/AppText";
import PageHeader from "../../../shared/components/PageHeader";
import SettingSection from "../components/SettingSection";
import SettingRow from "../components/SettingRow";
import SettingToggle from "../components/SettingToggle";
import GroupInviteCard from "../components/GroupInviteCard";
import { useModalStore } from "../../../shared/stores/modal/modalStore";
import { toast } from "../../../shared/components/toast/CenterToast";
import { groupApi } from "../api/groupApi";
import { useGroupQuery, useGroupNotificationQuery, useGroupMutation } from "../queries/groupQueries";
import GroupQueryState from "../components/GroupQueryState";
import colors from "../../../shared/styles/colors";

const GROUP_MAX_MEMBERS = 10;

/**
 * 그룹 관리(설정) 페이지.
 * - 그룹 정보: 이름/코드/복사/공유 (그룹장은 이름 tap → 편집)
 * - 그룹 설정: 알림 토글 + 공개 카테고리 설정
 * - 하단: 그룹 삭제(그룹장) / 그룹 나가기(그룹원) → 모달 확인 → 토스트 + 홈 이동
 *
 */
export default function GroupSettingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const openModal = useModalStore((s) => s.open);

  const groupId = route.params?.groupId;
  const query = useGroupQuery(groupId);
  const notificationQuery = useGroupNotificationQuery(groupId);
  const updateNotification = useGroupMutation(groupApi.updateNotification);
  const removeGroup = useGroupMutation(groupApi.deleteGroup);
  const leaveGroup = useGroupMutation(groupApi.leaveGroup);
  const group = query.data;
  const isLeader = group?.myRole === "OWNER";
  const groupName = group?.name ?? "";
  const groupCode = group?.inviteCode ?? "";
  const current = group?.memberCount ?? 0;
  const max = group?.maxMemberCount ?? GROUP_MAX_MEMBERS;
  const isFull = current >= max;
  const alarmOn = notificationQuery.data?.enabled ?? false;
  const [copied, setCopied] = useState(false);
  const publicText = `${group?.myPublicCategoryCount ?? 0}개 공개`;
  const removingRef = useRef(false);
  const changingNotificationRef = useRef(false);

  const handleToggleNotification = async (enabled) => {
    if (changingNotificationRef.current || !notificationQuery.isSuccess) return;
    changingNotificationRef.current = true;
    try {
      await updateNotification.mutateAsync({ groupId, enabled });
      await notificationQuery.refetch();
    } catch {
      // 공통 API 오류 토스트 사용. 실패 시 서버 설정을 그대로 표시한다.
    } finally {
      changingNotificationRef.current = false;
    }
  };

  const handleRemove = async () => {
    if (removingRef.current) return;
    removingRef.current = true;
    try {
      await (isLeader ? removeGroup : leaveGroup).mutateAsync(groupId);
      navigateToHomeWithToast(isLeader ? `${groupName} 그룹을 삭제했어요` : `${groupName} 그룹에서 나왔어요`);
    } catch {
      // 실패 시 현재 화면 유지.
    } finally {
      removingRef.current = false;
    }
  };

  const inviteText = useMemo(
    () => `우리 같이 할 일 같이 튀겨볼래?\n그룹 코드 : ${groupCode}`,
    [groupCode],
  );

  const handlePressName = () => {
    navigation.navigate("GroupNameEdit", { groupId, currentName: groupName });
  };

  const handleCopy = async () => {
    if (isFull) return;
    try {
      // lazy require - 네이티브 모듈 미링크 부팅 크래시 방지
      // eslint-disable-next-line global-require
      const Clipboard = require("expo-clipboard");
      await Clipboard.setStringAsync(inviteText);
      setCopied(true);
      toast.show("초대 문구를 복사했어요", { position: "center" });
      // 잠시 후 라벨 원복
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.show("복사에 실패했어요. 다시 시도해주세요", { position: "center" });
    }
  };

  const handleShare = async () => {
    if (isFull) return;
    try {
      await Share.share({ message: inviteText });
    } catch {
      // 유저 취소는 무시
    }
  };

  const handleOpenCategorySelect = () => {
    navigation.navigate("GroupCategorySelect", {
      groupId,
      mode: "setting",
    });
  };

  const handleDangerPress = () => {
    if (isLeader) {
      openModal({
        title: "확인",
        description: "그룹을 삭제하면 모든 그룹원이 내보내져요.\n정말 그룹을 삭제할까요?",
        showClose: true,
        closeOnBackdrop: true,
        buttons: [
          { label: "아니요, 그룹을 유지할래요", variant: "primary" },
          {
            label: "그룹을 삭제할래요",
            variant: "outline",
            onPress: handleRemove,
          },
        ],
      });
    } else {
      openModal({
        title: "확인",
        description: "그룹에서 나갈까요?",
        showClose: true,
        closeOnBackdrop: true,
        buttons: [
          { label: "아니요, 그룹에 머무를래요", variant: "primary" },
          {
            label: "그룹에서 나갈래요",
            variant: "outline",
            onPress: handleRemove,
          },
        ],
      });
    }
  };

  const navigateToHomeWithToast = (message) => {
    navigation.popToTop?.();
    // 홈 이동 후 토스트 (약간 delay 로 화면 전환 이후 노출)
    setTimeout(() => {
      toast.show(message, { position: "center", duration: 2000 });
    }, 250);
  };

  if (query.isPending || query.isError) return (
    <SafeAreaView className="bg-gr flex-1" edges={["top"]}>
      <PageHeader title="그룹 관리" showBackButton />
      <GroupQueryState query={query} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="bg-gr flex-1" edges={["top"]}>
      <PageHeader title="그룹 관리" showBackButton />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 그룹 정보 */}
        <SettingSection label="그룹 정보" style={{ marginTop: 4 }}>
          <GroupInviteCard
            groupName={groupName}
            current={current}
            max={max}
            code={groupCode}
            isLeader={isLeader}
            isFull={isFull}
            copied={copied}
            onPressName={handlePressName}
            onCopy={handleCopy}
            onShare={handleShare}
          />
        </SettingSection>

        {/* 그룹 설정 */}
        <SettingSection label="그룹 설정" style={{ marginTop: 24 }}>
          <View
            style={{
              backgroundColor: colors.wt,
              borderRadius: 16,
              paddingHorizontal: 4,
              borderWidth: 1,
              borderColor: colors.gr100,
            }}
          >
            <SettingRow
              title="그룹 알림"
              trailing={<SettingToggle value={alarmOn} onToggle={handleToggleNotification} disabled={!notificationQuery.isSuccess || updateNotification.isPending || notificationQuery.isFetching} />}
            />
            {notificationQuery.isError && <GroupQueryState query={notificationQuery} />}
            <View style={{ height: 1, backgroundColor: colors.gr100, marginHorizontal: 12 }} />
            <SettingRow
              title="공개 카테고리 설정"
              trailingText={publicText}
              showChevron
              onPress={handleOpenCategorySelect}
            />
          </View>
        </SettingSection>

        {/* 삭제/나가기 (마지막) */}
        <SettingSection style={{ marginTop: 24 }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDangerPress}
            disabled={removeGroup.isPending || leaveGroup.isPending}
            style={{
              backgroundColor: colors.wt,
              borderRadius: 16,
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: colors.gr100,
            }}
          >
            <AppText variant="M500" className="text-gr700">
              {isLeader ? "그룹 삭제하기" : "그룹 나가기"}
            </AppText>
          </TouchableOpacity>
        </SettingSection>
      </ScrollView>
    </SafeAreaView>
  );
}
