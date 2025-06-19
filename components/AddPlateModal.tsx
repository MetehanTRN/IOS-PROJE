import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { addDoc, collection, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useTheme } from "react-native-paper";

// Modal bileşenine dışarıdan gelen parametreler
interface AddPlateModalProps {
  visible: boolean;
  onClose: () => void;
  defaultPlate?: string;
  readonlyPlate?: boolean;
  removeFromBlacklist?: boolean;
}

// Plaka verisini normalize eden yardımcı fonksiyon
const normalizePlate = (plate: string) => plate.replace(/\s/g, "").toUpperCase();

const AddPlateModal: React.FC<AddPlateModalProps> = ({
  visible,
  onClose,
  defaultPlate,
  readonlyPlate,
  removeFromBlacklist
}) => {
  const [plate, setPlate] = useState("");
  const [owner, setOwner] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { dark } = useTheme();

  // Modal açıldığında inputlar sıfırlanır
  useEffect(() => {
    if (visible) {
      setPlate(defaultPlate || "");
      setOwner("");
      setErrorMessage("");
    }
  }, [visible, defaultPlate]);

  // Plaka ekleme işlemini yöneten fonksiyon
  const handleAdd = async () => {
    const trimmedPlate = normalizePlate(plate);

    // Alanlar boşsa uyarı ver
    if (!trimmedPlate || !owner) {
      setErrorMessage("Plaka ve isim boş bırakılamaz.");
      return;
    }

    // Plaka zaten kayıtlı mı kontrol et
    const existingPlateQuery = query(collection(db, "plates"), where("plate", "==", trimmedPlate));
    const existingPlateSnap = await getDocs(existingPlateQuery);

    if (!existingPlateSnap.empty) {
      setErrorMessage("⚠️ Bu plaka zaten kayıtlı.");
      return;
    }

    // Kara listede mi kontrol et
    const blacklistQuery = query(collection(db, "blacklist"), where("plate", "==", trimmedPlate));
    const blacklistSnap = await getDocs(blacklistQuery);

    if (!blacklistSnap.empty) {
      // Kara listede ise kullanıcıya uyarı göster
      Alert.alert(
        "Kara Liste Uyarısı",
        "Bu plaka kara listededir. Çıkarmak ve sisteme kaydetmek ister misiniz?",
        [
          { text: "Hayır", style: "cancel" },
          {
            text: "Evet",
            onPress: async () => {
              // Kara listeden sil ve sisteme ekle
              await deleteDoc(blacklistSnap.docs[0].ref);
              await addDoc(collection(db, "plates"), {
                plate: trimmedPlate,
                owner,
                createdAt: new Date(),
              });
              onClose();
            }
          }
        ]
      );
      return; // Alert sonrasında işlemi bitir
    }

    // Kara listede değilse direkt ekle
    await addDoc(collection(db, "plates"), {
      plate: trimmedPlate,
      owner,
      createdAt: new Date(),
    });

    // Opsiyonel olarak kara listeden sil
    if (removeFromBlacklist) {
      const removeQuery = query(collection(db, "blacklist"), where("plate", "==", trimmedPlate));
      const snapshot = await getDocs(removeQuery);

      for (const docItem of snapshot.docs) {
        await deleteDoc(docItem.ref);
      }
    }

    // Formu temizle ve modalı kapat
    setPlate("");
    setOwner("");
    setErrorMessage("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: dark ? "#1e1e1e" : "#fff" }]}>
          <Text style={[styles.title, { color: dark ? "#fff" : "#000" }]}>Plaka Ekle</Text>

          {/* Plaka input alanı */}
          <TextInput
            placeholder="Plaka"
            placeholderTextColor={dark ? "#999" : "#aaa"}
            value={plate}
            onChangeText={setPlate}
            editable={!readonlyPlate}
            style={[
              styles.input,
              {
                backgroundColor: readonlyPlate
                  ? dark ? "#2a2a2a" : "#eee"
                  : dark ? "#333" : "#fff",
                color: dark ? "#fff" : "#000",
                borderColor: dark ? "#555" : "#ccc",
              },
            ]}
          />

          {/* İsim input alanı */}
          <TextInput
            placeholder="İsim"
            placeholderTextColor={dark ? "#999" : "#aaa"}
            value={owner}
            onChangeText={setOwner}
            style={[
              styles.input,
              {
                backgroundColor: dark ? "#333" : "#fff",
                color: dark ? "#fff" : "#000",
                borderColor: dark ? "#555" : "#ccc",
              },
            ]}
          />

          {/* Hata mesajı */}
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

          {/* Butonlar */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={[styles.cancelButton, { backgroundColor: dark ? "#555" : "#ccc" }]}>
              <Text style={styles.buttonText}>Geri</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAdd} style={styles.confirmButton}>
              <Text style={styles.buttonText}>Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddPlateModal;

// Stil tanımları
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  error: {
    color: "#ff4d4d",
    marginBottom: 10,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    alignItems: "center",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
