import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import RecipeListScreen from '../screens/RecipeListScreen';
import GroupListScreen from '../screens/GroupListScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#999',
        headerStyle: { backgroundColor: '#FF6B6B' },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen name="Recetas" component={RecipeListScreen} />
      <Tab.Screen name="Grupos" component={GroupListScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
