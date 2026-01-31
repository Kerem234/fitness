import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { View, ActivityIndicator } from 'react-native'
import { LoginScreen } from '../screens/Auth/LoginScreen'
import { RegisterScreen } from '../screens/Auth/RegisterScreen'
import { WelcomeScreen } from '../screens/Onboarding/WelcomeScreen'
import { GoalScreen } from '../screens/Onboarding/GoalScreen'
import { DemographicsScreen } from '../screens/Onboarding/DemographicsScreen'
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen'
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
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {session ? (
                    <Stack.Screen name="Main" component={DashboardScreen} />
                ) : (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    )
}
