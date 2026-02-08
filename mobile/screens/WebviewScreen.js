import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export default function WebviewScreen({ route }) {
  const { url } = route.params || {};
  if (!url) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );

  return (
    <WebView source={{ uri: url }} startInLoadingState renderLoading={() => <ActivityIndicator style={{flex:1}} />} />
  );
}
