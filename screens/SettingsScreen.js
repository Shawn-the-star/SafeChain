import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen({ navigation }) {
  const [hasPasscode, setHasPasscode] = useState(false);

  useEffect(() => {
    const checkPasscode = async () => {
      const code = await AsyncStorage.getItem("SOS_PASSCODE");
      setHasPasscode(!!code);
    };

    checkPasscode();
  }, []);

  const openCalculator = () => {
    // Settings is inside the Tab Navigator.
    // Move to the parent Stack Navigator.
    const parentNavigation = navigation.getParent();

    if (parentNavigation) {
      parentNavigation.navigate("Calculator");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Manage your safety preferences
          </Text>
        </View>

        {/* Security section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SECURITY</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.settingItem}
            onPress={() => navigation.navigate("SetPasscode")}
          >
            <View style={styles.settingIcon}>
              <Text style={styles.iconText}>••</Text>
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                {hasPasscode ? "Change Passcode" : "Set Passcode"}
              </Text>

              <Text style={styles.settingDescription}>
                {hasPasscode
                  ? "Update your SOS stop passcode"
                  : "Protect your SOS controls"}
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.settingItem}
            onPress={openCalculator}
          >
            <View style={styles.settingIcon}>
              <Text style={styles.calculatorIcon}>÷</Text>
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Calculator Mode
              </Text>

              <Text style={styles.settingDescription}>
                Return to the calculator screen
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Safety App
          </Text>

          <Text style={styles.versionText}>
            Version 1.0.0
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  header: {
    marginBottom: 32,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: "#777777",
    fontSize: 14,
    marginTop: 6,
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    color: "#666666",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },

  settingItem: {
    minHeight: 72,
    backgroundColor: "#151515",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#222222",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  iconText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -2,
  },

  calculatorIcon: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "300",
  },

  settingContent: {
    flex: 1,
  },

  settingTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  settingDescription: {
    color: "#777777",
    fontSize: 12,
    marginTop: 4,
  },

  arrow: {
    color: "#555555",
    fontSize: 28,
    fontWeight: "300",
    marginLeft: 10,
  },

  footer: {
    marginTop: "auto",
    alignItems: "center",
    paddingBottom: 20,
  },

  footerText: {
    color: "#555555",
    fontSize: 12,
  },

  versionText: {
    color: "#3F3F3F",
    fontSize: 11,
    marginTop: 4,
  },
});