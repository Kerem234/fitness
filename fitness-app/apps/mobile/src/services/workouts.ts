import { supabase } from './supabase'
// In a real app, strict typing is best.
import { EXPO_PUBLIC_OPENAI_API_KEY } from '@env'

export const checkActivePlan = async (userId: string) => {
    const { data } = await supabase
        .from('workout_plans')
        .select(`
            *,
            days: workout_days (
                *,
                exercises: workout_exercises (*)
            )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()
    return data
}

export const generateWorkoutPlanAI = async (userProfile: any) => {
    // 1. Construct Prompt
    const prompt = `
    Create a weekly workout plan for a user with these stats:
    - Goal: ${userProfile.goal_type || 'General Fitness'}
    - Level: ${userProfile.activity_level || 'Intermediate'}
    - Gender: ${userProfile.gender || 'Any'}
    - Days per week: 4
    
    Return ONLY valid JSON with this structure:
    {
       "goal_name": "Hypertrophy A",
       "days": [
          {
             "day_name": "Monday",
             "focus": "Chest & Triceps",
             "exercises": [
                { "name": "Bench Press", "sets": 4, "reps": "8-12", "rest": 90 },
                ...
             ]
          },
          ...
       ]
    }
    `

    // 2. Call OpenAI
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini", // Optimized for speed/cost
            messages: [
                { role: "system", content: "You are an expert fitness coach. Output strict JSON." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7
        })
    })

    const result = await response.json()
    try {
        const plan = JSON.parse(result.choices[0].message.content.replace(/```json/g, '').replace(/```/g, ''))
        return plan
    } catch (e) {
        console.error("AI Parsing Error", e)
        throw new Error("Failed to generate plan.")
    }
}

export const saveFullPlan = async (userId: string, planData: any) => {
    // 1. Deactivate old plans
    await supabase.from('workout_plans').update({ is_active: false }).eq('user_id', userId)

    // 2. Insert New Plan Header
    const { data: plan, error: planError } = await supabase
        .from('workout_plans')
        .insert({
            user_id: userId,
            goal: planData.goal_name,
            week_number: 1,
            is_active: true
        })
        .select()
        .single()

    if (planError) throw planError

    // 3. Insert Days & Exercises
    // Loop through days
    for (const day of planData.days) {
        const { data: dayRecord, error: dayError } = await supabase
            .from('workout_days')
            .insert({
                plan_id: plan.id,
                day_name: day.day_name,
                focus_area: day.focus
            })
            .select()
            .single()

        if (dayError) throw dayError

        // Insert Exercises
        const exercises = day.exercises.map((ex: any) => ({
            day_id: dayRecord.id,
            exercise_name: ex.name,
            sets: ex.sets,
            reps_text: ex.reps,
            rest_seconds: ex.rest
        }))

        const { error: exError } = await supabase
            .from('workout_exercises')
            .insert(exercises)

        if (exError) throw exError
    }

    return plan
}
