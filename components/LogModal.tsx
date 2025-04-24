import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';
import { db } from '../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';

interface LogModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LogModal({ visible, onClose }: LogModalProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const { dark } = useTheme();

  useEffect(() => {
    if (visible) {
      // Firestore'dan veri alıyoruz
      const unsubscribe = onSnapshot(collection(db, 'entries'), (snapshot) => {
        const logsData = snapshot.docs.map((doc) => doc.data());
        setLogs(logsData); // State'i güncelliyoruz
      });

      // Unsubscribe to stop listening for updates when the component is unmounted
      return () => unsubscribe();
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.overlay, { backgroundColor: dark ? '#000000aa' : '#00000088' }]}>
        <View style={[styles.container, { backgroundColor: dark ? '#1e1e1e' : '#fff' }]}>
          <Text style={[styles.title, { color: dark ? '#fff' : '#000' }]}>Giriş/Çıkış Kayıtları</Text>

          {/* Firestore'dan alınan verileri listele */}
          <FlatList
            data={logs}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.logEntry,
                  {
                    backgroundColor: dark ? '#333' : '#f4f4f4', // Arka plan temaya uyumlu
                  },
                ]}
              >
                <Text style={{ color: dark ? '#ddd' : '#333' }}>Plaka: {item.plate}</Text>
                <Text style={{ color: dark ? '#ddd' : '#333' }}>Giriş Zamanı: {item.timestamp?.toDate().toString()}</Text>
              </View>

            )}
            keyExtractor={(item, index) => index.toString()}
          />

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: dark ? '#555' : '#ccc' }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    width: '85%',
    marginTop: 0, // Beyaz şerit için padding ve margin sıfırlandı
    marginBottom: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  logEntry: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    padding: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
