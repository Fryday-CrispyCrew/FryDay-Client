import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Dimensions } from 'react-native';

import AppText from '../../../shared/components/AppText';
import CategoryBg from '../assets/svg/Category_bg.svg';
import Tung from '../assets/svg/Tung.svg';
import CategoryLine from '../assets/svg/Category_line.svg';

const TICKS = [100, 80, 60, 40, 20];
const { height: DEVICE_HEIGHT } = Dimensions.get('window');

const clamp01 = (v) => Math.max(0, Math.min(100, v));

export default function ReportCategoryCard({ data = [] }) {
    const computed = useMemo(() => {
        if (!data.length) return [];

        const rates = data.map((d) => (d.total ? Math.round((d.success / d.total) * 100) : 0));
        const maxRate = Math.max(...rates);

        const maxSuccessCount = Math.max(...data.map((d) => d.success));
        const maxFailCount = Math.max(...data.map((d) => d.fail));

        return data.map((d, i) => ({
            ...d,
            rate: clamp01(rates[i]),
            isBestRate: rates[i] === maxRate,
            isBestSuccessCount: d.success === maxSuccessCount,
            isMostFailCount: d.fail === maxFailCount,
        }));
    }, [data]);


    return (
        <View className="px-5 gap-4">
            <RateCard data={computed} />
            <CountCard data={computed} />
        </View>
    );
}

// 바삭함 지수 Card
function RateCard({ data }) {
    const isEmpty = !data.length || data.every((d) => d.total === 0);

    return (
        <View>
            <View className="flex-row justify-between items-center mt-8 mb-4">
                <AppText variant="M500" className="text-gr500">
                    카테고리별 바삭함 지수
                </AppText>
                <AppText variant="S500" className="text-gr500">
                    투두 달성률 (%)
                </AppText>
            </View>

            <View
                className="bg-wt rounded-2xl overflow-hidden"
                style={{ borderWidth: 1, borderColor: '#F2F2F2' }}>
                {isEmpty ? (
                    <EmptyState />
                ) : (
                    <BarChart data={data} />
                )}
            </View>
        </View>
    );
}


// 바삭함 개수 Card
function CountCard({ data }) {
    const isEmpty = !data.length || data.every((d) => d.success === 0 && d.fail === 0);

    return (
        <View>
            <View className="flex-row justify-between items-center mt-8 mb-4">
                <AppText variant="M500" className="text-gr500">
                    카테고리별 바삭함 개수
                </AppText>

                <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center gap-1.5">
                        <View className="w-2.5 h-2.5 rounded-full bg-or" />
                        <AppText variant="S500" className="text-gr500">
                            바삭한 튀김
                        </AppText>
                    </View>

                    <View className="flex-row items-center gap-1.5">
                        <View className="w-2.5 h-2.5 rounded-full bg-gr900" />
                        <AppText variant="S500" className="text-gr500">
                            태운 튀김 (개)
                        </AppText>
                    </View>
                </View>
            </View>

            <View
                className="bg-wt rounded-2xl overflow-hidden"
                style={{ borderWidth: 1, borderColor: '#F2F2F2' }}>
                {isEmpty ? (
                    <EmptyState />
                ) : (
                    <LineChart data={data} />
                )}
            </View>
        </View>
    );
}

// 텅
function EmptyState() {
    return (
        <View
            className="h-60 items-center justify-center"
            style={{ maxHeight: DEVICE_HEIGHT * 0.45 }}>
            <Tung width={110} height={110} />
            <AppText variant="S500" className="text-gr500 text-center mt-2">
                아직 추가된 투두 튀김이 없어요{'\n'}먼저 할 일을 튀겨 주세요!
            </AppText>
        </View>
    );
}


// 공통 : 가로 격자 + y축
function GridLayer() {
    return (
        <>
            <CategoryBg
                width={310}
                height={180}
                style={{ position: 'absolute', bottom: 8, left: 45,maxWidth: '100%' }}
            />
            <View className="absolute left-6 top-6 justify-between h-36">
                {TICKS.map((v) => (
                    <AppText key={v} variant="S500" className="text-gr500">
                        {v}
                    </AppText>
                ))}
            </View>
        </>
    );
}

