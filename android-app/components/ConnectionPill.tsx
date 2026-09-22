import { StyleSheet, Text, View } from "react-native";

export default function ConnectionPill({ online }: { online: boolean }) {
  return (
    <View style={[styles.pill, online ? styles.online : styles.offline]}>
      <View style={[styles.dot, { backgroundColor: online ? "#24D67A" : "#FF5D5D" }]} />
      <Text style={styles.text}>{online ? "Online" : "Offline"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  online: { backgroundColor: "rgba(19, 111, 76, 0.42)" },
  offline: { backgroundColor: "rgba(130, 45, 50, 0.42)" },
  dot: { borderRadius: 5, height: 9, width: 9 },
  text: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
