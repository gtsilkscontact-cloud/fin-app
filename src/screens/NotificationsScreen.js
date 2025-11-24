import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import TransactionContext from '../context/TransactionContext';
import AmountDisplay from '../components/AmountDisplay';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../utils/DesignTokens';

const NotificationsScreen = () => {
    const { pendingTransactions, deletePendingTransaction } = useContext(TransactionContext);
    const navigation = useNavigation();

    const handleConfirm = (item) => {
        navigation.navigate('AddTransaction', {
            prefill: {
                ...item,
                isPending: true
            }
        });
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Ignore Transaction",
            "Are you sure you want to ignore this transaction?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Ignore",
                    style: "destructive",
                    onPress: () => deletePendingTransaction(id)
                }
            ]
        );
    };

    // Calculate time ago
    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return dateString;
    };

    // Check if transaction is new (within last hour)
    const isNew = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = diffMs / 3600000;
        return diffHours < 1;
    };

    const renderItem = ({ item }) => (
        <View style={styles.cardWrapper}>
            {/* Gradient border effect */}
            <LinearGradient
                colors={item.type === 'income' ? Colors.gradientSuccess : Colors.gradientDanger}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBorder}
            >
                <View style={styles.card}>
                    {/* NEW Badge */}
                    {isNew(item.date) && (
                        <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>⚡ NEW</Text>
                        </View>
                    )}

                    <View style={styles.cardContent}>
                        {/* Header with type and time */}
                        <View style={styles.headerRow}>
                            <View style={styles.typeContainer}>
                                <Text style={[
                                    styles.type,
                                    item.type === 'income' ? styles.typeIncome : styles.typeExpense
                                ]}>
                                    {item.type.toUpperCase()}
                                </Text>
                                {item.transactionMethod && (
                                    <Text style={styles.method}>{item.transactionMethod}</Text>
                                )}
                            </View>
                            <Text style={styles.timeAgo}>{getTimeAgo(item.date)}</Text>
                        </View>

                        {/* Amount - Large and prominent */}
                        <View style={styles.amountContainer}>
                            <AmountDisplay
                                amount={item.amount}
                                type={item.type}
                                size="huge"
                            />
                        </View>

                        {/* Merchant Name */}
                        {item.merchantName && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoIcon}>🏪</Text>
                                <Text style={styles.merchantName}>{item.merchantName}</Text>
                            </View>
                        )}

                        {/* Card Info */}
                        {item.last4Digits && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoIcon}>💳</Text>
                                <Text style={styles.cardInfo}>•••• {item.last4Digits}</Text>
                            </View>
                        )}

                        {/* Location */}
                        {item.location && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoIcon}>📍</Text>
                                <Text style={styles.location}>{item.location}</Text>
                            </View>
                        )}

                        {/* Description/Note */}
                        {item.note && item.note !== item.merchantName && (
                            <Text style={styles.description} numberOfLines={2}>
                                {item.note}
                            </Text>
                        )}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, styles.ignoreButton]}
                            onPress={() => handleDelete(item.id)}
                        >
                            <Text style={styles.ignoreText}>Ignore</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={() => handleConfirm(item)}
                        >
                            <LinearGradient
                                colors={Colors.gradientPrimary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.confirmGradient}
                            >
                                <Text style={styles.confirmText}>Confirm & Categorize</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={pendingTransactions}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🔔</Text>
                        <Text style={styles.emptyText}>No pending transactions</Text>
                        <Text style={styles.emptySubText}>New SMS transactions will appear here</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background
    },
    list: {
        padding: Spacing.lg,
    },
    cardWrapper: {
        marginBottom: Spacing.lg,
    },
    gradientBorder: {
        borderRadius: BorderRadius.lg,
        padding: 2, // Border width
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg - 1,
        overflow: 'hidden',
        ...Shadows.md,
    },
    newBadge: {
        position: 'absolute',
        top: Spacing.md,
        right: Spacing.md,
        backgroundColor: Colors.warning,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.pill,
        zIndex: 1,
        ...Shadows.sm,
    },
    newBadgeText: {
        color: Colors.textInverse,
        fontSize: Typography.xs,
        fontWeight: Typography.bold,
    },
    cardContent: {
        padding: Spacing.xl,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    type: {
        fontSize: Typography.xs,
        fontWeight: Typography.bold,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    typeExpense: {
        color: Colors.danger,
        backgroundColor: Colors.dangerLight,
    },
    typeIncome: {
        color: Colors.success,
        backgroundColor: Colors.successLight,
    },
    method: {
        fontSize: Typography.xs,
        color: Colors.textSecondary,
        backgroundColor: Colors.gray100,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
        fontWeight: Typography.semibold,
    },
    timeAgo: {
        fontSize: Typography.sm,
        color: Colors.textSecondary,
    },
    amountContainer: {
        marginBottom: Spacing.lg,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    infoIcon: {
        fontSize: 16,
        marginRight: Spacing.sm,
    },
    merchantName: {
        fontSize: Typography.lg,
        color: Colors.textPrimary,
        fontWeight: Typography.semibold,
    },
    cardInfo: {
        fontSize: Typography.base,
        color: Colors.textSecondary,
        fontWeight: Typography.medium,
    },
    location: {
        fontSize: Typography.sm,
        color: Colors.success,
        fontWeight: Typography.medium,
    },
    description: {
        fontSize: Typography.sm,
        color: Colors.textSecondary,
        marginTop: Spacing.sm,
        lineHeight: Typography.normal * Typography.sm,
    },
    actions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: Colors.gray200,
    },
    button: {
        flex: 1,
        padding: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ignoreButton: {
        borderRightWidth: 1,
        borderRightColor: Colors.gray200,
    },
    confirmButton: {
        padding: 0,
    },
    confirmGradient: {
        flex: 1,
        width: '100%',
        padding: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ignoreText: {
        color: Colors.textSecondary,
        fontWeight: Typography.semibold,
        fontSize: Typography.base,
    },
    confirmText: {
        color: Colors.textInverse,
        fontWeight: Typography.bold,
        fontSize: Typography.base,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: Spacing.lg,
    },
    emptyText: {
        fontSize: Typography.xl,
        color: Colors.textPrimary,
        fontWeight: Typography.bold,
        marginBottom: Spacing.sm,
    },
    emptySubText: {
        fontSize: Typography.base,
        color: Colors.textSecondary,
    },
});

export default NotificationsScreen;
