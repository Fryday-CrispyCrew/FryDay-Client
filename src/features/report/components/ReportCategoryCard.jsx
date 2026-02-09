import React, { useMemo } from 'react';
import { View, Image, useWindowDimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import AppText from '../../../shared/components/AppText';
import CategoryBg from '../assets/svg/Category_bg.svg';
import Tung from '../assets/png/Tung.png';
import CategoryLine from '../assets/svg/Category_line.svg';
import colors from '../../../shared/styles/colors';

const TICKS = [100, 80, 60, 40, 20];

const clamp01 = (v) => Math.max(0, Math.min(100, v));

export default function ReportCategoryCard({ data = [] }) {
    const computed = useMemo(() => {
        if (!data.length) return [];

        const rates = data.map((d) => {
            const total = d.total ?? 0;
            const success = d.success ?? 0;
            return total > 0 ? Math.round((success / total) * 100) : 0;
        });
        const maxRate = Math.max(0, ...rates);

        const orCandidates = data.map((d) => ((d.success ?? 0) >= (d.fail ?? 0) ? (d.success ?? 0) : null)).filter((v) => v != null);
        const grCandidates = data.map((d) => ((d.fail ?? 0) > (d.success ?? 0) ? (d.fail ?? 0) : null)).filter((v) => v != null);

        const maxOrSuccess = orCandidates.length ? Math.max(...orCandidates) : null;
        const maxGrFail = grCandidates.length ? Math.max(...grCandidates) : null;

        const allZeroSF = data.every((d) => (d.success ?? 0) === 0 && (d.fail ?? 0) === 0);

        return data.map((d, i) => {
            const success = d.success ?? 0;
            const fail = d.fail ?? 0;

            const isOrCandidate = success >= fail;
            const isGrCandidate = fail > success;

            return {
                ...d,
                rate: clamp01(rates[i]),

                isBestRate: !allZeroSF && rates[i] === maxRate,

                isOr: !allZeroSF && isOrCandidate && maxOrSuccess != null && success === maxOrSuccess,
                isGr: !allZeroSF && isGrCandidate && maxGrFail != null && fail === maxGrFail,

                _allZeroSF: allZeroSF,
            };
        });
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
    const isEmpty = !data.length;

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

            <View className="bg-wt rounded-2xl overflow-hidden" style={{ borderWidth: 1, borderColor: '#F2F2F2' }}>
                {isEmpty ? <EmptyState /> : <BarChart data={data} />}
            </View>
        </View>
    );
}

// 바삭함 개수 Card
function CountCard({ data }) {
    const isEmpty = !data.length;

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

            <View className="bg-wt rounded-2xl overflow-hidden" style={{ borderWidth: 1, borderColor: '#F2F2F2' }}>
                {isEmpty ? <EmptyState /> : <LineChart data={data} />}
            </View>
        </View>
    );
}

// 텅
function EmptyState() {
    const { height } = useWindowDimensions();

    return (
        <View className="h-60 items-center justify-center" style={{ maxHeight: height * 0.45 }}>
            <Image source={Tung} style={{ width: 110, height: 110 }} resizeMode="contain" />
            <AppText variant="S500" className="text-gr500 text-center mt-2">
                아직 추가된 투두 튀김이 없어요{'\n'}먼저 할 일을 튀겨 주세요!
            </AppText>
        </View>
    );
}

// 공통 : 가로 격자 + y축
function GridLayer() {
    const { width } = useWindowDimensions();

    const padX = 20;
    const cardWidth = Math.min(390, width - padX * 2);
    const plotLeft = 44;
    const plotRightPadding = 20;
    const bgW = Math.max(0, cardWidth - plotLeft - plotRightPadding);
    const bgH = 240;

    return (
        <>
            <CategoryBg
                width={bgW}
                height={bgH}
                style={{ position: 'absolute', bottom: 8, left: plotLeft, maxWidth: '100%' }}
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
    const { width, height } = useWindowDimensions();

    const padX = 20;
    const cardWidth = Math.min(390, width - padX * 2);

    const plotLeft = 44;
    const plotRightPadding = 16;
    const plotTop = 22;
    const plotHeight = 160;

    const topPadding = 5;
    const bottomPadding = 16;
    const usableHeight = plotHeight - topPadding - bottomPadding;

    const barW = 24;
    const labelBoxW = 44;

    const allZeroSF = data.length > 0 && data.every((d) => (d.success ?? 0) === 0 && (d.fail ?? 0) === 0);

    const splitCategoryName = (name) => {
        if (name.length <= 4) return name;
        return `${name.slice(0, 4)}\n${name.slice(4)}`;
    };

    return (
        <View className="h-60" style={{ maxHeight: height * 0.45, width: cardWidth }}>
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
                    const barH = Math.max(8, (d.rate / 100) * usableHeight);
                    const barClass = allZeroSF ? 'bg-gr500' : d.isBestRate ? 'bg-or' : 'bg-gr500';

                    return (
                        <View key={`${d.name}-${i}`} style={{ flex: 1, alignItems: 'center' }}>
                            <CategoryLine width={barW} height={plotHeight} pointerEvents="none" />
                            <View
                                className={barClass}
                                style={{
                                    position: 'absolute',
                                    bottom: bottomPadding,
                                    width: barW,
                                    height: barH,
                                    borderTopLeftRadius: 12,
                                    borderTopRightRadius: 12,
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
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {data.map((d, i) => (
                    <View key={`${d.name}-label-${i}`} style={{ flex: 1, alignItems: 'center' }}>
                        <View style={{ width: labelBoxW, alignItems: 'center' }}>
                            <AppText
                                variant={allZeroSF ? 'S500' : d.isBestRate ? 'S700' : 'S500'}
                                className={allZeroSF ? 'text-gr500' : d.isBestRate ? 'text-or' : 'text-gr500'}
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
    const { width, height } = useWindowDimensions();
    const n = data.length;

    const padX = 20;
    const cardWidth = Math.min(390, width - padX * 2);

    const plotLeft = 44;
    const plotRightPadding = 16;
    const plotTop = 16;
    const plotHeight = 160;

    const topPadding = 16;
    const bottomPadding = 16;
    const usableHeight = plotHeight - topPadding - bottomPadding;

    const barW = 24;

    const allZeroSF = data.length > 0 && data.every((d) => (d.success ?? 0) === 0 && (d.fail ?? 0) === 0);

    const successVals = data.map((d) => clamp01(d.success ?? 0));
    const failVals = data.map((d) => clamp01(d.fail ?? 0));

    const makePath = (vals, w) => {
        if (n === 1) {
            const x = w / 2;
            const y = topPadding + (usableHeight - (vals[0] / 100) * usableHeight);
            return `M ${x} ${y}`;
        }

        const step = w / n;
        return vals
            .map((v, i) => {
                const x = step * i + step / 2;
                const y = topPadding + (usableHeight - (v / 100) * usableHeight);
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ');
    };

    const splitCategoryName = (name) => {
        if (name.length <= 4) return name;
        return `${name.slice(0, 4)}\n${name.slice(4)}`;
    };

    const labelVariant = (d) => {
        if (allZeroSF) return 'S500';
        if (d.isGr || d.isOr) return 'S700';
        return 'S500';
    };

    const labelClass = (d) => {
        if (allZeroSF) return 'text-gr500';
        if (d.isGr) return 'text-gr900';
        if (d.isOr) return 'text-or';
        return 'text-gr500';
    };

    return (
        <View className="h-60" style={{ maxHeight: height * 0.45, width: cardWidth }}>
            <GridLayer />

            <View
                className="absolute"
                style={{
                    left: plotLeft,
                    right: plotRightPadding,
                    top: plotTop,
                    height: plotHeight,
                }}
            >
                <View className="absolute inset-0 flex-row">
                    {data.map((_, i) => (
                        <View key={`grid-${i}`} style={{ flex: 1, alignItems: 'center' }}>
                            <CategoryLine width={barW} height={plotHeight} pointerEvents="none" />
                        </View>
                    ))}
                </View>

                <MeasureWidth
                    render={(w) => {
                        const isSingle = n === 1;

                        return (
                            <Svg width={w} height={plotHeight}>
                                <Path
                                    d={makePath(failVals, w)}
                                    stroke={colors.gr900}
                                    strokeWidth={12}
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <Path
                                    d={makePath(successVals, w)}
                                    stroke={allZeroSF ? colors.gr500 : colors.or}
                                    strokeWidth={12}
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {isSingle && (
                                    <>
                                        <Circle
                                            cx={w / 2}
                                            cy={topPadding + (usableHeight - (failVals[0] / 100) * usableHeight)}
                                            r={6}
                                            fill={colors.gr900}
                                        />
                                        <Circle
                                            cx={w / 2}
                                            cy={topPadding + (usableHeight - (successVals[0] / 100) * usableHeight)}
                                            r={6}
                                            fill={allZeroSF ? colors.gr500 : colors.or}
                                        />
                                    </>
                                )}
                            </Svg>
                        );
                    }}
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
                {data.map((d, i) => (
                    <View key={`${d.name}-label2-${i}`} style={{ flex: 1, alignItems: 'center' }}>
                        <AppText variant={labelVariant(d)} className={labelClass(d)} style={{ textAlign: 'center' }}>
                            {splitCategoryName(d.name)}
                        </AppText>
                    </View>
                ))}
            </View>
        </View>
    );
}

function MeasureWidth({ render }) {
    const [w, setW] = React.useState(0);

    return (
        <View
            className="flex-1"
            onLayout={(e) => {
                const nextW = e.nativeEvent.layout.width;
                setW((prev) => (prev === nextW ? prev : nextW));
            }}
        >
            {w > 0 ? render(w) : null}
        </View>
    );
}
