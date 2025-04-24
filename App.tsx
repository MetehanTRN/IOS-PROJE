// App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Sayfalar arası geçiş
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Stack navigasyon

// Ekranlar
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';

// Tema sağlayıcısı (Paper UI için)
import { PaperProvider } from 'react-native-paper';

// Tema context’i – bizim yazdığımız geçişli tema sistemi
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext';
import AuthLoading from './screens/AuthLoading';

// Stack navigator oluştur
const Stack = createNativeStackNavigator();

// Ana bileşen – uygulamanın giriş noktası
export default function App() {
  return (
    // Tema sistemini tüm uygulamaya saran context
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}

// Tema context’inden temayı alıp Paper ve Navigation ile birlikte uygulamaya ver
function AppWithTheme() {
  const { theme } = useThemeContext();

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="AuthLoading" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="AuthLoading" component={AuthLoading} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