// 막대그래프
function BarChart({ data }) {
    const plotLeft = 44;
    const plotRightPadding = 20;
    const plotTop = 12;
    const plotHeight = 144;

    const barW = 24;
    const labelBoxW = 44;

    // 카테고리 이름 자동 자르기
    const splitCategoryName = (name) => {
        if (name.length <= 4) return name;
        return `${name.slice(0, 4)}\n${name.slice(4)}`;
    };

    return (
        <View
            className="h-60"
            style={{ maxHeight: DEVICE_HEIGHT * 0.45 }}>
            <GridLayer />

            <View
                className="absolute flex-row"
                style={{
                    left: plotLeft,
                    right: plotRightPadding,
                    top: plotTop,
                    height: plotHeight,
                }}
            >
                {data.map((d, i) => {
                    const barH = Math.max(8, (d.rate / 100) * plotHeight);

                    return (
                        <View key={`${d.name}-${i}`} style={{ flex: 1, alignItems: 'center' }}>

                            {/*세로 격자*/}
                            <CategoryLine
                                width={barW}
                                height={plotHeight}
                                pointerEvents="none"
                            />

                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    width: barW,
                                    height: barH,
                                    borderTopLeftRadius: 12,
                                    borderTopRightRadius: 12,
                                    backgroundColor: d.isBestRate ? '#FF5B22' : '#EAEAEA', // primary-or : gr200
                                }}
                            />
                        </View>
                    );
                })}
            </View>

            <View
                className="absolute flex-row bg-wt"
                style={{
                    height: 32,
                    left: plotLeft,
                    right: plotRightPadding,
                    bottom: 12,
                    alignItems: 'center', justifyContent: 'center'
                }}
            >
                {data.map((d, i) => (
                    <View key={`${d.name}-label-${i}`} style={{ flex: 1, alignItems: 'center' }}>
                        <View style={{ width: labelBoxW, alignItems: 'center' }}>
                            <AppText
                                variant={d.isBestRate ? 'S700' : 'S500'}
                                className={d.isBestRate ? 'text-or' : 'text-gr500'}
                                style={{ textAlign: 'center' }}
                            >
                                {splitCategoryName(d.name)}
                            </AppText>

                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}


// 꺾은선 그래프
function LineChart({ data }) {
    const n = data.length;

    const plotLeft = 44;
    const plotRightPadding = 16;
    const plotTop = 16;
    const plotHeight = 144;
    const topPadding = 16;
    const usableHeight = plotHeight - topPadding;


    const barW = 24;

    const successVals = data.map((d) => clamp01(d.success));
    const failVals = data.map((d) => clamp01(d.fail));

    const makePath = (vals, width) => {
        if (n === 1) {
            const x = width / 2;
            const y = plotHeight - (vals[0] / 100) * plotHeight;
            return `M ${x} ${y}`;
        }

        const step = width / n;
        return vals
            .map((v, i) => {
                const x = step * i + step / 2;
                const y = topPadding + (usableHeight - (v / 100) * usableHeight);
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ');
    };
    // 카테고리 이름 자동 자르기
    const splitCategoryName = (name) => {
        if (name.length <= 4) return name;
        return `${name.slice(0, 4)}\n${name.slice(4)}`;
    };

    return (
        <View
            className="h-60"
            style={{ maxHeight: DEVICE_HEIGHT * 0.45 }}>


            <GridLayer />

            <View
                className="absolute"
                style={{
                    left: plotLeft,
                    right: plotRightPadding,
                    top: plotTop,
                    height: plotHeight
                }}
            >
                {/*세로 격자*/}
                <View className="absolute inset-0 flex-row">
                    {data.map((_, i) => (
                        <View key={`grid-${i}`} style={{ flex: 1, alignItems: 'center' }}>
                            <CategoryLine
                                width={barW}
                                height={plotHeight}
                                pointerEvents="none"
                            />
                        </View>
                    ))}
                </View>

                <MeasureWidth
                    render={(w) => (
                        <Svg width={w} height={plotHeight}>
                            <Path
                                d={makePath(failVals, w)}
                                stroke="#4F4E4D" // gr900
                                strokeWidth={10}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <Path
                                d={makePath(successVals, w)}
                                stroke="#FF5B22" // primary-or
                                strokeWidth={10}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </Svg>
                    )}
                />
            </View>


            <View
                className="absolute flex-row bg-wt"
                style={{
                    height: 32,
                    left: plotLeft,
                    right: plotRightPadding,
                    bottom: 10,
                }}
            >
                {data.map((d, i) => {
                    const isBold = d.isBestSuccessCount || d.isMostFailCount;

                    const labelClass = d.isBestSuccessCount
                        ? 'text-or'
                        : d.isMostFailCount
                            ? 'text-gr900'
                            : 'text-gr500';

                    return (
                        <View key={`${d.name}-label2-${i}`} style={{ flex: 1, alignItems: 'center' }}>
                            <AppText
                                variant={isBold ? 'S700' : 'S500'}
                                className={labelClass}
                                style={{ textAlign: 'center' }}
                            >
                                {splitCategoryName(d.name)}
                            </AppText>
                        </View>
                    );
                })}

            </View>

        </View>
    );
}

function MeasureWidth({ render }) {
    const [w, setW] = React.useState(0);

    return (
        <View
            className="flex-1"
            onLayout={(e) => setW(e.nativeEvent.layout.width)}
        >
            {w > 0 ? render(w) : null}
        </View>
    );
}
