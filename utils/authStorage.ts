import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = 'AUTH_USER';

export const setLoggedIn = async () => {
  await AsyncStorage.setItem(AUTH_KEY, 'true');
};

export const setLoggedOut = async () => {
  await AsyncStorage.removeItem(AUTH_KEY);
};

export const isLoggedIn = async (): Promise<boolean> => {
  const result = await AsyncStorage.getItem(AUTH_KEY);
  return result === 'true';
};
