import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import AppText from '../../../../shared/components/AppText';
import MyPageHeader from '../../components/MypageHeader';
import SystemBox from '../../components/SystemBox';

const SYSTEM_NOTICE_MOCK = {
    title: '2000.00.00',
    content: '어쩌구 저쩌구 어쩌구 저쩌구 어쩌구 저쩌구 어쩌구 저쩌구 어쩌구 저쩌구 어쩌구 저쩌구',
};

export default function SystemNotice() {
    return (
        <SafeAreaView className="flex-1 bg-gr">
            <MyPageHeader showBackButton title="공지 사항" />

            <View className="px-5 gap-4">
                <SystemBox
                    title={SYSTEM_NOTICE_MOCK.title}
                    content={SYSTEM_NOTICE_MOCK.content}
                />
                <SystemBox
                    title={SYSTEM_NOTICE_MOCK.title}
                    content={SYSTEM_NOTICE_MOCK.content}
                />
            </View>
        </SafeAreaView>
    );
}
