import React from 'react'
import { View, Text, StyleSheet, Button } from 'react-native'
import { supabase } from '../../services/supabase'

export const DashboardScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome to Fitness App!</Text>
            <Text style={styles.subtext}>Phase 1 Complete</Text>
            <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtext: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
})
