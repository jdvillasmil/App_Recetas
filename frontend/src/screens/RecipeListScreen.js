import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RecipeListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🍳</Text>
      <Text style={styles.text}>Lista de recetas</Text>
      <Text style={styles.subtext}>Próximamente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 14,
    color: '#999',
  },
});
