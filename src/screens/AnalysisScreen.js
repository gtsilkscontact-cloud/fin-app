import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import TransactionContext from '../context/TransactionContext';

const AnalysisScreen = () => {
    const { transactions } = useContext(TransactionContext);

    // Calculate this month's data
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const thisMonthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear;
    });

    const totalIncome = thisMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = thisMonthTransactions
        .filter(t => t.type === 'expense' || t.type === 'payment')
        .reduce((sum, t) => sum + t.amount, 0);

    // Category breakdown
    const categoryBreakdown = {};
    thisMonthTransactions
        .filter(t => t.type === 'expense' || t.type === 'payment')
        .forEach(t => {
            const cat = t.category || 'Uncategorized';
            categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + t.amount;
        });

    const sortedCategories = Object.entries(categoryBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.summaryCard}>
                <Text style={styles.cardTitle}>This Month Summary</Text>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Income</Text>
                        <Text style={[styles.summaryValue, styles.income]}>₹{totalIncome.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Expense</Text>
                        <Text style={[styles.summaryValue, styles.expense]}>₹{totalExpense.toFixed(2)}</Text>
                    </View>
                </View>
                <View style={styles.netContainer}>
                    <Text style={styles.summaryLabel}>Net</Text>
                    <Text style={[styles.summaryValue, totalIncome - totalExpense >= 0 ? styles.income : styles.expense]}>
                        ₹{(totalIncome - totalExpense).toFixed(2)}
                    </Text>
                </View>
            </View>

            <View style={styles.categoryCard}>
                <Text style={styles.cardTitle}>Top Spending Categories</Text>
                {sortedCategories.length > 0 ? (
                    sortedCategories.map(([category, amount], index) => {
                        const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
                        return (
                            <View key={category} style={styles.categoryItem}>
                                <View style={styles.categoryHeader}>
                                    <Text style={styles.categoryName}>{category}</Text>
                                    <Text style={styles.categoryAmount}>₹{amount.toFixed(2)}</Text>
                                </View>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                                </View>
                                <Text style={styles.categoryPercentage}>{percentage.toFixed(1)}%</Text>
                            </View>
                        );
                    })
                ) : (
                    <Text style={styles.emptyText}>No expense data for this month</Text>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    summaryCard: { backgroundColor: '#fff', margin: 16, padding: 20, borderRadius: 10, elevation: 2 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
    summaryItem: { alignItems: 'center' },
    summaryLabel: { fontSize: 14, color: '#666', marginBottom: 5 },
    summaryValue: { fontSize: 24, fontWeight: 'bold' },
    income: { color: '#4caf50' },
    expense: { color: '#f44336' },
    netContainer: { alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#eee' },
    categoryCard: { backgroundColor: '#fff', margin: 16, marginTop: 0, padding: 20, borderRadius: 10, elevation: 2 },
    categoryItem: { marginBottom: 20 },
    categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    categoryName: { fontSize: 16, color: '#333', fontWeight: '500' },
    categoryAmount: { fontSize: 16, color: '#333', fontWeight: 'bold' },
    progressBar: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 4 },
    progressFill: { height: '100%', backgroundColor: '#6200ee', borderRadius: 4 },
    categoryPercentage: { fontSize: 12, color: '#666', textAlign: 'right' },
    emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
});

export default AnalysisScreen;
