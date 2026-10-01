import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";

const HOLD_DURATION = 3000;

export default function PanicButton({
  onActivate,
  onStop,
  isActive,
}) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const timerRef = useRef(null);
  const activatedRef = useRef(false);

  // Active SOS pulse
  useEffect(() => {
    if (!isActive) {
      pulseAnim.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.035,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, [isActive]);

  const startHold = () => {
    if (isActive || isHolding) return;

    setIsHolding(true);
    setProgress(0);
    activatedRef.current = false;

    progressAnim.setValue(0);

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 150,
        useNativeDriver: true,
      }),

      Animated.timing(progressAnim, {
        toValue: 1,
        duration: HOLD_DURATION,
        useNativeDriver: false,
      }),
    ]).start();

    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(elapsed / HOLD_DURATION, 1);

      setProgress(currentProgress);

      if (currentProgress >= 1) {
        clearInterval(timerRef.current);
        timerRef.current = null;

        activatedRef.current = true;
        setIsHolding(false);

        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }).start();

        onActivate?.();
      }
    }, 50);
  };

  const cancelHold = () => {
    if (!isHolding || activatedRef.current) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsHolding(false);
    setProgress(0);

    progressAnim.stopAnimation();
    progressAnim.setValue(0);

    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  if (isActive) {
    return (
      <View style={styles.container}>
        <View style={styles.activeHeader}>
          <View style={styles.activeIndicator} />

          <View>
            <Text style={styles.activeTitle}>SOS ACTIVE</Text>
            <Text style={styles.activeSubtitle}>
              Emergency mode is currently running
            </Text>
          </View>
        </View>

        <Animated.View
          style={[
            styles.activeCard,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={styles.activeIconCircle}>
            <Text style={styles.activeIcon}>!</Text>
          </View>

          <Text style={styles.activeMainText}>
            Help is being coordinated
          </Text>

          <Text style={styles.activeDescription}>
            Your emergency response, location tracking and recording
            services are active.
          </Text>

          <View style={styles.activeStatusRow}>
            <View style={styles.statusItem}>
              <View style={styles.statusDot} />
              <Text style={styles.statusLabel}>Tracking</Text>
            </View>

            <View style={styles.statusItem}>
              <View style={styles.statusDot} />
              <Text style={styles.statusLabel}>Recording</Text>
            </View>
          </View>
        </Animated.View>

        <Pressable
          onPress={onStop}
          style={({ pressed }) => [
            styles.stopButton,
            pressed && styles.stopButtonPressed,
          ]}
        >
          <Text style={styles.stopButtonText}>STOP SOS</Text>
        </Pressable>

        <Text style={styles.stopHint}>
          Enter your passcode to stop the emergency
        </Text>
      </View>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.headingTitle}>Emergency SOS</Text>

        <Text style={styles.headingSubtitle}>
          Hold the button for 3 seconds to activate
        </Text>
      </View>

      <View style={styles.buttonArea}>
        <View style={styles.outerRing}>
          <Animated.View
            style={[
              styles.progressRing,
              {
                transform: [
                  {
                    scale: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.06],
                    }),
                  },
                ],
                opacity: progressAnim.interpolate({
                  inputRange: [0, 0.05, 1],
                  outputRange: [0.25, 0.6, 1],
                }),
              },
            ]}
          />

          <Animated.View
            style={[
              styles.sosButton,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Pressable
              onPressIn={startHold}
              onPressOut={cancelHold}
              style={styles.pressArea}
            >
              <Text style={styles.sosLabel}>
                {isHolding ? "HOLD..." : "SOS"}
              </Text>

              <Text style={styles.sosSubLabel}>
                {isHolding
                  ? `${Math.ceil((1 - progress) * 3)}s`
                  : "EMERGENCY"}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>

        <Text style={styles.progressText}>
          {isHolding
            ? "Keep holding to activate SOS"
            : "Hold for 3 seconds"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },

  heading: {
    alignItems: "center",
    marginBottom: 22,
  },

  headingTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },

  headingSubtitle: {
    color: "#777",
    fontSize: 12,
    marginTop: 5,
  },

  buttonArea: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  outerRing: {
    width: 216,
    height: 216,
    borderRadius: 108,
    borderWidth: 1,
    borderColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
  },

  progressRing: {
    position: "absolute",
    width: 202,
    height: 202,
    borderRadius: 101,
    borderWidth: 5,
    borderColor: "#ff3b30",
  },

  sosButton: {
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: "#d92f29",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ff3b30",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },

  pressArea: {
    width: "100%",
    height: "100%",
    borderRadius: 88,
    alignItems: "center",
    justifyContent: "center",
  },

  sosLabel: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 1,
  },

  sosSubLabel: {
    color: "#ffd9d7",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginTop: 4,
  },

  progressContainer: {
    width: "82%",
    alignItems: "center",
  },

  progressTrack: {
    width: "100%",
    height: 4,
    backgroundColor: "#252525",
    borderRadius: 2,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#ff3b30",
    borderRadius: 2,
  },

  progressText: {
    color: "#777",
    fontSize: 11,
    marginTop: 9,
  },

  activeHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  activeIndicator: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#ff3b30",
    marginRight: 10,
  },

  activeTitle: {
    color: "#ff5148",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  activeSubtitle: {
    color: "#777",
    fontSize: 11,
    marginTop: 2,
  },

  activeCard: {
    width: "100%",
    backgroundColor: "#171313",
    borderWidth: 1,
    borderColor: "#40201e",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
  },

  activeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ff3b30",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  activeIcon: {
    color: "#ffffff",
    fontSize: 25,
    fontWeight: "800",
  },

  activeMainText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },

  activeDescription: {
    color: "#999",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 7,
    maxWidth: 290,
  },

  activeStatusRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 20,
  },

  statusItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ade80",
    marginRight: 6,
  },

  statusLabel: {
    color: "#aaa",
    fontSize: 11,
    fontWeight: "600",
  },

  stopButton: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#ff3b30",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },

  stopButtonPressed: {
    backgroundColor: "#241414",
  },

  stopButtonText: {
    color: "#ff5148",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },

  stopHint: {
    color: "#666",
    fontSize: 10,
    marginTop: 8,
  },
});