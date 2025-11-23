import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import TransactionContext from '../context/TransactionContext';
import SmsListener from '../components/SmsListener';
import { getCategoryDisplay } from '../utils/CategoryManager';

const HomeScreen = () => {
    const { accounts, transactions, isLoaded, customCategories } = useContext(TransactionContext);
    const navigation = useNavigation();

    if (!isLoaded) {
        return (
            <View style={styles.center}>
                <Text>Loading data...</Text>
            </View>
        );
    }

    const calculateBalance = (account) => {
        const accountTransactions = (transactions || []).filter(t => t && t.accountId === account.id);
        const totalIncome = accountTransactions
            .filter(t => t.type === 'income' || t.type === 'INCOME')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = accountTransactions
            .filter(t => t.type === 'expense' || t.type === 'EXPENSE')
            .reduce((sum, t) => sum + t.amount, 0);

        if (account.type === 'CREDIT_CARD') {
            // For Credit Cards:
            // Starting Balance is Initial Debt (Positive number)
            // Expense increases debt
            // Income (Payment) decreases debt
            // Current Debt = StartingBalance + Expense - Income
            // Net Worth Impact = -Current Debt
            const currentDebt = (account.startingBalance || 0) + totalExpense - totalIncome;
            return -currentDebt;
        } else {
            // For Bank Accounts:
            // Balance = StartingBalance + Income - Expense
            return (account.startingBalance || 0) + totalIncome - totalExpense;
        }
    };

    const totalBalance = (accounts || []).reduce((sum, account) => sum + calculateBalance(account), 0);

    // This month's data
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const thisMonthTransactions = (transactions || []).filter(t => {
        if (!t || !t.date) return false;
        const tDate = new Date(t.date);
        return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear;
    });

    const thisMonthIncome = thisMonthTransactions
        .filter(t => t.type === 'income' || t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);

    // Exclude payments from monthly expense summary
    const thisMonthExpense = thisMonthTransactions
        .filter(t => (t.type === 'expense' || t.type === 'EXPENSE') && t.category !== 'payment')
        .reduce((sum, t) => sum + t.amount, 0);

    // Recent Transactions
    const recentTransactions = (transactions || [])
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    return (
        <SafeAreaView style={styles.container}>
            <SmsListener />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.headerTitle}>My Finance</Text>
                            <Text style={styles.headerSubtitle}>Welcome back!</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                            <Text style={styles.bellIcon}>🔔</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Monthly Savings (Income - Expense)</Text>
                    <Text style={styles.balanceAmount}>₹ {(thisMonthIncome - thisMonthExpense).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                </View>

                <View style={styles.summaryContainer}>
                    <View style={[styles.summaryCard, styles.incomeCard]}>
                        <Text style={styles.summaryLabel}>This Month Income</Text>
                        <Text style={styles.summaryAmount}>₹ {thisMonthIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                    </View>
                    <View style={[styles.summaryCard, styles.expenseCard]}>
                        <Text style={styles.summaryLabel}>This Month Expense</Text>
                        <Text style={styles.summaryAmount}>₹ {thisMonthExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                    </View>
                </View>

                {/* Top Spend Widget */}
                {(() => {
                    const categoryBreakdown = {};
                    thisMonthTransactions
                        .filter(t => (t.type === 'expense' || t.type === 'EXPENSE') && t.category !== 'payment')
                        .forEach(t => {
                            const catId = typeof t.category === 'object' ? t.category.id : t.category;
                            categoryBreakdown[catId] = (categoryBreakdown[catId] || 0) + t.amount;
                        });

                    const topCategoryEntry = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

                    if (topCategoryEntry) {
                        const [catId, amount] = topCategoryEntry;
                        const category = getCategoryDisplay(catId, customCategories);
                        return (
                            <View style={styles.topSpendCard}>
                                <View>
                                    <Text style={styles.topSpendLabel}>Top Spend</Text>
                                    <Text style={styles.topSpendCategory}>{category.emoji} {category.name}</Text>
                                </View>
                                <Text style={styles.topSpendAmount}>₹{amount.toLocaleString()}</Text>
                            </View>
                        );
                    }
                    return null;
                })()}

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.recentList}>
                    {recentTransactions.length > 0 ? (
                        recentTransactions.map(item => {
                            const category = getCategoryDisplay(item.category, customCategories);
                            return (
                                <View key={item.id} style={styles.transactionItem}>
                                    <View style={styles.transactionLeft}>
                                        <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                                        <View>
                                            <Text style={styles.categoryName}>{category.name}</Text>
                                            <Text style={styles.transactionDate}>{item.date}</Text>
                                        </View>
                                    </View>
                                    <Text style={[
                                        styles.transactionAmount,
                                        item.type === 'INCOME' || item.type === 'income' ? styles.incomeText : styles.expenseText
                                    ]}>
                                        {item.type === 'INCOME' || item.type === 'income' ? '+' : '-'}₹{item.amount.toFixed(2)}
                                    </Text>
                                </View>
                            );
                        })
                    ) : (
                        <Text style={styles.emptyText}>No recent transactions</Text>
                    )}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddTransaction')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, paddingTop: 10, backgroundColor: '#6200ee' },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
    headerSubtitle: { fontSize: 16, color: '#e0d4ff', marginTop: 5 },
    bellIcon: { fontSize: 24 },
    balanceCard: { backgroundColor: '#6200ee', margin: 16, marginTop: 10, padding: 25, borderRadius: 15, elevation: 5, alignItems: 'center' },
    balanceLabel: { color: '#e0d4ff', fontSize: 14, marginBottom: 5 },
    balanceAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
    summaryContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16, marginTop: 8 },
    summaryCard: { flex: 1, padding: 20, borderRadius: 10, elevation: 2 },
    incomeCard: { backgroundColor: '#e8f5e9' },
    expenseCard: { backgroundColor: '#ffebee' },
    summaryLabel: { fontSize: 12, color: '#666', marginBottom: 5 },
    summaryAmount: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    quickStats: { flexDirection: 'row', backgroundColor: '#fff', margin: 16, marginTop: 0, padding: 20, borderRadius: 10, elevation: 2 },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#6200ee' },
    statLabel: { fontSize: 12, color: '#666', marginTop: 5 },
    topSpendCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, padding: 20, borderRadius: 12, elevation: 2, marginBottom: 5 },
    topSpendLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
    topSpendCategory: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    topSpendAmount: { fontSize: 18, fontWeight: 'bold', color: '#f44336' },
    fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#6200ee', alignItems: 'center', justifyContent: 'center', elevation: 5 },
    fabText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    seeAllText: { color: '#6200ee', fontWeight: '600' },
    recentList: { marginHorizontal: 16, marginBottom: 80 },
    transactionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1 },
    transactionLeft: { flexDirection: 'row', alignItems: 'center' },
    categoryEmoji: { fontSize: 24, marginRight: 12 },
    categoryName: { fontSize: 16, fontWeight: '600', color: '#333' },
    transactionDate: { fontSize: 12, color: '#999', marginTop: 2 },
    transactionAmount: { fontSize: 16, fontWeight: 'bold' },
    incomeText: { color: '#00B894' },
    expenseText: { color: '#FF6B6B' },
    emptyText: { textAlign: 'center', color: '#999', marginTop: 20, fontStyle: 'italic' },
});

export default HomeScreen;

