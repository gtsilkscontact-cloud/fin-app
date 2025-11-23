import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TransactionContext from '../context/TransactionContext';

const DetailsScreen = () => {
    const { accounts, transactions, deleteAccount } = useContext(TransactionContext);
    const navigation = useNavigation();

    const calculateBalance = (accountId) => {
        const account = accounts.find(a => a.id === accountId);
        if (!account) return 0;

        const accountTransactions = transactions.filter(t => t.accountId === accountId);
        const totalIncome = accountTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = accountTransactions
            .filter(t => t.type === 'expense' || t.type === 'payment')
            .reduce((sum, t) => sum + t.amount, 0);

        return account.startingBalance + totalIncome - totalExpense;
    };

    const handleDelete = (accountId, accountName) => {
        Alert.alert(
            'Delete Account',
            `Are you sure you want to delete "${accountName}"? This will also delete all associated transactions.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteAccount(accountId)
                }
            ]
        );
    };

    const renderAccount = ({ item }) => (
        <View style={styles.accountCard}>
            <View style={styles.accountHeader}>
                <View>
                    <Text style={styles.accountName}>{item.name}</Text>
                    <Text style={styles.accountType}>{item.type}</Text>
                    {item.last4Digits && (
                        <Text style={styles.accountDigits}>****{item.last4Digits}</Text>
                    )}
                </View>
                <Text style={styles.accountBalance}>₹{calculateBalance(item.id).toFixed(2)}</Text>
            </View>
            <View style={styles.accountActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('AccountDetail', { accountId: item.id })}
                >
                    <Text style={styles.actionButtonText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item.id, item.name)}
                >
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={accounts}
                keyExtractor={item => item.id}
                renderItem={renderAccount}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.emptyText}>No accounts yet. Add one!</Text>}
            />
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddAccount')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    list: { padding: 16 },
    accountCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
    accountHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    accountName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    accountType: { fontSize: 12, color: '#666', backgroundColor: '#eee', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 5, alignSelf: 'flex-start' },
    accountDigits: { fontSize: 12, color: '#999', marginTop: 5 },
    accountBalance: { fontSize: 24, fontWeight: 'bold', color: '#6200ee' },
    accountActions: { flexDirection: 'row', gap: 10 },
    actionButton: { flex: 1, backgroundColor: '#6200ee', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    actionButtonText: { color: '#fff', fontWeight: 'bold' },
    deleteButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#f44336' },
    deleteButtonText: { color: '#f44336' },
    emptyText: { textAlign: 'center', color: '#888', marginTop: 40 },
    fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#6200ee', alignItems: 'center', justifyContent: 'center', elevation: 5 },
    fabText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
});

export default DetailsScreen;
