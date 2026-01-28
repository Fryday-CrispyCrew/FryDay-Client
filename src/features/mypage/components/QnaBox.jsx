import React, { useState } from "react";
import { View, Pressable } from "react-native";
import AppText from "../../../shared/components/AppText";
import ChevronDown from "../assets/svg/ArrowDown.svg";

export default function QnaBox({ title, content, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <View className="w-full flex-col items-start gap-2">

            <Pressable
                onPress={() => setOpen((v) => !v)}
                className="self-stretch rounded-2xl flex-row items-center justify-between py-3"
                hitSlop={10}
            >
                <View className="flex-1 flex-row items-start gap-1 pr-2">
                    <AppText variant="L500" className="text-or">
                        Q
                    </AppText>

                    <View className="flex-1">
                        <AppText
                            variant="L400"
                            className="text-gr700 flex-1"
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >
                            {title}
                        </AppText>
                    </View>
                </View>

                <View
                    className="w-4 h-4 items-center justify-center shrink-0"
                    style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
                >
                    <ChevronDown width={12} height={12} />
                </View>
            </Pressable>

            {open && (
                <View className="self-stretch p-3 bg-wt rounded-lg">
                    <AppText variant="L500" className="text-bk leading-5">
                        {content}
                    </AppText>
                </View>
            )}
        </View>
    );
}
