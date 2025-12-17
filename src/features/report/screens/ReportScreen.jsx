import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';

import ReportHeader from '../components/ReportHeader';
import ReportHeroCard from '../components/ReportHeroCard';

export default function ReportScreen() {
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [caseType, setCaseType] = useState('A');


    // 임시 더미
    useEffect(() => {
        const year = currentDate.year();
        const month = currentDate.month() + 1;

        if (year === 2025 && month === 11) {
            setCaseType('A');
        } else if (year === 2025 && month === 12) {
            setCaseType('B');
        } else {
            setCaseType('C');
        }
    }, [currentDate]);


    return (
        <SafeAreaView className="flex-1 bg-wt">
            <ReportHeader
                currentDate={currentDate}
                onChangeMonth={setCurrentDate}
                joinedAt="2025-10-03"
            />

            <ReportHeroCard
                caseType={caseType}
                nickname="연우"
            />
        </SafeAreaView>
    );
}
