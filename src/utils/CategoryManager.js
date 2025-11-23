// Pre-defined categories with emojis and colors
export const EXPENSE_CATEGORIES = [
    { id: 'food_dining', name: 'Food & Dining', emoji: '🍔', color: '#FF6B6B', type: 'EXPENSE' },
    { id: 'groceries', name: 'Groceries', emoji: '🛒', color: '#4ECDC4', type: 'EXPENSE' },
    { id: 'transportation', name: 'Transportation', emoji: '🚗', color: '#45B7D1', type: 'EXPENSE' },
    { id: 'housing', name: 'Housing & Rent', emoji: '🏠', color: '#96CEB4', type: 'EXPENSE' },
    { id: 'phone_internet', name: 'Phone & Internet', emoji: '📱', color: '#FFEAA7', type: 'EXPENSE' },
    { id: 'utilities', name: 'Utilities', emoji: '⚡', color: '#DFE6E9', type: 'EXPENSE' },
    { id: 'shopping', name: 'Shopping', emoji: '🛍️', color: '#FD79A8', type: 'EXPENSE' },
    { id: 'entertainment', name: 'Entertainment', emoji: '🎬', color: '#A29BFE', type: 'EXPENSE' },
    { id: 'healthcare', name: 'Healthcare', emoji: '🏥', color: '#74B9FF', type: 'EXPENSE' },
    { id: 'pharmacy', name: 'Pharmacy', emoji: '💊', color: '#FF7675', type: 'EXPENSE' },
    { id: 'education', name: 'Education', emoji: '🎓', color: '#6C5CE7', type: 'EXPENSE' },
    { id: 'fitness', name: 'Fitness & Sports', emoji: '🏋️', color: '#00B894', type: 'EXPENSE' },
    { id: 'travel', name: 'Travel', emoji: '✈️', color: '#0984E3', type: 'EXPENSE' },
    { id: 'gifts', name: 'Gifts & Donations', emoji: '🎁', color: '#E17055', type: 'EXPENSE' },
    { id: 'personal_care', name: 'Personal Care', emoji: '💇', color: '#FDCB6E', type: 'EXPENSE' },
    { id: 'pets', name: 'Pets', emoji: '🐕', color: '#F39C12', type: 'EXPENSE' },
    { id: 'maintenance', name: 'Maintenance', emoji: '🔧', color: '#95A5A6', type: 'EXPENSE' },
    { id: 'bills_fees', name: 'Bills & Fees', emoji: '📄', color: '#636E72', type: 'EXPENSE' },
    { id: 'credit_payment', name: 'Credit Card Payment', emoji: '💳', color: '#2D3436', type: 'EXPENSE' },
    { id: 'investments', name: 'Investments', emoji: '📊', color: '#00B894', type: 'EXPENSE' },
    { id: 'gaming', name: 'Gaming', emoji: '🎮', color: '#6C5CE7', type: 'EXPENSE' },
    { id: 'coffee_snacks', name: 'Coffee & Snacks', emoji: '☕', color: '#D63031', type: 'EXPENSE' },
    { id: 'taxi', name: 'Taxi & Ride Share', emoji: '🚕', color: '#FDCB6E', type: 'EXPENSE' },
    { id: 'fuel', name: 'Fuel', emoji: '⛽', color: '#E17055', type: 'EXPENSE' },
    { id: 'parking', name: 'Parking', emoji: '🅿️', color: '#74B9FF', type: 'EXPENSE' },
    { id: 'subscriptions', name: 'Subscriptions', emoji: '🎵', color: '#A29BFE', type: 'EXPENSE' },
    { id: 'books_media', name: 'Books & Media', emoji: '📚', color: '#55EFC4', type: 'EXPENSE' },
    { id: 'kids_family', name: 'Kids & Family', emoji: '👶', color: '#FD79A8', type: 'EXPENSE' },
    { id: 'work_expenses', name: 'Work Expenses', emoji: '💼', color: '#636E72', type: 'EXPENSE' },
    { id: 'hobbies', name: 'Hobbies', emoji: '🎨', color: '#FF7675', type: 'EXPENSE' },
    { id: 'other_expense', name: 'Other', emoji: '🌟', color: '#B2BEC3', type: 'EXPENSE' },
];

