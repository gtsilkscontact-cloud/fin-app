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
                    <Text style={styles.type}>{item.type.toUpperCase()}</Text>
                    <Text style={styles.date}>{item.date}</Text>
                </View>
                <Text style={styles.amount}>₹{item.amount}</Text>
                <Text style={styles.description} numberOfLines={2}>{item.note}</Text>
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
                    <Text style={styles.confirmText}>Confirm Category</Text>
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
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    type: { fontSize: 12, fontWeight: 'bold', color: '#6200ee', backgroundColor: '#e8e0ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    date: { fontSize: 12, color: '#999' },
    amount: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    description: { fontSize: 14, color: '#666', marginBottom: 8 },
    location: { fontSize: 12, color: '#00B894', fontWeight: '500' },
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
