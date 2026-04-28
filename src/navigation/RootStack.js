import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './routes';
import TabNavigator from './TabNavigator';

import AddDocumentScreen from '../screens/AddDocumentScreen';
import AddEntityScreen from '../screens/AddEntityScreen';
import EntityDetailScreen from '../screens/EntityDetailScreen';
import DocumentDetailScreen from '../screens/DocumentDetailScreen';

const Stack = createNativeStackNavigator();

export default function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name={ROUTES.TABS} component={TabNavigator} />
      <Stack.Screen name={ROUTES.ADD_DOCUMENT} component={AddDocumentScreen} />
      <Stack.Screen name={ROUTES.ADD_ENTITY} component={AddEntityScreen} />
      <Stack.Screen name={ROUTES.ENTITY_DETAIL} component={EntityDetailScreen} />
      <Stack.Screen name={ROUTES.DOCUMENT_DETAIL} component={DocumentDetailScreen} />
    </Stack.Navigator>
  );
}
