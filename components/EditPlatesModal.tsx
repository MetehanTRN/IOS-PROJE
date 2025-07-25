// EditPlatesModal.tsx - Plaka düzenleme, silme, kara listeye ekleme modalı
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  collection,
  getDocs,
  updateDoc,
  setDoc,
  serverTimestamp,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useTheme } from 'react-native-paper';

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface PlateData {
  id: string;
  plate: string;
  owner: string;
}

export default function EditPlatesModal({ visible, onClose }: Props) {
  const [plates, setPlates] = useState<PlateData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedPlate, setEditedPlate] = useState('');
  const [editedOwner, setEditedOwner] = useState('');
  const { dark } = useTheme();

  // Veritabanından tüm plakaları çek
  const fetchPlates = async () => {
    const snapshot = await getDocs(collection(db, 'plates'));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      plate: doc.data().plate,
      owner: doc.data().owner,
    }));
    setPlates(data);
  };

  // Bir plakayı kara listeye ekle ve kayıttan çıkar
  const handleBlacklist = (plateId: string, plateText: string) => {
    Alert.alert(
      'Kara Listeye Ekle',
      `"${plateText}" plakalı aracı kara listeye eklemek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet',
          onPress: async () => {
            try {
              setPlates((prev) => prev.filter((plate) => plate.id !== plateId));
              await setDoc(doc(db, 'blacklist', plateText), {
                plate: plateText,
                timestamp: serverTimestamp(),
              });
              await deleteDoc(doc(db, 'plates', plateId));
              console.log('🚫 Kara listeye taşındı:', plateText);
            } catch (error) {
              console.error('Hata oluştu:', error);
            }
          },
        },
      ]
    );
  };

  // Modal açıldığında plakaları çek
  useEffect(() => {
    if (visible) fetchPlates();
  }, [visible]);

  // Güncelleme işlemi
  const handleUpdate = (id: string) => {
    Alert.alert('Emin misiniz?', 'Bu plakayı güncellemek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Evet',
        onPress: async () => {
          const ref = doc(db, 'plates', id);
          await updateDoc(ref, {
            plate: editedPlate.trim().toUpperCase(),
            owner: editedOwner.trim(),
          });
          setEditingId(null);
          fetchPlates();
        },
      },
    ]);
  };

  // Silme işlemi
  const handleDelete = (id: string) => {
    Alert.alert('Emin misiniz?', 'Bu plakayı silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          const ref = doc(db, 'plates', id);
          await deleteDoc(ref);
          fetchPlates();
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.container, { backgroundColor: dark ? '#121212' : '#fff' }]}>
        <Text style={[styles.title, { color: dark ? '#fff' : '#000' }]}>🛠️ Kayıtları Düzenle</Text>

        {/* Plakaları listeleyen FlatList */}
        <FlatList
          data={plates}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            editingId === item.id ? (
              // Düzenleme modu
              <View style={styles.item}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: dark ? '#fff' : '#000',
                      borderColor: dark ? '#666' : '#ccc',
                    },
                  ]}
                  value={editedPlate}
                  onChangeText={setEditedPlate}
                  placeholder="Plaka"
                  placeholderTextColor={dark ? '#aaa' : '#666'}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: dark ? '#fff' : '#000',
                      borderColor: dark ? '#666' : '#ccc',
                    },
                  ]}
                  value={editedOwner}
                  onChangeText={setEditedOwner}
                  placeholder="Ad Soyad"
                  placeholderTextColor={dark ? '#aaa' : '#666'}
                />
                <TouchableOpacity onPress={() => handleUpdate(item.id)}>
                  <Text style={[styles.confirmButton, { color: '#03a9f4' }]}>Güncelle</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Normal görünüm
              <View style={styles.item}>
                <Text style={[styles.text, { color: dark ? '#fff' : '#000' }]}>{item.plate}</Text>
                <Text style={[styles.text, { color: dark ? '#fff' : '#000' }]}>{item.owner}</Text>

                <TouchableOpacity
                  onPress={() => {
                    setEditingId(item.id);
                    setEditedPlate(item.plate);
                    setEditedOwner(item.owner);
                  }}
                >
                  <Text style={styles.edit}>✏️</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text style={styles.delete}>🗑️</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleBlacklist(item.id, item.plate)}>
                  <Text style={{ color: 'red', marginLeft: 10 }}>🚫</Text>
                </TouchableOpacity>
              </View>
            )
          }
        />

        {/* Modalı kapatma butonu */}
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: dark ? '#444' : '#555' }]}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>Kapat</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// Stil tanımları
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  text: {
    flex: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
  },
  confirmButton: {
    fontWeight: 'bold',
    marginLeft: 10,
  },
  edit: {
    fontSize: 18,
    marginLeft: 10,
  },
  delete: {
    fontSize: 18,
    marginLeft: 10,
    color: '#e74c3c',
  },
  closeButton: {
    marginTop: 20,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
