import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import TransactionContext from '../context/TransactionContext';

const NotificationsScreen = () => {
    const { pendingTransactions, deletePendingTransaction } = useContext(TransactionContext);
    const navigation = useNavigation();

    const handleConfirm = (item) => {
        // Navigate to AddTransaction with pre-filled data
        navigation.navigate('AddTransaction', {
            prefill: {
                ...item,
                isPending: true // Flag to indicate this is confirming a pending item
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

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                    <View style={styles.typeContainer}>
                        <Text style={[styles.type, item.type === 'income' ? styles.typeIncome : styles.typeExpense]}>
                            {item.type.toUpperCase()}
                        </Text>
                        {item.transactionMethod && (
                            <Text style={styles.method}>{item.transactionMethod}</Text>
                        )}
                    </View>
                    <Text style={styles.date}>{item.date}</Text>
                </View>

                <Text style={styles.amount}>₹{item.amount}</Text>

                {item.merchantName && (
                    <Text style={styles.merchant}>🏪 {item.merchantName}</Text>
                )}

                {item.last4Digits && (
                    <Text style={styles.cardInfo}>💳 •••• {item.last4Digits}</Text>
                )}

                {item.note && item.note !== item.merchantName && (
                    <Text style={styles.description} numberOfLines={2}>{item.note}</Text>
                )}

                {item.location && (
                    <Text style={styles.location}>📍 {item.location}</Text>
                )}
            </View>
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
                    <Text style={styles.confirmText}>Confirm & Categorize</Text>
                </TouchableOpacity>
            </View>
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
                        <Text style={styles.emptyText}>No pending transactions</Text>
                        <Text style={styles.emptySubText}>New SMS transactions will appear here</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    list: { padding: 16 },
    card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, elevation: 2, overflow: 'hidden' },
    cardContent: { padding: 16 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    typeContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    type: {
        fontSize: 11,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4
    },
    typeExpense: {
        color: '#dc2626',
        backgroundColor: '#fee2e2'
    },
    typeIncome: {
        color: '#059669',
        backgroundColor: '#d1fae5'
    },
    method: {
        fontSize: 10,
        color: '#6b7280',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
        fontWeight: '600'
    },
    date: { fontSize: 12, color: '#999' },
    amount: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    merchant: {
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '600',
        marginBottom: 6
    },
    cardInfo: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '500',
        marginBottom: 6
    },
    description: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
    location: { fontSize: 12, color: '#059669', fontWeight: '500', marginTop: 4 },
    actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee' },
    button: { flex: 1, padding: 15, alignItems: 'center' },
    ignoreButton: { borderRightWidth: 1, borderRightColor: '#eee' },
    confirmButton: { backgroundColor: '#f8f5ff' },
    ignoreText: { color: '#999', fontWeight: '600' },
    confirmText: { color: '#6200ee', fontWeight: 'bold' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, color: '#333', fontWeight: 'bold', marginBottom: 8 },
    emptySubText: { fontSize: 14, color: '#999' },
});

export default NotificationsScreen;
