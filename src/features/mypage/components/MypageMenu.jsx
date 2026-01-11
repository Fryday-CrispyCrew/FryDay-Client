import {TouchableOpacity, View} from "react-native";
import AppText from "../../../shared/components/AppText";
import Arrow from "../assets/svg/MenuArrow.svg"
import {useNavigation} from "@react-navigation/native";


export default function MyPageMenu({ menuTitle, to, onPress}) {
    const navigation = useNavigation();
    const handlePress = () => {
        if(onPress){
            onPress();
            return;
        }
        if(to){
            navigation.navigate(to);
        }
    }

    return(
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.5}>
        <View className="h-12 py-3 flex-row justify-between">
            <AppText variant="M500" className="text-gr700">
                {menuTitle}
            </AppText>
            <View>
                <Arrow width={16} height={16}/>
            </View>
        </View>
        </TouchableOpacity>
    );
}