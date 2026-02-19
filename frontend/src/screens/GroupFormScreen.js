import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { createGroup, updateGroup } from '../services/groupService';

export default function GroupFormScreen({ route, navigation }) {
  const editingGroup = route.params?.group;
  const isEditing = !!editingGroup;

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar Grupo' : 'Nuevo Grupo',
    });

    if (isEditing) {
      setName(editingGroup.name || '');
    }
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del grupo es obligatorio');
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        await updateGroup(editingGroup.id, name.trim());
        Alert.alert('Listo', 'Grupo actualizado');
      } else {
        await createGroup(name.trim());
        Alert.alert('Listo', 'Grupo creado');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'No se pudo guardar el grupo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📁</Text>
        </View>

        <Text style={styles.label}>Nombre del grupo</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ej: Postres, Desayunos, Favoritos..."
          placeholderTextColor="#999"
          autoFocus
        />

        <Text style={styles.hint}>
          Los grupos te ayudan a organizar tus recetas por categorías.
        </Text>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Guardar Cambios' : 'Crear Grupo'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  form: {
    backgroundColor: 'white',
    margin: 16,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 36,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  hint: {
    fontSize: 13,
    color: '#999',
    marginBottom: 24,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
