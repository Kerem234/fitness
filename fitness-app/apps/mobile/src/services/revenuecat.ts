import Purchases, { PurchasesPackage } from 'react-native-purchases'
import { Platform } from 'react-native'

const API_KEYS = {
    apple: process.env.EXPO_PUBLIC_REVENUECAT_APPLE || '',
    google: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE || '',
}

export const initRevenueCat = async () => {
    if (Platform.OS === 'ios') {
        Purchases.configure({ apiKey: API_KEYS.apple })
    } else if (Platform.OS === 'android') {
        Purchases.configure({ apiKey: API_KEYS.google })
    }
}

export const getPackages = async (): Promise<PurchasesPackage[]> => {
    try {
        const offerings = await Purchases.getOfferings()
        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
            return offerings.current.availablePackages
        }
        return []
    } catch (e) {
        console.error("Error fetching offerings", e)
        return []
    }
}

export const purchasePackage = async (pack: PurchasesPackage) => {
    try {
        const { customerInfo } = await Purchases.purchasePackage(pack)
        if (typeof customerInfo.entitlements.active['pro'] !== "undefined") {
            return true // Unlock Pro content
        }
    } catch (e: any) {
        if (!e.userCancelled) {
            console.error("Purchase error", e)
        }
    }
    return false
}

export const checkProStatus = async (): Promise<boolean> => {
    try {
        const customerInfo = await Purchases.getCustomerInfo()
        return typeof customerInfo.entitlements.active['pro'] !== "undefined"
    } catch (e) {
        return false // Default to free if error
    }
}
