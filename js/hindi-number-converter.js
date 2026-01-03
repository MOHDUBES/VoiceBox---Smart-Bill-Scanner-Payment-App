// Hindi Number Converter - Numbers ko Hindi mein convert karta hai
// Taaki Hindi voice properly bole

const HindiNumberConverter = {
    // English numbers to Hindi words
    numberToHindi: {
        '0': 'शून्य', '1': 'एक', '2': 'दो', '3': 'तीन', '4': 'चार',
        '5': 'पांच', '6': 'छह', '7': 'सात', '8': 'आठ', '9': 'नौ',
        '10': 'दस', '11': 'ग्यारह', '12': 'बारह', '13': 'तेरह', '14': 'चौदह',
        '15': 'पंद्रह', '16': 'सोलह', '17': 'सत्रह', '18': 'अठारह', '19': 'उन्नीस',
        '20': 'बीस', '30': 'तीस', '40': 'चालीस', '50': 'पचास',
        '60': 'साठ', '70': 'सत्तर', '80': 'अस्सी', '90': 'नब्बे',
        '100': 'सौ', '1000': 'हजार'
    },

    // Convert number to Hindi words
    convertNumberToHindi(num) {
        num = parseInt(num);

        if (num === 0) return 'शून्य';
        if (num < 20) return this.numberToHindi[num.toString()] || num.toString();

        if (num < 100) {
            const tens = Math.floor(num / 10) * 10;
            const ones = num % 10;
            if (ones === 0) return this.numberToHindi[tens.toString()];
            return this.numberToHindi[tens.toString()] + ' ' + this.numberToHindi[ones.toString()];
        }

        if (num < 1000) {
            const hundreds = Math.floor(num / 100);
            const remainder = num % 100;
            let result = this.numberToHindi[hundreds.toString()] + ' सौ';
            if (remainder > 0) {
                result += ' ' + this.convertNumberToHindi(remainder);
            }
            return result;
        }

        if (num < 100000) {
            const thousands = Math.floor(num / 1000);
            const remainder = num % 1000;
            let result = this.convertNumberToHindi(thousands) + ' हजार';
            if (remainder > 0) {
                result += ' ' + this.convertNumberToHindi(remainder);
            }
            return result;
        }

        // For larger numbers, just return as is
        return num.toString();
    },

    // Convert text for Hindi speech
    convertForHindiSpeech(text) {
        if (!text) return text;

        let converted = text;

        // Replace rupee symbol with Hindi word
        converted = converted.replace(/₹\s*(\d+)/g, (match, num) => {
            return this.convertNumberToHindi(num) + ' रुपये';
        });

        // Replace standalone numbers with Hindi words
        converted = converted.replace(/\b(\d+)\s*(kg|किलो|kilo)/gi, (match, num) => {
            return this.convertNumberToHindi(num) + ' किलो';
        });

        converted = converted.replace(/\b(\d+)\s*(g|gram|ग्राम)/gi, (match, num) => {
            return this.convertNumberToHindi(num) + ' ग्राम';
        });

        converted = converted.replace(/\b(\d+)\s*(L|liter|लीटर|litre)/gi, (match, num) => {
            return this.convertNumberToHindi(num) + ' लीटर';
        });

        converted = converted.replace(/\b(\d+)\s*(pc|piece|पीस)/gi, (match, num) => {
            return this.convertNumberToHindi(num) + ' पीस';
        });

        // Replace bill numbers, invoice numbers
        converted = converted.replace(/\b(\d{4,})\b/g, (match) => {
            // For long numbers like invoice numbers, read digit by digit
            return match.split('').map(d => this.numberToHindi[d] || d).join(' ');
        });

        // Replace remaining standalone numbers (like dates, quantities)
        converted = converted.replace(/\b(\d+)\b/g, (match) => {
            const num = parseInt(match);
            if (num <= 100000) {
                return this.convertNumberToHindi(num);
            }
            return match;
        });

        return converted;
    },

    // Convert text for Urdu speech (similar to Hindi)
    convertForUrduSpeech(text) {
        // For now, use Hindi conversion
        // Can be enhanced with Urdu-specific numbers later
        return this.convertForHindiSpeech(text);
    }
};

// Make it globally available
window.HindiNumberConverter = HindiNumberConverter;

console.log('✅ Hindi Number Converter loaded');
