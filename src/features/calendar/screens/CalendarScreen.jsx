import React, { useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import dayjs from 'dayjs';

import CalendarHeader from '../components/CalendarHeader';
import WeekdayHeader from '../components/WeekdayHeader';
import MonthView from './Month/MonthView';
import WeekSlider from './Week/WeekSlider';
import AppText from '../../../shared/components/AppText';
import Dotted from '../assets/svg/Dotted.svg';

export default function CalendarScreen() {
    const [mode, setMode] = useState('month'); // 'week' | 'month'
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [selectedDate, setSelectedDate] = useState(dayjs());

    const handlePressToday = () => {
        const today = dayjs();

        if (mode === 'week') {
            setCurrentDate(today);
            setSelectedDate(today);
        } else {
            setCurrentDate(today.startOf('month'));
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-wt">
            <CalendarHeader
                date={currentDate}
                onPressButton={() =>
                    setMode(m => (m === 'week' ? 'month' : 'week'))
                }
                onPressToday={handlePressToday}
            />

            <WeekdayHeader />

            <View className="shrink-0">
                {mode === 'week' ? (
                    <>
                        <WeekSlider
                            currentDate={currentDate}
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                            onChangeDate={setCurrentDate}
                        />
                        {/* 구분선 */}
                        <View className="mt-3 mx-5">
                            <Dotted width="100%" height={1} />
                        </View>

                        {/* 임시 */}
                        <View className="mt-[18px] items-center">
                            <AppText variant="M500" className="text-bk">
                                {selectedDate.format('M월 D일')}
                            </AppText>

                        </View>
                    </>


                ) : (
                    <MonthView
                        currentDate={currentDate}
                        onChangeDate={setCurrentDate}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
