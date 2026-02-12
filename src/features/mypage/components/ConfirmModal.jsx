import React, { useMemo } from "react";
import {
  Modal,
  Pressable,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import AppText from "../../../shared/components/AppText";
import CloseIcon from "../assets/svg/Close.svg";

export default function ConfirmModal({
  visible,
  onClose,
  message,
  primaryText,
  onPrimary,
  secondaryText,
  onSecondary,
  maxWidth = 420,
}) {
  const { width } = useWindowDimensions();

  const cardW = useMemo(() => {
    const w = width - 40; // px-5랑 동일(좌우 20)
    return Math.min(maxWidth, w);
  }, [width, maxWidth]);

  const buttonW = useMemo(() => {
    return cardW - 48; // px-6 내부 패딩(좌우 24*2)
  }, [cardW]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-bk/50 px-5"
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          className="bg-wt rounded-3xl overflow-hidden"
          style={{ width: cardW }}
        >
          <View className="px-6 pt-7 pb-6">
            <View className="flex-row items-center justify-between">
              <View style={{ width: 20, height: 20 }} />
              <AppText variant="H3" className="text-bk">
                확인
              </AppText>
              <TouchableOpacity
                hitSlop={10}
                activeOpacity={0.7}
                onPress={onClose}
              >
                <CloseIcon width={20} height={20} />
              </TouchableOpacity>
            </View>

            <View className="h-px bg-gr100 mt-4" />

            <AppText
              variant="L500"
              className="text-gr700 text-center mt-6"
              style={{ lineHeight: 20 }}
            >
              {message}
            </AppText>

            {secondaryText ? (
              <View className="gap-3 mt-6 items-center">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onSecondary}
                  className="bg-bk rounded-2xl py-4 items-center"
                  style={{ width: buttonW }}
                >
                  <AppText variant="L500" className="text-wt">
                    {secondaryText}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onPrimary}
                  className="border border-bk rounded-2xl py-4 items-center"
                  style={{ width: buttonW }}
                >
                  <AppText variant="L500" className="text-bk">
                    {primaryText}
                  </AppText>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onPrimary}
                className="bg-bk rounded-2xl py-4 items-center mt-6 self-center"
                style={{ width: buttonW }}
              >
                <AppText variant="L500" className="text-wt">
                  {primaryText}
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
