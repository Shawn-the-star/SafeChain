import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

import { getContacts, addContact, deleteContact } from "../services/contactService";

export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const loadContacts = async () => {
    const data = await getContacts();
    setContacts(data);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleAddContact = async () => {
    if (!name.trim() || !phone.trim()) return;

    await addContact({
      name: name.trim(),
      phone: phone.trim(),
    });

    setName("");
    setPhone("");
    setModalVisible(false);

    loadContacts();
  };

  const removeContact = async (index) => {
    await deleteContact(index);
    loadContacts();
  };

  const closeModal = () => {
    setName("");
    setPhone("");
    setModalVisible(false);
  };

  const renderContact = ({ item, index }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>

          <Text style={styles.phone}>
            {item.phone}
          </Text>

          <View style={styles.emergencyBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>
              Emergency contact
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.removeButton}
        onPress={() => removeContact(index)}
      >
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Emergency Contacts</Text>

          <Text style={styles.subtitle}>
            People who can be contacted during an emergency
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {contacts.length}
          </Text>
        </View>
      </View>

      {/* Contact List */}
      <FlatList
        data={contacts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderContact}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          contacts.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>+</Text>
            </View>

            <Text style={styles.emptyTitle}>
              No emergency contacts
            </Text>

            <Text style={styles.emptyText}>
              Add someone you trust so they can be
              contacted when you activate SOS.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.emptyAddButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.emptyAddText}>
                Add Emergency Contact
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Add Button */}
      {contacts.length > 0 && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.floatingButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>
      )}

      {/* Add Contact Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalOverlay}
            onPress={closeModal}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalContent}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    Add Emergency Contact
                  </Text>

                  <Text style={styles.modalSubtitle}>
                    This person may receive your SOS alert
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                >
                  <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>
              </View>

              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  CONTACT NAME
                </Text>

                <TextInput
                  placeholder="e.g. Mom"
                  placeholderTextColor="#666"
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  PHONE NUMBER
                </Text>

                <TextInput
                  placeholder="e.g. +91 98765 43210"
                  placeholderTextColor="#666"
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Save */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.saveButton,
                  (!name.trim() || !phone.trim()) &&
                    styles.saveButtonDisabled,
                ]}
                onPress={handleAddContact}
                disabled={!name.trim() || !phone.trim()}
              >
                <Text style={styles.saveText}>
                  Save Contact
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={closeModal}
                style={styles.cancelButton}
              >
                <Text style={styles.cancel}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0c0c",
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 22,
  },

  title: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
  },

  subtitle: {
    color: "#777",
    fontSize: 11,
    marginTop: 5,
    maxWidth: 300,
    lineHeight: 16,
  },

  countBadge: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 17,
    backgroundColor: "#191919",
    borderWidth: 1,
    borderColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    color: "#aaa",
    fontSize: 12,
    fontWeight: "700",
  },

  listContent: {
    paddingBottom: 110,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  contactCard: {
    backgroundColor: "#151515",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#242424",
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  contactLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#241717",
    borderWidth: 1,
    borderColor: "#482321",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  avatarText: {
    color: "#ff6259",
    fontSize: 17,
    fontWeight: "800",
  },

  contactInfo: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },

  phone: {
    color: "#888",
    fontSize: 12,
    marginTop: 3,
  },

  emergencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#151c17",
  },

  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#4ade80",
    marginRight: 5,
  },

  badgeText: {
    color: "#72c98e",
    fontSize: 8,
    fontWeight: "700",
  },

  removeButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginLeft: 8,
  },

  removeText: {
    color: "#ff5148",
    fontSize: 11,
    fontWeight: "700",
  },

  floatingButton: {
    position: "absolute",
    right: 22,
    bottom: 25,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#ff3b30",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },

  plus: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "400",
    marginTop: -2,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingBottom: 40,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#191919",
    borderWidth: 1,
    borderColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyIconText: {
    color: "#777",
    fontSize: 30,
    fontWeight: "300",
  },

  emptyTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },

  emptyText: {
    color: "#666",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 7,
    maxWidth: 280,
  },

  emptyAddButton: {
    backgroundColor: "#ff3b30",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 18,
  },

  emptyAddText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },

  modalContent: {
    backgroundColor: "#161616",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#292929",
    padding: 22,
    paddingBottom: 30,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  modalTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },

  modalSubtitle: {
    color: "#777",
    fontSize: 11,
    marginTop: 4,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },

  closeText: {
    color: "#aaa",
    fontSize: 23,
    lineHeight: 25,
    fontWeight: "300",
  },

  inputGroup: {
    marginBottom: 16,
  },

  inputLabel: {
    color: "#777",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 7,
  },

  input: {
    height: 50,
    backgroundColor: "#101010",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#ffffff",
    fontSize: 14,
  },

  saveButton: {
    height: 50,
    backgroundColor: "#ff3b30",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  saveButtonDisabled: {
    opacity: 0.4,
  },

  saveText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },

  cancelButton: {
    alignItems: "center",
    paddingVertical: 12,
  },

  cancel: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
  },
});