import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Screens
import MapScreen from './src/screens/MapScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import CreateScreen from './src/screens/CreateScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ARViewerScreen from './src/screens/ARViewerScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ArtifactDetailScreen from './src/screens/ArtifactDetailScreen';
import CameraScreen from './src/screens/CameraScreen';

// Context
import { AuthProvider } from './src/contexts/AuthContext';
import { LocationProvider } from './src/contexts/LocationContext';

// Types
import { RootStackParamList, TabParamList } from './src/types/navigation';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Create') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Create" component={CreateScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Main">
      <Stack.Screen 
        name="Main" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ title: 'Sign In' }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ title: 'Create Account' }}
      />
      <Stack.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{ 
          title: 'Create AR Content',
          headerShown: false, // Full screen camera
        }}
      />
      <Stack.Screen 
        name="ArtifactDetail" 
        component={ArtifactDetailScreen}
        options={{ title: 'Artifact Details' }}
      />
      <Stack.Screen 
        name="ARViewer" 
        component={ARViewerScreen}
        options={{ 
          title: 'AR View',
          headerShown: false, // Full screen AR
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <LocationProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </LocationProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
