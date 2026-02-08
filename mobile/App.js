import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import Dashboard from './screens/Dashboard';
import SubjectsScreen from './screens/SubjectsScreen';
import WebviewScreen from './screens/WebviewScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Subjects" component={SubjectsScreen} />
        <Stack.Screen name="Webview" component={WebviewScreen} options={{ title: 'Viewer' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
