/**
 * Enhanced SMS parser for Axis Bank transaction messages
 * Extracts: date, amount, type, last 4 digits, merchant/sender, transaction method
 */
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

    // Extract Date from SMS (multiple formats)
    // Format 1: "16-11-25, 17:56:09" or "16-11-25 17:56:09"
    // Format 2: "23-11-25 23:24:40 IST"
    // Format 3: "on 30-09-25 at 15:34:36 IST"
    let date = null;
    const datePatterns = [
        /(\d{2}-\d{2}-\d{2})[,\s]+\d{2}:\d{2}:\d{2}/,  // 16-11-25, 17:56:09 or 16-11-25 17:56:09
        /on\s+(\d{2}-\d{2}-\d{2})\s+at/i,               // on 30-09-25 at
        /(\d{2}-\d{2}-\d{2})/                           // fallback: any DD-MM-YY
    ];

    for (const pattern of datePatterns) {
        const dateMatch = body.match(pattern);
        if (dateMatch) {
            // Convert DD-MM-YY to YYYY-MM-DD
            const [day, month, year] = dateMatch[1].split('-');
            const fullYear = `20${year}`; // Assuming 20xx
            date = `${fullYear}-${month}-${day}`;
            break;
        }
    }

    // Fallback to current date if parsing fails
    if (!date) {
        date = new Date().toISOString().split('T')[0];
    }

    // Extract Transaction Method (UPI, NEFT, Card, etc.)
    let transactionMethod = null;
    if (body.match(/UPI/i)) {
        transactionMethod = 'UPI';
    } else if (body.match(/NEFT/i)) {
        transactionMethod = 'NEFT';
    } else if (body.match(/IMPS/i)) {
        transactionMethod = 'IMPS';
    } else if (body.match(/Card/i)) {
        transactionMethod = 'Card';
    } else if (body.match(/RTGS/i)) {
        transactionMethod = 'RTGS';
    }

    // Extract Merchant/Sender Name
    let merchantName = "Unknown";

    if (isDebit) {
        // For UPI transactions: "UPI/P2M/568615976445/SRUJANA NAZEER"
        const upiMatch = body.match(/UPI\/[^\/]+\/[^\/]+\/([^\n\r]+)/i);
        if (upiMatch) {
            merchantName = upiMatch[1].trim();
        } else {
            // For Card transactions: Find line after date/time, before "Avl Limit"
            // Split by newlines and find merchant line
            const lines = body.split(/[\n\r]+/).map(l => l.trim()).filter(l => l);

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Skip lines with known keywords
                if (line.match(/Spent|Debited|INR|Rs\.|Card no|A\/c no|Axis Bank|Avl Limit|Not you|SMS BLOCK/i)) {
                    continue;
                }

                // Skip date/time lines
                if (line.match(/\d{2}-\d{2}-\d{2}/)) {
                    continue;
                }

                // This should be the merchant line
                if (line.length > 0 && line.length < 100) {
                    merchantName = line;
                    break;
                }
            }
        }
    } else if (isCredit) {
        // For credits: "Info - NEFT/CHASH00005243419/BRIL"
        const infoMatch = body.match(/Info\s*-\s*([^\n\r]+)/i);
        if (infoMatch) {
            const infoText = infoMatch[1].trim();

            // Try to extract name from NEFT/IMPS format
            const neftMatch = infoText.match(/(?:NEFT|IMPS|UPI)\/[^\/]+\/([^\s\.]+)/i);
            if (neftMatch) {
                merchantName = neftMatch[1].trim();
            } else {
                // Use the entire info text
                merchantName = infoText.substring(0, 50);
            }
        }
    }

    // Clean up merchant name
    merchantName = merchantName
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .substring(0, 50)       // Limit length
        .trim();

    return {
        amount,
        type: isCredit ? 'income' : 'expense',
        last4Digits,
        date,
        merchantName,
        transactionMethod,
        description: `${transactionMethod || 'Transaction'} - ${merchantName}`
    };
};

export const isOtp = (body) => {
    return /OTP|One Time Password|verification code/i.test(body);
};
