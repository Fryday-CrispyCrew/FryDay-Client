import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppText from '../../../shared/components/AppText';
import Arrow from '../../report/assets/svg/ArrowLeft.svg';

export default function MyPageHeader({ showBackButton = false, title }) {
    const navigation = useNavigation();

    return (
        <View className="h-20 px-5 py-4 flex-row items-center">
            {showBackButton ? (
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="flex-row items-center"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Arrow width={14} height={14} />
                    <AppText variant="H3" className="text-bk ml-2">
                        {title}
                    </AppText>
                </TouchableOpacity>
            ) : (
                <AppText variant="H3" className="text-bk">
                    {title}
                </AppText>
            )}
        </View>
    );
}
