import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import TransactionContext from '../context/TransactionContext';
import { getCurrentLocationWithArea } from '../utils/LocationHelper';

const TRANSACTION_TYPES = ["expense", "income", "payment"];

const AddTransactionScreen = () => {
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const { addTransaction } = useContext(TransactionContext);
    const navigation = useNavigation();
    const route = useRoute();
    const { accountId } = route.params;

    const handleSave = async () => {
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            Alert.alert("Error", "Please enter a valid amount");
            return;
        }

        setLoading(true);

        // Get location
        const location = await getCurrentLocationWithArea();

        const newTransaction = {
            id: Date.now().toString(),
            accountId,
            amount: parseFloat(amount),
            type,
            category: category || null,
            note: note || null,
            date: new Date().toISOString().split('T')[0],
            location
        };

        addTransaction(newTransaction);
        setLoading(false);
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                autoFocus
            />

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeContainer}>
                {TRANSACTION_TYPES.map(t => (
                    <TouchableOpacity
                        key={t}
                        style={[styles.typeButton, type === t && styles.typeButtonSelected]}
                        onPress={() => setType(t)}
                    >
                        <Text style={[styles.typeText, type === t && styles.typeTextSelected]}>{t.toUpperCase()}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Category (Optional)</Text>
            <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="e.g. Food, Salary" />

            <Text style={styles.label}>Note (Optional)</Text>
            <TextInput style={styles.input} value={note} onChangeText={setNote} placeholder="Details..." />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Transaction</Text>}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    label: { fontSize: 16, marginBottom: 5, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 20, fontSize: 16 },
    typeContainer: { flexDirection: 'row', marginBottom: 20 },
    typeButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 10 },
    typeButtonSelected: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
    typeText: { color: '#333' },
    typeTextSelected: { color: '#fff' },
    saveButton: { backgroundColor: '#6200ee', padding: 15, borderRadius: 10, alignItems: 'center' },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default AddTransactionScreen;
