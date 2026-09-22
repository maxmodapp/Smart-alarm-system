import { StyleSheet, Text, View } from "react-native";

type Props = { name: string; enabled: boolean; active: boolean };

export default function ZoneChip({ name, enabled, active }: Props) {
  return (
    <View style={[styles.row, active && styles.activeRow]}>
      <View style={[styles.dot, { backgroundColor: active ? "#FF5151" : enabled ? "#00D56A" : "#56647E" }]} />
      <Text numberOfLines={1} style={styles.name}>{name}</Text>
      <View style={[styles.badge, enabled ? styles.enabledBadge : styles.disabledBadge]}>
        <Text style={[styles.badgeText, enabled ? styles.enabledText : styles.disabledText]}>
          {enabled ? "ENABLED" : "DISABLED"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 58,
    paddingHorizontal: 14,
  },
  activeRow: { borderColor: "rgba(255,81,81,0.65)" },
  dot: { borderRadius: 5, height: 10, marginRight: 12, width: 10 },
  name: { color: "#E8EEF8", flex: 1, fontSize: 15 },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  enabledBadge: { backgroundColor: "rgba(0,213,106,0.14)" },
  disabledBadge: { backgroundColor: "rgba(100,115,145,0.22)" },
  badgeText: { fontSize: 11, fontWeight: "800" },
  enabledText: { color: "#00D56A" },
  disabledText: { color: "#A9B4C8" },
});
