import {
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    View,
    Pressable,
    Keyboard,
} from 'react-native';
import React, { useRef, useState } from 'react';
import MyPageHeader from '../../components/MypageHeader';
import AppText from '../../../../shared/components/AppText';
import EditIcon from '../../assets/svg/Edit.svg';
import MyPageMenu from '../../components/MypageMenu';
import CheckIcon from '../../assets/svg/Check.svg';

export default function EditProfile() {
    const [nickName, setNickName] = useState('수정');
    const [draftNickName, setDraftNickName] = useState('수정');
    const [email] = useState('hamsj2413@naver.com');
    const [birth] = useState('2004-12-25');

    const formattedBirth = birth.replace(
        /(\d{4})-(\d{2})-(\d{2})/,
        '$1년 $2월 $3일'
    );

    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef(null);

    const finishEdit = () => {
        const v = draftNickName.trim();

        if (v.length >= 2 && v !== nickName) {
            setNickName(v);              // 유효 -> 저장
        }
        setIsEditing(false);
        Keyboard.dismiss();
    };


    return (
        <SafeAreaView className="bg-gr flex-1">
            <Pressable
                className="flex-1"
                onPress={() => {
                    if (isEditing) {
                        finishEdit();
                    } else {
                        Keyboard.dismiss();
                    }
                }}
            >
            <MyPageHeader showBackButton title="계정 설정" />

                <View className="gap-8">
                    <View className="px-5 gap-2">
                        <AppText variant="M500" className="text-gr500">
                            사용자 정보
                        </AppText>

                        <View className="bg-wt rounded-xl px-5 py-4">
                            {isEditing ? (
                                <View className="flex-row justify-between items-center mb-3">
                                    <TextInput
                                        ref={inputRef}
                                        value={draftNickName}
                                        onChangeText={setDraftNickName}
                                        maxLength={10}
                                        autoFocus
                                        onBlur={() => {finishEdit()}}
                                        className="text-[16px] text-bk flex-1"
                                        style={{
                                            height: 24,
                                            paddingVertical: 0,
                                            paddingHorizontal: 0,
                                            textAlignVertical: 'center',
                                            fontWeight: '500',
                                        }}
                                    />

                                    {draftNickName !== nickName && draftNickName.trim().length >= 2 &&
                                        nickName.length >= 2 && (
                                            <TouchableOpacity
                                                activeOpacity={0.5}
                                                onPress={finishEdit}
                                            >
                                                <CheckIcon width={18} height={18} />
                                            </TouchableOpacity>

                                        )}
                                </View>
                            ) : (
                                <View
                                    className="flex-row justify-between items-center mb-3">
                                    <AppText variant="XL500" className="text-bk">
                                        {nickName} 님
                                    </AppText>

                                    <TouchableOpacity
                                        activeOpacity={0.5}
                                        onPress={() => {
                                            setDraftNickName(nickName);
                                            setIsEditing(true);
                                        }}
                                    >
                                        <EditIcon width={24} height={24} />
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View className="h-[1px] bg-gr100" />

                            <View className="gap-1 mt-3">
                                <View className="flex-row gap-1">
                                    <AppText variant="M400" className="text-bk50">
                                        가입 메일
                                    </AppText>
                                    <AppText variant="M400" className="text-bk75">
                                        {email}
                                    </AppText>
                                </View>

                                <View className="flex-row gap-1">
                                    <AppText variant="M400" className="text-bk50">
                                        생년월일
                                    </AppText>
                                    <AppText variant="M400" className="text-bk75">
                                        {formattedBirth}
                                    </AppText>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View className="px-5">
                        <View className="bg-wt rounded-xl px-5">
                            {/*<MyPageMenu*/}
                            {/*    menuTitle="로그아웃"*/}
                            {/*    onPress={() => setModalType('logout')}*/}
                            {/*/>*/}
                            <View className="h-[1px] bg-gr100" />
                            {/*<MyPageMenu*/}
                            {/*    menuTitle="계정 삭제"*/}
                            {/*    onPress={() => setModalType('delete')}*/}
                            {/*/>*/}
                        </View>
                    </View>
                </View>
            </Pressable>
        </SafeAreaView>
    );
}
