import React from 'react';
import { View, Text, Button } from 'react-native';

export default function Dashboard({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Dashboard</Text>
      <Button title="Subjects" onPress={() => navigation.navigate('Subjects')} />
    </View>
  );
}
