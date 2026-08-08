// Android 는 native bridge 가 async 라 select 에서 sync 접근 불가
// → useWidgetSync 가 앱 진입/이벤트마다 refresh 해서 이 캐시에 저장
// → select 는 이 캐시를 sync 로 읽어서 pending overlay 적용
let cache = [];

export function setPendingCache(ids) {
  cache = Array.isArray(ids) ? ids.map(String) : [];
}

export function getPendingCache() {
  return cache;
}

export function clearPendingCache() {
  cache = [];
}
