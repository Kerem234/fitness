import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../services/supabase'
import { chatWithCoach } from '../../services/openai'
import { GlassCard } from '../../components/ui/GlassCard'
import { theme } from '../../theme/designSystem'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
}

export const ChatScreen = ({ navigation }: any) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Hello! I am your AI Fitness Coach. I know your goals and stats. How can I help you today? 💪' }
    ])
    const [inputText, setInputText] = useState('')
    const [loading, setLoading] = useState(false)
    const [userContext, setUserContext] = useState<any>({})
    const flatListRef = useRef<FlatList>(null)

    useEffect(() => {
        loadContext()
    }, [])

    const loadContext = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 1. Profile
        const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single()

        // 2. Last Meal
        const { data: meals } = await supabase.from('meals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1)

        // 3. Proactive Check
        let proactiveMsg = null
        if (meals && meals.length > 0) {
            const today = new Date().toISOString().split('T')[0]
            // A safer check if date column exists, else use created_at substring
            const lastMealDate = meals[0].date || meals[0].created_at.split('T')[0]

            if (lastMealDate !== today) {
                proactiveMsg = "Hey! haven't seen any food logs today. Don't forget to track your breakfast! 🍳"
            }
        } else {
            proactiveMsg = "Welcome! Let's start by logging your first meal or workout plan. I'm here to help."
        }

        if (proactiveMsg) {
            // Only add if we haven't already added a proactive message this session (simple check: length=1)
            setMessages(prev => {
                if (prev.length === 1) {
                    return [...prev, { id: 'proactive-1', role: 'assistant', content: proactiveMsg! }]
                }
                return prev
            })
        }

        setUserContext({
            name: profile?.full_name,
            goal: profile?.goal_type,
            weight: profile?.weight,
            height: profile?.height,
            age: profile?.age,
            gender: profile?.gender,
            lastMeal: meals && meals.length > 0 ? `${meals[0].total_calories}kcal meal` : 'None',
        })
    }

    const sendMessage = async () => {
        if (!inputText.trim()) return

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputText }
        setMessages(prev => [...prev, userMsg])
        setInputText('')
        setLoading(true)

        try {
            // Filter only role/content for API
            const history = messages.concat(userMsg).map(m => ({ role: m.role, content: m.content }))
            const recentHistory = history.slice(-10)

            const reply = await chatWithCoach(recentHistory, userContext)

            const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply }
            setMessages(prev => [...prev, botMsg])

        } catch (error) {
            console.error(error)
            const errorMsg: Message = { id: Date.now().toString(), role: 'assistant', content: "I'm having trouble connecting to the gym mainframe. Try again later!" }
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
                <View className="px-4 py-3 border-b border-gray-800 flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-800 rounded-full">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white font-bold text-lg">Fitness AI</Text>
                        <View className="flex-row items-center">
                            <View className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                            <Text className="text-gray-400 text-xs">Online & Context Aware</Text>
                        </View>
                    </View>
                    <TouchableOpacity className="p-2">
                        <Ionicons name="ellipsis-vertical" size={24} color="gray" />
                    </TouchableOpacity>
                </View>

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    renderItem={({ item }) => {
                        const isUser = item.role === 'user'
                        return (
                            <View className={`mb-4 max-w-[85%] ${isUser ? 'self-end' : 'self-start'}`}>
                                <GlassCard
                                    variant={isUser ? 'primary' : 'dark'}
                                    style={{
                                        padding: 12,
                                        borderRadius: 20,
                                        borderBottomRightRadius: isUser ? 4 : 20,
                                        borderTopLeftRadius: isUser ? 20 : 4,
                                        backgroundColor: isUser ? 'rgba(59, 130, 246, 0.3)' : 'rgba(39, 39, 42, 0.6)'
                                    }}
                                >
                                    <Text className="text-white text-base leading-6">{item.content}</Text>
                                </GlassCard>
                                {!isUser && (
                                    <Text className="text-gray-600 text-[10px] ml-2 mt-1">AI Coach</Text>
                                )}
                            </View>
                        )
                    }}
                />

                {/* Loading Indicator */}
                {loading && (
                    <View className="ml-4 mb-4">
                        <Text className="text-gray-500 text-xs italic">AI is typing...</Text>
                    </View>
                )}

                {/* Input */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
                >
                    <View className="p-4 border-t border-gray-800 bg-black/90 flex-row items-center">
                        <TextInput
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Ask about workouts, food..."
                            placeholderTextColor="#666"
                            className="flex-1 bg-gray-900 text-white rounded-2xl px-5 py-4 mr-3 text-base border border-gray-800"
                            multiline
                            maxHeight={100}
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
                                <Ionicons name="arrow-up" size={24} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    )
}
