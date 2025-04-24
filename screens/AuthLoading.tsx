// screens/AuthLoading.tsx

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { isLoggedIn } from '../utils/authStorage';
import { useNavigation } from '@react-navigation/native';

export default function AuthLoading() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const checkLogin = async () => {
      const logged = await isLoggedIn();
      navigation.reset({
        index: 0,
        routes: [{ name: logged ? 'Home' : 'Login' }],
      });
    };

    checkLogin();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007bff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
