import {registerRootComponent} from "expo";
import App from "./src/app/App";
import {registerBackgroundHandlers} from "./src/notifications/background/registerBackgroundHandlers";
import {initAnalyticsCollection} from "./src/shared/lib/analytics";

// 어떤 logEvent 보다 먼저 호출해야 dev 빌드 이벤트가 운영 데이터에 섞이지 않는다
initAnalyticsCollection();
registerBackgroundHandlers();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
