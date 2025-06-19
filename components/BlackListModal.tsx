import React, { useEffect, useState } from "react";
import { Modal, View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Props tipi: modal görünürlüğü, kapatma fonksiyonu ve plaka seçme callback'i
interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectToAdd: (plate: string) => void;
}

export default function BlackListModal({ visible, onClose, onSelectToAdd }: Props) {
  const [blacklist, setBlacklist] = useState<{ id: string; plate: string }[]>([]);

  // Kara listedeki plakaları Firebase'den çek
  const fetchBlacklist = async () => {
    const querySnapshot = await getDocs(collection(db, "blacklist"));
    const list: { id: string; plate: string }[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({ id: docSnap.id, plate: data.plate });
    });
    setBlacklist(list);
  };

  // Plakayı kara listeden silmek için kullanıcıdan onay al
  const removeFromBlacklist = async (id: string) => {
    Alert.alert(
      "Emin misiniz?",
      "Bu plakayı kara listeden çıkarmak istiyor musunuz?",
      [
        { text: "Hayır", style: "cancel" },
        {
          text: "Evet",
          onPress: async () => {
            await deleteDoc(doc(db, "blacklist", id));
            fetchBlacklist(); // Listeyi güncelle
          },
        },
      ]
    );
  };

  // Kara listedeki plakayı kayıtlı plakalara eklemeden önce onay al
  const confirmAddToPlates = (plate: string) => {
    Alert.alert(
      "Plakayı Kaydet",
      `${plate} plakalı aracı kayıtlı plaka olarak eklemek ister misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Evet",
          onPress: () => {
            onClose();         // Bu modalı kapat
            onSelectToAdd(plate); // Add modal'ı açmak için callback
          },
        },
      ]
    );
  };

  // Modal açıldığında kara listeyi çek
  useEffect(() => {
    if (visible) fetchBlacklist();
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>🚫 Kara Listedeki Plakalar</Text>

        {/* Kara listedeki plakaları listele */}
        <FlatList
          data={blacklist}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.plate}>{item.plate}</Text>

              {/* Kayıtlı plakalara ekle butonu */}
              <TouchableOpacity onPress={() => confirmAddToPlates(item.plate)} style={styles.addBtn}>
                <Text style={styles.btnText}>Kaydet</Text>
              </TouchableOpacity>

              {/* Kara listeden silme butonu */}
              <TouchableOpacity onPress={() => removeFromBlacklist(item.id)} style={styles.delBtn}>
                <Text style={styles.btnText}>Sil</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Modal kapatma butonu */}
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>Kapat</Text>
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
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
  },
  plate: {
    fontSize: 16,
  },
  addBtn: {
    backgroundColor: "#2ecc71",
    padding: 8,
    borderRadius: 6,
  },
  delBtn: {
    backgroundColor: "#e74c3c",
    padding: 8,
    borderRadius: 6,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  closeBtn: {
    marginTop: 20,
    alignSelf: "center",
  },
  closeText: {
    color: "#007aff",
    fontSize: 16,
  },
});
