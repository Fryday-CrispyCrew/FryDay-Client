import { View, Dimensions } from 'react-native';
import AppText from '../../../shared/components/AppText';

const { width } = Dimensions.get('window');
const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function WeekdayHeader() {
    return (
        <View style={{ width }}>
            <View className="flex-row px-5 mt-3">
                {DAYS.map((d, i) => (
                    <View key={d} className="flex-1 items-center">
                        <AppText
                            variant="S500"
                            className={[
                                i === 0 && 'text-[rgba(255,77,79,0.75)]',
                                i === 6 && 'text-[rgba(64,169,255,0.75)]',
                                i !== 0 && i !== 6 && 'text-gr700',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            {d}
                        </AppText>
                    </View>
                ))}
            </View>
        </View>
    );
}
