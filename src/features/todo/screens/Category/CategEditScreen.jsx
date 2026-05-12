import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CategoryHeader from "../../components/Category/CategoryHeader";
import AppText from "../../../../shared/components/AppText";
import ChevronIcon from "../../../../shared/components/ChevronIcon";
import ClearIcon from "../../../../shared/assets/svg/Clear.svg";
import CheckIcon from "../../assets/svg/category/Check.svg";
import colors from "../../../../shared/styles/colors";

import { useModalStore } from "../../../../shared/stores/modal/modalStore";
import { useCreateCategoryMutation } from "../../queries/category/useCreateCategoryMutation";
import { useUpdateCategoryMutation } from "../../queries/category/useUpdateCategoryMutation";
import { useDeleteCategoryMutation } from "../../queries/category/useDeleteCategoryMutation";
import { queryClient } from "../../../../shared/lib/queryClient";
import { categoryKeys } from "../../queries/category/categoryKeys";

const MAX_NAME_LEN = 12;

const COLOR_OPTIONS = [
  colors.or,
  colors.br,
  colors.lg,
  colors.vl,
  colors.dp,
  colors.cb,
  colors.mb,
  colors.mt,
  colors.pk,
];

const COLOR_CODE_MAP = {
  [colors.or]: "OR",
  [colors.br]: "BR",
  [colors.lg]: "LG",
  [colors.vl]: "VL",
  [colors.dp]: "DP",
  [colors.cb]: "CB",
  [colors.mb]: "MB",
  [colors.mt]: "MT",
  [colors.pk]: "PK",
};

