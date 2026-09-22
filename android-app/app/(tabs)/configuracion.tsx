import { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../../components/PrimaryButton";
import { COLORS } from "../../constants/colors";
import { useAlarm } from "../../store/alarm";

export default function Config() {
  const a = useAlarm();


  const [ip, setIp] = useState(a.wsConfig.ip);
  const [port, setPort] = useState(a.wsConfig.port);

  useEffect(() => {
    setIp(a.wsConfig.ip);
    setPort(a.wsConfig.port);
  }, [a.wsConfig.ip, a.wsConfig.port]);

  const saveConfig = async () => {
    await a.setWsConfig({ ip: ip.trim(), port: port.trim() });
  };

  const connect = async () => {

    await saveConfig();
    a.connect();
  };

  const disconnect = () => a.disconnect();

  const connected = a.connected;
  const connecting = a.connecting;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
      <View style={{ flex: 1, backgroundColor: "transparent", padding: 24, gap: 12 }}>
        <Text style={styles.h1}>CONFIGURACIÓN</Text>
        <Text style={styles.subtitle}>Conexión con microcontrolador</Text>

        <View
          style={[
            styles.stateCard,
            { backgroundColor: connected ? COLORS.DESARMADA : connecting ? COLORS.ARMANDO : "#d63333" },
          ]}
        >
          <Text style={styles.stateTitle}>
            {connected ? "CONECTADO" : connecting ? "CONECTANDO..." : "DESCONECTADO"}
          </Text>
          <Text style={styles.stateSub}>
            {connected ? "Comunicación estable" : connecting ? "Estableciendo enlace..." : "Sin comunicación"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PARÁMETROS DE CONEXIÓN</Text>

          <TextInput
            placeholder="Dirección IP"
            value={ip}
            onChangeText={setIp}
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            placeholder="Puerto"
            value={port}
            onChangeText={setPort}
            keyboardType="numeric"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
          />

          <View style={styles.row}>
            <Text style={{ color: "#fff" }}>Reconexión automática</Text>
            <Switch value={a.autoReconnect} onValueChange={(v) => a.setAutoReconnect(v)} />
          </View>
        </View>

        <PrimaryButton title="Guardar Configuración" onPress={saveConfig} style={{ backgroundColor: "#3D4A64" }}/>

        {connected ? (
          <PrimaryButton title="Desconectar" onPress={disconnect} style={{ backgroundColor: "#3D4A64" }} />
        ) : (
          <PrimaryButton
            title={connecting ? "Conectando..." : "Conectar"}
            onPress={connect}
            style={{ backgroundColor: connecting ? COLORS.ARMANDO : COLORS.DESARMADA }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 16 },
  h1: { color: "#fff", fontWeight: "800", fontSize: 22 },
  subtitle: { color: "#9EB2C7" },
  stateCard: { borderRadius: 16, padding: 18 },
  stateTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  stateSub: { color: "#fff", marginTop: 6, opacity: 0.9 },
  section: {
    backgroundColor: "#16223A",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.outline,
    gap: 10,
  },
  sectionTitle: { color: "#fff", fontWeight: "800", marginBottom: 4 },
  input: {
    backgroundColor: "#121A2C",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.outline,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
