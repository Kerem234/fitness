import { EXPO_PUBLIC_OPENAI_API_KEY } from '@env'
import { WeeklyPlan } from '../types/workout'
import { supabase } from './supabase'

export const generateWorkoutPlan = async (userProfile: any): Promise<WeeklyPlan> => {
    try {
        const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY

        const prompt = `
        Create a 7-day workout plan for a user with the following profile:
        - Gender: ${userProfile.gender}
        - Age: ${new Date().getFullYear() - new Date(userProfile.birth_date).getFullYear()}
        - Goal: ${userProfile.goal_type}
        - Activity Level: ${userProfile.activity_level}
        
        Return JSON ONLY. No markdown. Structure:
        {
            "week_number": 1,
            "goal": "${userProfile.goal_type}",
            "days": [
                {
                    "day_name": "Monday",
                    "focus_area": "Push (Chest/Triceps)",
                    "exercises": [
                        { 
                            "name": "Barbell Bench Press", 
                            "sets": 4, 
                            "target_reps": "8-12", 
                            "rest_seconds": 90,
                            "muscle_group": "Chest"
                        }
                    ]
                }
                ... for all 7 days (use "Rest" for rest days)
            ]
        }
        `

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are an expert fitness coach." },
                    { role: "user", content: prompt }
                ]
            })
        })

        const data = await response.json()
        const content = data.choices[0].message.content
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim()
        const plan = JSON.parse(jsonStr)

        // Save to Supabase (Mocking ID generation for structure)
        // In real app we would insert into 'plans' and 'workouts' tables

        return {
            id: 'generated-plan-' + Date.now(),
            ...plan,
            days: plan.days.map((d: any, i: number) => ({
                id: `day-${i}`,
                ...d,
                is_completed: false,
                exercises: d.exercises.map((e: any) => ({
                    exercise: { id: 'ex-' + Date.now(), name: e.name, muscle_group: e.muscle_group },
                    sets: e.sets,
                    target_reps: e.target_reps,
                    rest_seconds: e.rest_seconds
                }))
            }))
        }

    } catch (error) {
        console.error("AI Plan Gen Error", error)
        throw error
    }
}
