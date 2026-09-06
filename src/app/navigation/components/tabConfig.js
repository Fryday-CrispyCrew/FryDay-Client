// src/app/navigation/stacks/components/tabConfig.js
import HomeActive from '../assets/Home_Active.svg';
import HomeInactive from '../assets/Home_Inactive.svg';
import CalendarActive from '../assets/Calendar_Active.svg';
import CalendarInactive from '../assets/Calendar_Inactive.svg';
import ReportActive from '../assets/Report_Active.svg';
import ReportInactive from '../assets/Report_Inactive.svg';
import SettingActive from '../assets/Settings_Active.svg';
import SettingInactive from '../assets/Settings_Inactive.svg';
import GroupActive from '../assets/Group_Active.svg';
import GroupInactive from '../assets/Group_Inactive.svg';

// 탭별 라벨과 아이콘 (key = MainTabs 의 Tab.Screen name 과 정확히 일치해야 함)
export const TAB_CONFIG = {
  Todo: { label: '홈', active: HomeActive, inactive: HomeInactive },
  Calendar: { label: '캘린더', active: CalendarActive, inactive: CalendarInactive },
  Group: { label: '그룹', active: GroupActive, inactive: GroupInactive },
  MyPage: { label: '마이페이지', active: SettingActive, inactive: SettingInactive },
};

// 탭바를 숨길 라우트 (Stack 내부 포함)
export const HIDDEN_ROUTES = ["EditProfile", "Notice", "Use", "Qna", "Alarm", "Report"];
