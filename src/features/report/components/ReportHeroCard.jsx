import { View, Image, useWindowDimensions } from 'react-native';
import AppText from '../../../shared/components/AppText';

/**
 * caseType: 'A' | 'B' | 'C'
 * nickname: string
 */
export default function ReportHeroCard({ caseType, nickname }) {
    const { lines, image } = HERO_CONTENT[caseType];
    const { width } = useWindowDimensions();

    const imageSize = Math.min(150, width * 0.42);

    return (
        <View className="px-5 py-6 bg-wt">
            {/* 텍스트 영역 */}
            <View className="pr-2">
                {lines.map((line, lineIdx) => (
                    <View key={lineIdx} className="flex-row flex-wrap">
                        {line.map((part, idx) => (
                            <AppText
                                key={idx}
                                variant={part.weight}
                                className={`text-${part.color}`}
                                style={{ lineHeight: 26 }}
                            >
                                {part.text.replace('{nickname}', nickname)}
                            </AppText>
                        ))}
                    </View>
                ))}
            </View>

            {/* 아이콘 영역 (텍스트 아래) */}
            <View className="items-end mt-4">
                <Image
                    source={image}
                    resizeMode="contain"
                    style={{ width: imageSize, height: imageSize }}
                />
            </View>
        </View>
    );
}



export const HERO_CONTENT = {
    A: {
        lines: [
            [
                {
                    text: '바삭바삭, 접시에 튀김이 가득해요.',
                    color: 'gr700',
                    weight: 'XL500',
                },
            ],
            [
                {
                    text: '이번 달 {nickname}님은 ',
                    color: 'gr700',
                    weight: 'XL500',
                },
                {
                    text: '튀김 마스터!',
                    color: 'or',
                    weight: 'pointM',
                },
            ],
        ],
        image: require('../assets/png/a.png'),
    },

    B: {
        lines: [
            [
                {
                    text: '이번 달의 {nickname}님은 ',
                    color: 'gr700',
                    weight: 'XL500',
                },
                {
                    text: '튀김 메이커!',
                    color: 'or',
                    weight: 'pointM',
                },
            ],
            [
                {
                    text: '오늘도 바삭한 하루를 보내 볼까요?',
                    color: 'gr700',
                    weight: 'XL500',
                },
            ],
        ],
        image: require('../assets/png/b.png'),
    },

    C: {
        lines: [
            [
                {
                    text: '튀김기가 심심해 하고 있어요...',
                    color: 'gr700',
                    weight: 'XL500',
                },
            ],
            [
                {
                    text: '무엇이든 좋으니 튀기러 갈까요?',
                    color: 'or',
                    weight: 'pointM',
                },
            ],
        ],
        image: require('../assets/png/c.png'),
    },
};


