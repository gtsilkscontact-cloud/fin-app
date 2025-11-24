import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../utils/DesignTokens';

/**
 * StatCard - Small card for displaying statistics
 * @param {string} icon - Emoji icon
 * @param {string} label - Stat label
 * @param {string|number} value - Stat value
 * @param {string} trend - Trend indicator (e.g., "+5.2%")
 * @param {string} type - Type for color coding ('success', 'danger', 'neutral')
 */
export const StatCard = ({ icon, label, value, trend, type = 'neutral' }) => {
    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return Colors.successLight;
            case 'danger':
                return Colors.dangerLight;
            case 'info':
                return Colors.infoLight;
            default:
                return Colors.surface;
        }
    };

    const getTrendColor = () => {
        if (!trend) return Colors.textSecondary;
        return trend.startsWith('+') ? Colors.success : Colors.danger;
    };

    return (
        <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
            {trend && (
                <Text style={[styles.trend, { color: getTrendColor() }]}>
                    {trend}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        ...Shadows.sm,
    },
    icon: {
        fontSize: 24,
        marginBottom: Spacing.xs,
    },
    label: {
        fontSize: Typography.xs,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
        textTransform: 'uppercase',
        fontWeight: Typography.semibold,
    },
    value: {
        fontSize: Typography.xl,
        fontWeight: Typography.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    trend: {
        fontSize: Typography.sm,
        fontWeight: Typography.medium,
    },
});

export default StatCard;
