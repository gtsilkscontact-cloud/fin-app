import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, SectionList, TouchableWithoutFeedback } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../utils/DesignTokens';

const AccountFilterDropdown = ({ options, selectedValue, onSelect }) => {
    const [visible, setVisible] = useState(false);

    // Helper to find selected label
    const findSelectedLabel = () => {
        // Options is now an array of sections: [{ title, data: [] }]
        for (const section of options) {
            const found = section.data.find(item => item.value === selectedValue);
            if (found) return found.label;
        }
        return 'All Accounts';
    };

    const toggleDropdown = () => {
        setVisible(!visible);
    };

    const handleSelect = (value) => {
        onSelect(value);
        setVisible(false);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.optionItem,
                selectedValue === item.value && styles.selectedOption
            ]}
            onPress={() => handleSelect(item.value)}
        >
            <View style={styles.optionContent}>
                <View style={styles.optionHeader}>
                    {item.icon && <Text style={styles.optionIcon}>{item.icon}</Text>}
                    <Text style={[
                        styles.optionText,
                        selectedValue === item.value && styles.selectedOptionText
                    ]}>
                        {item.label}
                    </Text>
                </View>
                {item.subtitle && (
                    <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                )}
            </View>
            {selectedValue === item.value && (
                <Text style={styles.checkIcon}>✓</Text>
            )}
        </TouchableOpacity>
    );

    const renderSectionHeader = ({ section: { title } }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
    );

    return (
        <View>
            <TouchableOpacity
                style={styles.trigger}
                onPress={toggleDropdown}
                activeOpacity={0.7}
            >
                <Text style={styles.triggerText}>{findSelectedLabel()}</Text>
                <Text style={styles.chevron}>▼</Text>
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.dropdownMenu}>
                            <SectionList
                                sections={options}
                                keyExtractor={(item, index) => item.value + index}
                                renderItem={renderItem}
                                renderSectionHeader={renderSectionHeader}
                                stickySectionHeadersEnabled={false}
                                contentContainerStyle={styles.listContent}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.pill,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    triggerText: {
        color: Colors.textInverse,
        fontSize: Typography.sm,
        fontWeight: Typography.semibold,
        marginRight: Spacing.xs,
    },
    chevron: {
        color: Colors.textInverse,
        fontSize: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownMenu: {
        width: '85%',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.sm,
        ...Shadows.lg,
        maxHeight: 500,
    },
    listContent: {
        paddingBottom: Spacing.md,
    },
    sectionHeader: {
        backgroundColor: Colors.gray100,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.sm,
    },
    sectionHeaderText: {
        fontSize: Typography.xs,
        fontWeight: Typography.bold,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray100,
    },
    optionContent: {
        flex: 1,
    },
    optionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionIcon: {
        fontSize: Typography.lg,
        marginRight: Spacing.sm,
    },
    selectedOption: {
        backgroundColor: Colors.infoLight,
    },
    optionText: {
        fontSize: Typography.md,
        color: Colors.textPrimary,
    },
    optionSubtitle: {
        fontSize: Typography.xs,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    selectedOptionText: {
        color: Colors.primary,
        fontWeight: Typography.semibold,
    },
    checkIcon: {
        color: Colors.primary,
        fontSize: Typography.md,
        fontWeight: Typography.bold,
    },
});

export default AccountFilterDropdown;
