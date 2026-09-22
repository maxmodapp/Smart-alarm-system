import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

function TabItem({
  name, label, focused, color, size
  }: { name: any; label: string; focused: boolean; color: string; size: number }) {
  return (
    <View style={[styles.itemWrap, focused && styles.itemActiveBg]}>
      <Ionicons name={name} size={size} color={color} />
      <Text style={[styles.itemLabel, {color: color}]}>{label}</Text>

    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs detachInactiveScreens={true}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "rgba(255, 255, 255, 1)",
        tabBarInactiveTintColor: "#A1AEC8",
        tabBarStyle: { backgroundColor: "#0d1527ff", borderTopColor: "rgba(255,255,255,0.06)",
          height: 85,
          paddingTop: 20,
        },
        
      sceneStyle: { backgroundColor: "transparent" },
      //sceneContainerStyle:  { backgroundColor: "transparent" },
      //unmountOnBlur: true,
      }}
      
    > 

      <Tabs.Screen
        name="index"
        
        options={{
          title: "",
          tabBarIcon: ({ focused, color, size }) =>
            <TabItem name="home-outline" label="Inicio" focused={focused} color={color} size={22} />
        }}
      />
         
      <Tabs.Screen
        name="zonas"
        options={{
          title: "",
          tabBarIcon: ({ focused, color, size }) =>
            <TabItem name="shield-checkmark-outline"label="Zonas" focused={focused} color={color} size={22} />
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: "",
          tabBarIcon: ({ focused, color, size }) =>
            <TabItem name="time-outline" label="Historial" focused={focused} color={color} size={22} />
        }}
      />
      <Tabs.Screen
        name="configuracion"
        options={{
          title: "",
          tabBarIcon: ({ focused, color, size }) =>
            <TabItem name="settings-outline" label="Config" focused={focused} color={color} size={22} />
        }}
      />
      
    </Tabs>

  );
}
const styles = StyleSheet.create({
  itemWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 12,
    width:70,
    height:60,

    
    

    

  },
  itemActiveBg: {
    backgroundColor: "#0054d1ff" 
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: "600",

  }
});