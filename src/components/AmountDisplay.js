import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../utils/DesignTokens';

/**
 * AmountDisplay - Large, formatted amount display
 * @param {number} amount - Amount to display
 * @param {string} type - Type for color coding ('income', 'expense', 'neutral')
 * @param {string} size - Size variant ('small', 'medium', 'large', 'huge')
 * @param {boolean} showSign - Whether to show +/- sign
 */
export const AmountDisplay = ({
    amount,
    type = 'neutral',
    size = 'large',
    showSign = false
}) => {
    const getColor = () => {
        switch (type) {
            case 'income':
                return Colors.success;
            case 'expense':
                return Colors.danger;
            default:
                return Colors.textPrimary;
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'small':
                return Typography.lg;
            case 'medium':
                return Typography.xxxl;
            case 'large':
                return Typography.huge;
            case 'huge':
                return Typography.massive;
            default:
                return Typography.huge;
        }
    };

    const formatAmount = (value) => {
        const formatted = Math.abs(value).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        if (showSign) {
            const sign = value >= 0 ? '+' : '-';
            return `${sign}₹${formatted}`;
        }

        return `₹${formatted}`;
    };

    return (
        <Text style={[
            styles.amount,
            { color: getColor(), fontSize: getFontSize() }
        ]}>
            {formatAmount(amount)}
        </Text>
    );
};

const styles = StyleSheet.create({
    amount: {
        fontWeight: Typography.bold,
        letterSpacing: -0.5,
    },
});

export default AmountDisplay;
