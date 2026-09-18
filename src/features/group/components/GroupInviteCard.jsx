import React, { useState } from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import AppText from "../../../shared/components/AppText";
import ChevronIcon from "../../../shared/components/ChevronIcon";
import colors from "../../../shared/styles/colors";

/**
 * 그룹 관리 페이지 최상단 정보 카드.
 * Figma:
 * - card: padding 16(v)/20(h), gap 16, radius 16, bg WT
 * - 그룹명 XL500 BK (그룹장은 우측 chevron)
 * - "그룹원" M500 GR500 + 카운트 M600 OR
 * - 그룹 코드 박스: padding 12(v) 0(h), align-self stretch, "그룹 코드" L500 GR500 / 코드 H1 OR
 * - 복사/공유 버튼: gap 12, align-self stretch
 *   - 복사 pressed: bg GR200
 *   - 공유 pressed: bg OR-DO (#DC582B)
 * - isFull(최대인원 도달): 코드/버튼 disabled + 에러 M500
 */
export default function GroupInviteCard({
  groupName,
  current = 0,
  max = 10,
  code,
  isLeader = false,
  isFull = false,
  copied = false,
  onPressName,
  onCopy,
  onShare,
}) {
  const NameRow = (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "stretch",
      }}
    >
      <AppText
        variant="XL500"
        className="text-bk"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{ flexShrink: 1 }}
      >
        {groupName}
      </AppText>
      {isLeader ? (
        <ChevronIcon
          direction="right"
          size={16}
          color={colors.gr500}
          strokeWidth={2}
        />
      ) : null}
    </View>
  );

  return (
    <View
      style={{
        alignSelf: "stretch",
        backgroundColor: colors.wt,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 16,
      }}
    >
      {/* 상단: 그룹명 + 그룹원 카운트 (isFull 이면 안내 문구까지) */}
      <View style={{ alignSelf: "stretch", gap: 4 }}>
        {isLeader && onPressName ? (
          <Pressable onPress={onPressName} hitSlop={4}>
            {NameRow}
          </Pressable>
        ) : (
          NameRow
        )}

        {/* 그룹원 카운트 or 최대 안내 (에러 색상) */}
        {isFull ? (
          <AppText variant="M500" className="text-red-500">
            최대 그룹원 수에 도달하여 더이상 초대할 수 없어요
          </AppText>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <AppText variant="M500" className="text-gr500">
              그룹원{" "}
            </AppText>
            <AppText variant="M600" style={{ color: colors.or }}>
              {current}
            </AppText>
            <AppText variant="M500" className="text-gr500">
              /{max}
            </AppText>
          </View>
        )}
      </View>

      {/* 그룹 코드 박스 */}
      <View
        style={{
          alignSelf: "stretch",
          paddingVertical: 12,
          paddingHorizontal: 0,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.gr100,
          borderRadius: 16,
          opacity: isFull ? 0.5 : 1,
        }}
      >
        <AppText variant="L500" className="text-gr500">
          그룹 코드
        </AppText>
        <AppText
          variant="H1"
          style={{
            color: isFull ? colors.gr500 : colors.or,
            marginTop: 4,
          }}
        >
          {code}
        </AppText>
      </View>

      {/* 복사 / 공유 버튼 */}
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, alignSelf: "stretch" }}>
        <CopyButton disabled={isFull} onPress={onCopy} copied={copied} />
        <ShareButton disabled={isFull} onPress={onShare} />
      </View>
    </View>
  );
}

/**
 * 복사하기 버튼. 눌렀을 때 배경 gr200.
 * disabled 시 gray-out.
 * (Pressable style-function 이 이 프로젝트 세팅에서 무시되는 케이스가 있어서
 *  TouchableOpacity + onPressIn/Out state 로 대체.)
 */
function CopyButton({ disabled, onPress, copied }) {
  const [pressed, setPressed] = useState(false);
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      activeOpacity={1}
      style={{
        flex: 1,
        height: 48,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: disabled ? colors.gr200 : colors.or,
        backgroundColor: disabled
          ? colors.wt
          : pressed
          ? colors.gr200
          : colors.wt,
        justifyContent: "center",
        alignItems: "center",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <AppText
        variant="L600"
        style={{ color: disabled ? colors.gr500 : colors.or }}
      >
        {copied ? "복사됨" : "복사하기"}
      </AppText>
    </TouchableOpacity>
  );
}

/**
 * 공유하기 버튼. 눌렀을 때 배경 or-do (다크 오렌지).
 * disabled 시 gray-out.
 */
function ShareButton({ disabled, onPress }) {
  const [pressed, setPressed] = useState(false);
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      activeOpacity={1}
      style={{
        flex: 1,
        height: 48,
        borderRadius: 16,
        backgroundColor: disabled
          ? colors.gr200
          : pressed
          ? colors.do
          : colors.or,
        justifyContent: "center",
        alignItems: "center",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <AppText
        variant="L600"
        style={{ color: disabled ? colors.gr500 : colors.wt }}
      >
        공유하기
      </AppText>
    </TouchableOpacity>
  );
}
