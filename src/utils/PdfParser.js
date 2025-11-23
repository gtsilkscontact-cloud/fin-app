import * as pdfjsLib from 'pdfjs-dist';
import 'text-encoding'; // Polyfill for TextEncoder/TextDecoder

// Set worker source (required for pdfjs-dist in some environments, though in RN it might need a different approach)
// For React Native without a standard web worker, we might need to rely on the main thread or a specific setup.
// We'll try a basic setup first.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromPdf = async (uri) => {
    try {
        // In Expo/RN, we need to read the file as base64 or array buffer
        // pdfjs-dist expects a typed array or a url. 
        // Since we have a local URI, we might need to read it first.
        // However, pdfjs-dist might not be able to fetch 'file://' URIs directly in RN environment easily without fetch blob support.
        // Let's try passing the data directly.

        const response = await fetch(uri);
        const blob = await response.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();

        const loadingTask = pdfjsLib.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;

        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + "\n";
        }

        return fullText;
    } catch (error) {
        console.error("Error extracting PDF text:", error);
        throw error;
    }
};

export const parseTransactionsFromText = (text) => {
    const transactions = [];

    // Regex strategies
    // 1. Look for lines with Date, Description, Amount, Balance (typical bank stmt)
    // Example line: "23/11/2025  UPI/123456/Merchant  500.00  12000.00 CR"
    // Example line: "23-Nov-2025  NETFLIX  499.00 Dr"

    // We'll split by newlines and try to match common patterns.
    const lines = text.split('\n');

    // Regex for Date (DD/MM/YYYY or DD-MMM-YYYY)
    const dateRegex = /(\d{2}[/-]\d{2}[/-]\d{4}|\d{2}-[A-Za-z]{3}-\d{4})/;

    // Regex for Amount (numbers with optional commas and decimals)
    const amountRegex = /([\d,]+\.\d{2})/;

    // Regex for Type (Dr/Cr/Debit/Credit)
    const typeRegex = /(Dr|Cr|Debit|Credit)/i;

    lines.forEach(line => {
        const dateMatch = line.match(dateRegex);
        const amountMatches = line.matchAll(/([\d,]+\.\d{2})/g); // Find all amount-like strings
        const amounts = Array.from(amountMatches).map(m => m[1]);

        if (dateMatch && amounts.length > 0) {
            // Potential transaction line
            const dateStr = dateMatch[0];

            // Usually the last amount is balance, the one before is transaction amount.
            // Or if there's a Dr/Cr indicator.

            let amount = 0;
            let type = 'expense'; // Default

            // Simple heuristic: If "Cr" or "Credit" is present, it's income.
            if (/Cr|Credit/i.test(line)) {
                type = 'income';
            }

            // If we have multiple amounts, usually the transaction amount is the first one found after the date?
            // Or we can try to parse the structure better.
            // Let's take the first amount found in the line as the transaction amount for now.
            // Ideally, we'd want to exclude the balance.

            // Let's assume the largest amount is the balance? No, that's risky.
            // Let's assume the transaction amount comes before the balance.

            const amountStr = amounts[0].replace(/,/g, '');
            amount = parseFloat(amountStr);

            // Description: Everything else?
            // Remove date and amount from line to get description
            let description = line
                .replace(dateStr, '')
                .replace(amounts[0], '')
                .replace(/Dr|Cr|Debit|Credit/gi, '')
                .trim();

            // Clean up description
            description = description.replace(/\s+/g, ' ');

            // Normalize date
            let date = new Date().toISOString().split('T')[0];
            // TODO: Better date parsing based on format found

            transactions.push({
                date: dateStr, // Keep original string for now, or parse it
                description,
                amount,
                type
            });
        }
    });

    return transactions;
};
