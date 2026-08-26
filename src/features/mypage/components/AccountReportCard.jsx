import { View, TouchableOpacity } from "react-native";
import ChevronIcon from "../../../shared/components/ChevronIcon";
import AppText from "../../../shared/components/AppText";
import Dotted from "../../calendar/assets/svg/Dotted.svg";
import colors from "../../../shared/styles/colors";


export default function AccountReportCard({
                                            username,
                                            monthLabel,
                                            crispyCount,
                                            burntCount,
                                            onPressAccount,
                                            onPressReport,
                                          }) {
  return (
    <View className="bg-white rounded-2xl">
      <TouchableOpacity
        onPress={onPressAccount}
        className="flex-row items-center justify-between px-5 py-4"
      >
        <AppText variant="XL500" className="text-bk">
          {username} 님의 계정 정보
        </AppText>
        <ChevronIcon direction="right" size={16} color={colors.gr500} />
      </TouchableOpacity>

      <View className="px-5">
        <Dotted width="100%" height={1} preserveAspectRatio="none" />
      </View>



      <TouchableOpacity
        onPress={onPressReport}
        className="px-5 py-4"
      >
        <View className="flex-row items-center justify-between">
          <AppText variant="XL500" className="text-bk">
            {monthLabel}월 리포트
          </AppText>
          <ChevronIcon direction="right" size={16} color={colors.gr500} />
        </View>

        <View className="flex-row items-center mt-3">
          <AppText variant="L400" className="text-gr500">
            바삭한 튀김 <AppText variant="L600" className="text-or">{crispyCount}개</AppText>
          </AppText>
          <AppText variant="L400" className="text-gr500 ml-3">
            태운 튀김 <AppText variant="L600" className="text-gr900">{burntCount}개</AppText>
          </AppText>
        </View>
      </TouchableOpacity>
    </View>
  );
}