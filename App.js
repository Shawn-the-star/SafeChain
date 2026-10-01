
import React, { useEffect, useRef } from "react";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  NavigationContainer
} from "@react-navigation/native";

import {
  createBottomTabNavigator
} from "@react-navigation/bottom-tabs";

import {
  createNativeStackNavigator
} from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";
import ContactsScreen from "./screens/ContactsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import EvidenceScreen from "./screens/EvidenceScreen";
import SetPasscodeScreen from "./screens/SetPasscodeScreen";
import CalculatorScreen from "./screens/CalculatorScreen";

import { requestAllPermissions } from "./services/permissionService";
import { setCameraRef } from "./services/cameraService";

import { CameraView } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


// ==========================================
// BOTTOM TABS
// ==========================================

function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "#111",
          borderTopColor: "#222",

          // Normal tab bar + Android system navigation inset
          height: 65 + insets.bottom,

          // Push the icons/text above the system buttons
          paddingBottom: insets.bottom,

          paddingTop: 6,
        },

        tabBarActiveTintColor: "#ff3b30",
        tabBarInactiveTintColor: "#777",

        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="home"
              size={25}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="contacts"
              size={25}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="settings"
              size={25}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Evidence"
        component={EvidenceScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="videocam"
              size={25}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}


// ==========================================
// MAIN APP
// ==========================================

export default function App() {

  const cameraRef = useRef(null);


  useEffect(() => {

    const init = async () => {

      try {

        const permissions =
          await requestAllPermissions();

        console.log(
          "Permissions:",
          permissions
        );

        setCameraRef(cameraRef);

      } catch (error) {

        console.log(
          "Initialization error:",
          error
        );

      }

    };

    init();

  }, []);


  return (
    <SafeAreaProvider>
      <CameraView
        ref={cameraRef}
        style={{
          width: 1,
          height: 1,
          position: "absolute",
          top: -100,
          left: -100,
        }}
      />

      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="Calculator"
            component={CalculatorScreen}
          />

          <Stack.Screen
            name="MainTabs"
            component={TabNavigator}
          />

          <Stack.Screen
            name="SetPasscode"
            component={SetPasscodeScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

