import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppText from '../../../shared/components/AppText';
import Arrow from '../../report/assets/svg/ArrowLeft.svg';

export default function MyPageHeader({
                                         showBackButton = false,
                                         title = '',
                                     }) {
    const navigation = useNavigation();

    return (
        <View className="h-20 px-5 py-4 flex-row items-center">
            {showBackButton ? (
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-2">
                    <Arrow width={16} height={16} />
                </TouchableOpacity>
            ) : (
                <View />
            )}

            <AppText variant="H3" className="text-bk">
                {title}
            </AppText>
        </View>
    );
}
