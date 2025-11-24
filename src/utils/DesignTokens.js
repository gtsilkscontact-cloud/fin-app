// Design Tokens - Modern Finance App
// Centralized design system for consistent styling

export const Colors = {
    // Primary Gradient
    primary: '#6200ee',
    primaryLight: '#7c3aed',
    primaryDark: '#4c1d95',
    secondary: '#4285F4',

    // Gradients (use with LinearGradient)
    gradientPrimary: ['#6200ee', '#4285F4'],
    gradientSuccess: ['#10B981', '#059669'],
    gradientDanger: ['#EF4444', '#DC2626'],
    gradientNeutral: ['#F9FAFB', '#E5E7EB'],

    // Semantic Colors
    success: '#10B981',
    successLight: '#D1FAE5',
    successDark: '#059669',

    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    dangerDark: '#DC2626',

    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    warningDark: '#D97706',

    info: '#3B82F6',
    infoLight: '#DBEAFE',
    infoDark: '#2563EB',

    // Neutral Grays
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',

    // Background
    background: '#F9FAFB',
    surface: '#FFFFFF',

    // Text
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textInverse: '#FFFFFF',
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
    pill: 24,
};

export const Typography = {
    // Font Sizes
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 32,
    massive: 48,

    // Font Weights
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',

    // Line Heights
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
};

export const Shadows = {
    // Card shadows
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 8,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 25,
        elevation: 12,
    },
};

export const Animations = {
    // Duration
    fast: 150,
    normal: 300,
    slow: 500,

    // Easing
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
};

// Helper function to create gradient style
export const createGradient = (colors, angle = 135) => ({
    colors,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
});

export default {
    Colors,
    Spacing,
    BorderRadius,
    Typography,
    Shadows,
    Animations,
    createGradient,
};
