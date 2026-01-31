import { EXPO_PUBLIC_USDA_API_KEY } from '@env'
import { supabase } from './supabase'

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1'

export interface FoodItem {
    fdcId: number
    description: string
    brandOwner?: string
    nutrients: {
        calories: number
        protein: number
        carbs: number
        fat: number
    }
    servingSize?: number
    servingUnit?: string
}

export const searchFood = async (query: string): Promise<FoodItem[]> => {
    try {
        // Note: In a real app, use the API Key from env. 
        // Assuming the user put USDA_API_KEY in .env, typically exposed via Config or process.env depending on setup.
        // For Expo, we often usage process.env.EXPO_PUBLIC_...
        const apiKey = process.env.EXPO_PUBLIC_USDA_API_KEY || 'DEMO_KEY'

        const response = await fetch(`${BASE_URL}/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&dataType=Branded,Foundation&pageSize=10`)
        const data = await response.json()

        if (!data.foods) return []

        const formattedFoods = data.foods.map((food: any) => {
            const getNutrient = (id: number) => food.foodNutrients.find((n: any) => n.nutrientId === id)?.value || 0

            // USDA Nutrient IDs: 1008=Calories, 1003=Protein, 1005=Carbs, 1004=Fat
            return {
                fdcId: food.fdcId,
                description: food.description,
                brandOwner: food.brandOwner,
                nutrients: {
                    calories: getNutrient(1008),
                    protein: getNutrient(1003),
                    carbs: getNutrient(1005),
                    fat: getNutrient(1004),
                },
                servingSize: food.servingSize,
                servingUnit: food.servingSizeUnit
            }
        })

        // 2. Background Cache (Fire and Forget)
        // We cache these items into foods_cache so we can look them up by ID later without API cost
        formattedFoods.forEach(async (item: FoodItem) => {
            try {
                await supabase.from('foods_cache').upsert({
                    source: 'usda',
                    external_id: item.fdcId.toString(),
                    food_name: item.description,
                    brand_name: item.brandOwner,
                    calories_per_100g: item.nutrients.calories,
                    protein_per_100g: item.nutrients.protein,
                    carbs_per_100g: item.nutrients.carbs,
                    fat_per_100g: item.nutrients.fat,
                    raw_data: item
                }, { onConflict: 'source, external_id' })
            } catch (e) {
                console.log('Cache error', e)
            }
        })

        return formattedFoods
    } catch (error) {
        console.error("USDA Search Error", error)
        return []
    }
}
