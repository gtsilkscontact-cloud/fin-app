/**
 * Utility functions for credit card calculations
 */

/**
 * Calculate total spent across all cards in a group
 * @param {Array} transactions - All transactions
 * @param {Array} cardIds - IDs of cards in the group
 * @returns {number} Total amount spent
 */
export const calculateGroupSpent = (transactions, cardIds, startingBalance = 0) => {
    if (!transactions || !cardIds) return startingBalance;

    const transactionSpent = transactions
        .filter(t => t && cardIds.includes(t.accountId))
        .reduce((sum, t) => {
            const type = t.type ? t.type.toLowerCase() : '';
            if (type === 'expense') return sum + t.amount;
            if (type === 'payment') return sum - t.amount;
            return sum;
        }, 0);

    return transactionSpent + startingBalance;
};

/**
 * Calculate available credit for a card group
 * @param {number} sharedLimit - Total credit limit for the group
 * @param {Array} transactions - All transactions
 * @param {Array} cardIds - IDs of cards in the group
 * @returns {number} Available credit
 */
export const calculateAvailableCredit = (sharedLimit, transactions, cardIds, startingBalance = 0) => {
    const spent = calculateGroupSpent(transactions, cardIds, startingBalance);
    return Math.max(0, sharedLimit - spent);
};

/**
 * Calculate credit utilization percentage
 * @param {number} sharedLimit - Total credit limit
 * @param {Array} transactions - All transactions
 * @param {Array} cardIds - IDs of cards in the group
 * @returns {number} Utilization percentage (0-100)
 */
export const calculateUtilization = (sharedLimit, transactions, cardIds, startingBalance = 0) => {
    if (!sharedLimit || sharedLimit === 0) return 0;

    const spent = calculateGroupSpent(transactions, cardIds, startingBalance);
    return Math.min(100, (spent / sharedLimit) * 100);
};

/**
 * Get all cards in a group
 * @param {Array} accounts - All accounts
 * @param {string} groupId - Card group ID
 * @returns {Array} Cards in the group
 */
export const getCardsInGroup = (accounts, groupId) => {
    if (!accounts || !groupId) return [];

    return accounts.filter(acc => acc.cardGroup === groupId);
};
