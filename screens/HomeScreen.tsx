// Home ekranı temaya uyumlu stiller + çıkış tuşu vurgusu eklendi
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { db } from '../firebaseConfig';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { useTheme, Switch, Avatar, Menu, IconButton } from 'react-native-paper';
import AddPlateModal from '../components/AddPlateModal';
import EditPlatesModal from '../components/EditPlatesModal';
import LogModal from '../components/LogModal';
import { useThemeContext } from '../contexts/ThemeContext';
import { setLoggedOut } from '../utils/authStorage';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 60) / 2;

export default function HomeScreen() {
  const { colors, dark } = useTheme();
  const { isDark, toggleTheme } = useThemeContext();
  const navigation = useNavigation<any>();

  const [plateCount, setPlateCount] = useState(0);
  const [lastEntry, setLastEntry] = useState<null | { plate: string; time: string }>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'plates'), (snapshot) => {
      setPlateCount(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'entries'),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const time = new Date(data.timestamp.seconds * 1000).toLocaleTimeString();
          setLastEntry({ plate: data.plate, time });
          setTimeout(() => setLastEntry(null), 5000);
        }
      });
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setWelcomeVisible(false), 3000);
    return () => clearTimeout(timeout);
  }, []);

  const handleLogout = async () => {
    await setLoggedOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: dark ? '#121212' : '#f2f4f8' }]}>
      <View style={styles.innerContent}>
        <View style={styles.header}>
          {welcomeVisible && <Text style={[styles.title, { color: dark ? '#fff' : '#000' }]}>👋 Hoş Geldin, Admin</Text>}
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <Avatar.Icon size={40} icon="account" />
              </TouchableOpacity>
            }
            contentStyle={[styles.menuContent, { backgroundColor: dark ? '#1f1f1f' : '#fff' }]}
          >
            <View style={styles.menuHeader}>
              <Text style={[styles.profileName, { color: dark ? '#fff' : '#000' }]}>👤 Admin</Text>
              <IconButton icon="close" size={20} onPress={() => setMenuVisible(false)} iconColor={dark ? '#fff' : '#000'} />
            </View>
            <Menu.Item
              onPress={toggleTheme}
              title={`Tema: ${isDark ? 'Karanlık' : 'Aydınlık'}`}
              leadingIcon="theme-light-dark"
              titleStyle={{ color: dark ? '#fff' : '#000' }}
            />
            <Menu.Item
              onPress={handleLogout}
              title="Çıkış Yap"
              leadingIcon="logout"
              titleStyle={{ color: '#e53935', fontWeight: 'bold' }}
            />
          </Menu>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: isDark ? '#0288d1' : '#00bcd4' }]}>
          <Text style={styles.cardTitle}>Toplam Kayıtlı Plaka</Text>
          <Text style={styles.cardNumber}>{plateCount}</Text>
        </View>

        {lastEntry && (
          <View style={styles.notification}>
            <Text style={styles.notifText}>
              🚗 {lastEntry.plate} plakalı araç giriş yaptı ({lastEntry.time})
            </Text>
          </View>
        )}

        <View style={styles.cardRow}>
          <TouchableOpacity onPress={() => setAddModalVisible(true)}>
            <View style={[styles.cardButton, { width: cardWidth, backgroundColor: dark ? '#1e1e1e' : '#ffffff' }]}> 
              <Text style={[styles.cardIcon, { color: dark ? '#fff' : '#000' }]}>➕</Text>
              <Text style={[styles.cardLabel, { color: dark ? '#fff' : '#000' }]}>Plaka Ekle</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setEditModalVisible(true)}>
            <View style={[styles.cardButton, { width: cardWidth, backgroundColor: dark ? '#1e1e1e' : '#ffffff' }]}> 
              <Text style={[styles.cardIcon, { color: dark ? '#fff' : '#000' }]}>✏️</Text>
              <Text style={[styles.cardLabel, { color: dark ? '#fff' : '#000' }]}>Kayıtları Düzenle</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setLogModalVisible(true)}>
          <View style={[styles.cardButton, { width: '100%', backgroundColor: dark ? '#1e1e1e' : '#ffffff' }]}> 
            <Text style={[styles.cardIcon, { color: dark ? '#fff' : '#000' }]}>📋</Text>
            <Text style={[styles.cardLabel, { color: dark ? '#fff' : '#000' }]}>Giriş-Çıkış Logları</Text>
          </View>
        </TouchableOpacity>

        <AddPlateModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} />
        <EditPlatesModal visible={editModalVisible} onClose={() => setEditModalVisible(false)} />
        <LogModal visible={logModalVisible} onClose={() => setLogModalVisible(false)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 60,
  },
  innerContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  cardNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  notification: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  notifText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cardButton: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 4,
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuContent: {
    width: 220,
    paddingVertical: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  profileName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});