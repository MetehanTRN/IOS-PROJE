import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { collection, getDoc, doc, setDoc, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useTheme } from "react-native-paper";

// Modal bileşeni için props tanımları
interface AddToBlacklistModalProps {
  visible: boolean;
  onClose: () => void;
  defaultPlate?: string;
}

// Plaka yazımını normalize eden yardımcı fonksiyon
const normalizePlate = (plate: string) => plate.replace(/\s/g, "").toUpperCase();

const AddToBlacklistModal: React.FC<AddToBlacklistModalProps> = ({ visible, onClose, defaultPlate }) => {
  const [plate, setPlate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { dark } = useTheme();

  // Modal açıldığında varsayılan plakayı al ve hata mesajını sıfırla
  useEffect(() => {
    if (visible) {
      setPlate(defaultPlate || "");
      setErrorMessage("");
    }
  }, [visible, defaultPlate]);

  // Ekleme işlemini gerçekleştiren fonksiyon
  const handleAdd = async () => {
    const trimmedPlate = normalizePlate(plate);

    if (!trimmedPlate) {
      setErrorMessage("Plaka boş bırakılamaz.");
      return;
    }

    // Plaka daha önce sistemde kayıtlı mı kontrol et
    const plateQuery = query(collection(db, "plates"), where("plate", "==", trimmedPlate));
    const plateSnap = await getDocs(plateQuery);

    if (!plateSnap.empty) {
      // Kullanıcıya uyarı ver ve onaylarsa sistemden silip kara listeye ekle
      Alert.alert(
        "Zaten Kayıtlı",
        "Bu plaka zaten sistemde kayıtlı. Kara listeye taşımak ve sistemden silmek ister misiniz?",
        [
          { text: "Hayır", style: "cancel" },
          {
            text: "Evet",
            onPress: async () => {
              await deleteDoc(plateSnap.docs[0].ref);
              await setDoc(doc(db, "blacklist", trimmedPlate), {
                plate: trimmedPlate,
                createdAt: new Date(),
              });
              onClose();
            },
          },
        ]
      );
      return;
    }

    // Plaka zaten kara listede varsa uyarı göster
    const docRef = doc(db, "blacklist", trimmedPlate);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setErrorMessage("⚠️ Bu plaka zaten kara listede kayıtlı.");
      return;
    }

    // Plakayı kara listeye ekle
    await setDoc(docRef, {
      plate: trimmedPlate,
      createdAt: new Date(),
    });

    setPlate("");
    setErrorMessage("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: dark ? "#1e1e1e" : "#fff" }]}>
          <Text style={[styles.title, { color: dark ? "#fff" : "#000" }]}>Kara Listeye Ekle</Text>

          <TextInput
            placeholder="Plaka"
            placeholderTextColor={dark ? "#999" : "#aaa"}
            value={plate}
            onChangeText={setPlate}
            style={[
              styles.input,
              {
                backgroundColor: dark ? "#333" : "#fff",
                color: dark ? "#fff" : "#000",
                borderColor: dark ? "#555" : "#ccc",
              },
            ]}
          />

          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

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

export default AddToBlacklistModal;

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
