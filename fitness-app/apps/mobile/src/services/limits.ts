import { supabase } from './supabase'

export const DAILY_LIMIT_FREE = 5

export const checkUsageLimit = async (userId: string, actionDesc: string = 'scan_food'): Promise<boolean> => {
    // 1. Check if user is Premium (using local claim or RevenueCat status)
    // For now, assume we check a 'is_pro' flag on profile or just check database count
    // Real app: use RevenueCat customerInfo.entitlements.active['pro']

    // Simulating "Is Pro?" check via profile (requires profile column 'is_pro' or similar)
    // Let's just enforce limit for everyone for MVP logic demonstration

    const today = new Date().toISOString().split('T')[0]
    const startOfDay = `${today}T00:00:00.000Z`
    const endOfDay = `${today}T23:59:59.999Z`

    const { count, error } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action_type', actionDesc)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)

    if (error) {
        console.error("Usage Check Error", error)
        return true // Fail safe: allow usage if DB error? OR Block. Let's Allow.
    }

    if ((count || 0) >= DAILY_LIMIT_FREE) {
        return false // Limit Reached
    }

    return true // Allowed
}

export const incrementUsage = async (userId: string, actionDesc: string = 'scan_food') => {
    await supabase.from('usage_logs').insert({
        user_id: userId,
        action_type: actionDesc
    })
}
