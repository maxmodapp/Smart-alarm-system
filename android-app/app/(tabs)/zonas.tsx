import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import ZoneRow from "../../components/ZoneRow";
import { useAlarm } from "../../store/alarm";

export default function Zones() {
  const a = useAlarm();
  const [openCam, setOpenCam] = useState(false);



  const streamUrl = useMemo(() => {
    const ip = (a.wsConfig?.ip || "").trim();
    if (!ip) return "";
    return `http://${ip}/cam/stream`; // puerto 80 por defecto
  }, [a.wsConfig?.ip]);

  const camHtml = useMemo(() => {
    if (!streamUrl) return "<html><body></body></html>";
    return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body { margin:0; padding:0; background:#000; height:100%; width:100%; overflow:hidden; }
      .wrap { height:100%; width:100%; display:flex; align-items:center; justify-content:center; }
      img { width:100%; height:100%; object-fit:contain; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <img src="${streamUrl}" />
    </div>
  </body>
</html>`;
  }, [streamUrl]);
  const webSource = useMemo(() => ({ html: camHtml }), [camHtml]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: "transparent" }}
        contentContainerStyle={styles.wrap}
      >
        <Text style={styles.h1}>ZONAS DE SEGURIDAD</Text>
        <Text style={styles.subtitle}>Gestión de sensores</Text>

        <ZoneRow
          label={a.names.z1}
          value={a.zones.z1}
          onToggle={(val) => a.setZone("z1", val)}
          onRename={(nuevo) => a.saveNames({ ...a.names, z1: nuevo })}
        />
        <ZoneRow
          label={a.names.z2}
          value={a.zones.z2}
          onToggle={(val) => a.setZone("z2", val)}
          onRename={(nuevo) => a.saveNames({ ...a.names, z2: nuevo })}
        />
        <ZoneRow
          label={a.names.z3}
          value={a.zones.z3}
          onToggle={(val) => a.setZone("z3", val)}
          onRename={(nuevo) => a.saveNames({ ...a.names, z3: nuevo })}
        />

        <Pressable
          style={({ pressed }) => [styles.camBtn, pressed && { opacity: 0.85 }]}
          onPress={() => setOpenCam(true)}
        >
          <Text style={styles.camBtnText}>VER CÁMARA</Text>

        </Pressable>
      </ScrollView>

      <Modal visible={openCam} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalWrap}>
          <View style={styles.modalTop}>
            <Text style={styles.modalTitle}>Cámara</Text>
            <Pressable
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.8 }]}
              onPress={() => setOpenCam(false)}
            >
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </Pressable>
          </View>

          <View style={styles.webWrap}>
            {!streamUrl ? (
              <View style={styles.center}>
                <Text style={styles.err}>No hay IP configurada.</Text>
                <Text style={styles.errSub}>Andá a Configuración y poné la IP del ESP32</Text>
              </View>
            ) : (
              <WebView
                key={openCam ? "cam-open" : "cam-closed"} // corta el stream al cerrar
                originWhitelist={["*"]}
                source={webSource}
                androidLayerType="hardware"
                javaScriptEnabled
                domStorageEnabled
                cacheEnabled={false}
                incognito
                startInLoadingState
                renderLoading={() => (
                  <View style={styles.center}>
                    <ActivityIndicator />
                    <Text style={styles.loading}>Cargando stream…</Text>
                  </View>
                )}
                mixedContentMode="always"
                allowsInlineMediaPlayback
                setSupportMultipleWindows={false}
              />
            )}
          </View>

        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 24, paddingBlockStart: 24, gap: 15 },
  h1: { color: "#fff", fontWeight: "800", fontSize: 22 },
  subtitle: { color: "#9EB2C7", marginBottom: 8 },

  camBtn: {
    marginTop: 6,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "#3d4a64a2",
    borderWidth: 1,
    borderColor: "#3d4a64",
    alignItems: "center"
  },
  camBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  camBtnSub: { color: "#9EB2C7", marginTop: 4, fontSize: 12 },

  modalWrap: { flex: 1, backgroundColor: "#000" },
  modalTop: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: { color: "#fff", fontWeight: "800", fontSize: 16 },
  closeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  closeBtnText: { color: "#fff", fontWeight: "700" },

  webWrap: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  loading: { color: "#9EB2C7", marginTop: 10 },
  err: { color: "#fff", fontWeight: "800", fontSize: 16, textAlign: "center" },
  errSub: { color: "#9EB2C7", marginTop: 8, textAlign: "center" },

  hint: {
    color: "#9EB2C7",
    textAlign: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 12,
  },
});
