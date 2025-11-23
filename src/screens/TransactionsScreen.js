import React, { useState, useContext, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import TransactionContext from '../context/TransactionContext';
import { getCategoryDisplay } from '../utils/CategoryManager';

const TransactionsScreen = () => {
    const { transactions, accounts, customCategories, deleteTransaction } = useContext(TransactionContext);
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('ALL'); // ALL, INCOME, EXPENSE
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCategoryFilters, setShowCategoryFilters] = useState(false);
    const [dateFilter, setDateFilter] = useState('ALL'); // ALL, CUSTOM
    const [customStartDate, setCustomStartDate] = useState(new Date());
    const [customEndDate, setCustomEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // Get unique categories from transactions
    const usedCategories = useMemo(() => {
        return [...new Set(
            (transactions || [])
                .filter(t => t.category)
                .map(t => {
                    const cat = t.category;
                    return typeof cat === 'object' ? cat.id : cat;
                })
        )].filter(Boolean);
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        return (transactions || []).filter(t => {
            // Filter by type
            if (selectedType !== 'ALL') {
                if (selectedType === 'INCOME' && (t.type !== 'income' && t.type !== 'INCOME')) return false;
                if (selectedType === 'EXPENSE' && (t.type !== 'expense' && t.type !== 'EXPENSE')) return false;
            }

            // Filter by date range
            if (dateFilter === 'CUSTOM') {
                const tDate = new Date(t.date);
                const start = new Date(customStartDate.getFullYear(), customStartDate.getMonth(), customStartDate.getDate());
                const end = new Date(customEndDate.getFullYear(), customEndDate.getMonth(), customEndDate.getDate());
                const d = new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate());
                if (d < start || d > end) return false;
            }

            // Filter by category
            if (selectedCategory) {
                const tCatId = typeof t.category === 'object' ? t.category.id : t.category;
                if (tCatId !== selectedCategory) return false;
            }

            // Filter by search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const category = getCategoryDisplay(t.category, customCategories);
                const account = (accounts || []).find(a => a.id === t.accountId);

                return (
                    (t.description && t.description.toLowerCase().includes(query)) ||
                    (category.name && category.name.toLowerCase().includes(query)) ||
                    (account && account.name.toLowerCase().includes(query)) ||
                    t.amount.toString().includes(query)
                );
            }

            return true;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [transactions, selectedType, selectedCategory, searchQuery, accounts, customCategories, dateFilter, customStartDate, customEndDate]);

    const handleDelete = (transactionId) => {
        Alert.alert(
            "Delete Transaction",
            "Are you sure you want to delete this transaction?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteTransaction(transactionId)
                }
            ]
        );
    };

    const renderTransaction = ({ item }) => {
        const account = (accounts || []).find(a => a.id === item.accountId);
        const category = getCategoryDisplay(item.category, customCategories);
        const isIncome = item.type === 'income' || item.type === 'INCOME';

        return (
            <View style={styles.transactionCard}>
                <View style={styles.transactionLeft}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                    </View>
                    <View style={styles.transactionDetails}>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <Text style={styles.accountName}>
                            {account ? account.name : 'Unknown Account'} • {item.date}
                        </Text>
                        {item.description ? (
                            <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
                        ) : null}
                    </View>
                </View>
                <View style={styles.transactionRight}>
                    <Text style={[styles.amount, isIncome ? styles.incomeText : styles.expenseText]}>
                        {isIncome ? '+' : '-'}₹{item.amount.toFixed(2)}
                    </Text>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity onPress={() => navigation.navigate('AddTransaction', {
                            editMode: true,
                            transaction: item
                        })} style={styles.editButton}>
                            <Text style={styles.editIcon}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                            <Text style={styles.deleteIcon}>🗑️</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderFilters = () => {
        return (
            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterChip, selectedType === 'ALL' && styles.filterChipActive]}
                        onPress={() => setSelectedType('ALL')}
                    >
                        <Text style={styles.filterEmoji}>🌟</Text>
                        <Text style={[styles.filterText, selectedType === 'ALL' && styles.filterTextActive]}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, selectedType === 'INCOME' && styles.filterChipActive]}
                        onPress={() => setSelectedType('INCOME')}
                    >
                        <Text style={styles.filterEmoji}>💵</Text>
                        <Text style={[styles.filterText, selectedType === 'INCOME' && styles.filterTextActive]}>Income</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, selectedType === 'EXPENSE' && styles.filterChipActive]}
                        onPress={() => setSelectedType('EXPENSE')}
                    >
                        <Text style={styles.filterEmoji}>💸</Text>
                        <Text style={[styles.filterText, selectedType === 'EXPENSE' && styles.filterTextActive]}>Expense</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Date Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterChip, dateFilter === 'ALL' && styles.filterChipActive]}
                        onPress={() => setDateFilter('ALL')}
                    >
                        <Text style={styles.filterEmoji}>📅</Text>
                        <Text style={[styles.filterText, dateFilter === 'ALL' && styles.filterTextActive]}>All Time</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, dateFilter === 'CUSTOM' && styles.filterChipActive]}
                        onPress={() => setDateFilter('CUSTOM')}
                    >
                        <Text style={styles.filterEmoji}>🗓️</Text>
                        <Text style={[styles.filterText, dateFilter === 'CUSTOM' && styles.filterTextActive]}>Custom Range</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Custom Date Range */}
                {dateFilter === 'CUSTOM' && (
                    <View style={styles.customDateRow}>
                        <TouchableOpacity
                            style={styles.datePickerBtn}
                            onPress={() => setShowStartPicker(true)}
                        >
                            <Text style={styles.dateLbl}>From:</Text>
                            <Text style={styles.dateVal}>{customStartDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.datePickerBtn}
                            onPress={() => setShowEndPicker(true)}
                        >
                            <Text style={styles.dateLbl}>To:</Text>
                            <Text style={styles.dateVal}>{customEndDate.toLocaleDateString()}</Text>
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
                            if (selectedDate) setCustomStartDate(selectedDate);
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
                            if (selectedDate) setCustomEndDate(selectedDate);
                        }}
                    />
                )}

                {(showCategoryFilters || searchQuery.length > 0) && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilterContainer}>
                        <TouchableOpacity
                            style={[
                                styles.categoryFilterChip,
                                selectedCategory === null && styles.categoryFilterChipActive
                            ]}
                            onPress={() => setSelectedCategory(null)}
                        >
                            <Text style={[
                                styles.categoryFilterText,
                                selectedCategory === null && styles.categoryFilterTextActive
                            ]}>
                                All Categories
                            </Text>
                        </TouchableOpacity>
                        {(() => {
                            const renderedNames = new Set();
                            return usedCategories.map(catId => {
                                const cat = getCategoryDisplay(catId, customCategories);
                                if (renderedNames.has(cat.name)) return null;
                                renderedNames.add(cat.name);

                                return (
                                    <TouchableOpacity
                                        key={catId}
                                        style={[
                                            styles.categoryFilterChip,
                                            selectedCategory === catId && styles.categoryFilterChipActive
                                        ]}
                                        onPress={() => setSelectedCategory(catId)}
                                    >
                                        <Text style={styles.categoryFilterEmoji}>{cat.emoji}</Text>
                                        <Text style={[
                                            styles.categoryFilterText,
                                            selectedCategory === catId && styles.categoryFilterTextActive
                                        ]}>
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            });
                        })()}
                    </ScrollView>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>📊 Transactions</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChangeText={(text) => {
                        setSearchQuery(text);
                        if (text.length > 0) setShowCategoryFilters(true);
                    }}
                />
            </View>

            {renderFilters()}

            <View style={styles.listHeader}>
                <Text style={styles.listCount}>{filteredTransactions.length} transactions</Text>
                {!showCategoryFilters && searchQuery.length === 0 && (
                    <TouchableOpacity onPress={() => setShowCategoryFilters(true)}>
                        <Text style={styles.filterLink}>Filter by Category</Text>
                    </TouchableOpacity>
                )}
                {showCategoryFilters && searchQuery.length === 0 && (
                    <TouchableOpacity onPress={() => {
                        setShowCategoryFilters(false);
                        setSelectedCategory(null);
                    }}>
                        <Text style={styles.filterLink}>Hide Filters</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={filteredTransactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No transactions found</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: {
        backgroundColor: '#6200ee',
        padding: 20,
        paddingTop: 10,
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    searchContainer: { padding: 16, paddingBottom: 8 },
    searchInput: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        fontSize: 16,
        elevation: 2,
    },
    filterContainer: { paddingHorizontal: 16, marginBottom: 10, flexDirection: 'row' },
    categoryFilterContainer: { paddingHorizontal: 16, marginBottom: 10, flexDirection: 'row' },
    customDateRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10, gap: 10 },
    datePickerBtn: { flex: 1, padding: 12, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
    dateLbl: { fontSize: 12, color: '#666', marginBottom: 4 },
    dateVal: { fontSize: 14, fontWeight: '600', color: '#333' },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    filterChipActive: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
    filterEmoji: { marginRight: 6, fontSize: 16 },
    filterText: { color: '#333', fontWeight: '600' },
    filterTextActive: { color: '#fff' },
    categoryFilterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    categoryFilterChipActive: { backgroundColor: '#e0e0e0', borderColor: '#999' },
    categoryFilterEmoji: { marginRight: 6, fontSize: 14 },
    categoryFilterText: { color: '#666', fontSize: 13 },
    categoryFilterTextActive: { color: '#333', fontWeight: 'bold' },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8, alignItems: 'center' },
    listCount: { color: '#666', fontSize: 14 },
    filterLink: { color: '#6200ee', fontWeight: '600', fontSize: 14 },
    listContent: { padding: 16, paddingTop: 0 },
    transactionCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
    },
    transactionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    categoryEmoji: { fontSize: 20 },
    transactionDetails: { flex: 1 },
    categoryName: { fontSize: 16, fontWeight: '600', color: '#333' },
    accountName: { fontSize: 12, color: '#999', marginTop: 2 },
    description: { fontSize: 12, color: '#666', marginTop: 2, fontStyle: 'italic' },
    transactionRight: { alignItems: 'flex-end' },
    amount: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    incomeText: { color: '#00B894' },
    expenseText: { color: '#FF6B6B' },
    actionButtons: { flexDirection: 'row', gap: 8, marginTop: 4 },
    editButton: { padding: 4 },
    editIcon: { fontSize: 16 },
    deleteButton: { padding: 4 },
    deleteIcon: { fontSize: 16 },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#999', fontSize: 16 },
});

export default TransactionsScreen;
