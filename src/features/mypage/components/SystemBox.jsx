import {View} from "react-native";
import AppText from "../../../shared/components/AppText";

export default function SystemBox({title, content}) {
    return(
        <View className="py-3 gap-2">
            <AppText variant="M500" className="text-gr500">
                {title}
            </AppText>
            <AppText variant="M400" className="text-bk">
                {content}
            </AppText>
        </View>
    )
}