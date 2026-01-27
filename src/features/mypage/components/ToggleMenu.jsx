import React, {useState} from "react";
import {View, Pressable} from "react-native";
import AppText from "../../../shared/components/AppText";

export default function ToggleMenu({title, content}) {
    const [on, setOn] = useState(false);

    return (
        <View className="py-3 gap-2">
            <View className="flex-row justify-between items-center">
            <View>
                <AppText variant="L500" className="text-bk">
                    {title}
                </AppText>
                <AppText variant="S500" className="text-gr500">
                    {content}
                </AppText>
            </View>

            <Pressable
                onPress={() => setOn(!on)}
                className={`w-12 h-7 rounded-full px-1 justify-center ${
                    on ? "bg-or" : "bg-gr300"
                }`}
            >
                <View
                    className={`w-5 h-5 rounded-full bg-white ${
                        on ? "self-end" : "self-start"
                    }`}
                />
            </Pressable>
            </View>
        </View>
    );
}
