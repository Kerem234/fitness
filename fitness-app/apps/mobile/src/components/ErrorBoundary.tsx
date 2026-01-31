import React, { Component, ErrorInfo, ReactNode } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo)
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    public render() {
        if (this.state.hasError) {
            return (
                <SafeAreaView style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <View style={{ width: 80, height: 80, backgroundColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
                        <Ionicons name="warning" size={40} color="#EF4444" />
                    </View>
                    <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
                        Oops! Something went wrong.
                    </Text>
                    <Text style={{ color: '#9CA3AF', marginBottom: 32, textAlign: 'center' }}>
                        We've encountered an unexpected error. Our team has been notified.
                    </Text>

                    <ScrollView style={{ maxHeight: 150, width: '100%', backgroundColor: '#1F2937', padding: 12, borderRadius: 8, marginBottom: 24 }}>
                        <Text style={{ color: '#F87171', fontFamily: 'monospace', fontSize: 12 }}>
                            {this.state.error?.toString()}
                        </Text>
                    </ScrollView>

                    <TouchableOpacity
                        onPress={this.handleReset}
                        style={{ backgroundColor: '#2563EB', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Try Again</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            )
        }

        return this.props.children
    }
}
