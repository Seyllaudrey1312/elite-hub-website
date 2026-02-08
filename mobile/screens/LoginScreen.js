import React from 'react';
import { View, Text, Button } from 'react-native';

export default function LoginScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>Elite Hub Mobile (demo)</Text>
      <Button title="Continue" onPress={() => navigation.replace('Dashboard')} />
    </View>
  );
}
