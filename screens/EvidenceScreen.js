import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import MapView, { Marker } from "react-native-maps";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";

const SESSION_KEY = "CURRENT_EVIDENCE_SESSION";

export default function EvidenceScreen() {
  const [session, setSession] = useState(null);
  const [sound, setSound] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [playingUri, setPlayingUri] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadEvidence = async () => {
    try {
      const data = await AsyncStorage.getItem(SESSION_KEY);

      if (data) {
        setSession(JSON.parse(data));
      } else {
        setSession(null);
      }
    } catch (err) {
      console.log("Evidence load error:", err);
    }
  };

  const playAudio = async (uri) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync({ uri });

      setSound(newSound);
      setPlayingUri(uri);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingUri(null);
        }
      });

      await newSound.playAsync();
    } catch (err) {
      setPlayingUri(null);
      console.log("Audio play error:", err);
    }
  };

  useEffect(() => {
    loadEvidence();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => { });
      }
    };
  }, []);

  if (!session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyScreen}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>▣</Text>
          </View>

          <Text style={styles.emptyTitle}>No Evidence Recorded</Text>

          <Text style={styles.emptyDescription}>
            Evidence from an SOS session will appear here.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.refreshButton,
              pressed && styles.pressed,
            ]}
            onPress={loadEvidence}
          >
            <Text style={styles.refreshButtonText}>
              Refresh Evidence
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const audioCount = session.audio?.length || 0;
  const photoCount = session.photos?.length || 0;
  const locationCount = session.locations?.length || 0;

  const isActive = !session.endTime;

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <Animated.View
        style={[
          styles.screen,
          { opacity: fadeAnim },
        ]}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >

          {/* ================= HEADER ================= */}

          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>
                SECURITY RECORD
              </Text>

              <Text style={styles.title}>
                Evidence
              </Text>

              <Text style={styles.subtitle}>
                Collected evidence from your SOS session
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.headerRefresh,
                pressed && styles.pressed,
              ]}
              onPress={loadEvidence}
            >
              <Text style={styles.headerRefreshText}>
                ↻
              </Text>
            </Pressable>
          </View>

          {/* ================= SESSION CARD ================= */}

          <View style={styles.sessionCard}>

            <View style={styles.sessionTop}>

              <View>
                <Text style={styles.cardLabel}>
                  SESSION STATUS
                </Text>

                <Text style={styles.sessionTitle}>
                  {isActive
                    ? "SOS Session Active"
                    : "SOS Session Complete"}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  isActive
                    ? styles.activeBadge
                    : styles.completeBadge,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    isActive
                      ? styles.activeDot
                      : styles.completeDot,
                  ]}
                />

                <Text
                  style={[
                    styles.statusText,
                    isActive
                      ? styles.activeText
                      : styles.completeText,
                  ]}
                >
                  {isActive ? "ACTIVE" : "SAVED"}
                </Text>
              </View>

            </View>

            <View style={styles.divider} />

            <View style={styles.timeRow}>

              <View style={styles.timeBlock}>
                <Text style={styles.timeLabel}>
                  STARTED
                </Text>

                <Text style={styles.timeValue}>
                  {new Date(
                    session.startTime
                  ).toLocaleString()}
                </Text>
              </View>

              <View style={styles.timeBlock}>
                <Text style={styles.timeLabel}>
                  ENDED
                </Text>

                <Text style={styles.timeValue}>
                  {session.endTime
                    ? new Date(
                      session.endTime
                    ).toLocaleString()
                    : "Currently active"}
                </Text>
              </View>

            </View>
          </View>

          {/* ================= SUMMARY ================= */}

          <View style={styles.summaryRow}>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {audioCount}
              </Text>

              <Text style={styles.summaryLabel}>
                Audio
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {photoCount}
              </Text>

              <Text style={styles.summaryLabel}>
                Photos
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {locationCount}
              </Text>

              <Text style={styles.summaryLabel}>
                Locations
              </Text>
            </View>

          </View>

          {/* ================= AUDIO ================= */}

          <View style={styles.sectionHeader}>

            <View>
              <Text style={styles.sectionTitle}>
                Audio Evidence
              </Text>

              <Text style={styles.sectionSubtitle}>
                Recorded audio segments
              </Text>
            </View>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {audioCount}
              </Text>
            </View>

          </View>

          {audioCount === 0 ? (
            <EmptySection
              text="No audio was recorded during this session."
            />
          ) : (
            session.audio.map((item, index) => {

              const isPlaying =
                playingUri === item.uri;

              return (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    styles.audioCard,
                    isPlaying &&
                    styles.audioCardPlaying,
                    pressed &&
                    styles.pressed,
                  ]}
                  onPress={() =>
                    playAudio(item.uri)
                  }
                >

                  <View
                    style={[
                      styles.audioIcon,
                      isPlaying &&
                      styles.audioIconPlaying,
                    ]}
                  >
                    <Text style={styles.audioIconText}>
                      {isPlaying ? "Ⅱ" : "▶"}
                    </Text>
                  </View>

                  <View style={styles.audioContent}>

                    <Text style={styles.audioTitle}>
                      Audio Segment {index + 1}
                    </Text>

                    <Text style={styles.audioSubtitle}>
                      {isPlaying
                        ? "Playing audio..."
                        : "Tap to play recording"}
                    </Text>

                  </View>

                  <Text style={styles.audioArrow}>
                    ›
                  </Text>

                </Pressable>
              );
            })
          )}

          {/* ================= PHOTOS ================= */}

          <View style={styles.sectionHeader}>

            <View>
              <Text style={styles.sectionTitle}>
                Photo Evidence
              </Text>

              <Text style={styles.sectionSubtitle}>
                Captured images from the session
              </Text>
            </View>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {photoCount}
              </Text>
            </View>

          </View>

          {photoCount === 0 ? (
            <EmptySection
              text="No photos were captured during this session."
            />
          ) : (
            <View style={styles.photoGrid}>

              {session.photos.map((item, index) => (

                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    styles.photoCard,
                    pressed && styles.pressed,
                  ]}
                  onPress={() =>
                    setSelectedImage(item.uri)
                  }
                >

                  <Image
                    source={{ uri: item.uri }}
                    style={styles.photo}
                    contentFit="cover"
                  />

                  <View style={styles.photoOverlay}>

                    <Text style={styles.photoNumber}>
                      {index + 1}
                    </Text>

                    <Text style={styles.photoExpand}>
                      ⛶
                    </Text>

                  </View>

                </Pressable>

              ))}

            </View>
          )}

          {/* ================= LOCATION ================= */}

          <View style={styles.sectionHeader}>

            <View>
              <Text style={styles.sectionTitle}>
                Location Evidence
              </Text>

              <Text style={styles.sectionSubtitle}>
                Recorded GPS positions
              </Text>
            </View>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {locationCount}
              </Text>
            </View>

          </View>

          {locationCount === 0 ? (
            <EmptySection
              text="No location data was recorded during this session."
            />
          ) : (
            <View style={styles.mapCard}>

              <MapView
                style={styles.map}
                initialRegion={{
                  latitude:
                    session.locations[0].coords.latitude,

                  longitude:
                    session.locations[0].coords.longitude,

                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >

                {session.locations.map(
                  (item, index) => (
                    <Marker
                      key={index}
                      coordinate={{
                        latitude:
                          item.coords.latitude,

                        longitude:
                          item.coords.longitude,
                      }}
                    />
                  )
                )}

              </MapView>

              <View style={styles.mapFooter}>

                <View style={styles.mapIndicator} />

                <Text style={styles.mapFooterText}>
                  {locationCount} location point
                  {locationCount === 1
                    ? ""
                    : "s"} recorded
                </Text>

              </View>

            </View>
          )}

          <View style={{ height: 30 }} />

        </ScrollView>
      </Animated.View>

      {/* ================= FULLSCREEN IMAGE ================= */}

      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
      >

        <View style={styles.imageModal}>

          <Pressable
            style={styles.closeButton}
            onPress={() =>
              setSelectedImage(null)
            }
          >
            <Text style={styles.closeButtonText}>
              ×
            </Text>
          </Pressable>

          <Pressable
            style={styles.imageModalContent}
            onPress={() =>
              setSelectedImage(null)
            }
          >

            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              contentFit="contain"
            />

          </Pressable>

          <Text style={styles.imageHint}>
            Tap anywhere to close
          </Text>

        </View>

      </Modal>

    </SafeAreaView>
  );
}


