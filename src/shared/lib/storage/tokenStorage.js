// src/shared/lib/storage/tokenStorage.js
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const saveAccessToken = async (value) => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, value);
    // console.log(`access token saved successfully`, value);
  } catch (error) {
    // console.log(`access token saving failed`, error);
  }
};

export const saveRefreshToken = async (value) => {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, value);
    // console.log(`refresh token saved successfully`, value);
  } catch (error) {
    // console.log(`refresh token saving failed`, error);
  }
};

export const getAccessToken = async () => {
  try {
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    // console.log('accessToken',accessToken);
    return accessToken;
  } catch (error) {
    // console.error('Failed to get access token:', error);
    return null;
  }
};

export const getRefreshToken = async () => {
  try {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    // console.log('refreshToken',refreshToken);
    return refreshToken;
  } catch (error) {
    // console.error("Failed to get refresh token:", error);
    return null;
  }
};

export const deleteTokens = async () => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    // console.log("successfully deleted tokens");
  } catch (error) {
    // console.error("Failed to delete tokens:", error);
  }
};
