import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import TransactionContext from '../context/TransactionContext';

const TransactionsScreen = () => {
    const { transactions, accounts } = useContext(TransactionContext);
    const [filter, setFilter] = useState('all'); // all, income, expense

    const getAccountName = (accountId) => {
        const account = accounts.find(a => a.id === accountId);
        return account ? account.name : 'Unknown';
    };

    const filteredTransactions = filter === 'all'
        ? transactions
        : transactions.filter(t => t.type === filter);

    const renderTransaction = ({ item }) => (
        <View style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
                <Text style={styles.transactionDate}>{item.date}</Text>
                <Text style={[styles.transactionAmount, item.type === 'income' ? styles.income : styles.expense]}>
                    {item.type === 'income' ? '+' : '-'}₹{item.amount.toFixed(2)}
                </Text>
            </View>
            <Text style={styles.transactionNote}>{item.note || 'No description'}</Text>
            <View style={styles.transactionFooter}>
                <Text style={styles.transactionAccount}>{getAccountName(item.accountId)}</Text>
                <Text style={styles.transactionCategory}>{item.category || 'Uncategorized'}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'income' && styles.filterButtonActive]}
                    onPress={() => setFilter('income')}
                >
                    <Text style={[styles.filterText, filter === 'income' && styles.filterTextActive]}>Income</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'expense' && styles.filterButtonActive]}
                    onPress={() => setFilter('expense')}
                >
                    <Text style={[styles.filterText, filter === 'expense' && styles.filterTextActive]}>Expense</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))}
                keyExtractor={item => item.id}
                renderItem={renderTransaction}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.emptyText}>No transactions yet</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    filterContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', gap: 10 },
    filterButton: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
    filterButtonActive: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
    filterText: { color: '#333', fontWeight: '500' },
    filterTextActive: { color: '#fff' },
    list: { padding: 16 },
    transactionCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
    transactionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    transactionDate: { fontSize: 14, color: '#666' },
    transactionAmount: { fontSize: 18, fontWeight: 'bold' },
    income: { color: '#4caf50' },
    expense: { color: '#f44336' },
    transactionNote: { fontSize: 16, color: '#333', marginBottom: 8 },
    transactionFooter: { flexDirection: 'row', justifyContent: 'space-between' },
    transactionAccount: { fontSize: 12, color: '#666' },
    transactionCategory: { fontSize: 12, color: '#6200ee', backgroundColor: '#e8e0ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    emptyText: { textAlign: 'center', color: '#888', marginTop: 40 },
});

export default TransactionsScreen;
