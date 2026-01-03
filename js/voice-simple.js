// SIMPLIFIED VOICE FUNCTION - Exactly like voice-test.html
// This replaces the complex speakText function with a simple, working version

window.speakTextSimple = function (text, customLang) {
    // Simple and direct - no complications
    if (!text || text.trim() === '') {
        console.warn('⚠️ No text to speak');
        return;
    }

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    // Use custom language if provided, otherwise use global
    const lang = customLang || window.currentLanguage || 'en-US';

    console.log('🔊 SIMPLE SPEAK - Starting...');
    console.log('  Language:', lang);
    console.log('  Text length:', text.length);
    console.log('  Preview:', text.substring(0, 80) + '...');

    // Convert numbers to Hindi/Urdu words if needed
    let processedText = text;
    if (lang.startsWith('hi') || lang.startsWith('ur')) {
        // Check if text contains Hindi/Devanagari characters
        const hasHindiChars = /[\u0900-\u097F]/.test(text);

        if (hasHindiChars) {
            // Text is already in Hindi - only convert English numbers if present
            console.log('📝 Text contains Hindi characters - converting only English numbers');
            if (typeof HindiNumberConverter !== 'undefined') {
                processedText = HindiNumberConverter.convertForHindiSpeech(text);
            }
        } else {
            // Text is in English - convert numbers to Hindi
            console.log('🔄 Converting English numbers to Hindi words...');
            if (typeof HindiNumberConverter !== 'undefined') {
                processedText = HindiNumberConverter.convertForHindiSpeech(text);
                console.log('  Converted preview:', processedText.substring(0, 80) + '...');
            } else {
                console.warn('⚠️ HindiNumberConverter not loaded');
            }
        }
    }

    const utterance = new SpeechSynthesisUtterance(processedText);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Get voices
    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
        console.log('⏳ Waiting for voices...');
        window.speechSynthesis.addEventListener('voiceschanged', () => {
            voices = window.speechSynthesis.getVoices();
            selectAndSpeak();
        }, { once: true });
        return;
    }

    selectAndSpeak();

    function selectAndSpeak() {
        const voices = window.speechSynthesis.getVoices();
        const langCode = lang.split('-')[0];

        console.log('🔍 Available voices:', voices.length);

        // Find matching voice - simple logic
        let voice = voices.find(v => v.lang.toLowerCase().startsWith(langCode));

        if (!voice) {
            voice = voices.find(v => v.lang.includes(langCode));
        }

        if (voice) {
            utterance.voice = voice;
            console.log('🎤 Using voice:', voice.name, '(' + voice.lang + ')');
        } else {
            console.warn('⚠️ No matching voice, using default');
        }

        utterance.onstart = () => console.log('▶️ Speech STARTED');
        utterance.onend = () => console.log('✅ Speech COMPLETED');
        utterance.onerror = (e) => console.error('❌ Speech ERROR:', e.error);

        // Just speak it!
        window.speechSynthesis.speak(utterance);
        console.log('🚀 Speak command sent!');
    }
};

// Override the main speakText to use simple version
if (typeof speakText !== 'undefined') {
    const originalSpeakText = speakText;
    window.speakText = function (text, lang) {
        console.log('📢 Using SIMPLIFIED speak function');
        window.speakTextSimple(text, lang);
    };
}

console.log('✅ Simplified voice module loaded');
