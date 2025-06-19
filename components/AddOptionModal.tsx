import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

// Modal bileşeni için props tanımı
interface AddOptionModalProps {
  visible: boolean;
  onClose: () => void;
  onAddPlate: () => void;
  onAddBlacklist: () => void;
}

export default function AddOptionModal({
  visible,
  onClose,
  onAddPlate,
  onAddBlacklist,
}: AddOptionModalProps) {
  const { dark } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: dark ? '#1e1e1e' : '#fff' }]}>
          {/* Başlık */}
          <Text style={[styles.title, { color: dark ? '#fff' : '#000' }]}>
            Ne yapmak istiyorsunuz?
          </Text>

          {/* Sisteme plaka ekleme seçeneği */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#2ecc71' }]}
            onPress={onAddPlate}
          >
            <Text style={styles.buttonText}>✅ Sisteme Plaka Ekle</Text>
          </TouchableOpacity>

          {/* Kara listeye ekleme seçeneği */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#e74c3c' }]}
            onPress={onAddBlacklist}
          >
            <Text style={styles.buttonText}>🚫 Kara Listeye Plaka Ekle</Text>
          </TouchableOpacity>

          {/* İptal butonu */}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={[styles.buttonText, { color: '#666' }]}>İptal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Stil tanımları
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Yarı saydam arka plan
  },
  container: {
    width: '85%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 10,
  },
});
