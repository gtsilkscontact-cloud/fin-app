import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Shadows } from '../utils/DesignTokens';

/**
 * GradientCard - Card component with gradient background
 * @param {Array} colors - Gradient colors array
 * @param {ReactNode} children - Card content
 * @param {Object} style - Additional styles
 */
export const GradientCard = ({ colors = Colors.gradientPrimary, children, style }) => {
    return (
        <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientCard, style]}
        >
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradientCard: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        ...Shadows.lg,
    },
});

export default GradientCard;
