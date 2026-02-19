import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getRecipes } from '../services/recipeService';

export default function RecipeListScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [showMine, setShowMine] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const data = await getRecipes(showMine, search);
      setRecipes(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las recetas');
    } finally {
      setLoading(false);
    }
  };

  // Recargar al volver a la pantalla
  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [showMine, search])
  );

  useEffect(() => {
    loadRecipes();
  }, [showMine]);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      loadRecipes();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const renderRecipe = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
    >
      <Text style={styles.title}>{item.title}</Text>
      {item.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
      <View style={styles.metaRow}>
        {item.prepTime ? <Text style={styles.meta}>⏱️ {item.prepTime}</Text> : null}
        {item.servings ? <Text style={styles.meta}>🍽️ {item.servings} porciones</Text> : null}
      </View>
      {item.Groups && item.Groups.length > 0 && (
        <View style={styles.groupsRow}>
          {item.Groups.map((g) => (
            <View key={g.id} style={styles.groupBadge}>
              <Text style={styles.groupBadgeText}>{g.name}</Text>
            </View>
          ))}
        </View>
      )}
      <Text style={styles.author}>Por: {item.User?.username || 'Desconocido'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar recetas..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#999"
      />

      <TouchableOpacity
        style={[styles.toggleButton, showMine && styles.toggleButtonActive]}
        onPress={() => setShowMine(!showMine)}
      >
        <Text style={[styles.toggleText, showMine && styles.toggleTextActive]}>
          {showMine ? '👤 Mis Recetas' : '📋 Todas las Recetas'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={recipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadRecipes} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🍳</Text>
            <Text style={styles.emptyText}>
              {search ? 'No se encontraron recetas' : 'No hay recetas aún'}
            </Text>
            <Text style={styles.emptySubtext}>
              {showMine ? 'Crea tu primera receta' : 'Sé el primero en agregar una'}
            </Text>
          </View>
        }
        contentContainerStyle={recipes.length === 0 ? styles.emptyList : null}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('RecipeForm')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  searchBar: {
    margin: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  toggleButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  toggleButtonActive: {
    backgroundColor: '#4ECDC4',
  },
  toggleText: {
    color: '#4ECDC4',
    fontWeight: 'bold',
    fontSize: 14,
  },
  toggleTextActive: {
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    color: '#888',
    marginRight: 16,
  },
  groupsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  groupBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  groupBadgeText: {
    fontSize: 11,
    color: '#2E7D32',
  },
  author: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: 'white',
    marginTop: -2,
  },
});
