const { withDangerousMod, withAndroidManifest } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo config plugin: assets/notification_icon.png을
 * Android res/drawable 폴더에 notification_icon.png로 복사하고,
 * AndroidManifest.xml에 Firebase 기본 알림 아이콘 meta-data를 추가합니다.
 * - Notifee의 smallIcon: "notification_icon" 설정과 매핑됩니다 (foreground).
 * - Firebase가 백그라운드에서 자동 표시하는 알림에도 동일 아이콘이 적용됩니다 (background).
 */
function withAndroidNotificationIcon(config) {
  // 1) notification_icon.png를 res/drawable에 복사
  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const sourceIcon = path.resolve(
        config.modRequest.projectRoot,
        "assets/notification_icon.png"
      );
      const resDir = path.join(
        config.modRequest.platformProjectRoot,
        "app/src/main/res"
      );

      const drawableDir = path.join(resDir, "drawable");
      fs.mkdirSync(drawableDir, { recursive: true });
      fs.copyFileSync(sourceIcon, path.join(drawableDir, "notification_icon.png"));

      return config;
    },
  ]);

  // 2) AndroidManifest.xml에 Firebase 기본 알림 아이콘 meta-data 추가
  config = withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application[0];
    if (!application["meta-data"]) application["meta-data"] = [];

    const ICON_META = "com.google.firebase.messaging.default_notification_icon";
    const already = application["meta-data"].find(
      (m) => m.$?.["android:name"] === ICON_META
    );
    if (!already) {
      application["meta-data"].push({
        $: {
          "android:name": ICON_META,
          "android:resource": "@drawable/notification_icon",
        },
      });
    }

    return config;
  });

  return config;
}

module.exports = withAndroidNotificationIcon;
