import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TransactionContext from '../context/TransactionContext';
import SmsListener from '../components/SmsListener';

const HomeScreen = () => {
    const { accounts, transactions, isLoaded } = useContext(TransactionContext);
    const navigation = useNavigation();

    if (!isLoaded) {
        return (
            <View style={styles.center}>
                <Text>Loading data...</Text>
            </View>
        );
    }

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

    const totalBalance = accounts.reduce((sum, account) => sum + calculateBalance(account.id), 0);

    // This month's data
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const thisMonthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear;
    });

    const thisMonthIncome = thisMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthExpense = thisMonthTransactions
        .filter(t => t.type === 'expense' || t.type === 'payment')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <View style={styles.container}>
            <SmsListener />
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Finance</Text>
                    <Text style={styles.headerSubtitle}>Welcome back!</Text>
                </View>

                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Total Balance</Text>
                    <Text style={styles.balanceAmount}>₹ {totalBalance.toFixed(2)}</Text>
                </View>

                <View style={styles.summaryContainer}>
                    <View style={[styles.summaryCard, styles.incomeCard]}>
                        <Text style={styles.summaryLabel}>This Month Income</Text>
                        <Text style={styles.summaryAmount}>₹ {thisMonthIncome.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.summaryCard, styles.expenseCard]}>
                        <Text style={styles.summaryLabel}>This Month Expense</Text>
                        <Text style={styles.summaryAmount}>₹ {thisMonthExpense.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.quickStats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{accounts.length}</Text>
                        <Text style={styles.statLabel}>Accounts</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{transactions.length}</Text>
                        <Text style={styles.statLabel}>Transactions</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{thisMonthTransactions.length}</Text>
                        <Text style={styles.statLabel}>This Month</Text>
                    </View>
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddTransaction')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, paddingTop: 40, backgroundColor: '#6200ee' },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
    headerSubtitle: { fontSize: 16, color: '#e0d4ff', marginTop: 5 },
    balanceCard: { backgroundColor: '#6200ee', margin: 16, marginTop: -30, padding: 25, borderRadius: 15, elevation: 5, alignItems: 'center' },
    balanceLabel: { color: '#e0d4ff', fontSize: 14, marginBottom: 5 },
    balanceAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
    summaryContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 20 },
    summaryCard: { flex: 1, padding: 20, borderRadius: 10, elevation: 2 },
    incomeCard: { backgroundColor: '#e8f5e9' },
    expenseCard: { backgroundColor: '#ffebee' },
    summaryLabel: { fontSize: 12, color: '#666', marginBottom: 5 },
    summaryAmount: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    quickStats: { flexDirection: 'row', backgroundColor: '#fff', margin: 16, marginTop: 0, padding: 20, borderRadius: 10, elevation: 2 },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#6200ee' },
    statLabel: { fontSize: 12, color: '#666', marginTop: 5 },
    fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#6200ee', alignItems: 'center', justifyContent: 'center', elevation: 5 },
    fabText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
});

export default HomeScreen;

