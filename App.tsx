// App.tsx – Uygulamanın giriş noktası

import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Sayfalar arası geçiş sağlar
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Stack yapılı navigasyon sistemi

// Uygulamadaki ekranlar
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
// React Native Paper için tema sağlayıcısı
import { PaperProvider } from 'react-native-paper';

// Kendi oluşturduğumuz tema context'i (dark/light geçişi vs.)
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext';
import AuthLoading from './screens/AuthLoading'; // Giriş kontrolü yapılacak yüklenme ekranı

// Navigasyon için stack yapısı oluşturuluyor
const Stack = createNativeStackNavigator();

// Ana bileşen – Uygulamanın dış katmanını saran yapı
export default function App() {
  return (
    // Tema context'i sağlayıcı (tüm uygulamada erişilebilir hale getirir)
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}

// Tema context'inden alınan tema ile Navigation + Paper birleşimi
function AppWithTheme() {
  const { theme } = useThemeContext();

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="AuthLoading"
          screenOptions={{ headerShown: false }}
        >
          {/* Giriş yapılmış mı kontrol eden ekran */}
          <Stack.Screen name="AuthLoading" component={AuthLoading} />

          {/* Giriş ekranı */}
          <Stack.Screen name="Login" component={LoginScreen} />

          {/* Ana ekran */}
          <Stack.Screen name="Home" component={HomeScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
