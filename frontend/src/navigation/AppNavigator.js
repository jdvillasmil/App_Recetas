import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

// Screens
import RecipeListScreen from '../screens/RecipeListScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import RecipeFormScreen from '../screens/RecipeFormScreen';
import GroupListScreen from '../screens/GroupListScreen';
import GroupFormScreen from '../screens/GroupFormScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#999',
        headerStyle: { backgroundColor: '#FF6B6B' },
        headerTintColor: '#fff',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="RecipeList"
        component={RecipeListScreen}
        options={{
          title: 'Recetas',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🍳</Text>
          ),
        }}
      />
      <Tab.Screen
        name="GroupList"
        component={GroupListScreen}
        options={{
          title: 'Grupos',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>📁</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FF6B6B' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={{ title: 'Receta' }}
      />
      <Stack.Screen
        name="RecipeForm"
        component={RecipeFormScreen}
        options={{ title: 'Nueva Receta' }}
      />
      <Stack.Screen
        name="GroupForm"
        component={GroupFormScreen}
        options={{ title: 'Nuevo Grupo' }}
      />
    </Stack.Navigator>
  );
}
