export const parseAxisBankSms = (body) => {
    // Check if it's an OTP
    if (isOtp(body)) return null;

    // Check if it's a transaction
    const isDebit = /spent|debited|paid/i.test(body);
    const isCredit = /credited|received|deposited/i.test(body);

    if (!isDebit && !isCredit) return null;

    // Extract Amount
    // Matches: INR 500, Rs. 500, Rs 500.00, INR 181035.19
    const amountRegex = /(?:INR|Rs\.?)\s*([\d,]+\.?\d*)/i;
    const amountMatch = body.match(amountRegex);
    if (!amountMatch) return null;

    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (isNaN(amount)) return null;

    // Extract Account/Card Last 4 Digits
    // Matches: Card no. XX5516, A/c no. XX9900
    const accountRegex = /(?:Card no\.|A\/c no\.)\s*XX(\d{4})/i;
    const accountMatch = body.match(accountRegex);
    const last4Digits = accountMatch ? accountMatch[1] : null;

    // Extract Date (Simple fallback to today if not found or complex)
    // 22-11-25 18:27:16 IST
    // We'll use current date for simplicity as parsing various date formats is error-prone
    // and the SMS is usually received instantly.
    const date = new Date().toISOString().split('T')[0];

    // Extract Merchant/Description
    let description = "SMS Transaction";
    if (isDebit) {
        // "Spent INR 439 ... 22-11-25 ... Payu*Swiggy Avl Limit..."
        // Try to find text between date/time and "Avl Limit"
        // This is tricky without strict format.
        // Heuristic: Split by newlines, find the line that doesn't have keywords
        const lines = body.split('\n').map(l => l.trim()).filter(l => l);
        // Usually merchant is on its own line or after date
        // For the example:
        // Spent INR 439
        // Axis Bank Card no. XX5516
        // 22-11-25 18:27:16 IST
        // Payu*Swiggy
        // Avl Limit...

        // We can try to grab the line that is NOT the amount line, NOT the card line, NOT the date line, NOT the limit line.
        for (const line of lines) {
            if (line.match(/Spent|Debited|INR|Rs\.|Card no|A\/c no|Avl Limit|Not you/i)) continue;
            if (line.match(/\d{2}-\d{2}-\d{2}/)) continue; // Date line
            description = line;
            break;
        }
    } else if (isCredit) {
        // "INR ... credited ... Info - NEFT/..."
        const infoMatch = body.match(/Info\s*-\s*(.*)/i);
        if (infoMatch) {
            description = infoMatch[1];
        }
    }

    return {
        amount,
        type: isCredit ? 'income' : 'expense',
        last4Digits,
        date,
        description: description.substring(0, 50)
    };
};

export const isOtp = (body) => {
    return /OTP|One Time Password|verification code/i.test(body);
};
