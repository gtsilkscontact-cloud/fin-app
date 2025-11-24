import React, { useContext, useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import DateTimePicker from '@react-native-community/datetimepicker';
import TransactionContext from '../context/TransactionContext';
import { getCategoryDisplay } from '../utils/CategoryManager';
import { calculateAvailableCredit, getCardsInGroup } from '../utils/CreditCalculator';

const { width } = Dimensions.get('window');

const AnalysisScreen = () => {
    const { transactions, customCategories, accounts, cardGroups } = useContext(TransactionContext);
    const [selectedSlice, setSelectedSlice] = useState(null);
    const [dateRange, setDateRange] = useState('THIS_MONTH'); // THIS_MONTH, LAST_MONTH, 6_MONTHS, 1_YEAR, ALL_TIME, CUSTOM
    const [customStartDate, setCustomStartDate] = useState(new Date());
    const [customEndDate, setCustomEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // Helper to get date range boundaries
    const getDateRange = () => {
        const now = new Date();
        const start = new Date();
        const end = new Date();

        if (dateRange === 'THIS_MONTH') {
            start.setDate(1);
        } else if (dateRange === 'LAST_MONTH') {
            start.setMonth(now.getMonth() - 1);
            start.setDate(1);
            end.setDate(0); // Last day of previous month
        } else if (dateRange === '6_MONTHS') {
            start.setMonth(now.getMonth() - 5);
            start.setDate(1);
        } else if (dateRange === '1_YEAR') {
            start.setMonth(now.getMonth() - 11);
            start.setDate(1);
        } else if (dateRange === 'ALL_TIME') {
            start.setFullYear(2000, 0, 1); // Far back date
        } else if (dateRange === 'CUSTOM') {
            return { start: customStartDate, end: customEndDate };
        }
        return { start, end };
    };

    // Filter transactions based on range
    const filteredTransactions = useMemo(() => {
        const { start, end } = getDateRange();
        return (transactions || []).filter(t => {
            if (!t.date) return false;

            if (dateRange === 'ALL_TIME') return true;

            const tDate = new Date(t.date);
            // Simple date comparison (ignoring time)
            const d = new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate());
            const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());

            if (dateRange === 'THIS_MONTH' || dateRange === '6_MONTHS' || dateRange === '1_YEAR') {
                return d >= s;
            }
            return d >= s && d <= e;
        });
    }, [transactions, dateRange, customStartDate, customEndDate]);

    // Prepare Location Data
    const locationData = useMemo(() => {
        const locations = {};
        filteredTransactions
            .filter(t => (t.type === 'expense' || t.type === 'EXPENSE') && t.category !== 'payment' && t.location && typeof t.location === 'string')
            .forEach(t => {
                // Extract main area/city if possible, or use full string
                const loc = t.location.split(',')[0].trim();
                locations[loc] = (locations[loc] || 0) + t.amount;
            });

        return Object.entries(locations)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5); // Top 5
    }, [filteredTransactions]);

    // Prepare Payment Mode Data
    const paymentModeData = useMemo(() => {
        let bankTotal = 0;
        let creditTotal = 0;
        let cashTotal = 0;

        filteredTransactions
            .filter(t => (t.type === 'expense' || t.type === 'EXPENSE') && t.category !== 'payment')
            .forEach(t => {
                const account = (accounts || []).find(a => a.id === t.accountId);
                if (account) {
                    if (account.type === 'CREDIT_CARD') creditTotal += t.amount;
                    else if (account.type === 'CASH') cashTotal += t.amount;
                    else bankTotal += t.amount;
                }
            });

        const total = bankTotal + creditTotal + cashTotal;
        return [
            { name: 'Credit Card', amount: creditTotal, color: '#9B59B6', percent: total ? creditTotal / total : 0 },
            { name: 'Bank', amount: bankTotal, color: '#3498DB', percent: total ? bankTotal / total : 0 },
            { name: 'Cash', amount: cashTotal, color: '#F1C40F', percent: total ? cashTotal / total : 0 }
        ].filter(d => d.amount > 0).sort((a, b) => b.amount - a.amount);
    }, [filteredTransactions, accounts]);

    // Calculate Summary Data
    const summaryData = useMemo(() => {
        const income = filteredTransactions
            .filter(t => (t.type === 'income' || t.type === 'INCOME'))
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = filteredTransactions
            .filter(t => (t.type === 'expense' || t.type === 'EXPENSE') && t.category !== 'payment')
            .reduce((sum, t) => sum + t.amount, 0);

        return { income, expense };
    }, [filteredTransactions]);

    // Calculate Financial Health (Net Worth vs Spending Power)
    const financialHealth = useMemo(() => {
        let totalCashBank = 0;
        let totalCreditDebt = 0;
        let totalCreditLimit = 0;
        let totalAvailableCredit = 0;

        // Calculate Bank + Cash
        (accounts || []).forEach(acc => {
            if (acc.type === 'BANK' || acc.type === 'CASH') {
                // Calculate current balance for this account
                const accountTransactions = (transactions || []).filter(t => t.accountId === acc.id);
                const income = accountTransactions.filter(t => t.type === 'income' || t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
                const expense = accountTransactions.filter(t => t.type === 'expense' || t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
                totalCashBank += (acc.startingBalance || 0) + income - expense;
            } else if (acc.type === 'CREDIT_CARD') {
                // Calculate Debt
                const accountTransactions = (transactions || []).filter(t => t.accountId === acc.id);
                const spent = accountTransactions.reduce((sum, t) => {
                    const type = t.type ? t.type.toLowerCase() : '';
                    if (type === 'expense') return sum + t.amount;
                    if (type === 'payment') return sum - t.amount;
                    return sum;
                }, 0);

                // Debt is starting balance + spent (since payments reduce debt)
                // Note: startingBalance for CC is usually initial debt
                const currentDebt = (acc.startingBalance || 0) + spent;
                totalCreditDebt += currentDebt;

                // Calculate Limit & Available
                if (acc.cardGroup) {
                    // Handle Group Logic (avoid double counting shared limits)
                    // We need to check if we've processed this group already?
                    // Actually, simpler: Iterate groups separately for limits, and cards for debt.
                } else {
                    totalCreditLimit += (acc.creditLimit || 0);
                    totalAvailableCredit += ((acc.creditLimit || 0) - currentDebt);
                }
            }
        });

        // Correct Limit Calculation for Groups
        const processedGroups = new Set();
        (accounts || []).filter(a => a.type === 'CREDIT_CARD' && a.cardGroup).forEach(acc => {
            if (!processedGroups.has(acc.cardGroup)) {
                processedGroups.add(acc.cardGroup);
                const group = (cardGroups || []).find(g => g.id === acc.cardGroup);
                if (group) {
                    totalCreditLimit += (group.sharedCreditLimit || 0);

                    // Calculate Group Debt
                    const cardIds = getCardsInGroup(accounts, group.id).map(c => c.id);
                    const groupAvail = calculateAvailableCredit(group.sharedCreditLimit, transactions, cardIds, group.startingBalance);
                    totalAvailableCredit += groupAvail;
                }
            }
        });

        const netWorth = totalCashBank - totalCreditDebt;
        const spendingPower = totalCashBank + totalAvailableCredit;
        const utilization = totalCreditLimit > 0 ? (totalCreditDebt / totalCreditLimit) * 100 : 0;

        return { netWorth, spendingPower, utilization };
    }, [accounts, transactions, cardGroups]);

    // Prepare Pie Chart Data (Category Breakdown)
    const pieData = useMemo(() => {
        const categoryBreakdown = {};
        filteredTransactions
            .filter(t => (t.type === 'expense' || t.type === 'EXPENSE') && t.category !== 'payment')
            .forEach(t => {
                const catId = typeof t.category === 'object' ? t.category.id : t.category;
                categoryBreakdown[catId] = (categoryBreakdown[catId] || 0) + t.amount;
            });

        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'];

        return Object.entries(categoryBreakdown)
            .map(([catId, amount], index) => {
                const category = getCategoryDisplay(catId, customCategories);
                return {
                    value: amount,
                    color: colors[index % colors.length],
                    text: `${((amount / summaryData.expense) * 100).toFixed(0)}%`,
                    categoryName: category.name,
                    categoryEmoji: category.emoji,
                    amount: amount,
                    focused: selectedSlice && selectedSlice.categoryName === category.name,
                };
            })
            .sort((a, b) => b.value - a.value);
    }, [filteredTransactions, summaryData.expense, selectedSlice, customCategories]);

    // Prepare Bar Chart Data (Monthly Trends)
    const barData = useMemo(() => {
        if (dateRange !== '6_MONTHS') return [];

        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            last6Months.push({
                month: d.getMonth(),
                year: d.getFullYear(),
                label: d.toLocaleString('default', { month: 'short' })
            });
        }

        const data = [];
        last6Months.forEach(m => {
            const monthlyTrans = (transactions || []).filter(t => {
                if (!t.date) return false;
                const d = new Date(t.date);
                return d.getMonth() === m.month && d.getFullYear() === m.year;
            });

            const income = monthlyTrans
                .filter(t => (t.type === 'income' || t.type === 'INCOME'))
                .reduce((sum, t) => sum + t.amount, 0);

            const expense = monthlyTrans
                .filter(t => (t.type === 'expense' || t.type === 'EXPENSE') && t.category !== 'payment')
                .reduce((sum, t) => sum + t.amount, 0);

            data.push({
                value: income,
                label: m.label,
                spacing: 2,
                labelWidth: 30,
                labelTextStyle: { color: 'gray', fontSize: 10 },
                frontColor: '#4caf50',
            });
            data.push({
                value: expense,
                frontColor: '#f44336',
            });
        });
        return data;
    }, [transactions, dateRange]);

    const renderLegend = () => (
        <View style={styles.legendContainer}>
            {pieData.map((item) => (
                <View key={item.categoryName} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>
                        {item.categoryEmoji} {item.categoryName}
                    </Text>
                    <Text style={styles.legendAmount}>₹{item.amount.toLocaleString()}</Text>
                </View>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>📈 Analytics</Text>
                </View>

                {/* Date Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterChip, dateRange === 'ALL_TIME' && styles.filterChipActive]}
                        onPress={() => { setDateRange('ALL_TIME'); setSelectedSlice(null); }}
                    >
                        <Text style={styles.filterEmoji}>🌐</Text>
                        <Text style={[styles.filterText, dateRange === 'ALL_TIME' && styles.filterTextActive]}>All Time</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, dateRange === 'THIS_MONTH' && styles.filterChipActive]}
                        onPress={() => { setDateRange('THIS_MONTH'); setSelectedSlice(null); }}
                    >
                        <Text style={styles.filterEmoji}>📅</Text>
                        <Text style={[styles.filterText, dateRange === 'THIS_MONTH' && styles.filterTextActive]}>This Month</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, dateRange === 'LAST_MONTH' && styles.filterChipActive]}
                        onPress={() => { setDateRange('LAST_MONTH'); setSelectedSlice(null); }}
                    >
                        <Text style={styles.filterEmoji}>📆</Text>
                        <Text style={[styles.filterText, dateRange === 'LAST_MONTH' && styles.filterTextActive]}>Last Month</Text>
                    </TouchableOpacity>
                </ScrollView>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterChip, dateRange === '6_MONTHS' && styles.filterChipActive]}
                        onPress={() => { setDateRange('6_MONTHS'); setSelectedSlice(null); }}
                    >
                        <Text style={styles.filterEmoji}>📊</Text>
                        <Text style={[styles.filterText, dateRange === '6_MONTHS' && styles.filterTextActive]}>6 Months</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, dateRange === '1_YEAR' && styles.filterChipActive]}
                        onPress={() => { setDateRange('1_YEAR'); setSelectedSlice(null); }}
                    >
                        <Text style={styles.filterEmoji}>📈</Text>
                        <Text style={[styles.filterText, dateRange === '1_YEAR' && styles.filterTextActive]}>1 Year</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, dateRange === 'CUSTOM' && styles.filterChipActive]}
                        onPress={() => { setDateRange('CUSTOM'); setSelectedSlice(null); }}
                    >
                        <Text style={styles.filterEmoji}>🗓️</Text>
                        <Text style={[styles.filterText, dateRange === 'CUSTOM' && styles.filterTextActive]}>Custom</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Custom Date Range Picker */}
                {dateRange === 'CUSTOM' && (
                    <View style={styles.customDateContainer}>
                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowStartPicker(true)}
                        >
                            <Text style={styles.dateLabel}>From:</Text>
                            <Text style={styles.dateValue}>{customStartDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowEndPicker(true)}
                        >
                            <Text style={styles.dateLabel}>To:</Text>
                            <Text style={styles.dateValue}>{customEndDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Date Pickers */}
                {showStartPicker && (
                    <DateTimePicker
                        value={customStartDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                            setShowStartPicker(Platform.OS === 'ios');
                            if (selectedDate) {
                                setCustomStartDate(selectedDate);
                            }
                        }}
                    />
                )}
                {showEndPicker && (
                    <DateTimePicker
                        value={customEndDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                            setShowEndPicker(Platform.OS === 'ios');
                            if (selectedDate) {
                                setCustomEndDate(selectedDate);
                            }
                        }}
                    />
                )}

                {/* Financial Health Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.cardTitle}>Financial Health</Text>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Net Worth</Text>
                            <Text style={[styles.summaryValue, { color: '#6200ee' }]}>
                                ₹{financialHealth.netWorth.toLocaleString()}
                            </Text>
                            <Text style={styles.miniLabel}>Real Assets</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Spending Power</Text>
                            <Text style={[styles.summaryValue, { color: '#03dac6' }]}>
                                ₹{financialHealth.spendingPower.toLocaleString()}
                            </Text>
                            <Text style={styles.miniLabel}>Liquidity + Credit</Text>
                        </View>
                    </View>
                    <View style={styles.netContainer}>
                        <Text style={styles.summaryLabel}>Credit Utilization</Text>
                        <View style={styles.progressBarBg}>
                            <View style={[
                                styles.progressBarFill,
                                {
                                    width: `${Math.min(financialHealth.utilization, 100)}%`,
                                    backgroundColor: financialHealth.utilization > 30 ? '#f44336' : '#4caf50'
                                }
                            ]} />
                        </View>
                        <Text style={[styles.miniLabel, { marginTop: 5, textAlign: 'center' }]}>
                            {financialHealth.utilization.toFixed(1)}% Used of Total Limit
                        </Text>
                    </View>
                </View>

                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.cardTitle}>Period Summary</Text>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Income</Text>
                            <Text style={[styles.summaryValue, styles.income]}>₹{summaryData.income.toLocaleString()}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Expense</Text>
                            <Text style={[styles.summaryValue, styles.expense]}>₹{summaryData.expense.toLocaleString()}</Text>
                        </View>
                    </View>
                    <View style={styles.netContainer}>
                        <Text style={styles.summaryLabel}>Net Savings</Text>
                        <Text style={[styles.summaryValue, summaryData.income - summaryData.expense >= 0 ? styles.income : styles.expense]}>
                            ₹{(summaryData.income - summaryData.expense).toLocaleString()}
                        </Text>
                    </View>
                </View>

                {/* Payment Mode Analysis */}
                {paymentModeData.length > 0 && (
                    <View style={styles.chartCard}>
                        <Text style={styles.cardTitle}>Spending by Mode</Text>
                        {paymentModeData.map((item) => (
                            <View key={item.name} style={styles.modeItem}>
                                <View style={styles.modeHeader}>
                                    <Text style={styles.modeName}>{item.name}</Text>
                                    <Text style={styles.modeAmount}>₹{item.amount.toLocaleString()}</Text>
                                </View>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: `${item.percent * 100}%`, backgroundColor: item.color }]} />
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Top Locations Analysis */}
                {locationData.length > 0 && (
                    <View style={styles.chartCard}>
                        <Text style={styles.cardTitle}>Top Spending Locations</Text>
                        {locationData.map((item, index) => (
                            <View key={item.name} style={styles.locationItem}>
                                <Text style={styles.locationRank}>#{index + 1}</Text>
                                <Text style={styles.locationName}>{item.name}</Text>
                                <Text style={styles.locationAmount}>₹{item.amount.toLocaleString()}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Charts */}
                {dateRange === '6_MONTHS' ? (
                    <View style={styles.chartCard}>
                        <Text style={styles.cardTitle}>Income vs Expense Trend</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <BarChart
                                data={barData}
                                barWidth={12}
                                spacing={24}
                                roundedTop
                                roundedBottom
                                hideRules
                                xAxisThickness={0}
                                yAxisThickness={0}
                                yAxisTextStyle={{ color: 'gray' }}
                                noOfSections={4}
                                maxValue={Math.max(...barData.map(d => d.value)) * 1.2 || 1000}
                                width={width - 80}
                            />
                        </ScrollView>
                        <View style={styles.barLegend}>
                            <View style={styles.barLegendItem}>
                                <View style={[styles.legendColor, { backgroundColor: '#4caf50' }]} />
                                <Text style={styles.legendText}>Income</Text>
                            </View>
                            <View style={styles.barLegendItem}>
                                <View style={[styles.legendColor, { backgroundColor: '#f44336' }]} />
                                <Text style={styles.legendText}>Expense</Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.chartCard}>
                        <Text style={styles.cardTitle}>Spending Breakdown</Text>
                        {summaryData.expense > 0 ? (
                            <View style={styles.chartContainer}>
                                <PieChart
                                    data={pieData}
                                    donut
                                    showText
                                    textColor="black"
                                    radius={120}
                                    innerRadius={60}
                                    textSize={10}
                                    focusOnPress
                                    onPress={(item) => setSelectedSlice(item)}
                                    centerLabelComponent={() => (
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 20, color: 'black', fontWeight: 'bold' }}>
                                                {selectedSlice ? `₹${selectedSlice.amount}` : `₹${summaryData.expense}`}
                                            </Text>
                                            <Text style={{ fontSize: 12, color: 'gray' }}>
                                                {selectedSlice ? selectedSlice.categoryName : 'Total'}
                                            </Text>
                                        </View>
                                    )}
                                />
                                {renderLegend()}
                            </View>
                        ) : (
                            <Text style={styles.emptyText}>No expense data for this period</Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
    container: { flex: 1 },
    header: { padding: 20, paddingTop: 10 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
    filterContainer: { paddingHorizontal: 16, marginBottom: 10, marginTop: 16, flexDirection: 'row' },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        elevation: 1,
    },
    filterChipActive: { backgroundColor: '#6200ee' },
    filterEmoji: { fontSize: 14, marginRight: 4 },
    filterText: { color: '#666', fontWeight: '600' },
    filterTextActive: { color: '#fff' },
    customDateContainer: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10, gap: 10 },
    datePickerButton: { flex: 1, padding: 12, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
    dateLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
    dateValue: { fontSize: 14, fontWeight: '600', color: '#333' },
    summaryCard: { backgroundColor: '#fff', margin: 16, marginTop: 10, padding: 20, borderRadius: 10, elevation: 2 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
    summaryItem: { alignItems: 'center' },
    summaryLabel: { fontSize: 14, color: '#666', marginBottom: 5 },
    summaryValue: { fontSize: 20, fontWeight: 'bold' },
    income: { color: '#4caf50' },
    expense: { color: '#f44336' },
    netContainer: { alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#eee' },
    chartCard: { backgroundColor: '#fff', margin: 16, marginTop: 0, padding: 20, borderRadius: 10, elevation: 2, alignItems: 'center' },
    chartContainer: { alignItems: 'center', width: '100%' },
    legendContainer: { marginTop: 20, width: '100%' },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between' },
    legendColor: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
    legendText: { fontSize: 14, color: '#333', flex: 1 },
    legendAmount: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
    barLegend: { flexDirection: 'row', marginTop: 20, gap: 20 },
    barLegendItem: { flexDirection: 'row', alignItems: 'center' },
    modeItem: { marginBottom: 15, width: '100%' },
    modeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    modeName: { fontSize: 14, color: '#333', fontWeight: '500' },
    modeAmount: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    progressBarBg: { height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },
    locationItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', width: '100%' },
    locationRank: { width: 30, fontSize: 14, fontWeight: 'bold', color: '#999' },
    locationName: { flex: 1, fontSize: 14, color: '#333' },
    locationAmount: { fontSize: 14, fontWeight: 'bold', color: '#333' },
});

export default AnalysisScreen;
