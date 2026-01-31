import { EXPO_PUBLIC_OPENAI_API_KEY } from '@env'

export const analyzeFoodImage = async (base64Image: string) => {
    try {
        const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY
        // ... (existing code for image analysis)
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Faster for vision/chat
                messages: [
                    {
                        role: "system",
                        content: "You are a nutritionist. Analyze the image and identify the food items. Return ONLY valid JSON with no markdown formatting. Structure: { foods: [{ name: string, calories: number, protein_g: number, carbs_g: number, fat_g: number, confidence: number }] }"
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 500
            })
        })

        const data = await response.json()
        const content = data.choices[0].message.content
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim()
        return JSON.parse(jsonStr)

    } catch (error) {
        console.error("OpenAI Analysis Error", error)
        throw error
    }
}

export const chatWithCoach = async (messages: any[], userContext: any) => {
    try {
        const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY

        // Construct System Prompt with Context
        const systemPrompt = `
        You are an elite AI Fitness & Nutrition Coach.
        User Profile:
        - Name: ${userContext.name || 'Athlete'}
        - Goal: ${userContext.goal || 'General Fitness'}
        - Weight: ${userContext.weight}kg, Height: ${userContext.height}cm
        - Info: ${userContext.age} years old, ${userContext.gender}
        
        Recent Activity:
        - Last Meal: ${userContext.lastMeal || 'None logged recently'}
        - Workout Plan: ${userContext.workoutFocus || 'None'}

        Style:
        - Be motivational, concise, and scientific.
        - Use emojis occasionally.
        - If asked about medical advice, disclaim that you are an AI.
        `

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages
                ],
                temperature: 0.7
            })
        })

        const data = await response.json()
        if (data.error) throw new Error(data.error.message)

        return data.choices[0].message.content

    } catch (error) {
        console.error("Chat Error", error)
        throw error
    }
}
