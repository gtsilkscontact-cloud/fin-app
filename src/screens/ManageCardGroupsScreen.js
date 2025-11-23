import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import TransactionContext from '../context/TransactionContext';
import { getCardsInGroup } from '../utils/CreditCalculator';

const ManageCardGroupsScreen = () => {
    const [groupName, setGroupName] = useState('');
    const [sharedLimit, setSharedLimit] = useState('');
    const [editingGroupId, setEditingGroupId] = useState(null);

    const { cardGroups, addCardGroup, deleteCardGroup, accounts } = useContext(TransactionContext);
    const navigation = useNavigation();

    const handleSaveGroup = () => {
        if (!groupName.trim()) {
            Alert.alert("Error", "Please enter a group name");
            return;
        }
        if (!sharedLimit || isNaN(parseFloat(sharedLimit))) {
            Alert.alert("Error", "Please enter a valid credit limit");
            return;
        }

        const newGroup = {
            id: editingGroupId || `group_${Date.now()}`,
            name: groupName.trim(),
            sharedCreditLimit: parseFloat(sharedLimit),
        };

        addCardGroup(newGroup);
        setGroupName('');
        setSharedLimit('');
        setEditingGroupId(null);
        Alert.alert("Success", "Card group created! Now add cards and link them to this group.");
    };

    const handleDeleteGroup = (groupId, groupName) => {
        Alert.alert(
            'Delete Card Group',
            `Delete "${groupName}"? Cards will be ungrouped.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteCardGroup(groupId)
                }
            ]
        );
    };

    const renderGroup = ({ item }) => {
        const cardsInGroup = getCardsInGroup(accounts || [], item.id);

        return (
            <View style={styles.groupCard}>
                <View style={styles.groupHeader}>
                    <View>
                        <Text style={styles.groupName}>{item.name}</Text>
                        <Text style={styles.groupLimit}>Shared Limit: ₹{item.sharedCreditLimit.toLocaleString()}</Text>
                    </View>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('EditCardGroup', { group: item })}
                            style={styles.editButton}
                        >
                            <Text style={styles.editIcon}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteGroup(item.id, item.name)}>
                            <Text style={styles.deleteIcon}>🗑️</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.cardsSection}>
                    <Text style={styles.cardsLabel}>Cards in this group:</Text>
                    {cardsInGroup.length > 0 ? (
                        cardsInGroup.map(card => (
                            <Text key={card.id} style={styles.cardItem}>
                                • {card.name} (****{card.last4Digits})
                            </Text>
                        ))
                    ) : (
                        <Text style={styles.noCards}>No cards linked yet</Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Create New Card Group</Text>
                    <Text style={styles.helpText}>
                        💡 Create a group to share credit limit across multiple cards (e.g., My Zone + Neo = ₹195,000)
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

                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveGroup}>
                        <Text style={styles.saveButtonText}>Create Group</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.listSection}>
                    <Text style={styles.sectionTitle}>Existing Card Groups</Text>
                    {cardGroups && cardGroups.length > 0 ? (
                        <FlatList
                            data={cardGroups}
                            keyExtractor={item => item.id}
                            renderItem={renderGroup}
                            scrollEnabled={false}
                        />
                    ) : (
                        <Text style={styles.emptyText}>No card groups yet. Create one above!</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    formSection: { backgroundColor: '#fff', padding: 20, marginBottom: 10 },
    listSection: { backgroundColor: '#fff', padding: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    helpText: { fontSize: 13, color: '#666', marginBottom: 20, fontStyle: 'italic', lineHeight: 18 },
    label: { fontSize: 16, marginBottom: 5, color: '#333', fontWeight: '500' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 16 },
    saveButton: { backgroundColor: '#6200ee', padding: 15, borderRadius: 10, alignItems: 'center' },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    groupCard: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#e0e0e0' },
    groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    groupName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    groupLimit: { fontSize: 13, color: '#666', marginTop: 3 },
    actionButtons: { flexDirection: 'row', gap: 10 },
    editButton: { marginRight: 10 },
    editIcon: { fontSize: 20 },
    deleteIcon: { fontSize: 20 },
    cardsSection: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
    cardsLabel: { fontSize: 12, color: '#999', marginBottom: 5, fontWeight: '600' },
    cardItem: { fontSize: 14, color: '#333', marginBottom: 3 },
    noCards: { fontSize: 13, color: '#999', fontStyle: 'italic' },
    emptyText: { textAlign: 'center', color: '#999', marginTop: 20, fontSize: 14 },
});

export default ManageCardGroupsScreen;
