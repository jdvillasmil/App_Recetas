# 🎯 GUÍA PARA COMPLETAR EL PROYECTO - RECETAS APP

## 📊 ESTADO ACTUAL

**✅ BACKEND 100% COMPLETO**
- Todos los endpoints funcionando localmente
- 22 tests pasados (auth: 5, recipes: 9, groups: 8)
- Lógica de borrado destructivo implementada y probada

**✅ FRONTEND 25% COMPLETO**
- Navegación configurada
- Login y Register funcionando
- AuthContext con persistencia de token

**⏳ TU TRABAJO:**
1. Testing del backend (1h)
2. Pantallas de recetas (3h)
3. Pantallas de grupos (1h)
4. Testing final y APK (1h)

---

## 1️⃣ TESTING BACKEND (1 hora)

### Herramienta
Instala **Thunder Client** en VS Code (Extensions → Thunder Client)

### Qué hacer

**A. Probar Autenticación (15 min)**
1. Abrir `backend/test-auth.http`
2. Probar los 5 endpoints:
   - POST /register
   - POST /login (copiar el token que retorna)
   - GET /profile (agregar token en Authorization)
   - PUT /profile
   - DELETE /account

**B. Probar Recetas (25 min)**
1. Abrir `backend/test-recipes.http`
2. Ejecutar los 9 tests en orden
3. **IMPORTANTE:** Verificar que el listado esté ordenado alfabéticamente
4. Probar crear receta con título duplicado (debe dar error 409)

**C. Probar Grupos (20 min)**
1. Abrir `backend/test-groups.http`
2. Ejecutar los 8 tests
3. **CRÍTICO:** Test 4-5 prueban el borrado destructivo:
   - Crear grupo "Postres" con 3 recetas
   - Borrar grupo → Verificar que las 3 recetas SE ELIMINARON de la BD
   - Esto es lo que pide el profesor
4. Test 7 prueba borrado NO destructivo:
   - Quitar receta de un grupo → La receta persiste

**Documentar:** Crear `TESTING.md` con los resultados

---

## 2️⃣ PANTALLAS DE RECETAS (3 horas)

### Ubicación
`frontend/src/screens/`

### A. RecipeListScreen.js (1.5h)

**Crear el servicio primero:**

`frontend/src/services/recipeService.js`:
```javascript
import api from '../config/api';

export const getRecipes = async (mine = false, search = '') => {
  const params = {};
  if (mine) params.mine = true;
  if (search) params.search = search;
  const response = await api.get('/api/recipes', { params });
  return response.data;
};

export const getRecipeById = async (id) => {
  const response = await api.get(`/api/recipes/${id}`);
  return response.data;
};

export const createRecipe = async (recipeData) => {
  const response = await api.post('/api/recipes', recipeData);
  return response.data;
};

export const updateRecipe = async (id, recipeData) => {
  const response = await api.put(`/api/recipes/${id}`, recipeData);
  return response.data;
};

export const deleteRecipe = async (id) => {
  const response = await api.delete(`/api/recipes/${id}`);
  return response.data;
};
```

**Pantalla RecipeListScreen:**
```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  Alert
} from 'react-native';
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

  useEffect(() => {
    loadRecipes();
  }, [showMine, search]);

  const renderRecipe = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.time}>⏱️ {item.prepTime} | 🍽️ {item.servings} porciones</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar recetas..."
        value={search}
        onChangeText={setSearch}
      />
      
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowMine(!showMine)}
      >
        <Text style={styles.toggleText}>
          {showMine ? '📋 Todas las Recetas' : '👤 Mis Recetas'}
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
          <Text style={styles.empty}>No hay recetas aún. ¡Crea la primera!</Text>
        }
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
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  searchBar: {
    margin: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  toggleButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    alignItems: 'center'
  },
  toggleText: { color: 'white', fontWeight: 'bold' },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  description: { fontSize: 14, color: '#666', marginTop: 4 },
  time: { fontSize: 12, color: '#999', marginTop: 8 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' },
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
    elevation: 8
  },
  fabText: { fontSize: 32, color: 'white', marginTop: -4 }
});
```

**Agregar a la navegación:**
En `AppNavigator.js`, actualiza el import:
```javascript
import RecipeListScreen from '../screens/RecipeListScreen';
```

---

### B. RecipeDetailScreen y RecipeFormScreen (1.5h)

Estas son más complejas. **Copia el patrón de las pantallas de Auth** (estados, loading, validaciones).

**RecipeFormScreen debe tener:**
- Arrays dinámicos de ingredientes y pasos (botón + para agregar, X para eliminar)
- Validación de título único (si el servidor retorna 409, mostrar Alert)

---

## 3️⃣ PANTALLAS DE GRUPOS (1 hora)

Similar a RecipeListScreen pero más simple.

**GroupListScreen:**
- FlatList con grupos
- Mostrar contador de recetas
- OnPress → Editar
- OnLongPress → Alert de confirmación:
```
  "Este grupo tiene X recetas asociadas.
  ¿Estás seguro? Las recetas se eliminarán permanentemente."
```

---

## 4️⃣ TESTING FINAL (1 hora)

**En Expo Go:**
```bash
cd frontend
npx expo start
```

1. Escanear QR con Expo Go en tu celular
2. Probar flujo completo:
   - Registro → Login
   - Crear 3 recetas
   - Crear 2 grupos
   - Agregar recetas a grupos
   - Borrar un grupo → Confirmar que las recetas desaparecen
3. Cerrar app y reabrir → Verificar que mantiene sesión

**Generar APK:**
```bash
eas build --platform android --profile preview
```

---

## 🆘 ERRORES COMUNES

**"Network request failed":**
- Backend debe estar corriendo: `cd backend && npm start`
- O cambiar URL en `frontend/src/config/api.js` a Railway cuando esté listo

**"Token inválido":**
```javascript
// Limpiar AsyncStorage en ProfileScreen
await AsyncStorage.clear();
```

---

## ✅ CHECKLIST FINAL

- [ ] Backend testeado (TESTING.md creado)
- [ ] RecipeListScreen completa
- [ ] RecipeDetailScreen completa
- [ ] RecipeFormScreen completa
- [ ] GroupListScreen completa
- [ ] GroupFormScreen completa
- [ ] App funciona en Expo Go
- [ ] APK generado
- [ ] Video demo (2 min) grabado

---

**Tiempo total: ~6 horas**

**Dudas:** Revisa los archivos en `backend/test-*.http` para ver cómo funcionan los endpoints.