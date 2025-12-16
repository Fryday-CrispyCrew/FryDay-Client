import { StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import ReportHeader from "../components/ReportHeader";
import dayjs from 'dayjs';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReportHeroCard from "../components/ReportHeroCard";

export default function ReportScreen(){

    const [currentDate, setCurrentDate] = useState(dayjs());

    return (
        <SafeAreaView className="flex-1 bg-wt">
            <ReportHeader
                currentDate={currentDate}
                onChangeMonth={setCurrentDate}
            />
            <ReportHeroCard
                caseType="A" // A | B | C
                nickname="연우"
            />
        </SafeAreaView>
  )
}