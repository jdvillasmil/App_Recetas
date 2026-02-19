import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user?.username?.charAt(0).toUpperCase() || '?'}
        </Text>
      </View>

      <Text style={styles.username}>{user?.username}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>Otras funciones próximamente...</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoText: {
    color: '#999',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
