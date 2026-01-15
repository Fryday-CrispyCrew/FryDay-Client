import React, { useMemo, useRef, useState } from 'react';
import {
    TextInput,
    TouchableOpacity,
    View,
    Pressable,
    Keyboard,
    Modal,
    useWindowDimensions,
    Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import MyPageHeader from '../../components/MypageHeader';
import AppText from '../../../../shared/components/AppText';
import EditIcon from '../../assets/svg/Edit.svg';
import MyPageMenu from '../../components/MypageMenu';
import CheckIcon from '../../assets/svg/Check.svg';
import ErrorIcon from '../../assets/svg/Error.svg';
import CloseIcon from '../../assets/svg/Close.svg';

export default function EditProfile() {
    const { width } = useWindowDimensions();

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

    const [modalType, setModalType] = useState(null); // 'logout' | 'delete' | null

    const [nicknameError, setNicknameError] = useState(null);

    const NICKNAME_MAX = 10;

    const takenNicknames = useMemo(() => new Set(['김닉네임', 'test']), []);

    const checkNicknameDuplicate = (v) => {
        return takenNicknames.has(v);
    };

    const validateNickname = (raw) => {
        const v = raw.trim();

        if (!v || v === nickName || v.length < 2) return null;
        if (v.length > NICKNAME_MAX) return 'tooLong';
        if (checkNicknameDuplicate(v)) return 'duplicate';

        return null;
    };


    const errorMessage = useMemo(() => {
        if (nicknameError === 'duplicate') return '이미 사용중인 닉네임이에요';
        if (nicknameError === 'tooLong') return '닉네임은 한/영문/숫자 10자까지 입력 가능해요';
        return '';
    }, [nicknameError]);


    const trimmed = draftNickName.trim();
    const isChanged = trimmed && trimmed !== nickName;
    const isNeutral = !isChanged || trimmed.length < 2;
    const isError = !isNeutral && !!nicknameError;
    const isValid = !isNeutral && !nicknameError;

    const finishEdit = () => {
        const err = validateNickname(draftNickName);

        if (err) {
            setNicknameError(err);
            setDraftNickName(nickName);
            setIsEditing(false);
            Keyboard.dismiss();
            return;
        }

        if (isValid) {
            setNickName(trimmed);
        } else {
            setDraftNickName(nickName);
        }

        setNicknameError(null);
        setIsEditing(false);
        Keyboard.dismiss();
    };

    const startEdit = () => {
        setDraftNickName(nickName);
        setNicknameError(null);
        setIsEditing(true);

        requestAnimationFrame(() => {
            inputRef.current?.focus?.();
        });
    };

    const onChangeNickname = (text) => {
        setDraftNickName(text);
        setNicknameError(validateNickname(text));
    };

    const containerWidth = Math.min(width - 40, 520);

    return (
        <SafeAreaView className="bg-gr flex-1" edges={['top', 'bottom']}>
            <Pressable
                className="flex-1"
                onPress={() => {
                    if (isEditing) finishEdit();
                    else Keyboard.dismiss();
                }}
            >
                <MyPageHeader showBackButton title="계정 설정" />

                <View className="gap-8">
                    <View className="px-5 gap-2">
                        <View className="flex-row justify-between items-center">
                            <AppText variant="M500" className="text-gr500">
                                사용자 정보
                            </AppText>

                            <View style={{ minWidth: 190, alignItems: 'flex-end' }}>
                                {isEditing && isError ? (
                                    <AppText variant="S400" className="text-red-500">
                                        {errorMessage}
                                    </AppText>
                                ) : null}
                            </View>
                        </View>


                        <View
                            className="bg-wt rounded-xl px-5 py-4 self-center"
                            style={{
                                width: containerWidth,
                                borderWidth: 1,
                                borderColor: isEditing && isError ? '#F97316' : 'transparent',
                            }}
                        >

                        {isEditing ? (
                                <View className="flex-row justify-between items-center mb-3">
                                    <TextInput
                                        ref={inputRef}
                                        value={draftNickName}
                                        onChangeText={onChangeNickname}
                                        maxLength={12}
                                        autoFocus
                                        onBlur={finishEdit}
                                        returnKeyType="done"
                                        onSubmitEditing={finishEdit}
                                        className="text-[16px] text-bk flex-1"
                                        style={{
                                            minHeight: 22,
                                            paddingVertical: 0,
                                            paddingHorizontal: 0,
                                            textAlignVertical: 'center',
                                            fontWeight: '500',
                                            ...(Platform.OS === 'android'
                                                ? { includeFontPadding: false }
                                                : null),
                                        }}
                                    />

                                    {isError ? (
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            hitSlop={10}
                                            onPress={() => {
                                                setDraftNickName(nickName);
                                                setNicknameError(null);
                                                inputRef.current?.focus?.();
                                            }}
                                        >
                                            <ErrorIcon width={18} height={18} />
                                        </TouchableOpacity>
                                    ) : null}

                                    {isValid ? (
                                        <TouchableOpacity
                                            activeOpacity={0.5}
                                            onPress={finishEdit}
                                            style={{ marginLeft: 10 }}
                                        >
                                            <CheckIcon width={18} height={18} />
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            ) : (
                                <View className="flex-row justify-between items-center mb-3">
                                    <AppText variant="XL500" className="text-bk">
                                        {nickName} 님
                                    </AppText>

                                    <TouchableOpacity activeOpacity={0.5} onPress={startEdit}>
                                        <EditIcon width={20} height={20} />
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View className="h-[1px] bg-gr100" />

                            <View className="gap-1 mt-3">
                                <View className="flex-row gap-1 flex-wrap">
                                    <AppText variant="M400" className="text-bk50">
                                        가입 메일
                                    </AppText>
                                    <AppText variant="M400" className="text-bk75">
                                        {email}
                                    </AppText>
                                </View>

                                {/*<View className="flex-row gap-1">*/}
                                {/*    <AppText variant="M400" className="text-bk50">*/}
                                {/*        생년월일*/}
                                {/*    </AppText>*/}
                                {/*    <AppText variant="M400" className="text-bk75">*/}
                                {/*        {formattedBirth}*/}
                                {/*    </AppText>*/}
                                {/*</View>*/}
                            </View>
                        </View>
                    </View>

                    <View className="px-5">
                        <View className="bg-wt rounded-xl px-5">
                            <MyPageMenu
                                menuTitle="로그아웃"
                                onPress={() => setModalType('logout')}
                            />
                            <View className="h-[1px] bg-gr100" />
                            <MyPageMenu
                                menuTitle="계정 삭제"
                                onPress={() => setModalType('delete')}
                            />
                        </View>
                    </View>
                </View>
            </Pressable>

            <Modal transparent visible={modalType !== null} animationType="fade">
                <View className="flex-1 items-center justify-center bg-bk/40 px-5">
                    <View
                        className="w-full bg-wt rounded-3xl overflow-hidden"
                        style={{ maxWidth: 420 }}
                    >
                        <View className="px-6 pt-7 pb-6">
                            <View className="flex-row items-center justify-between">
                                <View style={{ width: 20, height: 20 }} />
                                <AppText variant="H3" className="text-bk text-center">
                                    확인
                                </AppText>
                                <TouchableOpacity
                                    hitSlop={10}
                                    activeOpacity={0.7}
                                    onPress={() => setModalType(null)}
                                >
                                    <CloseIcon width={20} height={20} />
                                </TouchableOpacity>
                            </View>

                            <View className="h-px bg-gr100 mt-4" />

                            {/* 본문 */}
                            <AppText variant="M500" className="text-gr500 text-center mt-6">
                                {modalType === 'logout'
                                    ? 'FryDay에서 로그아웃하시겠어요?'
                                    : modalType === 'delete'
                                        ? '모든 데이터가 삭제되며 복구할 수 없어요\n정말 계정을 삭제하시겠어요?'
                                        : ''}
                            </AppText>

                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                    if (modalType === 'logout') {
                                        setModalType(null);
                                        // TODO: logout();
                                        return;
                                    }

                                    if (modalType === 'delete') {
                                        setModalType(null);
                                        // TODO: deleteAccount();
                                    }
                                }}
                                className="bg-bk rounded-2xl py-4 items-center mt-6"
                            >
                                <AppText variant="L600" className="text-wt">
                                    {modalType === 'logout'
                                        ? '네, 로그아웃 할래요'
                                        : modalType === 'delete'
                                            ? '네, 삭제할래요'
                                            : ''}
                                </AppText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>



        </SafeAreaView>
    );
}
