import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import TransactionContext from '../context/TransactionContext';

const AccountDetailScreen = () => {
    const { accounts, transactions } = useContext(TransactionContext);
    const route = useRoute();
    const navigation = useNavigation();
    const { accountId } = route.params;

    const account = accounts.find(a => a.id === accountId);
    const accountTransactions = transactions
        .filter(t => t.accountId === accountId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const calculateBalance = () => {
        if (!account) return 0;
        const totalIncome = accountTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = accountTransactions
            .filter(t => t.type === 'expense' || t.type === 'payment')
            .reduce((sum, t) => sum + t.amount, 0);
        return account.startingBalance + totalIncome - totalExpense;
    };

    if (!account) return <View style={styles.center}><Text>Account not found</Text></View>;

    const renderTransactionItem = ({ item }) => (
        <View style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
                <Text style={styles.transactionCategory}>{item.category || item.type}</Text>
                {item.note ? <Text style={styles.transactionNote}>{item.note}</Text> : null}
                <Text style={styles.transactionDate}>{item.date}</Text>
                {item.location && item.location.area ? (
                    <Text style={styles.transactionLocation}>📍 {item.location.area}</Text>
                ) : null}
            </View>
            <Text style={[
                styles.transactionAmount,
                item.type === 'income' ? styles.income : styles.expense
            ]}>
                {item.type === 'income' ? '+' : '-'} ₹ {item.amount.toFixed(2)}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text style={styles.accountType}>{account.type}</Text>
                <Text style={styles.balance}>₹ {calculateBalance().toFixed(2)}</Text>
                {account.type === 'CREDIT_CARD' && account.creditLimit && (
                    <Text style={styles.creditLimit}>Limit: ₹ {account.creditLimit.toFixed(2)}</Text>
                )}
            </View>

            <FlatList
                data={accountTransactions}
                keyExtractor={item => item.id}
                renderItem={renderTransactionItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.emptyText}>No transactions yet.</Text>}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddTransaction', { accountId })}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: '#6200ee', padding: 20, alignItems: 'center' },
    accountName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    accountType: { color: '#ddd', fontSize: 14, marginBottom: 10 },
    balance: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
    creditLimit: { color: '#ddd', fontSize: 12, marginTop: 5 },
    list: { padding: 15, paddingBottom: 80 },
    transactionItem: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
    transactionLeft: { flex: 1 },
    transactionCategory: { fontSize: 16, fontWeight: 'bold', textTransform: 'capitalize' },
    transactionNote: { color: '#666', fontSize: 14 },
    transactionDate: { color: '#999', fontSize: 12, marginTop: 2 },
    transactionLocation: { color: '#6200ee', fontSize: 12, marginTop: 2 },
    transactionAmount: { fontSize: 16, fontWeight: 'bold' },
    income: { color: '#4caf50' },
    expense: { color: '#f44336' },
    emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
    fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#03dac6', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 },
    fabText: { fontSize: 30, color: '#000', marginTop: -2 },
});

export default AccountDetailScreen;