/* =========================================================
   EMPTY SECTION
========================================================= */

function EmptySection({ text }) {
  return (
    <View style={styles.emptySection}>

      <View style={styles.emptySectionDot} />

      <Text style={styles.emptySectionText}>
        {text}
      </Text>

    </View>
  );
}


/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#0c0c0c",
  },

  screen: {
    flex: 1,
    backgroundColor: "#0c0c0c",
  },

  container: {
    flex: 1,
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
    marginBottom: 22,
  },

  headerText: {
    flex: 1,
    paddingRight: 16,
  },

  eyebrow: {
    color: "#666",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 5,
  },

  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
  },

  subtitle: {
    color: "#777",
    fontSize: 13,
    marginTop: 5,
    lineHeight: 19,
  },

  headerRefresh: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#242424",
    justifyContent: "center",
    alignItems: "center",
  },

  headerRefreshText: {
    color: "#bbb",
    fontSize: 25,
    lineHeight: 28,
  },

  /* SESSION */

  sessionCard: {
    backgroundColor: "#151515",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#242424",
    padding: 18,
  },

  sessionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  cardLabel: {
    color: "#666",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 7,
  },

  sessionTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: "rgba(255,59,48,0.12)",
  },

  completeBadge: {
    backgroundColor: "rgba(74,222,128,0.10)",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  activeDot: {
    backgroundColor: "#ff3b30",
  },

  completeDot: {
    backgroundColor: "#4ade80",
  },

  statusText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  activeText: {
    color: "#ff6b63",
  },

  completeText: {
    color: "#4ade80",
  },

  divider: {
    height: 1,
    backgroundColor: "#242424",
    marginVertical: 16,
  },

  timeRow: {
    gap: 13,
  },

  timeBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  timeLabel: {
    color: "#666",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  timeValue: {
    color: "#aaa",
    fontSize: 11,
    maxWidth: "70%",
    textAlign: "right",
  },

  /* SUMMARY */

  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: "center",
  },

  summaryNumber: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },

  summaryLabel: {
    color: "#777",
    fontSize: 11,
    marginTop: 3,
  },

  /* SECTION */

  sectionHeader: {
    marginTop: 28,
    marginBottom: 11,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  sectionSubtitle: {
    color: "#666",
    fontSize: 11,
    marginTop: 3,
  },

  countBadge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: "#181818",
    borderWidth: 1,
    borderColor: "#292929",
    justifyContent: "center",
    alignItems: "center",
  },

  countText: {
    color: "#aaa",
    fontSize: 11,
    fontWeight: "700",
  },

  /* AUDIO */

  audioCard: {
    minHeight: 72,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 16,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  audioCardPlaying: {
    borderColor: "#ff3b30",
  },

  audioIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#202020",
    justifyContent: "center",
    alignItems: "center",
  },

  audioIconPlaying: {
    backgroundColor: "rgba(255,59,48,0.14)",
  },

  audioIconText: {
    color: "#ff5148",
    fontSize: 15,
    fontWeight: "800",
  },

  audioContent: {
    flex: 1,
    marginLeft: 13,
  },

  audioTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  audioSubtitle: {
    color: "#707070",
    fontSize: 11,
    marginTop: 4,
  },

  audioArrow: {
    color: "#555",
    fontSize: 25,
    marginLeft: 8,
  },

  /* PHOTOS */

  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  photoCard: {
    width: "48.5%",
    height: 150,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 10,
    backgroundColor: "#151515",
  },

  photo: {
    width: "100%",
    height: "100%",
  },

  photoOverlay: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  photoNumber: {
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: "700",
  },

  photoExpand: {
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.65)",
    width: 27,
    height: 27,
    borderRadius: 8,
    textAlign: "center",
    lineHeight: 27,
    fontSize: 14,
  },

  /* MAP */

  mapCard: {
    backgroundColor: "#151515",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#242424",
    overflow: "hidden",
  },

  map: {
    height: 260,
    width: "100%",
  },

  mapFooter: {
    height: 45,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  mapIndicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#ff3b30",
    marginRight: 8,
  },

  mapFooterText: {
    color: "#888",
    fontSize: 11,
  },

  /* EMPTY */

  emptySection: {
    minHeight: 66,
    backgroundColor: "#121212",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#202020",
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  emptySectionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#444",
    marginRight: 10,
  },

  emptySectionText: {
    flex: 1,
    color: "#666",
    fontSize: 12,
    lineHeight: 18,
  },

  emptyScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 35,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#242424",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  emptyIconText: {
    color: "#666",
    fontSize: 27,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "700",
  },

  emptyDescription: {
    color: "#666",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 7,
    maxWidth: 280,
  },

  refreshButton: {
    marginTop: 22,
    backgroundColor: "#ff3b30",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  refreshButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  /* GENERAL */

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  /* FULLSCREEN IMAGE */

  imageModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.98)",
    justifyContent: "center",
    alignItems: "center",
  },

  imageModalContent: {
    width: "100%",
    height: "82%",
    justifyContent: "center",
    alignItems: "center",
  },

  fullImage: {
    width: "100%",
    height: "100%",
  },

  closeButton: {
    position: "absolute",
    top: 52,
    right: 20,
    zIndex: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(35,35,35,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },

  closeButtonText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 30,
  },

  imageHint: {
    position: "absolute",
    bottom: 35,
    color: "#666",
    fontSize: 11,
  },

});