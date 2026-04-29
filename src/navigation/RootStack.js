import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './routes';
import { useData } from '../context/AppContext';

import DashboardScreen from '../screens/DashboardScreen';
import EntitiesScreen from '../screens/EntitiesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddDocumentScreen from '../screens/AddDocumentScreen';
import AddEntityScreen from '../screens/AddEntityScreen';
import EntityDetailScreen from '../screens/EntityDetailScreen';
import DocumentDetailScreen from '../screens/DocumentDetailScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

const Stack = createNativeStackNavigator();

export default function RootStack() {
  const { state } = useData();
  const initialRoute = state.profile?.hasCompletedOnboarding ? ROUTES.DASHBOARD : ROUTES.ONBOARDING;

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name={ROUTES.ONBOARDING} component={OnboardingScreen} />
      <Stack.Screen name={ROUTES.DASHBOARD} component={DashboardScreen} />
      <Stack.Screen name={ROUTES.ENTITIES} component={EntitiesScreen} />
      <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
      <Stack.Screen name={ROUTES.ADD_DOCUMENT} component={AddDocumentScreen} />
      <Stack.Screen name={ROUTES.ADD_ENTITY} component={AddEntityScreen} />
      <Stack.Screen name={ROUTES.ENTITY_DETAIL} component={EntityDetailScreen} />
      <Stack.Screen name={ROUTES.DOCUMENT_DETAIL} component={DocumentDetailScreen} />
    </Stack.Navigator>
  );
}
