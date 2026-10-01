import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useFocusEffect } from "@react-navigation/native";
import PanicButton from "../components/PanicButton";
import StatusCard from "../components/StatusCard";
import ActivityFeed from "../components/ActivityFeed";
import PasscodeModal from "../components/PasscodeModal";

import { checkPermissions } from "../services/permissionService";
import { getContacts } from "../services/contactService";
import { triggerSOS, stopSOS } from "../services/sosService";

import AsyncStorage from "@react-native-async-storage/async-storage";

const SOS_STATE_KEY = "SOS_ACTIVE";

export default function HomeScreen() {
  const [contactsReady, setContactsReady] = useState(false);
  const [locationReady, setLocationReady] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadSOSState = async () => {
      const state = await AsyncStorage.getItem(SOS_STATE_KEY);
      setIsSOSActive(state === "true");
    };

    loadSOSState();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const refreshStatus = async () => {
        try {
          const permissions = await checkPermissions();

          setLocationReady(permissions.location);
          setAudioReady(permissions.microphone);
          setCameraReady(permissions.camera);

          const contacts = await getContacts();
          setContactsReady(contacts.length > 0);
        } catch (error) {
          console.log("Status refresh error:", error);
        }
      };

      refreshStatus();
    }, [])
  );

  const handleSOS = async () => {
    try {
      await triggerSOS();
      setIsSOSActive(true);
    } catch (error) {
      console.log("SOS error:", error);
    }
  };

  const stopSOSHandler = () => {
    setShowModal(true);
  };

  const handlePasscodeSubmit = async (code) => {
    const success = await stopSOS(code);

    if (success) {
      setIsSOSActive(false);
      setShowModal(false);
      return true;
    }

    return false;
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>SAFETY SYSTEM</Text>

            <Text style={styles.title}>
              Emergency SOS
            </Text>

            <Text style={styles.subtitle}>
              Your safety companion
            </Text>
          </View>

          {/* System state indicator */}
          <View
            style={[
              styles.statusBadge,
              isSOSActive && styles.statusBadgeActive,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isSOSActive && styles.statusDotActive,
              ]}
            />

            <Text
              style={[
                styles.statusText,
                isSOSActive && styles.statusTextActive,
              ]}
            >
              {isSOSActive ? "ACTIVE" : "READY"}
            </Text>
          </View>
        </View>

        {/* SYSTEM STATUS */}
        <StatusCard
          contactsReady={contactsReady}
          locationReady={locationReady}
          audioReady={audioReady}
          cameraReady={cameraReady}
        />

        {/* SOS SECTION */}
        <View style={styles.sosSection}>
          <Text style={styles.sosLabel}>
            {isSOSActive ? "EMERGENCY ACTIVE" : "EMERGENCY"}
          </Text>

          <PanicButton
            onActivate={handleSOS}
            onStop={stopSOSHandler}
            isActive={isSOSActive}
          />

          {!isSOSActive && (
            <Text style={styles.sosHint}>
              Hold the button for 3 seconds
            </Text>
          )}
        </View>

        {/* ACTIVITY */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Recent activity
            </Text>

            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          <ActivityFeed />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* STOP SOS MODAL */}
      <PasscodeModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handlePasscodeSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#090909",
  },

  container: {
    flex: 1,
    backgroundColor: "#090909",
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  eyebrow: {
    color: "#666",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 7,
  },

  title: {
    color: "#F5F5F5",
    fontSize: 29,
    fontWeight: "700",
    letterSpacing: -0.6,
  },

  subtitle: {
    color: "#777",
    fontSize: 13,
    marginTop: 5,
  },

  /* READY / ACTIVE BADGE */

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#242424",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 5,
  },

  statusBadgeActive: {
    borderColor: "rgba(255,59,48,0.45)",
    backgroundColor: "rgba(255,59,48,0.08)",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },

  statusDotActive: {
    backgroundColor: "#FF3B30",
  },

  statusText: {
    color: "#999",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  statusTextActive: {
    color: "#FF5A52",
  },

  /* SOS */

  sosSection: {
    alignItems: "center",
    marginTop: 4,
    marginBottom: 28,
    paddingTop: 6,
  },

  sosLabel: {
    color: "#777",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 2,
  },

  sosHint: {
    color: "#555",
    fontSize: 12,
    marginTop: 13,
  },

  /* ACTIVITY */

  activitySection: {
    marginTop: 4,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitle: {
    color: "#E5E5E5",
    fontSize: 16,
    fontWeight: "600",
  },

  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
    marginRight: 5,
  },

  liveText: {
    color: "#666",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },

  bottomSpacing: {
    height: 20,
  },
});