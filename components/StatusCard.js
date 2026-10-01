import React from "react";
import { View, Text, StyleSheet } from "react-native";

function StatusRow({ label, ready }) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View
          style={[
            styles.statusDot,
            ready ? styles.readyDot : styles.notReadyDot,
          ]}
        />

        <Text style={styles.label}>{label}</Text>
      </View>

      <Text style={[styles.statusText, ready ? styles.readyText : styles.notReadyText]}>
        {ready ? "Ready" : "Not Ready"}
      </Text>
    </View>
  );
}

export default function StatusCard({
  contactsReady,
  locationReady,
  audioReady,
  cameraReady,
}) {
  const allReady =
    contactsReady &&
    locationReady &&
    audioReady &&
    cameraReady;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>System Status</Text>
          <Text style={styles.subtitle}>
            {allReady
              ? "Everything is ready"
              : "Some permissions need attention"}
          </Text>
        </View>

        <View
          style={[
            styles.overallBadge,
            allReady ? styles.overallReady : styles.overallWarning,
          ]}
        >
          <View
            style={[
              styles.overallDot,
              allReady ? styles.readyDot : styles.warningDot,
            ]}
          />

          <Text
            style={[
              styles.overallText,
              allReady ? styles.readyText : styles.warningText,
            ]}
          >
            {allReady ? "READY" : "CHECK"}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <StatusRow
        label="Emergency Contacts"
        ready={contactsReady}
      />

      <StatusRow
        label="Location Permission"
        ready={locationReady}
      />

      <StatusRow
        label="Microphone Permission"
        ready={audioReady}
      />

      <StatusRow
        label="Camera Permission"
        ready={cameraReady}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#151515",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#242424",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },

  subtitle: {
    color: "#777",
    fontSize: 12,
    marginTop: 4,
  },

  overallBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },

  overallReady: {
    backgroundColor: "#102015",
    borderColor: "#1f6b36",
  },

  overallWarning: {
    backgroundColor: "#201b10",
    borderColor: "#66521d",
  },

  overallDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  overallText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  readyDot: {
    backgroundColor: "#4ade80",
  },

  warningDot: {
    backgroundColor: "#facc15",
  },

  notReadyDot: {
    backgroundColor: "#ef4444",
  },

  readyText: {
    color: "#4ade80",
  },

  warningText: {
    color: "#facc15",
  },

  notReadyText: {
    color: "#ef4444",
  },

  divider: {
    height: 1,
    backgroundColor: "#242424",
    marginVertical: 14,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 38,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 11,
  },

  label: {
    color: "#d4d4d4",
    fontSize: 14,
    fontWeight: "500",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
});