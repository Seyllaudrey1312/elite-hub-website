import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { fetchSubjects, WEB_BASE } from '../api';

const STATIC_SUBJECTS = [
  'Mathematics',
  'English',
  'Biology',
  'Physics',
  'Chemistry',
  'History',
];

export default function SubjectsScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await fetchSubjects();
      if (!mounted) return;
      if (res && !res.error && Array.isArray(res)) setSubjects(res);
      else setSubjects(STATIC_SUBJECTS.map((s) => ({ name: s })));
    })();
    return () => (mounted = false);
  }, []);

  function openSubjectWeb(subjectName) {
    // Opens the site subjects page — you can host the frontend and set WEB_BASE in api.js
    const url = `${WEB_BASE}/pages/subjects.html`;
    navigation.navigate('Webview', { url, title: subjectName });
  }

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>Subjects</Text>
      <FlatList
        data={subjects}
        keyExtractor={(item, idx) => item._id || item.name || String(idx)}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openSubjectWeb(item.name || item.subject || 'Subjects')}
            style={{ padding: 12, marginBottom: 8, backgroundColor: '#f3f4f6', borderRadius: 8 }}
          >
            <Text style={{ fontSize: 16 }}>{item.name || item.subject}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
