import React, { useState, useRef } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { EXPO_PUBLIC_OPENAI_API_KEY } from '@env'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
}

export const ChatScreen = ({ navigation }: any) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Hello! I am your AI Fitness Coach. Ask me anything about your diet, workout, or health goals.' }
    ])
    const [inputText, setInputText] = useState('')
    const [loading, setLoading] = useState(false)
    const flatListRef = useRef<FlatList>(null)

    const sendMessage = async () => {
        if (!inputText.trim()) return

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputText }
        setMessages(prev => [...prev, userMsg])
        setInputText('')
        setLoading(true)

        try {
            // In real app, move this to backend or Edge Function to hide Key.
            // Using client-side for MVP speed as requested.
            const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY

            const apiMessages = messages.concat(userMsg).map(m => ({ role: m.role, content: m.content }))

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: "You are a helpful, motivating, and knowledgeable fitness coach." },
                        ...apiMessages
                    ]
                })
            })

            const data = await response.json()
            const reply = data.choices[0].message.content

            const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply }
            setMessages(prev => [...prev, botMsg])

        } catch (error) {
            console.error(error)
            const errorMsg: Message = { id: Date.now().toString(), role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setLoading(false)
        }
    }

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-4 py-3 border-b border-gray-800 flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-white font-bold text-lg">AI Coach</Text>
                        <Text className="text-green-500 text-xs">Online</Text>
                    </View>
                </View>

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    renderItem={({ item }) => (
                        <View className={`mb-4 max-w-[80%] ${item.role === 'user' ? 'self-end' : 'self-start'}`}>
                            <View className={`p-4 rounded-2xl ${item.role === 'user'
                                    ? 'bg-primary rounded-tr-none'
                                    : 'bg-gray-800 rounded-tl-none'
                                }`}>
                                <Text className="text-white text-base leading-6">{item.content}</Text>
                            </View>
                        </View>
                    )}
                />

                {/* Input */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
                >
                    <View className="p-4 border-t border-gray-800 bg-black flex-row items-center">
                        <TextInput
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Ask about workouts, food..."
                            placeholderTextColor="#666"
                            className="flex-1 bg-gray-900 text-white rounded-full px-5 py-3 mr-3 text-base border border-gray-800"
                            multiline
                        />
                        <TouchableOpacity
                            onPress={sendMessage}
                            disabled={loading || !inputText.trim()}
                            className={`w-12 h-12 rounded-full items-center justify-center ${loading || !inputText.trim() ? 'bg-gray-800' : 'bg-primary'
                                }`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Ionicons name="send" size={20} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    )
}
