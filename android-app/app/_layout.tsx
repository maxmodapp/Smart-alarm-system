import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import GradientBackground from "../components/GradientBackground";
import { AlarmProvider } from "../store/alarm";
export default function RootLayout() {
  //const [loaded] = useFonts({
  //PoppinsBlackItalic: require("../assets/fonts/Poppins-BlackItalic.ttf"),

//});
  return (
    <AlarmProvider>
      <GradientBackground>
        <StatusBar style="light" />
        <Slot />
      </GradientBackground>
    </AlarmProvider>
  );
}
      