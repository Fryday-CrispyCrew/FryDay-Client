import { ScrollView, View } from 'react-native';
import AppText from '../../../shared/components/AppText';
import ReportTotalCard from './ReportTotalCard';

export default function ReportTotalSection({
                                               total,
                                               completed,
                                               failed,
                                           }) {
    return (
        <>
            <AppText variant="M500" className="text-gr500 px-5">
                누적 튀김 현황
            </AppText>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
            <View className="flex-row gap-3 px-5 mt-4">
                    <ReportTotalCard type="total" count={total} />
                    <ReportTotalCard type="completed" count={completed} />
                    <ReportTotalCard type="failed" count={failed} />
                </View>
            </ScrollView>
        </>
    );
}
