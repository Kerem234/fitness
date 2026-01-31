import React, { useEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { View, ActivityIndicator } from 'react-native'
import { LoginScreen } from '../screens/Auth/LoginScreen'
import { RegisterScreen } from '../screens/Auth/RegisterScreen'
import { WelcomeScreen } from '../screens/Onboarding/WelcomeScreen'
import { GoalScreen } from '../screens/Onboarding/GoalScreen'
import { DemographicsScreen } from '../screens/Onboarding/DemographicsScreen'
import { PaywallScreen } from '../screens/Paywall/PaywallScreen'
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen'
import { FoodSearchScreen } from '../screens/Nutrition/FoodSearchScreen'
import { BarcodeScannerScreen } from '../screens/Nutrition/BarcodeScannerScreen'
import { WorkoutPlanScreen } from '../screens/Workout/WorkoutPlanScreen'
import { ChatScreen } from '../screens/Coach/ChatScreen'
import { PhotoAnalysisScreen } from '../screens/Nutrition/PhotoAnalysisScreen'
import { WorkoutSessionScreen } from '../screens/Workout/WorkoutSessionScreen'
import { AnalyticsScreen } from '../screens/Analytics/AnalyticsScreen'
import { ProfileScreen } from '../screens/Profile/ProfileScreen'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../services/supabase'

const Stack = createStackNavigator()
const AuthStack = createStackNavigator()

const AuthNavigator = () => (
    <AuthStack.Navigator screenOptions={{ headerTransparent: true, headerTitle: '', headerTintColor: 'white' }}>
        <AuthStack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
        <AuthStack.Screen name="Goal" component={GoalScreen} options={{ headerShown: false }} />
        <AuthStack.Screen name="Demographics" component={DemographicsScreen} options={{ headerShown: false }} />
        <AuthStack.Screen name="Paywall" component={PaywallScreen} options={{ headerShown: false }} />
    </AuthStack.Navigator>
)

export const AppNavigator = () => {
    const { session, loading, setSession, setLoading } = useAuthStore()


    useEffect(() => {
        // 1. Initial Session Check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setLoading(false)
        })

        // 2. Listen for Auth Changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {true || session ? (
                <>
                    <Stack.Screen name="Main" component={DashboardScreen} />
                    <Stack.Screen name="FoodSearch" component={FoodSearchScreen} />
                    <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
                    <Stack.Screen name="WorkoutPlan" component={WorkoutPlanScreen} />
                    <Stack.Screen name="Chat" component={ChatScreen} />
                    <Stack.Screen name="PhotoAnalysis" component={PhotoAnalysisScreen} />
                    <Stack.Screen name="WorkoutSession" component={WorkoutSessionScreen} />
                    <Stack.Screen name="Analytics" component={AnalyticsScreen} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                </>
            ) : (
                <Stack.Screen name="Auth" component={AuthNavigator} />
            )}
        </Stack.Navigator>
    )
}
