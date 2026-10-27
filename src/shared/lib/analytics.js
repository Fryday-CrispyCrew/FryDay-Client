import analytics from "@react-native-firebase/analytics";

// api.js 와 같은 기준: dev 서버에 붙는 빌드는 dev 빌드로 본다
export const IS_DEV_BUILD = Boolean(process.env.EXPO_PUBLIC_BACKEND_URL_DEV);

// 수집 설정은 기기에 저장되므로, dev 빌드 위에 prod 를 설치한 경우를 위해 prod 에서도 매번 명시적으로 켠다
export function initAnalyticsCollection() {
  analytics()
    .setAnalyticsCollectionEnabled(!IS_DEV_BUILD)
    .catch(() => {});
}

export function setAnalyticsUserId(userId) {
  analytics()
    .setUserId(userId == null ? null : String(userId))
    .catch(() => {});
}

export function clearAnalyticsUserId() {
  setAnalyticsUserId(null);
}

// iOS 는 공유 시트를 닫으면 dismissedAction 이 와서 제외된다. Android 는 항상 sharedAction 이라 취소도 포함된다
export function logInviteShare(shareResult, { groupId, source }) {
  if (shareResult?.action !== "sharedAction") return;
  analytics()
    .logEvent("invite_share", {
      group_id: groupId == null ? null : String(groupId),
      source,
    })
    .catch(() => {});
}
