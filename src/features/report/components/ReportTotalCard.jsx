import React, { useMemo } from 'react';
import { View, useWindowDimensions } from 'react-native';
import AppText from '../../../shared/components/AppText';

import TotalSvg from '../assets/svg/Total.svg';
import CompletedSvg from '../assets/svg/Completed.svg';
import FailedSvg from '../assets/svg/Failed.svg';

const CARD_META = {
    total: {
        title: '일단 가보자고!\n추가한 모든 튀김 수',
        Svg: TotalSvg,
        bg: 'bg-or',
        titleColor: 'text-wt',
        valueColor: 'text-wt',
        iconPosition: 'bottom',
    },
    completed: {
        title: '바삭바삭!\n완벽하게 구워낸 튀김 수',
        Svg: CompletedSvg,
        bg: 'bg-wt',
        titleColor: 'text-gr700',
        valueColor: 'text-gr900',
        iconPosition: 'bottom',
    },
    failed: {
        title: '아차차...\n아쉽게 태운 튀김 수',
        Svg: FailedSvg,
        bg: 'bg-wt',
        titleColor: 'text-gr700',
        valueColor: 'text-gr900',
        iconPosition: 'top',
    },
};

export default function ReportTotalCard({ type, count }) {
    const { width } = useWindowDimensions();

    const cardW = useMemo(() => {
        const w = width * 0.38;
        return Math.max(144, Math.min(160, w));
    }, [width]);

    const cardH = 140;

    const { title, Svg, bg, titleColor, valueColor, iconPosition } = CARD_META[type];

    const ICON_OFFSET = {
        total: { x: -4, y: 8 },
        completed: { x: -6, y: -6 },
        failed: { x: 8, y: -8 },
    };

    const formatCount = (n) => {
        if (n >= 10000) return '9,999+ 개';
        return `${n.toLocaleString()}개`;
    };



    return (
        <View
            className={`rounded-2xl overflow-hidden ${bg}`}
            style={{
                width: cardW,
                height: cardH,
                borderWidth: type === 'total' ? 0 : 1,
                borderColor: '#F2F2F2',
            }}
        >
            <View className="px-5 pt-4 z-10">
                <AppText variant="M600" className={`${titleColor} leading-4`}>
                    {title}
                </AppText>
            </View>

            <View className="absolute left-5 bottom-5 z-10">
                <AppText variant="H2" className={valueColor}>
                    {formatCount(count)}
                </AppText>
            </View>

            <View
                className={`absolute right-0 ${iconPosition === 'bottom' ? 'bottom-0' : 'top-0'} z-0`}
                pointerEvents="none"
            >
                <Svg
                    style={{
                        transform: [
                            { scale: 0.9 },
                            { translateY: ICON_OFFSET[type].y },
                            { translateX: ICON_OFFSET[type].x },
                        ],
                    }}
                />
            </View>
        </View>
    );
}

