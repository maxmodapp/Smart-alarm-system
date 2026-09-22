import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AlarmStatusCard from "../../components/AlarmStatusCard";
import ConnectionPill from "../../components/ConnectionPill";
import PrimaryButton from "../../components/PrimaryButton";
import ZoneChip from "../../components/ZoneChip";
import { COLORS } from "../../constants/colors";
import { useAlarm } from "../../store/alarm";

export default function Home() {
  const a = useAlarm();

  console.log("z1", a.zones.z1)
  console.log("z2", a.zones.z2)
  console.log("z3", a.zones.z3)

  return (
    
    <SafeAreaView style={{ flex:1, backgroundColor: "transparent"}}>
    <ScrollView style={{ flex: 1, backgroundColor: "transparent" }} contentContainerStyle={styles.wrap}>
    <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center" }}>
      <View>
        <Text style={styles.h1}>SISTEMA DE ALARMA</Text>
        <Text style={styles.subtitle}>Panel de Control Principal</Text>
      </View>
      <ConnectionPill online={a.connected && !a.connecting} />
    </View>

      <AlarmStatusCard state={a.state} armingLeft={a.armingLeft} disparoZona={a.disparoZona}/>

      {/* disparoZona={a.disparoZona */}
      
      
      {a.state === "DESARMADA" ? (
        <PrimaryButton title="ARMAR SISTEMA"  onPress={a.arm} style={{backgroundColor: COLORS.DESARMADA }} />
      ) : (
        <PrimaryButton title="DESARMAR SISTEMA" onPress={a.disarm} style={{ backgroundColor: "#3D4A64" }} />
      )}

      {/* Tarjeta de Zonas  */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text style={styles.h2}>ZONAS DE SEGURIDAD</Text>
          <Text style={styles.count}>{a.activeCount} / 3</Text>
        </View>
        <View style={{ gap: 10 }}>
          <ZoneChip name={a.names.z1} enabled={a.zones.z1} active={a.zonesActive.z1} />
          <ZoneChip name={a.names.z2} enabled={a.zones.z2} active={a.zonesActive.z2} />
          <ZoneChip name={a.names.z3} enabled={a.zones.z3} active={a.zonesActive.z3} />

        </View>

        {/* <Text style={styles.link}>Gestionar zonas →</Text> */}

      </View>

      <View style={{ height: 40 }} />
    </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 24, paddingBlockStart:24, gap: 25 },
  h1: { color: "#fff", fontWeight: "400", fontSize: 22 },
  subtitle: { color: "#9EB2C7" },
  section: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.outline, gap: 12
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  h2: { color: "#fff", fontWeight: "400" },
  count: { color: COLORS.textMuted, fontWeight: "700" },
  link: { color: "#8AB8FF", marginTop: 6 }
});
