import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { getRecipeById, deleteRecipe } from '../services/recipeService';

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipeId } = route.params;
  const { user } = useContext(AuthContext);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      const data = await getRecipeById(recipeId);
      setRecipe(data);
      navigation.setOptions({ title: data.title });
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la receta');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Receta',
      `¿Estás seguro de que deseas eliminar "${recipe.title}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecipe(recipeId);
              Alert.alert('Listo', 'Receta eliminada');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la receta');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (!recipe) return null;

  const isOwner = user?.id === recipe.userId;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{recipe.title}</Text>
        {recipe.description ? (
          <Text style={styles.description}>{recipe.description}</Text>
        ) : null}

        <View style={styles.metaContainer}>
          {recipe.prepTime ? (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⏱️</Text>
              <Text style={styles.metaText}>{recipe.prepTime}</Text>
            </View>
          ) : null}
          {recipe.servings ? (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🍽️</Text>
              <Text style={styles.metaText}>{recipe.servings} porciones</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.author}>Por: {recipe.User?.username || 'Desconocido'}</Text>
      </View>

      {/* Grupos */}
      {recipe.Groups && recipe.Groups.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📁 Grupos</Text>
          <View style={styles.groupsContainer}>
            {recipe.Groups.map((group) => (
              <View key={group.id} style={styles.groupBadge}>
                <Text style={styles.groupBadgeText}>{group.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Ingredientes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🥗 Ingredientes</Text>
        {recipe.Ingredients?.map((ingredient, index) => (
          <View key={ingredient.id || index} style={styles.ingredientItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.ingredientText}>
              {ingredient.quantity ? `${ingredient.quantity} ` : ''}{ingredient.name}
            </Text>
          </View>
        ))}
      </View>

      {/* Pasos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👨‍🍳 Pasos</Text>
        {recipe.Steps?.map((step, index) => (
          <View key={step.id || index} style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step.description}</Text>
          </View>
        ))}
      </View>

      {/* Acciones del dueño */}
      {isOwner && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('RecipeForm', { recipe })}
          >
            <Text style={styles.editButtonText}>✏️ Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 22,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  metaIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  author: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  groupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  groupBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  groupBadgeText: {
    fontSize: 14,
    color: '#2E7D32',
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bullet: {
    fontSize: 16,
    color: '#FF6B6B',
    marginRight: 10,
    marginTop: 2,
  },
  ingredientText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomSpacer: {
    height: 40,
  },
});
