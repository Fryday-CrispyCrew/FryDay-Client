import React, { useMemo } from 'react';
import { View, Image, useWindowDimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import AppText from '../../../shared/components/AppText';
import CategoryBg from '../assets/svg/Category_bg.svg';
import Tung from '../assets/png/T.png';
import CategoryLine from '../assets/svg/Category_line.svg';

const TICKS = [100, 80, 60, 40, 20];

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
                {isEmpty ? <EmptyState /> : <BarChart data={data} />}
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
    const plotHeight = 144;
    const plotTop = 12;
    const bgW = Math.max(0, cardWidth - plotLeft - plotRightPadding);
    const bgH = 180;

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
    const plotRightPadding = 20;
    const plotTop = 12;
    const plotHeight = 144;

    const barW = 24;
    const labelBoxW = 44;

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
                    const barH = Math.max(8, (d.rate / 100) * plotHeight);

                    return (
                        <View key={`${d.name}-${i}`} style={{ flex: 1, alignItems: 'center' }}>
                            <CategoryLine width={barW} height={plotHeight} pointerEvents="none" />

                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    width: barW,
                                    height: barH,
                                    borderTopLeftRadius: 12,
                                    borderTopRightRadius: 12,
                                    backgroundColor: d.isBestRate ? '#FF5B22' : '#EAEAEA',
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
    const { width, height } = useWindowDimensions();
    const n = data.length;

    const padX = 20;
    const cardWidth = Math.min(390, width - padX * 2);

    const plotLeft = 44;
    const plotRightPadding = 16;
    const plotTop = 16;
    const plotHeight = 144;
    const topPadding = 16;
    const usableHeight = plotHeight - topPadding;

    const barW = 24;

    const successVals = data.map((d) => clamp01(d.success));
    const failVals = data.map((d) => clamp01(d.fail));

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
                        const successY = topPadding + (usableHeight - (successVals[0] / 100) * usableHeight);
                        const failY = topPadding + (usableHeight - (failVals[0] / 100) * usableHeight);
                        const centerX = w / 2;

                        return (
                            <Svg width={w} height={plotHeight}>
                                <Path
                                    d={makePath(failVals, w)}
                                    stroke="#4F4E4D"
                                    strokeWidth={12}
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <Path
                                    d={makePath(successVals, w)}
                                    stroke="#FF5B22"
                                    strokeWidth={12}
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {isSingle && (
                                    <>
                                        <Circle cx={centerX} cy={failY} r={6} fill="#4F4E4D" />
                                        <Circle cx={centerX} cy={successY} r={6} fill="#FF5B22" />
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
                {data.map((d, i) => {
                    const isSingle = data.length === 1;

                    let labelClass = 'text-gr500';
                    let isBold = false;

                    if (isSingle) {
                        if (d.success > d.fail) {
                            labelClass = 'text-or';
                            isBold = true;
                        } else if (d.fail > d.success) {
                            labelClass = 'text-gr900';
                            isBold = true;
                        }
                    } else {
                        if (d.isBestSuccessCount) {
                            labelClass = 'text-or';
                            isBold = true;
                        } else if (d.isMostFailCount) {
                            labelClass = 'text-gr900';
                            isBold = true;
                        }
                    }

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
    const mountedRef = React.useRef(false);

    React.useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    return (
        <View
            className="flex-1"
            onLayout={(e) => {
                const nextW = e.nativeEvent.layout.width;
                if (!mountedRef.current) return;
                setW((prev) => (prev === nextW ? prev : nextW));
            }}
        >
            {w > 0 ? render(w) : null}
        </View>
    );
}

