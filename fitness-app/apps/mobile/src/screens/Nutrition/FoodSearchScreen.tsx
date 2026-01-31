import React, { useState } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { searchFood, FoodItem } from '../../services/usda'
import { logMeal } from '../../services/nutrition'

export const FoodSearchScreen = ({ navigation, route }: any) => {
    const { mealType } = route.params
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<FoodItem[]>([])
    const [loading, setLoading] = useState(false)

    const handleSearch = async () => {
        if (!query) return
        setLoading(true)
        const foods = await searchFood(query)
        setResults(foods)
        setLoading(false)
    }

    const handleAddFood = async (item: FoodItem) => {
        // Quick add wrapper
        try {
            setLoading(true)
            await logMeal(
                mealType,
                [{
                    food_name: item.description,
                    calories: item.nutrients.calories,
                    protein_g: item.nutrients.protein,
                    carbs_g: item.nutrients.carbs,
                    fat_g: item.nutrients.fat,
                    quantity: 1, // Serving
                    serving_unit: item.servingUnit || 'serving'
                }],
                {
                    calories: item.nutrients.calories,
                    protein: item.nutrients.protein,
                    carbs: item.nutrients.carbs,
                    fat: item.nutrients.fat
                }
            )
            Alert.alert("Success", "Food added!")
            navigation.goBack()
        } catch (e: any) {
            Alert.alert("Error", e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />
            <SafeAreaView className="flex-1">

                {/* Header */}
                <View className="px-4 py-2 flex-row items-center border-b border-gray-800">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold capitalize">Add to {mealType}</Text>
                </View>

                {/* Search Bar */}
                <View className="p-4 bg-gray-900 border-b border-gray-800">
                    <View className="flex-row bg-gray-800 rounded-xl px-4 py-3 items-center">
                        <Ionicons name="search" size={20} color="#888" />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                            placeholder="Search food (e.g. Apple, Chicken)"
                            placeholderTextColor="#666"
                            className="flex-1 ml-3 text-white text-lg"
                            autoFocus
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => setQuery('')}>
                                <Ionicons name="close-circle" size={20} color="#888" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Results */}
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#007AFF" />
                    </View>
                ) : (
                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.fdcId.toString()}
                        contentContainerStyle={{ padding: 16 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => handleAddFood(item)}
                                className="bg-gray-900 p-4 rounded-xl mb-3 flex-row justify-between items-center border border-gray-800"
                            >
                                <View className="flex-1 mr-4">
                                    <Text className="text-white font-bold text-lg" numberOfLines={1}>{item.description}</Text>
                                    <Text className="text-gray-400 text-sm">
                                        {Math.round(item.nutrients.calories)} kcal • {item.brandOwner || 'Generic'}
                                    </Text>
                                </View>
                                <View className="bg-primary/20 p-2 rounded-full">
                                    <Ionicons name="add" size={20} color="#007AFF" />
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <View className="mt-20 items-center">
                                <Ionicons name="nutrition-outline" size={64} color="#333" />
                                <Text className="text-gray-600 mt-4 text-center">
                                    Search for any food{'\n'}to see nutritional info
                                </Text>
                            </View>
                        )}
                    />
                )}

            </SafeAreaView>
        </View>
    )
}