export default function CategEditScreen({ navigation, route }) {
  const mode = route?.params?.mode ?? "create";
  const editingCategory = route?.params?.category ?? null;
  const categoryCount = route?.params?.categoryCount ?? 0;

  const isEdit = mode === "edit";

  const [name, setName] = useState(
    isEdit ? (editingCategory?.label ?? editingCategory?.name ?? "") : "",
  );
  const [selectedColor, setSelectedColor] = useState(
    isEdit
      ? (editingCategory?.color ?? editingCategory?.colorHex ?? null)
      : null,
  );
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const openModal = useModalStore((s) => s.open);

  const { mutate: createCategory, isPending: isCreating } =
    useCreateCategoryMutation({
      onSuccess: async () => {
        await queryClient.refetchQueries({ queryKey: categoryKeys.list() });
        navigation.goBack();
      },
    });

  const { mutate: updateCategory, isPending: isUpdating } =
    useUpdateCategoryMutation({
      onSuccess: async () => {
        await queryClient.refetchQueries({ queryKey: categoryKeys.list() });
        navigation.goBack();
      },
    });

  const { mutate: deleteCategory, isPending: isDeleting } =
    useDeleteCategoryMutation({
      onSuccess: async () => {
        await queryClient.refetchQueries({ queryKey: categoryKeys.list() });
        navigation.goBack();
      },
    });

  const helperText = useMemo(
    () => `카테고리 이름은 ${MAX_NAME_LEN}자까지 입력할 수 있어요`,
    [],
  );

  const isSubmitEnabled =
    (name?.trim?.() ?? "").length > 0 && selectedColor != null;

  const onChangeName = (text) => {
    setName(text.slice(0, MAX_NAME_LEN));
  };

  const onPressSave = () => {
    if (!isSubmitEnabled || isUpdating) return;

    const colorCode = COLOR_CODE_MAP[selectedColor];

    // console.log("카테고리 수정 요청", {
    //   categoryId: editingCategory?.id,
    //   name: name.trim(),
    //   length: name.trim().length,
    //   color: colorCode,
    // });

    updateCategory({
      categoryId: editingCategory?.id,
      name: name.trim(),
      color: colorCode,
    });
  };

  const onPressCreate = () => {
    if (!isSubmitEnabled || isCreating) return;

    const colorCode = COLOR_CODE_MAP[selectedColor];

    // console.log("카테고리 생성 요청", {
    //   name: name.trim(),
    //   length: name.trim().length,
    //   color: colorCode,
    // });

    createCategory({
      name: name.trim(),
      color: colorCode,
    });
  };

  const onPressDelete = () => {
    openModal({
      title: "카테고리 삭제하기",
      description:
        "카테고리에 속한 모든 투두가 함께 삭제돼요!\n정말 카테고리를 삭제할까요?",
      closeOnBackdrop: true,
      showClose: true,
      primary: {
        label: "네, 삭제할래요",
        variant: "outline",
        onPress: () => {
          if (isDeleting) return;

          if (categoryCount <= 1) {
            setTimeout(() => {
              openModal({
                title: "알림",
                description: "카테고리는 최소 1개를 유지해야 해요!",
                closeOnBackdrop: true,
                showClose: true,
                primary: {
                  label: "확인했어요",
                  variant: "primary",
                  onPress: () => {},
                },
              });
            }, 0);
            return;
          }

          deleteCategory({
            categoryId: editingCategory?.id,
          });
        },
      },
      secondary: {
        label: "아니요, 그만 둘래요",
        variant: "outline",
        onPress: () => {},
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        // behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="px-5">
          <CategoryHeader
            variant={isEdit ? "edit" : "create"}
            onPressBack={() => navigation?.goBack?.()}
          />
        </View>

        <View className="flex-1 px-5 pt-1.5">
          <AppText variant="L600" style={styles.sectionTitle}>
            이름
          </AppText>

          <View className="mt-3 h-12 flex-row items-center rounded-2xl bg-white px-3">
            <TextInput
              value={name}
              onChangeText={onChangeName}
              placeholder="카테고리 이름을 입력해 주세요"
              placeholderTextColor={colors?.gr300 ?? "#BDBDBD"}
              style={styles.input}
              returnKeyType="done"
              maxLength={MAX_NAME_LEN}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
            />

            {!!name?.length && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setName("")}
                hitSlop={10}
                className="ml-2 h-7 w-7 items-center justify-center rounded-full"
              >
                <ClearIcon
                  width={18}
                  height={18}
                  color={colors?.gr300 ?? "#C4C4C3"}
                />
              </TouchableOpacity>
            )}
          </View>

          <AppText variant="S400" style={styles.helperText}>
            {helperText}
          </AppText>

          <View style={{ height: 26 }} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsColorOpen((prev) => !prev)}
          >
            <View className="mt-[18px] flex-row items-center justify-between">
              <AppText variant="L600" style={styles.sectionTitle}>
                컬러
              </AppText>

              <View className="flex-row items-center h-8">
                <View
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: selectedColor ?? "transparent",
                    },
                  ]}
                />
                <View style={{ width: 8 }} />
                <ChevronIcon
                  direction={isColorOpen ? "up" : "down"}
                  size={18}
                  color={colors?.gr500 ?? "#8A8989"}
                  strokeWidth={2}
                />
              </View>
            </View>
          </TouchableOpacity>

          {isColorOpen && (
            <View className="mt-3 flex-row flex-wrap justify-between py-4">
              {COLOR_OPTIONS.map((c) => {
                const isSelected = c === selectedColor;

                return (
                  <TouchableOpacity
                    key={c}
                    activeOpacity={0.8}
                    onPress={() => {
                      Keyboard.dismiss();
                      setSelectedColor(c);
                    }}
                    className="mb-12 w-[30%] items-center"
                  >
                    <View style={[styles.paletteDot, { backgroundColor: c }]}>
                      {isSelected && <CheckIcon width={15} height={12} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.bottomArea}>
          {isEdit ? (
            <>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPressSave}
                disabled={!isSubmitEnabled || isUpdating}
                style={[
                  styles.submitBtn,
                  (!isSubmitEnabled || isUpdating) && styles.submitBtnDisabled,
                ]}
              >
                {isUpdating ? (
                  <ActivityIndicator />
                ) : (
                  <AppText
                    variant="L600"
                    style={[
                      styles.submitText,
                      !isSubmitEnabled && styles.submitTextDisabled,
                    ]}
                  >
                    변경사항 저장하기
                  </AppText>
                )}
              </TouchableOpacity>

              <View style={{ height: 12 }} />

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPressDelete}
                disabled={isDeleting}
                style={styles.deleteBtn}
              >
                <AppText variant="L600" style={styles.deleteText}>
                  카테고리 삭제하기
                </AppText>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onPressCreate}
              disabled={!isSubmitEnabled || isCreating}
              style={[
                styles.submitBtn,
                (!isSubmitEnabled || isCreating) && styles.submitBtnDisabled,
              ]}
            >
              {isCreating ? (
                <ActivityIndicator />
              ) : (
                <AppText
                  variant="L600"
                  style={[
                    styles.submitText,
                    !isSubmitEnabled && styles.submitTextDisabled,
                  ]}
                >
                  추가하기
                </AppText>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: {
    flex: 1,
    backgroundColor: colors.gr,
  },

  sectionTitle: {
    color: colors?.bk ?? "#141312",
  },

  input: {
    flex: 1,
    fontFamily: "Pretendard-Medium",
    fontSize: 14,
    lineHeight: 18,
    color: colors?.bk ?? "#111111",
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },

  helperText: {
    marginTop: 8,
    color: colors?.gr500 ?? "#8A8989",
  },

  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 100,
    overflow: "hidden",
  },

  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: colors.gr,
  },

  submitBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.bk,
    alignItems: "center",
    justifyContent: "center",
  },

  submitBtnDisabled: {
    backgroundColor: colors.gr200,
  },

  submitText: {
    color: colors.wt,
  },

  submitTextDisabled: {
    color: colors.gr300,
  },

  paletteDot: {
    width: 36,
    height: 36,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.wt,
    borderWidth: 1,
    borderColor: colors.bk,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteText: {
    color: colors.bk,
  },
});
