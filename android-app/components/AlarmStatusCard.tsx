import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { AlarmState } from "../store/alarm";

type Props = {
  state: AlarmState;
  armingLeft: number;
  disparoZona: number;
};

const stateUi = {
  DESARMADA: { color: "#66758D", icon: "shield-outline", label: "SYSTEM DISARMED" },
  ARMANDO: { color: "#F39C12", icon: "time-outline", label: "ARMING SYSTEM" },
  ARMADA: { color: "#00C853", icon: "shield-checkmark-outline", label: "SYSTEM ARMED" },
  DISPARADA: { color: "#E00000", icon: "alert-circle-outline", label: "ALARM TRIGGERED!" },
} as const;

export default function AlarmStatusCard({ state, armingLeft, disparoZona }: Props) {
  const ui = stateUi[state];
  return (
    <View style={[styles.card, { backgroundColor: ui.color }]}>
      <View style={styles.iconHalo}>
        <Ionicons name={ui.icon} color="#FFFFFF" size={42} />
      </View>
      <Text style={styles.label}>{ui.label}</Text>
      {state === "ARMANDO" && (
        <>
          <Text style={styles.countdown}>{armingLeft}</Text>
          <Text style={styles.seconds}>seconds</Text>
        </>
      )}
      {state === "DISPARADA" && disparoZona > 0 && (
        <Text style={styles.detail}>Motion detected in zone {disparoZona}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderRadius: 22,
    justifyContent: "center",
    minHeight: 225,
    overflow: "hidden",
    padding: 22,
  },
  iconHalo: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 80,
    borderWidth: 2,
    height: 120,
    justifyContent: "center",
    marginBottom: 20,
    width: 120,
  },
  label: { color: "#FFFFFF", fontSize: 18, fontWeight: "600", textAlign: "center" },
  countdown: { color: "#FFFFFF", fontSize: 36, fontWeight: "800", marginTop: 6 },
  seconds: { color: "#FFFFFF", fontSize: 15, opacity: 0.9 },
  detail: { color: "#FFFFFF", fontSize: 13, marginTop: 8, opacity: 0.9 },
});
