
import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Button} from 'react-native';
import { db } from '../firebaseConfig';
import {onSnapshot, query, orderBy, limit, getDoc, deleteDoc} from 'firebase/firestore';
import { useTheme, Switch, Avatar, Menu, IconButton } from 'react-native-paper';
import AddPlateModal from '../components/AddPlateModal';
import EditPlatesModal from '../components/EditPlatesModal';
import LogModal from '../components/LogModal';
import { useThemeContext } from '../contexts/ThemeContext';
import { setLoggedOut } from '../utils/authStorage';
import { useNavigation } from '@react-navigation/native';
import { recognizePlate } from '../utils/plateRecognizer';
import { collection, getDocs, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { useRef } from 'react';
import imageList from '../assets/test-plates/testImages.json';
import { imageMap } from '../imageMap';
import BlackListModal from '../components/BlackListModal';
import { setDoc, doc } from "firebase/firestore";
import * as FileSystem from 'expo-file-system';
import { normalizePlate } from '../utils/normalizePlate';
import AddOptionModal from '../components/AddOptionModal';
import AddToBlacklistModal from "../components/AddToBlacklistModal";
import { Image } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 60) / 2;

export default function HomeScreen() {
  const { colors, dark } = useTheme();
  const { isDark, toggleTheme } = useThemeContext();
  const navigation = useNavigation<any>();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [plateCount, setPlateCount] = useState(0);
  const [lastEntry, setLastEntry] = useState<null | { plate: string; time: string; status: string }>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [processedIndexes, setProcessedIndexes] = useState<number[]>([]);
  const [selectedPlate, setSelectedPlate] = useState('');
  const [pendingPlates, setPendingPlates] = useState<string[]>([]);
  const [isAskingUser, setIsAskingUser] = useState(false);
  const testImages = imageList.filter(Boolean);
  const [blacklistModalVisible, setBlacklistModalVisible] = useState(false);
  const [blacklistedPlates, setBlacklistedPlates] = useState<string[]>([]);
  const [blacklistCount, setBlacklistCount] = useState(0);
  const [addOptionVisible, setAddOptionVisible] = useState(false);
  const [addBlacklistModalVisible, setAddBlacklistModalVisible] = useState(false);
  const [selectAddModalVisible, setSelectAddModalVisible] = useState(false);
  const [addPlateModalVisible, setAddPlateModalVisible] = useState(false);
  const [defaultPlate, setDefaultPlate] = useState<string | undefined>(undefined);
  const [readonlyPlate, setReadonlyPlate] = useState<boolean>(false);
  const [removeFromBlacklist, setRemoveFromBlacklist] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'plates'), (snapshot) => {
      setPlateCount(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'blacklist'), (snapshot) => {
      setBlacklistCount(snapshot.size);
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    const fetchBlacklistCount = async () => {
      const snapshot = await getDocs(collection(db, "blacklist"));
      setBlacklistCount(snapshot.size);
    };

    fetchBlacklistCount();
  }, []);

  useEffect(() => {
    const loadBlacklist = async () => {
      const snapshot = await getDocs(collection(db, "blacklist"));
      const list = snapshot.docs.map(doc => doc.data().plate.toLowerCase());
      setBlacklistedPlates(list);
    };

    loadBlacklist();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'entries'),
      orderBy('timestamp', 'desc'),
      limit(15)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const time = new Date(data.timestamp?.seconds * 1000).toLocaleTimeString();
          setLastEntry({ plate: data.plate, time, status: data.status });
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          // Yeni timeout başlat
          timeoutRef.current = setTimeout(() => {setLastEntry(null);}, 5000);
        }
      });
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setWelcomeVisible(false), 3000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    recognizeSamplePlates();
  }, []);

  useEffect(() => {
    if (!isAskingUser && pendingPlates.length > 0) {
      setIsAskingUser(true);

      const plate = pendingPlates[0];

      Alert.alert(
        "Plaka Tespit Edildi",
        `Sistemde kayıtlı olmayan plaka: ${plate}\nKaydetmek ister misiniz?`,
        [
          {
            text: "Hayır",
            style: "cancel",
            onPress: () => {
              Alert.alert(
                "Kara Listeye Ekle",
                `${plate} plakalı aracı kara listeye almak ister misiniz?`,
                [
                  {
                    text: "Hayır",
                    style: "cancel",
                    onPress: () => {
                      setPendingPlates((prev) => prev.slice(1));
                      setIsAskingUser(false);
                    },
                  },
                  {
                    text: "Evet",
                    onPress: async () => {
                      try {
                        // 🔍 Kara listede bu plaka var mı kontrol et
                        const q = query(
                          collection(db, "blacklist"),
                          where("plate", "==", plate)
                        );
                        const querySnapshot = await getDocs(q);

                        if (!querySnapshot.empty) {
                          Alert.alert("⚠️ Zaten Eklendi", "Bu plaka zaten kara listede.");
                        } else {
                          // ✅ Eğer yoksa ekle
                          await setDoc(doc(db, "blacklist", plate.toUpperCase()), {
                            plate: plate.toUpperCase(),
                            timestamp: serverTimestamp(),
                          });

                          Alert.alert("✔️ Başarılı", "Plaka kara listeye eklendi.");
                        }
                      } catch (err) {
                        console.error("Kara liste hatası:", err);
                        Alert.alert("❌ Hata", "Plaka kara listeye eklenemedi.");
                      } finally {
                        // 🧹 Kuyruktan çıkar
                        setPendingPlates((prev) => prev.slice(1));
                        setIsAskingUser(false);
                      }
                    }
                  },
                ]
              );
            },
          },
          {
            text: "Evet",
            onPress: () => {
              setSelectedPlate(plate);
              setAddModalVisible(true);
              setDefaultPlate(plate); // Uyarıda gösterilen plakayı al
              setReadonlyPlate(true); // Plaka değiştirilemesin
              // modal kapanınca kalanlar gösterilecek
            },
          },
        ]
      );
    }
  }, [pendingPlates, isAskingUser]);

  const handleLogout = async () => {
    await setLoggedOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  

  const recognizeSamplePlates = async () => {

    // 🔄 Eğer 50'den fazla işlenmiş resim varsa, her şeyi temizle
    const processedSnapshot = await getDocs(collection(db, "processed_images"));

    if (processedSnapshot.size >= 50) {
      console.log("⚠️ 50'den fazla kayıt bulundu, Firestore ve klasör temizleniyor...");

      // 1️⃣ Firestore'daki kayıtları sil
      const deleteOps = processedSnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deleteOps);

      // 2️⃣ Klasördeki karşılık gelen resimleri sil (uygunsa)
      for (const doc of processedSnapshot.docs) {
        const fileName = doc.data().name;
        const filePath = FileSystem.documentDirectory + "test-plates/" + fileName;

        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(filePath);
          console.log("🗑️ Silindi:", fileName);
        }
      }

      console.log("✅ Tüm veriler ve dosyalar sıfırlandı.");
    }

    for (let i = 0; i < testImages.length; i++) {
        const fileName = testImages[i];
        const filePath = FileSystem.documentDirectory + "test-plates/" + fileName;

        const fileInfo = await FileSystem.getInfoAsync(filePath);

        let base64: string;
        let uri: string;

        if (fileInfo.exists) {
          // Yeni dosya cihazda var, base64'ü buradan oku
          const base64Data = await FileSystem.readAsStringAsync(filePath, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const mime = fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
          base64 = `data:${mime};base64,${base64Data}`;
          uri = filePath;

        } else {
          // Yeni dosya yok, eski bundle dosyasından oku
          const image = imageMap[fileName];
          uri = Image.resolveAssetSource(image).uri;

          const response = await fetch(uri);
          const blob = await response.blob();

          base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }

        // API çağrısı
        const result = await recognizePlate(base64, uri);
        const plate = result?.results?.[0]?.plate;
        const normalizedPlate = normalizePlate(plate);

        const processedRef = doc(db, "processed_images", fileName);
        const processedSnap = await getDoc(processedRef);
        if (processedSnap.exists()) {
          console.log("✅ Zaten işlenmiş:", fileName);
          continue;
        }

        await setDoc(processedRef, {
          name: fileName,
          timestamp: serverTimestamp(),
        });

        if (blacklistedPlates.some(p => normalizePlate(p) === normalizedPlate)) {
          console.log("⛔ Kara listede, geçiliyor:", plate);
          continue;
        }

        if (plate) {
          const platesSnapshot = await getDocs(collection(db, 'plates'));
          const matched = platesSnapshot.docs.find((doc) =>
            normalizePlate(doc.data().plate) === normalizedPlate
          );

          const status = matched ? 'Giriş Başarılı' : 'Giriş Reddedildi';

          await addDoc(collection(db, 'entries'), {
            plate,
            timestamp: serverTimestamp(),
            status,
          });

          if (!matched) {
            setPendingPlates((prev) => [...prev, plate]);
          }
        }

        await new Promise((r) => setTimeout(r, 2000));
      }
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
        
        <View style={[styles.summaryCard, { backgroundColor: isDark ? '#ff4d4d' : '#c0392b' }]}>
          <Text style={styles.cardTitle}>Kara Listedeki Plaka</Text>
          <Text style={styles.cardNumber}>{blacklistCount}</Text>
        </View>

        {lastEntry && (
          <View
            style={[
              styles.notification,
              {
                backgroundColor:
                  lastEntry.status === 'Giriş Başarılı' ? '#2ecc71' : '#e74c3c',
              },
            ]}
          >
            <Text style={styles.notifText}>
              {lastEntry.status === 'Giriş Başarılı'
                ? `${lastEntry.plate} plakalı araç giriş yaptı (${lastEntry.time})`
                : `Sistemde kayıtlı olmayan plaka tespit edildi (${lastEntry.plate})`}
            </Text>
          </View>
        )}


        <View style={styles.cardRow}>
          <TouchableOpacity onPress={() => setAddOptionVisible(true)}>
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

          <TouchableOpacity onPress={() => setBlacklistModalVisible(true)}>
            <View style={[styles.cardButton, { width: '100%', backgroundColor: dark ? '#1e1e1e' : '#ffffff' }]}> 
              <Text style={[styles.cardIcon, { color: dark ? '#fff' : '#000' }]}>🚫</Text>
              <Text style={[styles.cardLabel, { color: dark ? '#fff' : '#000' }]}>Kara Listeyi Gör</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLogModalVisible(true)}>
            <View style={[styles.cardButton, { width: '100%', backgroundColor: dark ? '#1e1e1e' : '#ffffff' }]}> 
              <Text style={[styles.cardIcon, { color: dark ? '#fff' : '#000' }]}>📋</Text>
              <Text style={[styles.cardLabel, { color: dark ? '#fff' : '#000' }]}>Giriş-Çıkış Logları</Text>
            </View>
          </TouchableOpacity>
                
        <AddOptionModal
          visible={addOptionVisible}
          onClose={() => setAddOptionVisible(false)}
          onAddPlate={() => {
            setAddOptionVisible(false);
            setAddModalVisible(true); // mevcut modal'ı açıyorsan bu zaten tanımlıdır
          }}
          onAddBlacklist={() => {
            setAddOptionVisible(false);
            setAddBlacklistModalVisible(true); // ✅ doğru modal'ı açıyoruz
          }}
        />

        <AddToBlacklistModal
          visible={addBlacklistModalVisible}
          onClose={() => {
            setAddBlacklistModalVisible(false);
            setAddOptionVisible(true);
            }
          }
        />



        <AddPlateModal
          visible={addModalVisible}
          onClose={() => {
            setAddModalVisible(false);
            setAddOptionVisible(true);
            setPendingPlates((prev) => prev.slice(1));
            setIsAskingUser(false);
            setDefaultPlate(undefined);
            setReadonlyPlate(false);
            setRemoveFromBlacklist(false);
          }}
          defaultPlate={defaultPlate}
          readonlyPlate={readonlyPlate}
          removeFromBlacklist={removeFromBlacklist}
        />        
        <EditPlatesModal visible={editModalVisible} onClose={() => setEditModalVisible(false)} />
        <LogModal visible={logModalVisible} onClose={() => setLogModalVisible(false)} />

        <BlackListModal
          visible={blacklistModalVisible}
          onClose={() => setBlacklistModalVisible(false)}
          onSelectToAdd={(plate) => {
            setSelectedPlate(plate);
            setAddModalVisible(true);
            setDefaultPlate(plate);
            setReadonlyPlate(true);
            setRemoveFromBlacklist(true);
          }}
        />

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