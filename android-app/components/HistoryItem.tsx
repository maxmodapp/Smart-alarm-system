import { StyleSheet, Text, View } from "react-native";
import type { HistoryItem as HistoryItemData } from "../store/alarm";

function describe(item: HistoryItemData) {
  if (item.tipo === "DISPARO") return `Alarm triggered · Zone ${item.zona || "unknown"}`;
  if (item.tipo === "ARMADA") return "System armed";
  if (item.tipo === "DESARMADA") return "System disarmed";
  return `Zone ${item.zona} ${item.valor ? "enabled" : "disabled"}`;
}

export default function HistoryItem({ item }: { item: HistoryItemData }) {
  const alarm = item.tipo === "DISPARO";
  return (
    <View style={[styles.card, alarm && styles.alarmCard]}>
      <Text style={[styles.title, alarm && styles.alarmTitle]}>{describe(item)}</Text>
      <Text style={styles.date}>{new Date(item.t).toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: "#5D6B86",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 17,
  },
  alarmCard: { borderColor: "#E74C3C" },
  title: { color: "#DCE5F2", fontSize: 15, fontWeight: "800" },
  alarmTitle: { color: "#FF6464" },
  date: { color: "#9EADC2", marginTop: 9 },
});
