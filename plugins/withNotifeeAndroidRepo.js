const { withProjectBuildGradle } = require("@expo/config-plugins");

/**
 * Expo config plugin: android/build.gradle의 allprojects.repositories에
 * @notifee/react-native 로컬 Maven 저장소를 추가합니다.
 * Gradle 8+에서 notifee의 app.notifee:core 의존성 해석 실패를 방지합니다.
 */
function withNotifeeAndroidRepo(config) {
  return withProjectBuildGradle(config, (config) => {
    const { contents } = config.modResults;
    const notifeeRepo = `    maven { url "$rootDir/../node_modules/@notifee/react-native/android/libs" }`;

    if (contents.includes("@notifee/react-native/android/libs")) {
      return config;
    }

    config.modResults.contents = contents.replace(
      /maven \{ url 'https:\/\/www\.jitpack\.io' \}/,
      `maven { url 'https://www.jitpack.io' }\n${notifeeRepo}`
    );

    return config;
  });
}

module.exports = withNotifeeAndroidRepo;
