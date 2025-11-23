import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';

const EMOJI_OPTIONS = ['🍔', '🛒', '🚗', '🏠', '📱', '⚡', '🛍️', '🎬', '🏥', '💊', '🎓', '🏋️', '✈️', '🎁', '💇', '🐕', '🔧', '📄', '💳', '📊', '🎮', '☕', '🚕', '⛽', '🅿️', '🎵', '📚', '👶', '💼', '🎨', '🌟', '💰', '💵', '📈', '🏆', '💸', '🔄', '🍕', '🍜', '🍺', '🎪', '🎭', '🎤', '🎸', '📷', '💻', '📞', '✉️', '🎂', '🌮'];

const COLOR_OPTIONS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9',
    '#FD79A8', '#A29BFE', '#74B9FF', '#FF7675', '#6C5CE7', '#00B894',
    '#0984E3', '#E17055', '#FDCB6E', '#F39C12', '#95A5A6', '#636E72',
    '#2D3436', '#00CEC9', '#D63031', '#55EFC4', '#B2BEC3'
];

const CreateCategoryModal = ({ visible, onClose, onCreateCategory, type = 'EXPENSE' }) => {
    const [name, setName] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('🌟');
    const [selectedColor, setSelectedColor] = useState('#FF6B6B');

    const handleCreate = () => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter a category name");
            return;
        }

        const newCategory = {
            id: `custom_${Date.now()}`,
            name: name.trim(),
            emoji: selectedEmoji,
            color: selectedColor,
            type,
            isCustom: true,
            isActive: true
        };

        onCreateCategory(newCategory);

        // Reset form
        setName('');
        setSelectedEmoji('🌟');
        setSelectedColor('#FF6B6B');
        onClose();
    };

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
                        <Text style={styles.title}>➕ Create Custom Category</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>Category Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Gym Membership"
                            value={name}
                            onChangeText={setName}
                        />

                        <Text style={styles.label}>Select Emoji</Text>
                        <View style={styles.emojiGrid}>
                            {EMOJI_OPTIONS.map(emoji => (
                                <TouchableOpacity
                                    key={emoji}
                                    style={[
                                        styles.emojiButton,
                                        selectedEmoji === emoji && styles.emojiButtonSelected
                                    ]}
                                    onPress={() => setSelectedEmoji(emoji)}
                                >
                                    <Text style={styles.emojiText}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Select Color</Text>
                        <View style={styles.colorGrid}>
                            {COLOR_OPTIONS.map(color => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorButton,
                                        { backgroundColor: color },
                                        selectedColor === color && styles.colorButtonSelected
                                    ]}
                                    onPress={() => setSelectedColor(color)}
                                />
                            ))}
                        </View>

                        <View style={styles.preview}>
                            <Text style={styles.previewLabel}>Preview:</Text>
                            <View style={[styles.previewBox, { borderColor: selectedColor }]}>
                                <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
                                <Text style={styles.previewName}>{name || 'Category Name'}</Text>
                            </View>
                        </View>
                    </ScrollView>

                    <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
                        <Text style={styles.createButtonText}>Create Category</Text>
                    </TouchableOpacity>
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
        maxHeight: '85%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
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
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        marginBottom: 15,
    },
    emojiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 15,
    },
    emojiButton: {
        width: 50,
        height: 50,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
    },
    emojiButtonSelected: {
        borderColor: '#6200ee',
        backgroundColor: '#e8e0ff',
    },
    emojiText: {
        fontSize: 24,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 15,
    },
    colorButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: 'transparent',
    },
    colorButtonSelected: {
        borderColor: '#333',
    },
    preview: {
        marginTop: 10,
        marginBottom: 20,
    },
    previewLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    previewBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        borderWidth: 2,
        backgroundColor: '#f9f9f9',
    },
    previewEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    previewName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    createButton: {
        backgroundColor: '#6200ee',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 15,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CreateCategoryModal;
