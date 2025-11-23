import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TransactionContext from '../context/TransactionContext';

const ACCOUNT_TYPES = ["BANK", "CREDIT_CARD", "CASH", "OTHER"];

const AddAccountScreen = () => {
    const [name, setName] = useState('');
    const [type, setType] = useState('BANK');
    const [startingBalance, setStartingBalance] = useState('');
    const [creditLimit, setCreditLimit] = useState('');
    const [last4Digits, setLast4Digits] = useState('');

    const { addAccount } = useContext(TransactionContext);
    const navigation = useNavigation();

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter an account name");
            return;
        }
        if (isNaN(parseFloat(startingBalance))) {
            Alert.alert("Error", "Please enter a valid starting balance");
            return;
        }

        const newAccount = {
            id: Date.now().toString(),
            name,
            type,
            startingBalance: parseFloat(startingBalance),
            creditLimit: type === 'CREDIT_CARD' ? parseFloat(creditLimit) || 0 : null,
            last4Digits: last4Digits.trim() || null,
            currency: "INR"
        };

        addAccount(newAccount);
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Account Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. HDFC Salary" />

            <Text style={styles.label}>Account Type</Text>
            <View style={styles.typeContainer}>
                {ACCOUNT_TYPES.map(t => (
                    <TouchableOpacity
                        key={t}
                        style={[styles.typeButton, type === t && styles.typeButtonSelected]}
                        onPress={() => setType(t)}
                    >
                        <Text style={[styles.typeText, type === t && styles.typeTextSelected]}>{t}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Last 4 Digits (for SMS tracking)</Text>
            <TextInput
                style={styles.input}
                value={last4Digits}
                onChangeText={setLast4Digits}
                placeholder="e.g. 5516"
                keyboardType="numeric"
                maxLength={4}
            />

            <Text style={styles.label}>Starting Balance</Text>
            <TextInput
                style={styles.input}
                value={startingBalance}
                onChangeText={setStartingBalance}
                placeholder="0.00"
                keyboardType="numeric"
            />



            {type === 'CREDIT_CARD' && (
                <>
                    <Text style={styles.label}>Credit Limit</Text>
                    <TextInput
                        style={styles.input}
                        value={creditLimit}
                        onChangeText={setCreditLimit}
                        placeholder="Optional"
                        keyboardType="numeric"
                    />
                </>
            )}

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Account</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    label: { fontSize: 16, marginBottom: 5, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 20, fontSize: 16 },
    typeContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
    typeButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 10, marginBottom: 10 },
    typeButtonSelected: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
    typeText: { color: '#333' },
    typeTextSelected: { color: '#fff' },
    saveButton: { backgroundColor: '#6200ee', padding: 15, borderRadius: 10, alignItems: 'center' },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default AddAccountScreen;
