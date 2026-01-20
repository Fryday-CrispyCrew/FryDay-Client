// src/app/navigation/stacks/components/navigationHelper.js
export function getDeepActiveRouteName(route) {
  let r = route;
  while (r?.state?.routes && r.state.index != null) {
    r = r.state.routes[r.state.index];
  }
  return r?.name ?? route?.name;
}
