import { supabase } from './supabase'

export interface Meal {
    id: string
    user_id: string
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    meal_time: string
    total_calories: number
    items?: MealItem[]
}

export interface MealItem {
    id?: string
    food_name: string
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
    quantity: number
    serving_unit?: string
}

export const getDailyNutrition = async (date: Date) => {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
        .from('meals')
        .select('*, meal_items(*)')
        .eq('user_id', user.id)
        .gte('meal_time', startOfDay.toISOString())
        .lte('meal_time', endOfDay.toISOString())
        .order('meal_time', { ascending: true })

    if (error) throw error
    return data || []
}

export const logMeal = async (mealType: string, items: MealItem[], totalStats: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // 1. Create Meal
    const { data: meal, error: mealError } = await supabase
        .from('meals')
        .insert({
            user_id: user.id,
            meal_type: mealType,
            meal_time: new Date().toISOString(),
            total_calories: totalStats.calories,
            total_protein_g: totalStats.protein,
            total_carbs_g: totalStats.carbs,
            total_fat_g: totalStats.fat
        })
        .select()
        .single()

    if (mealError) throw mealError

    // 2. Create Items
    const itemsToInsert = items.map(item => ({
        meal_id: meal.id,
        food_name: item.food_name,
        calories: item.calories,
        protein_g: item.protein_g,
        carbs_g: item.carbs_g,
        fat_g: item.fat_g,
        quantity: item.quantity,
        serving_unit: item.serving_unit
    }))

    const { error: itemsError } = await supabase.from('meal_items').insert(itemsToInsert)
    if (itemsError) throw itemsError

    return meal
}
