import {View} from "react-native";
import AppText from "../../../shared/components/AppText";

export default function SystemBox({title, content}) {
    const paragraphs = String(content ?? "").split("\n\n");

    return(
        <View className="py-3 px-5 gap-2">
            <AppText variant="M500" className="text-gr500">
                {title}
            </AppText>
            {paragraphs.map((p, i) => (
                <AppText key={i} variant="L400" className="text-bk leading-6">
                    {p}
                </AppText>
            ))}
        </View>
    )
}