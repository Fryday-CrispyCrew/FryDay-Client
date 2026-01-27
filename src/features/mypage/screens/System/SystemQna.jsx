import { SafeAreaView } from "react-native-safe-area-context";
import MyPageHeader from "../../components/MypageHeader";
import { ScrollView, View } from "react-native";
import React from "react";
import QnaBox from "../../components/QnaBox";

const SYSTEM_NOTICE_MOCK = [
    {
        title: "FryDay는 어떤 서비스인가요?",
        content:
            "FryDay는 할 일을 ‘튀김’에 비유해, 미루지 않고\n정해진 시간 안에 완료하도록 도와주는 투두 서비스예요.",
    },
    {
        title: "튀김은 어떻게 튀기나요?",
        content:
            "매일 00시, 새로운 할 일을 추가하면 튀김 반죽이 생성돼요.\n24시간 안에 할 일을 완료하면 바삭한 튀김이 완성되고,\n시간 안에 완료하지 못하면 튀김이 까맣게 타 버린답니다.",
    },
    {
        title: "카테고리는 어디서 관리하나요?",
        content:
            "FryDay에서는 최대 6개의 카테고리를 사용할 수 있어요!\n홈 화면에 빈 자리가 있으면 새 카테고리 버튼으로\n추가할 수 있고, 카테고리가 6개 모두 찬 경우에는\n홈 화면 우측 상단 버튼을 통해 카테고리 관리 페이지로 이동할 수 있어요.\n이 페이지에서 카테고리 순서 변경, 이름 수정, 삭제가 가능해요.",
    },
    {
        title: "투두를 수정할 수 있나요?",
        content:
            "투두를 클릭하면 바텀시트에서 다음 기능을 사용할 수 있어요.\n · 메모 추가\n · 알림 설정\n · 반복 설정\n\n투두를 왼쪽으로 스와이프하면 다음 기능을 사용할 수 있어요.\n · 삭제\n · 어제 못 한 투두를 오늘로 옮기는 오늘 하기 기능",
    },
    {
        title: "알림이 오지 않아요!",
        content:
            "기기 알림 설정과 FryDay의 알림 권한을 확인해주세요.\nFryDay 설정 페이지에서 알림 설정 상태를 확인할 수 있습니다.",
    },
    {
        title: "문제가 해결되지 않아요!",
        content:
            " · 간단한 문의 · 빠른 답변\n→ 공식 인스타그램 @fryday.official\n\n ·  버그 제보 · 자세한 설명\n→ 공식 이메일 fryday.makers@gmail.com\n버그 제보 시 캡처 이미지와 함께 메일로 보내주시면 빠르게 확인하고 대응하겠습니다.",
    },
];

export default function SystemQna() {
    return (
        <SafeAreaView className="flex-1 bg-gr" edges={["top", "bottom"]}>
            <MyPageHeader showBackButton title="자주 묻는 질문" />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 48 }}
            >
                <View className="px-5 gap-4">
                    {SYSTEM_NOTICE_MOCK.map((item, idx) => (
                        <QnaBox key={idx} title={item.title} content={item.content} />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
