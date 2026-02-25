const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo config plugin: assets/ic_notification.png을
 * Android res/drawable 폴더에 ic_notification.png로 복사합니다.
 * Notifee의 smallIcon: "ic_notification" 설정과 매핑됩니다.
 */
function withAndroidNotificationIcon(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const sourceIcon = path.resolve(
        config.modRequest.projectRoot,
        "assets/ic_notification.png"
      );
      const resDir = path.join(
        config.modRequest.platformProjectRoot,
        "app/src/main/res"
      );

      const drawableDir = path.join(resDir, "drawable");
      fs.mkdirSync(drawableDir, { recursive: true });
      fs.copyFileSync(sourceIcon, path.join(drawableDir, "ic_notification.png"));

      return config;
    },
  ]);
}

module.exports = withAndroidNotificationIcon;
