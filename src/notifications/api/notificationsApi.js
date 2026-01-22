import api from "../../shared/lib/api";

export async function registerFcmToken({fcmToken, deviceId}) {
  if (!fcmToken) throw new Error("token is required");
  if (!deviceId) throw new Error("deviceId is required");
  console.log("token: ", fcmToken);
  console.log("deviceId: ", deviceId);
  const {data} = await api.post("/api/users/me/fcm-token", {
    fcmToken,
    deviceId,
  });
  return data;
}
