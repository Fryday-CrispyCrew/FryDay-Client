import React, {useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';

import ReportHeader from '../components/ReportHeader';
import ReportHeroCard from '../components/ReportHeroCard';
import ReportTotalSection from '../components/ReportTotalSection';
import ReportCategoryCard from "../components/ReportCategoryCard";
import {ScrollView} from "react-native";

const REPORT_DUMMY = {
    '2025-11': {
        caseType: 'A',
        categories: [
            { name: '카테고리', success: 90, total: 100, fail: 10 },
            { name: '운동', success: 40, total: 100, fail: 60 },
            { name: '공부', success: 50, total: 100, fail: 50 },
            { name: '카테고리0000', success: 90, total: 100, fail: 10 },
            { name: '생활', success: 30, total: 100, fail: 70 },
        ],
    },

    '2025-12': {
        caseType: 'B',
        categories: [
            { name: '운동', success: 20, total: 50, fail: 30 },
            // { name: '불닭', success: 90, total: 100, fail: 10 },
            // { name: '졸려', success: 50, total: 100, fail: 50 },
        ],
    },

};


export default function ReportScreen() {
    const [currentDate, setCurrentDate] = useState(dayjs());

    const key = useMemo(() => currentDate.format('YYYY-MM'), [currentDate]);
    const report = REPORT_DUMMY[key] ?? {
        caseType: 'C',
        categories: [],
    };


    const totals = report.categories.reduce(
        (acc, cur) => {
            acc.total += cur.total;
            acc.completed += cur.success;
            acc.failed += cur.fail;
            return acc;
        },
        { total: 0, completed: 0, failed: 0 }
    );


    return (
        <SafeAreaView className="flex-1 bg-wt">
            <ReportHeader
                currentDate={currentDate}
                onChangeMonth={setCurrentDate}
                joinedAt="2025-10-03"
            />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >

            <ReportHeroCard caseType={report.caseType} nickname="연우" />

            <ReportTotalSection
                total={totals.total}
                completed={totals.completed}
                failed={totals.failed}
            />
            <ReportCategoryCard data={report.categories} />
            </ScrollView>
        </SafeAreaView>
    );
}
