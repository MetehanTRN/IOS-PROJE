// LoginScreen.tsx - Geliştirilmiş versiyon (Dark başlangıç + hata mesajları özel)
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { setLoggedIn } from '../utils/authStorage';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { dark } = useTheme();

  // State tanımları
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // Giriş işlemi
  const handleLogin = async () => {
    setError('');
    setUsernameError(false);
    setPasswordError(false);

    let valid = true;

    if (!username) {
      setUsernameError(true);
      valid = false;
    }

    if (!password) {
      setPasswordError(true);
      valid = false;
    }

    if (!valid) {
      setError('Lütfen tüm alanları doldurunuz.');
      return;
    }

    setLoading(true);

    if (username === 'admin' && password === '1234') {
      await setLoggedIn();
      navigation.navigate('Home');
    } else {
      if (username !== 'admin' && password !== '1234') {
        setError('Kullanıcı adı ve şifre yanlış.');
        setUsernameError(true);
        setPasswordError(true);
      } else if (username !== 'admin') {
        setError('Kullanıcı adı hatalı.');
        setUsernameError(true);
      } else {
        setError('Şifre hatalı.');
        setPasswordError(true);
      }
    }

    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: dark ? '#121212' : '#f2f4f8' }]}>
      <Text style={styles.title}>🚗 Plaka Tanıma Sistemi</Text>

      {/* Hata kutusu */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Kullanıcı adı input */}
      <View
        style={[styles.inputWrapper, usernameError && styles.inputError]}
      >
        <MaterialIcons name="person" size={20} color="#555" style={styles.icon} />
        <TextInput
          placeholder="Kullanıcı Adı"
          placeholderTextColor="#999"
          style={[styles.input, { color: dark ? '#fff' : '#000' }]}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      {/* Şifre input */}
      <View
        style={[styles.inputWrapper, passwordError && styles.inputError]}
      >
        <MaterialIcons name="lock" size={20} color="#555" style={styles.icon} />
        <TextInput
          placeholder="Şifre"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          style={[styles.input, { color: dark ? '#fff' : '#000' }]}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Giriş yap butonu */}
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Giriş Yap</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// Stil tanımlamaları
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#00bcd4',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  icon: {
    marginRight: 8,
  },
  button: {
    backgroundColor: '#00bcd4',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorBox: {
    backgroundColor: '#fdecea',
    borderWidth: 1,
    borderColor: '#e74c3c',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    fontWeight: '500',
  },
});