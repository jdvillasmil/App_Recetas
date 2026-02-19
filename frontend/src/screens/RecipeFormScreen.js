import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { createRecipe, updateRecipe } from '../services/recipeService';
import { getGroups } from '../services/groupService';

export default function RecipeFormScreen({ route, navigation }) {
  const editingRecipe = route.params?.recipe;
  const isEditing = !!editingRecipe;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [servings, setServings] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '' }]);
  const [steps, setSteps] = useState([{ description: '' }]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar Receta' : 'Nueva Receta',
    });
    loadGroups();

    if (isEditing) {
      setTitle(editingRecipe.title || '');
      setDescription(editingRecipe.description || '');
      setPrepTime(editingRecipe.prepTime || '');
      setServings(editingRecipe.servings?.toString() || '');
      setIngredients(
        editingRecipe.Ingredients?.length > 0
          ? editingRecipe.Ingredients.map((i) => ({ name: i.name, quantity: i.quantity || '' }))
          : [{ name: '', quantity: '' }]
      );
      setSteps(
        editingRecipe.Steps?.length > 0
          ? editingRecipe.Steps.map((s) => ({ description: s.description }))
          : [{ description: '' }]
      );
      setSelectedGroups(editingRecipe.Groups?.map((g) => g.id) || []);
    }
  }, []);

  const loadGroups = async () => {
    try {
      const groups = await getGroups();
      setAvailableGroups(groups);
    } catch (error) {
      console.log('No se pudieron cargar los grupos');
    } finally {
      setLoadingGroups(false);
    }
  };

  // Ingredientes
  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '' }]);
  };

  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  // Pasos
  const addStep = () => {
    setSteps([...steps, { description: '' }]);
  };

  const removeStep = (index) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index, value) => {
    const updated = [...steps];
    updated[index].description = value;
    setSteps(updated);
  };

  // Grupos
  const toggleGroup = (groupId) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter((id) => id !== groupId));
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  };

  // Validar y guardar
  const handleSave = async () => {
    // Validaciones
    if (!title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    const validIngredients = ingredients.filter((i) => i.name.trim());
    if (validIngredients.length === 0) {
      Alert.alert('Error', 'Debe agregar al menos un ingrediente');
      return;
    }

    const validSteps = steps.filter((s) => s.description.trim());
    if (validSteps.length === 0) {
      Alert.alert('Error', 'Debe agregar al menos un paso');
      return;
    }

    setLoading(true);

    const recipeData = {
      title: title.trim(),
      description: description.trim(),
      prepTime: prepTime.trim(),
      servings: servings ? parseInt(servings) : null,
      ingredients: validIngredients.map((i) => ({
        name: i.name.trim(),
        quantity: i.quantity.trim(),
      })),
      steps: validSteps.map((s) => ({
        description: s.description.trim(),
      })),
      groupIds: selectedGroups,
    };

    try {
      if (isEditing) {
        await updateRecipe(editingRecipe.id, recipeData);
        Alert.alert('Listo', 'Receta actualizada');
      } else {
        await createRecipe(recipeData);
        Alert.alert('Listo', 'Receta creada');
      }
      navigation.goBack();
    } catch (error) {
      if (error.response?.status === 409) {
        Alert.alert('Error', 'Ya existe una receta con ese título. Por favor usa otro nombre.');
      } else {
        Alert.alert('Error', error.response?.data?.error || 'No se pudo guardar la receta');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Información básica */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Básica</Text>

        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Ej: Pasta Carbonara"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Una breve descripción de tu receta..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Tiempo de preparación</Text>
            <TextInput
              style={styles.input}
              value={prepTime}
              onChangeText={setPrepTime}
              placeholder="Ej: 30 min"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Porciones</Text>
            <TextInput
              style={styles.input}
              value={servings}
              onChangeText={setServings}
              placeholder="Ej: 4"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Ingredientes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🥗 Ingredientes *</Text>

        {ingredients.map((ingredient, index) => (
          <View key={index} style={styles.dynamicRow}>
            <TextInput
              style={[styles.input, styles.quantityInput]}
              value={ingredient.quantity}
              onChangeText={(value) => updateIngredient(index, 'quantity', value)}
              placeholder="Cant."
              placeholderTextColor="#999"
            />
            <TextInput
              style={[styles.input, styles.ingredientInput]}
              value={ingredient.name}
              onChangeText={(value) => updateIngredient(index, 'name', value)}
              placeholder="Nombre del ingrediente"
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeIngredient(index)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
          <Text style={styles.addButtonText}>+ Agregar ingrediente</Text>
        </TouchableOpacity>
      </View>

      {/* Pasos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👨‍🍳 Pasos *</Text>

        {steps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <TextInput
              style={[styles.input, styles.stepInput]}
              value={step.description}
              onChangeText={(value) => updateStep(index, value)}
              placeholder="Describe este paso..."
              placeholderTextColor="#999"
              multiline
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeStep(index)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={addStep}>
          <Text style={styles.addButtonText}>+ Agregar paso</Text>
        </TouchableOpacity>
      </View>

      {/* Grupos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📁 Grupos (opcional)</Text>

        {loadingGroups ? (
          <ActivityIndicator color="#4ECDC4" />
        ) : availableGroups.length === 0 ? (
          <Text style={styles.noGroups}>No tienes grupos creados</Text>
        ) : (
          <View style={styles.groupsContainer}>
            {availableGroups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.groupChip,
                  selectedGroups.includes(group.id) && styles.groupChipSelected,
                ]}
                onPress={() => toggleGroup(group.id)}
              >
                <Text
                  style={[
                    styles.groupChipText,
                    selectedGroups.includes(group.id) && styles.groupChipTextSelected,
                  ]}
                >
                  {group.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Botón guardar */}
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Guardar Cambios' : 'Crear Receta'}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  dynamicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityInput: {
    width: 70,
    marginRight: 8,
    marginBottom: 0,
  },
  ingredientInput: {
    flex: 1,
    marginBottom: 0,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 10,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepInput: {
    flex: 1,
    marginBottom: 0,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  groupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  groupChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  groupChipSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  groupChipText: {
    color: '#666',
    fontSize: 14,
  },
  groupChipTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  noGroups: {
    color: '#999',
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    margin: 16,
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
  bottomSpacer: {
    height: 40,
  },
});
