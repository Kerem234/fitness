export const calculateBMR = (
    weightConfig: number,
    heightCm: number,
    age: number,
    gender: 'male' | 'female' | 'other'
): number => {
    // Mifflin-St Jeor Equation
    let bmr = 10 * weightConfig + 6.25 * heightCm - 5 * age
    if (gender === 'male') {
        bmr += 5
    } else {
        bmr -= 161
    }
    return Math.round(bmr)
}

export const calculateTDEE = (
    bmr: number,
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): number => {
    const multipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
    }
    return Math.round(bmr * multipliers[activityLevel])
}

export const calculateMacros = (targetCalories: number) => {
    const proteinCals = targetCalories * 0.3
    const carbsCals = targetCalories * 0.4
    const fatCals = targetCalories * 0.3

    return {
        protein_g: Math.round(proteinCals / 4),
        carbs_g: Math.round(carbsCals / 4),
        fat_g: Math.round(fatCals / 9),
    }
}
