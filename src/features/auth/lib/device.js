import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getDeviceId() {
    const key = "deviceId";
    let id = await AsyncStorage.getItem(key);

    if (id) return id;

    id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    await AsyncStorage.setItem(key, id);
    return id;
}
