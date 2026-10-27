import { Platform } from "react-native";
import analytics from "@react-native-firebase/analytics";
import * as Updates from "expo-updates";

// Metro 로 띄운 실행, development 채널 업데이트를 dev 로 본다. 서버 URL 환경변수와는 무관하게 판단한다
export const IS_DEV_BUILD = __DEV__ || Updates.channel === "development";

// 수집 설정은 기기에 저장되므로, dev 빌드 위에 prod 를 설치한 경우를 위해 prod 에서도 매번 명시적으로 켠다
export function initAnalyticsCollection() {
  analytics()
    .setAnalyticsCollectionEnabled(!IS_DEV_BUILD)
    .catch(() => {});
}

export function setAnalyticsUserId(userId) {
  analytics()
    .setUserId(String(userId))
    .catch(() => {});
}

export function clearAnalyticsUserId() {
  analytics()
    .setUserId(null)
    .catch(() => {});
}

// 탈퇴 시 기기에 남은 Analytics 식별 정보를 지워 다음 계정과 연결되지 않게 한다
export function resetAnalyticsData() {
  analytics()
    .resetAnalyticsData()
    .catch(() => {});
}

// 공유 창을 열 때마다 기록한다. Android 는 항상 sharedAction 이 와서 결과를 구분할 수 없으므로 unknown 으로 둔다
export function logInviteShare(shareResult, { groupId, source }) {
  let result = "unknown";
  if (Platform.OS === "ios") {
    result = shareResult?.action === "sharedAction" ? "shared" : "dismissed";
  }
  analytics()
    .logEvent("invite_share", {
      group_id: groupId == null ? null : String(groupId),
      source,
      result,
    })
    .catch(() => {});
}
