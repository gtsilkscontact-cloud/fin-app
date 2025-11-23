import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TransactionContext from '../context/TransactionContext';

const ACCOUNT_TYPES = ["BANK", "CREDIT_CARD", "CASH", "OTHER"];

const AddAccountScreen = () => {
    const [accountType, setAccountType] = useState('BANK');
    const [isGroup, setIsGroup] = useState(false);

    // Single account fields
    const [name, setName] = useState('');
    const [startingBalance, setStartingBalance] = useState('');
    const [creditLimit, setCreditLimit] = useState('');
    const [last4Digits, setLast4Digits] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState(null);

    // Group fields
    const [groupName, setGroupName] = useState('');
    const [sharedLimit, setSharedLimit] = useState('');
    const [sharedStartingBalance, setSharedStartingBalance] = useState('');
    const [cardCount, setCardCount] = useState(2);
    const [cards, setCards] = useState([
        { name: '', last4Digits: '' },
        { name: '', last4Digits: '' }
    ]);

    const { addAccount, addCardGroup, cardGroups, updateCardGroup } = useContext(TransactionContext);
    const navigation = useNavigation();

    // Safe cardGroups with default empty array
    const safeCardGroups = cardGroups || [];

    const handleCardCountChange = (count) => {
        const newCount = Math.max(2, Math.min(5, count));
        setCardCount(newCount);

        const newCards = [...cards];
        if (newCount > cards.length) {
            for (let i = cards.length; i < newCount; i++) {
                newCards.push({ name: '', last4Digits: '' });
            }
        } else {
            newCards.splice(newCount);
        }
        setCards(newCards);
    };

    const updateCard = (index, field, value) => {
        const newCards = [...cards];
        newCards[index][field] = value;
        setCards(newCards);
    };

    const handleSaveGroup = () => {
        if (!groupName.trim()) {
            Alert.alert("Error", "Please enter a group name");
            return;
        }
        if (!sharedLimit || isNaN(parseFloat(sharedLimit))) {
            Alert.alert("Error", "Please enter a valid shared credit limit");
            return;
        }

        // Allow empty starting balance, default to 0
        const startingBalanceValue = sharedStartingBalance.trim() === '' ? 0 : parseFloat(sharedStartingBalance);
        if (isNaN(startingBalanceValue)) {
            Alert.alert("Error", "Please enter a valid shared starting balance");
            return;
        }

        // Validate all cards
        for (let i = 0; i < cardCount; i++) {
            if (!cards[i].name.trim()) {
                Alert.alert("Error", `Please enter name for Card ${i + 1}`);
                return;
            }
            if (!cards[i].last4Digits || cards[i].last4Digits.length !== 4) {
                Alert.alert("Error", `Please enter 4 digits for Card ${i + 1}`);
                return;
            }
        }

        // Create group
        const groupId = `group_${Date.now()}`;
        // startingBalanceValue is now the available credit input
        // So initial debt (startingBalance) = Limit - Available
        const initialDebt = parseFloat(sharedLimit) - startingBalanceValue;

        const newGroup = {
            id: groupId,
            name: groupName.trim(),
            sharedCreditLimit: parseFloat(sharedLimit),
            startingBalance: initialDebt,
        };
        addCardGroup(newGroup);

        // Create all cards with 0 starting balance (managed by group)
        const baseTimestamp = Date.now();
        for (let i = 0; i < cardCount; i++) {
            const newCard = {
                id: `${baseTimestamp}_${i}_${Math.random().toString(36).substr(2, 9)}`,
                name: cards[i].name.trim(),
                type: 'CREDIT_CARD',
                startingBalance: 0, // Individual cards have 0 balance in a group
                creditLimit: null,
                last4Digits: cards[i].last4Digits,
                cardGroup: groupId,
                currency: "INR"
            };
            addAccount(newCard);
        }

        Alert.alert("Success", `Created group "${groupName}" with ${cardCount} cards!`);
        navigation.goBack();
    };

    const handleSaveSingle = () => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter an account name");
            return;
        }
        if (isNaN(parseFloat(startingBalance))) {
            Alert.alert("Error", "Please enter a valid starting balance");
            return;
        }

        const newAccount = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            type: accountType,
            startingBalance: parseFloat(startingBalance),
            creditLimit: accountType === 'CREDIT_CARD' && !selectedGroupId ? parseFloat(creditLimit) || 0 : null,
            last4Digits: last4Digits.trim() || null,
            cardGroup: selectedGroupId || null,
            currency: "INR"
        };

        addAccount(newAccount);
        navigation.goBack();
    };

    const renderGroupCreation = () => (
        <View>
            <Text style={styles.sectionTitle}>Create Card Group</Text>
            <Text style={styles.helpText}>
                💡 Create multiple cards that share a credit limit and starting balance
            </Text>

            <Text style={styles.label}>Group Name</Text>
            <TextInput
                style={styles.input}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="e.g. Axis Bank Cards"
            />

            <Text style={styles.label}>Shared Credit Limit</Text>
            <TextInput
                style={styles.input}
                value={sharedLimit}
                onChangeText={setSharedLimit}
                placeholder="e.g. 195000"
                keyboardType="numeric"
            />

            <Text style={styles.label}>Current Available Credit</Text>
            <TextInput
                style={styles.input}
                value={sharedStartingBalance}
                onChangeText={setSharedStartingBalance}
                placeholder="e.g. 180000"
                keyboardType="numeric"
            />

            <Text style={styles.label}>Number of Cards</Text>
            <View style={styles.counterContainer}>
                <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => handleCardCountChange(cardCount - 1)}
                >
                    <Text style={styles.counterButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{cardCount}</Text>
                <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => handleCardCountChange(cardCount + 1)}
                >
                    <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            {cards.slice(0, cardCount).map((card, index) => (
                <View key={index} style={styles.cardInputContainer}>
                    <Text style={styles.cardLabel}>Card {index + 1}</Text>
                    <TextInput
                        style={styles.input}
                        value={card.name}
                        onChangeText={(text) => updateCard(index, 'name', text)}
                        placeholder={`e.g. ${index === 0 ? 'My Zone' : 'Neo'}`}
                    />
                    <TextInput
                        style={styles.input}
                        value={card.last4Digits}
                        onChangeText={(text) => updateCard(index, 'last4Digits', text)}
                        placeholder="Last 4 digits"
                        keyboardType="numeric"
                        maxLength={4}
                    />
                </View>
            ))}

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveGroup}>
                <Text style={styles.saveButtonText}>Create Group with {cardCount} Cards</Text>
            </TouchableOpacity>
        </View>
    );

    const renderSingleAccount = () => (
        <View>
            <Text style={styles.label}>Account Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. HDFC Salary" />

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

            {accountType === 'CREDIT_CARD' && safeCardGroups && safeCardGroups.length > 0 && (
                <>
                    <Text style={styles.label}>Link to Existing Group (Optional)</Text>
                    <View style={styles.groupContainer}>
                        <TouchableOpacity
                            style={[styles.groupButton, !selectedGroupId && styles.groupButtonSelected]}
                            onPress={() => setSelectedGroupId(null)}
                        >
                            <Text style={[styles.groupText, !selectedGroupId && styles.groupTextSelected]}>
                                Individual Card
                            </Text>
                        </TouchableOpacity>
                        {safeCardGroups.map(group => (
                            <TouchableOpacity
                                key={group.id}
                                style={[styles.groupButton, selectedGroupId === group.id && styles.groupButtonSelected]}
                                onPress={() => setSelectedGroupId(group.id)}
                            >
                                <Text style={[styles.groupText, selectedGroupId === group.id && styles.groupTextSelected]}>
                                    {group.name}
                                </Text>
                                <Text style={[styles.groupLimit, selectedGroupId === group.id && styles.groupTextSelected]}>
                                    ₹{group.sharedCreditLimit.toLocaleString()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            {accountType === 'CREDIT_CARD' && !selectedGroupId && (
                <>
                    <Text style={styles.label}>Individual Credit Limit</Text>
                    <TextInput
                        style={styles.input}
                        value={creditLimit}
                        onChangeText={setCreditLimit}
                        placeholder="Optional"
                        keyboardType="numeric"
                    />
                </>
            )}

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveSingle}>
                <Text style={styles.saveButtonText}>Save Account</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.label}>Account Type</Text>
                <View style={styles.typeContainer}>
                    {ACCOUNT_TYPES.map(t => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.typeButton, accountType === t && styles.typeButtonSelected]}
                            onPress={() => {
                                setAccountType(t);
                                setIsGroup(false);
                            }}
                        >
                            <Text style={[styles.typeText, accountType === t && styles.typeTextSelected]}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {accountType === 'CREDIT_CARD' && (
                    <>
                        <Text style={styles.label}>Create As</Text>
                        <View style={styles.typeContainer}>
                            <TouchableOpacity
                                style={[styles.typeButton, !isGroup && styles.typeButtonSelected]}
                                onPress={() => setIsGroup(false)}
                            >
                                <Text style={[styles.typeText, !isGroup && styles.typeTextSelected]}>Single Card</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeButton, isGroup && styles.typeButtonSelected]}
                                onPress={() => setIsGroup(true)}
                            >
                                <Text style={[styles.typeText, isGroup && styles.typeTextSelected]}>Card Group</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {accountType === 'CREDIT_CARD' && isGroup ? renderGroupCreation() : renderSingleAccount()}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    helpText: { fontSize: 13, color: '#666', marginBottom: 20, fontStyle: 'italic' },
    label: { fontSize: 16, marginBottom: 5, color: '#333', fontWeight: '500' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 16 },
    typeContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
    typeButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 10, marginBottom: 10 },
    typeButtonSelected: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
    typeText: { color: '#333' },
    typeTextSelected: { color: '#fff' },
    counterContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    counterButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6200ee', alignItems: 'center', justifyContent: 'center' },
    counterButtonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    counterValue: { fontSize: 24, fontWeight: 'bold', marginHorizontal: 20, color: '#333' },
    cardInputContainer: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, marginBottom: 15 },
    cardLabel: { fontSize: 14, fontWeight: 'bold', color: '#6200ee', marginBottom: 10 },
    groupContainer: { marginBottom: 15 },
    groupButton: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
    groupButtonSelected: { borderColor: '#6200ee', backgroundColor: '#e8e0ff' },
    groupText: { fontSize: 14, fontWeight: '600', color: '#333' },
    groupTextSelected: { color: '#6200ee' },
    groupLimit: { fontSize: 12, color: '#666', marginTop: 3 },
    saveButton: { backgroundColor: '#6200ee', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 30 },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default AddAccountScreen;
