import { EXPO_PUBLIC_OPENAI_API_KEY } from '@env'

export const analyzeFoodImage = async (base64Image: string) => {
    try {
        const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY

        // We strictly instruct the AI to return JSON
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
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

        // Clean up if markdown code blocks exist ( ```json ... ``` )
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim()
        return JSON.parse(jsonStr)

    } catch (error) {
        console.error("OpenAI Analysis Error", error)
        throw error
    }
}
