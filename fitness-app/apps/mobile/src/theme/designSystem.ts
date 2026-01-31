export const theme = {
    colors: {
        // Backgrounds
        background: '#09090B', // Very dark zinc
        surface: '#18181B', // Slightly lighter for cards
        surfaceHighlight: '#27272A', // For hover/active states (zinc 800)

        // Primary Brand
        primary: '#3B82F6', // Blue 500
        primaryDark: '#2563EB', // Blue 600
        primaryLight: '#60A5FA', // Blue 400

        // Accents
        success: '#10B981', // Emerald 500
        warning: '#F59E0B', // Amber 500
        error: '#EF4444', // Red 500
        rating: '#EAB308', // Yellow 500 (Star icon color)

        // Text
        text: '#FAFAFA', // Zinc 50 (Headings)
        textSecondary: '#A1A1AA', // Zinc 400 (Body)
        textMuted: '#52525B', // Zinc 600 (Disabled/Subtle)

        // Gradients (Represented as tuple for LinearGradient)
        gradients: {
            primary: ['#3B82F6', '#2563EB'],
            dark: ['#18181B', '#09090B'],
            glass: ['rgba(39, 39, 42, 0.6)', 'rgba(24, 24, 27, 0.4)'],
            orange: ['#F59E0B', '#D97706'],
        }
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        full: 9999,
    }
}
