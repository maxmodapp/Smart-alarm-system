import { LinearGradient } from "expo-linear-gradient";
import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

export default function GradientBackground({ children }: PropsWithChildren) {
  return (
    <LinearGradient colors={["#16264A", "#091122"]} style={styles.background}>
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  content: { flex: 1 },
});
