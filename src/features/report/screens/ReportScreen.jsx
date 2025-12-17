import React, {useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';

import ReportHeader from '../components/ReportHeader';
import ReportHeroCard from '../components/ReportHeroCard';
import ReportTotalSection from '../components/ReportTotalSection';

const REPORT_DUMMY = {
    '2025-11': { caseType: 'A', total: 96, completed: 90, failed: 6 },
    '2025-12': { caseType: 'B', total: 40, completed: 33, failed: 7 },
};

export default function ReportScreen() {
    const [currentDate, setCurrentDate] = useState(dayjs());

    const key = useMemo(() => currentDate.format('YYYY-MM'), [currentDate]);
    const report = REPORT_DUMMY[key] ?? { caseType: 'C', total: 0, completed: 0, failed: 0 };

    return (
        <SafeAreaView className="flex-1 bg-wt">
            <ReportHeader
                currentDate={currentDate}
                onChangeMonth={setCurrentDate}
                joinedAt="2025-10-03"
            />

            <ReportHeroCard caseType={report.caseType} nickname="연우" />

            <ReportTotalSection
                total={report.total}
                completed={report.completed}
                failed={report.failed}
            />
        </SafeAreaView>
    );
}
