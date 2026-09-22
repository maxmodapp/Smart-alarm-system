import { useState } from "react";
import { Modal, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { COLORS } from "../constants/colors";
import PrimaryButton from "./PrimaryButton";

type Props = {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void | Promise<void>;
  onRename: (name: string) => void | Promise<void>;
};

export default function ZoneRow({ label, value, onToggle, onRename }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);

  const save = async () => {
    const next = draft.trim();
    if (next) await onRename(next);
    setEditing(false);
  };

  return (
    <>
      <View style={styles.card}>
        <Pressable
          accessibilityHint="Changes the zone name"
          accessibilityRole="button"
          onPress={() => { setDraft(label); setEditing(true); }}
          style={styles.textBlock}
        >
          <Text style={styles.name}>{label}</Text>
          <Text style={[styles.state, value ? styles.active : styles.inactive]}>
            {value ? "ACTIVE" : "INACTIVE"}
          </Text>
          <Text style={styles.rename}>Tap the name to edit</Text>
        </Pressable>
        <Switch value={value} onValueChange={onToggle} />
      </View>

      <Modal visible={editing} animationType="fade" transparent onRequestClose={() => setEditing(false)}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Zone name</Text>
            <TextInput
              autoFocus
              maxLength={32}
              onChangeText={setDraft}
              placeholder="E.g. Living room"
              placeholderTextColor={COLORS.textMuted}
              style={styles.input}
              value={draft}
            />
            <PrimaryButton title="SAVE" onPress={save} style={{ backgroundColor: "#006CE5" }} />
            <Pressable onPress={() => setEditing(false)} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: COLORS.outline,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 108,
    padding: 18,
  },
  textBlock: { flex: 1 },
  name: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  state: { fontSize: 14, fontWeight: "800", marginTop: 8 },
  active: { color: "#00D56A" },
  inactive: { color: "#A8B4C9" },
  rename: { color: COLORS.textMuted, fontSize: 11, marginTop: 7 },
  overlay: { alignItems: "center", backgroundColor: "rgba(0,0,0,0.72)", flex: 1, justifyContent: "center", padding: 24 },
  dialog: { backgroundColor: "#16223A", borderRadius: 18, gap: 14, padding: 20, width: "100%" },
  dialogTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  input: { backgroundColor: "#10192C", borderColor: COLORS.outline, borderRadius: 12, borderWidth: 1, color: "#FFFFFF", padding: 14 },
  cancel: { alignItems: "center", padding: 8 },
  cancelText: { color: COLORS.textMuted, fontWeight: "700" },
});
