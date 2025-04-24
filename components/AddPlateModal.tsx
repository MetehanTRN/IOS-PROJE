// AddPlateModal.tsx - Dark/Light tema uyumlu hale getirildi
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useTheme } from 'react-native-paper';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AddPlateModal({ visible, onClose }: Props) {
  const [plate, setPlate] = useState('');
  const [owner, setOwner] = useState('');
  const { dark } = useTheme();

  const handleAdd = () => {
    if (!plate || !owner) return;

    Alert.alert(
      'Emin misiniz?',
      'Bu plakayı kaydetmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Evet',
          onPress: async () => {
            try {
              const newPlate = {
                plate: plate.trim().toUpperCase(),
                owner: owner.trim(),
                timestamp: serverTimestamp(),
              };
              await addDoc(collection(db, 'plates'), newPlate);
              setPlate('');
              setOwner('');
              onClose();
            } catch (error) {
              console.error('Plaka eklenemedi:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: dark ? '#1e1e1e' : '#fff' }]}>
          <Text style={[styles.title, { color: dark ? '#fff' : '#000' }]}>➕ Plaka Ekle</Text>

          <TextInput
            style={[styles.input, { color: dark ? '#fff' : '#000', borderColor: dark ? '#555' : '#ccc' }]}
            placeholder="Plaka"
            placeholderTextColor={dark ? '#aaa' : '#888'}
            value={plate}
            onChangeText={setPlate}
          />
          <TextInput
            style={[styles.input, { color: dark ? '#fff' : '#000', borderColor: dark ? '#555' : '#ccc' }]}
            placeholder="Ad Soyad"
            placeholderTextColor={dark ? '#aaa' : '#888'}
            value={owner}
            onChangeText={setOwner}
          />

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: dark ? '#555' : '#ccc' }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: dark ? '#0288d1' : '#00bcd4' }]}
              onPress={handleAdd}
            >
              <Text style={styles.buttonText}>Ekle</Text>
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
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: 10,
    padding: 20,
    width: '85%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
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
  addButton: {
    padding: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});