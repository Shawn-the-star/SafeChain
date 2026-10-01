import { View, Text, StyleSheet } from "react-native";
import { subscribeToActivities } from "../services/activityLogger";
import { useEffect, useState } from "react";

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToActivities(setActivities);

    return unsubscribe;
  }, []);

  const getType = (message) => {
    if (message.includes("SOS") || message.includes("🚨")) {
      return "danger";
    }

    if (message.includes("error")) {
      return "error";
    }

    if (message.includes("started")) {
      return "success";
    }

    return "normal";
  };

  const getIndicatorColor = (type) => {
    switch (type) {
      case "danger":
        return "#ff3b30";
      case "error":
        return "#facc15";
      case "success":
        return "#4ade80";
      default:
        return "#666";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Live Activity</Text>

          <Text style={styles.subtitle}>
            Recent security events
          </Text>
        </View>

        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Activity List */}
      <View style={styles.activityList}>
        {activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>•</Text>
            </View>

            <Text style={styles.emptyTitle}>
              No activity yet
            </Text>

            <Text style={styles.emptyText}>
              Security events will appear here
            </Text>
          </View>
        ) : (
          activities.map((item, index) => {
            const type = getType(item.message);
            const indicatorColor = getIndicatorColor(type);

            return (
              <View key={item.id} style={styles.item}>
                {/* Timeline */}
                <View style={styles.timeline}>
                  <View
                    style={[
                      styles.indicator,
                      {
                        backgroundColor: indicatorColor,
                      },
                    ]}
                  />

                  {index !== activities.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>

                {/* Activity Content */}
                <View style={styles.activityContent}>
                  <Text style={styles.message}>
                    {item.message}
                  </Text>

                  <Text style={styles.time}>
                    {item.time}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#151515",
    borderRadius: 18,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#242424",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  title: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },

  subtitle: {
    color: "#777",
    fontSize: 11,
    marginTop: 3,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151d17",
    borderWidth: 1,
    borderColor: "#24452e",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ade80",
    marginRight: 5,
  },

  liveText: {
    color: "#4ade80",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  activityList: {
    width: "100%",
  },

  item: {
    flexDirection: "row",
    minHeight: 46,
  },

  timeline: {
    width: 20,
    alignItems: "center",
  },

  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },

  timelineLine: {
    width: 1,
    flex: 1,
    backgroundColor: "#292929",
    marginTop: 4,
    marginBottom: 3,
  },

  activityContent: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 12,
  },

  message: {
    color: "#d6d6d6",
    fontSize: 13,
    lineHeight: 18,
  },

  time: {
    color: "#666",
    fontSize: 10,
    marginTop: 3,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },

  emptyIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#202020",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  emptyIconText: {
    color: "#666",
    fontSize: 20,
    lineHeight: 20,
  },

  emptyTitle: {
    color: "#aaa",
    fontSize: 12,
    fontWeight: "600",
  },

  emptyText: {
    color: "#555",
    fontSize: 10,
    marginTop: 3,
  },
});