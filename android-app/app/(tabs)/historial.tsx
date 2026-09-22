import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HistoryItem from "../../components/HistoryItem";
import PrimaryButton from "../../components/PrimaryButton";
import { useAlarm } from "../../store/alarm";
export default function History() {
  const a = useAlarm();
  return (
    <SafeAreaView style={{ flex:1, backgroundColor: "transparent"}}>
    <ScrollView style={{ flex: 1, backgroundColor: "transparent"}} contentContainerStyle={styles.wrap}>
      <Text style={styles.h1}>HISTORIAL</Text>
      <Text style={styles.subtitle}>Registro de actividad</Text>
      <View style={{ height: 8 }} />

      <PrimaryButton
        title="ACTUALIZAR"
        onPress={a.requestHistory}
        style={{ backgroundColor: "#3D4A64" }}
      />
      <View style={{ height: 10 }} />

      {a.history.map((h, i) => <HistoryItem key={i} item={h} />)}
    </ScrollView>

    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  wrap: { padding: 24, paddingBlockStart:24, gap: 0 },
  h1: { color: "#fff", fontWeight: "800", fontSize: 22 },
  subtitle: { color: "#9EB2C7" }
});