export const INCOME_CATEGORIES = [
    { id: 'salary', name: 'Salary', emoji: '💼', color: '#00B894', type: 'INCOME' },
    { id: 'business', name: 'Business Income', emoji: '💵', color: '#00CEC9', type: 'INCOME' },
    { id: 'gifts_received', name: 'Gifts Received', emoji: '🎁', color: '#FD79A8', type: 'INCOME' },
    { id: 'investment_income', name: 'Investment Returns', emoji: '📈', color: '#6C5CE7', type: 'INCOME' },
    { id: 'bonus', name: 'Bonus', emoji: '💰', color: '#FDCB6E', type: 'INCOME' },
    { id: 'awards', name: 'Awards', emoji: '🏆', color: '#F39C12', type: 'INCOME' },
    { id: 'refunds', name: 'Refunds', emoji: '💸', color: '#74B9FF', type: 'INCOME' },
    { id: 'transfers', name: 'Transfers', emoji: '🔄', color: '#DFE6E9', type: 'INCOME' },
    { id: 'other_income', name: 'Other Income', emoji: '🌟', color: '#B2BEC3', type: 'INCOME' },
];

// Get all categories
export const getAllCategories = () => {
    return [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
};

// Get categories by type
export const getCategoriesByType = (type) => {
    return type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
};

// Get category by ID
export const getCategoryById = (categoryId, customCategories = []) => {
    const allPredefined = getAllCategories();
    const category = allPredefined.find(cat => cat.id === categoryId);

    if (category) return category;

    // Check custom categories
    return customCategories.find(cat => cat.id === categoryId);
};

// Get category display
export const getCategoryDisplay = (categoryId, customCategories = []) => {
    const category = getCategoryById(categoryId, customCategories);
    if (!category) return { emoji: '🌟', name: 'Other', color: '#B2BEC3' };
    return category;
};

// Search categories
export const searchCategories = (query, type = null) => {
    const categories = type ? getCategoriesByType(type) : getAllCategories();
    const lowerQuery = query.toLowerCase();

    return categories.filter(cat =>
        cat.name.toLowerCase().includes(lowerQuery) ||
        cat.emoji.includes(query)
    );
};

// Create custom category
export const createCustomCategory = (name, emoji, color, type) => {
    return {
        id: `custom_${Date.now()}`,
        name,
        emoji,
        color,
        type,
        isCustom: true,
        isActive: true
    };
};

// Validate category
export const isValidCategory = (categoryId, customCategories = []) => {
    return getCategoryById(categoryId, customCategories) !== undefined;
};

// Get top categories from transactions
export const getTopCategories = (transactions, limit = 5) => {
    const categoryTotals = {};

    transactions.forEach(transaction => {
        if (transaction.type === 'EXPENSE' && transaction.category) {
            if (!categoryTotals[transaction.category]) {
                categoryTotals[transaction.category] = 0;
            }
            categoryTotals[transaction.category] += transaction.amount;
        }
    });

    return Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([categoryId, total]) => ({
            categoryId,
            total
        }));
};

// Get category spending summary
export const getCategorySpendingSummary = (transactions, customCategories = []) => {
    const summary = {};

    transactions.forEach(transaction => {
        if (transaction.category) {
            const category = getCategoryById(transaction.category, customCategories);
            if (!category) return;

            if (!summary[transaction.category]) {
                summary[transaction.category] = {
                    category,
                    income: 0,
                    expense: 0,
                    count: 0
                };
            }

            if (transaction.type === 'INCOME') {
                summary[transaction.category].income += transaction.amount;
            } else {
                summary[transaction.category].expense += transaction.amount;
            }
            summary[transaction.category].count += 1;
        }
    });

    return Object.values(summary);
};

export default {
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    getAllCategories,
    getCategoriesByType,
    getCategoryById,
    getCategoryDisplay,
    searchCategories,
    createCustomCategory,
    isValidCategory,
    getTopCategories,
    getCategorySpendingSummary
};
