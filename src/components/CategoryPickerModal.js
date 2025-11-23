import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { getCategoriesByType, searchCategories } from '../utils/CategoryManager';
import CreateCategoryModal from './CreateCategoryModal';
import TransactionContext from '../context/TransactionContext';

const CategoryPickerModal = ({ visible, onClose, onSelectCategory, type = 'EXPENSE', customCategories = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { addCustomCategory } = useContext(TransactionContext);

    const categories = searchQuery
        ? searchCategories(searchQuery, type)
        : getCategoriesByType(type);

    // Add custom categories of the same type
    const allCategories = [
        ...categories,
        ...customCategories.filter(c => c.type === type && c.isActive)
    ];

    const handleSelectCategory = (category) => {
        // Pass only the category ID string
        onSelectCategory(category.id);
        setSearchQuery('');
        onClose();
    };

    const renderCategory = ({ item }) => (
        <TouchableOpacity
            style={[styles.categoryItem, { borderColor: item.color }]}
            onPress={() => handleSelectCategory(item)}
        >
            <Text style={styles.categoryEmoji}>{item.emoji}</Text>
            <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {type === 'INCOME' ? '💰 Income' : '💸 Expense'} Category
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={styles.searchInput}
                        placeholder="🔍 Search categories..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />

                    <FlatList
                        data={allCategories}
                        renderItem={renderCategory}
                        keyExtractor={(item) => item.id}
                        numColumns={3}
                        contentContainerStyle={styles.gridContainer}
                        showsVerticalScrollIndicator={false}
                    />

                    <TouchableOpacity
                        style={styles.customButton}
                        onPress={() => setShowCreateModal(true)}
                    >
                        <Text style={styles.customButtonText}>➕ Create Custom Category</Text>
                    </TouchableOpacity>

                    <CreateCategoryModal
                        visible={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        onCreateCategory={(category) => {
                            addCustomCategory(category);
                            // Pass only the category ID string
                            onSelectCategory(category.id);
                            onClose();
                        }}
                        type={type}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingHorizontal: 20,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 5,
    },
    closeText: {
        fontSize: 24,
        color: '#666',
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    gridContainer: {
        paddingBottom: 20,
    },
    categoryItem: {
        flex: 1,
        margin: 5,
        padding: 15,
        borderRadius: 12,
        borderWidth: 2,
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
        minHeight: 90,
        justifyContent: 'center',
    },
    categoryEmoji: {
        fontSize: 32,
        marginBottom: 5,
    },
    categoryName: {
        fontSize: 11,
        color: '#333',
        textAlign: 'center',
        fontWeight: '500',
    },
    customButton: {
        backgroundColor: '#6200ee',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 15,
    },
    customButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CategoryPickerModal;
