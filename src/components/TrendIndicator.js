import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../utils/DesignTokens';

/**
 * TrendIndicator - Shows trend with arrow and percentage
 * @param {number} percentage - Percentage change
 * @param {string} label - Optional label (e.g., "from last month")
 */
export const TrendIndicator = ({ percentage, label }) => {
    const isPositive = percentage >= 0;
    const arrow = isPositive ? '↗' : '↘';
    const color = isPositive ? Colors.success : Colors.danger;

    return (
        <View style={styles.container}>
            <Text style={[styles.arrow, { color }]}>{arrow}</Text>
            <Text style={[styles.percentage, { color }]}>
                {Math.abs(percentage).toFixed(1)}%
            </Text>
            {label && (
                <Text style={styles.label}> {label}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    arrow: {
        fontSize: Typography.md,
        marginRight: Spacing.xs,
    },
    percentage: {
        fontSize: Typography.sm,
        fontWeight: Typography.semibold,
    },
    label: {
        fontSize: Typography.sm,
        color: Colors.textSecondary,
    },
});

export default TrendIndicator;
