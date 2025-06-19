// AsyncStorage modülünü içe aktar (cihazda veri saklamak için kullanılır)
import AsyncStorage from '@react-native-async-storage/async-storage';

// Anahtar olarak kullanılacak sabit değer
const AUTH_KEY = 'AUTH_USER';

/**
 * Kullanıcıyı giriş yapmış olarak işaretler
 */
export const setLoggedIn = async () => {
  await AsyncStorage.setItem(AUTH_KEY, 'true');
};

/**
 * Kullanıcının oturumunu kapatır (veriyi temizler)
 */
export const setLoggedOut = async () => {
  await AsyncStorage.removeItem(AUTH_KEY);
};

/**
 * Kullanıcının giriş yapıp yapmadığını kontrol eder
 * @returns boolean (true ise giriş yapılmış)
 */
export const isLoggedIn = async (): Promise<boolean> => {
  const result = await AsyncStorage.getItem(AUTH_KEY);
  return result === 'true';
};
