// RN XMLHttpRequest의 증분 응답으로 SSE를 읽는다. ping 주석은 이벤트로 전달하지 않는다.
export function createSSEParser(onEvent) {
  let buffer = "";
  let event = "";
  let data = [];
  return (chunk) => {
    buffer += chunk;
    while (true) {
      const match = /\r\n|\r|\n/.exec(buffer);
      if (!match) return;
      if (match[0] === "\r" && match.index === buffer.length - 1) return;
      const line = buffer.slice(0, match.index);
      buffer = buffer.slice(match.index + match[0].length);
      if (!line) {
        if (data.length) onEvent({ type: event || "message", data: data.join("\n") });
        event = "";
        data = [];
      } else if (!line.startsWith(":")) {
        const colon = line.indexOf(":");
        const field = colon < 0 ? line : line.slice(0, colon);
        const value = colon < 0 ? "" : line.slice(colon + 1).replace(/^ /, "");
        if (field === "event") event = value;
        if (field === "data") data.push(value);
      }
    }
  };
}

export function openGroupEventStream({
  url, getToken, recoverAuth, onEvent, onUnavailable,
  createRequest = () => new XMLHttpRequest(),
}) {
  let stopped = false;
  let request;
  let retryTimer;
  let watchdog;
  let retryDelay = 1000;
  let authRecovered = false;

  const disposeRequest = () => {
    clearTimeout(watchdog);
    if (!request) return;
    request.onreadystatechange = request.onprogress = request.onerror = request.onload = null;
    request.abort();
    request = null;
  };
  const retry = () => {
    if (stopped) return;
    disposeRequest();
    clearTimeout(retryTimer);
    retryTimer = setTimeout(connect, retryDelay);
    retryDelay = Math.min(retryDelay * 2, 30_000);
  };
  const touch = () => {
    clearTimeout(watchdog);
    watchdog = setTimeout(retry, 60_000);
  };
  const connect = async () => {
    if (stopped) return;
    try {
      const token = await getToken();
      if (stopped) return;
      if (!token) {
        stopped = true;
        return;
      }
      const xhr = createRequest();
      request = xhr;
      let offset = 0;
      let failed = false;
      const parse = createSSEParser((event) => {
        if (event.type === "connected") {
          retryDelay = 1000;
          authRecovered = false;
        }
        onEvent(event);
      });
      const fail = async () => {
        if (failed || stopped || request !== xhr) return;
        failed = true;
        const status = xhr.status;
        disposeRequest();
        if (status === 404) {
          stopped = true;
          onUnavailable();
          return;
        }
        if (status === 401 || status === 403) {
          if (authRecovered) {
            stopped = true;
            onUnavailable();
            return;
          }
          authRecovered = true;
          try {
            await recoverAuth();
          } catch {
            if (stopped) return;
            stopped = true;
            onUnavailable();
            return;
          }
        }
        retry();
      };
      const read = () => {
        if (stopped || failed || request !== xhr) return;
        if (xhr.readyState >= 2 && xhr.status >= 400) {
          void fail();
          return;
        }
        if (xhr.status !== 200 || xhr.readyState < 3) return;
        const text = xhr.responseText;
        if (text.length > offset) {
          touch();
          const chunk = text.slice(offset);
          offset = text.length;
          parse(chunk);
        }
      };
      xhr.open("GET", url, true);
      xhr.setRequestHeader("Accept", "text/event-stream");
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.onreadystatechange = read;
      xhr.onprogress = read;
      xhr.onerror = fail;
      xhr.onload = () => { read(); void fail(); };
      touch();
      xhr.send();
    } catch {
      retry();
    }
  };
  void connect();
  return () => {
    stopped = true;
    clearTimeout(retryTimer);
    disposeRequest();
  };
}

export function getSeoulDate(now = Date.now()) {
  return new Date(now + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
