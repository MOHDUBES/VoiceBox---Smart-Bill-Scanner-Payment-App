// FIXED: Enhanced Voice Gender Selection - Hindi & Female Voice Support
// This ensures proper Hindi language and female voice selection

window.speakText = speakText;
function speakText(text) {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    // IMPORTANT: Use window.currentLanguage which is updated by language selector
    const langToUse = window.currentLanguage || document.getElementById('language')?.value || 'en-US';

    // Get user's voice preference (male/female)
    const voiceGenderSelect = document.getElementById('voiceGender');
    const preferredGender = voiceGenderSelect ? voiceGenderSelect.value : 'female';

    console.log(`\n🎙️ === VOICE SELECTION START ===`);
    console.log(`📝 Text to speak: "${text.substring(0, 50)}..."`);
    console.log(`🌍 Selected Language: ${langToUse}`);
    console.log(`👤 Selected Gender: ${preferredGender.toUpperCase()}`);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langToUse; // Use selected language
    utterance.rate = 0.9;

    // Adjust pitch based on gender - MORE difference for clarity
    utterance.pitch = preferredGender === 'female' ? 1.3 : 0.8;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    console.log(`🔍 Total voices available: ${voices.length}`);

    // Get language code (e.g., 'hi' from 'hi-IN')
    const langCode = langToUse.split('-')[0];
    console.log(`🔎 Searching for language code: ${langCode}`);

    // Filter voices by language first
    const languageVoices = voices.filter(v => v.lang.startsWith(langCode));
    console.log(`📋 Found ${languageVoices.length} voices for ${langCode}:`, languageVoices.map(v => v.name));

    if (preferredGender === 'female') {
        // FEMALE VOICE SELECTION
        console.log(`\n👩 Searching for FEMALE voice in ${langCode}...`);

        // Strategy 1: Look for explicit female keywords in the language
        const femaleKeywords = ['female', 'woman', 'zira', 'samantha', 'victoria', 'susan', 'karen', 'moira', 'fiona', 'salli', 'heera', 'kalpana'];

        selectedVoice = languageVoices.find(v =>
            femaleKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
        );

        if (selectedVoice) {
            console.log(`✅ Found female voice (keyword match): ${selectedVoice.name}`);
        }

        // Strategy 2: Exclude male voices from language voices
        if (!selectedVoice) {
            const maleKeywords = ['male', 'david', 'mark', 'daniel', 'james', 'thomas', 'ravi', 'prabhat'];
            selectedVoice = languageVoices.find(v =>
                !maleKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
            );

            if (selectedVoice) {
                console.log(`✅ Found female voice (excluding males): ${selectedVoice.name}`);
            }
        }

        // Strategy 3: Use first voice for the language (often female)
        if (!selectedVoice && languageVoices.length > 0) {
            selectedVoice = languageVoices[0];
            console.log(`✅ Using first ${langCode} voice: ${selectedVoice.name}`);
        }

    } else {
        // MALE VOICE SELECTION
        console.log(`\n👨 Searching for MALE voice in ${langCode}...`);

        const maleKeywords = ['male', 'man', 'david', 'mark', 'daniel', 'james', 'thomas', 'george', 'ravi', 'prabhat'];

        selectedVoice = languageVoices.find(v =>
            maleKeywords.some(keyword => v.name.toLowerCase().includes(keyword)) &&
            !v.name.toLowerCase().includes('female')
        );

        if (selectedVoice) {
            console.log(`✅ Found male voice: ${selectedVoice.name}`);
        } else if (languageVoices.length > 0) {
            // Use any voice from the language
            selectedVoice = languageVoices[languageVoices.length > 1 ? 1 : 0];
            console.log(`✅ Using ${langCode} voice: ${selectedVoice.name}`);
        }
    }

    // Final fallback - use any available voice
    if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
        console.log(`⚠️ Using fallback voice: ${selectedVoice.name}`);
    }

    if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(`\n🎙️ === FINAL SELECTION ===`);
        console.log(`✅ Voice: ${selectedVoice.name}`);
        console.log(`🌍 Language: ${selectedVoice.lang}`);
        console.log(`👤 Gender: ${preferredGender.toUpperCase()}`);
        console.log(`🎚️ Pitch: ${utterance.pitch}`);
        console.log(`🎵 Rate: ${utterance.rate}`);
        console.log(`=========================\n`);
    } else {
        console.log(`❌ No voice found! Using browser default`);
    }

    // Show toast notification with language and gender
    const genderEmoji = preferredGender === 'female' ? '👩' : '👨';
    const langName = document.getElementById('language')?.selectedOptions[0]?.text || langToUse;
    if (typeof showToast === 'function') {
        showToast(`${genderEmoji} Speaking in ${langName} (${preferredGender} voice)...`);
    }

    window.speechSynthesis.speak(utterance);

    // Store for replay
    if (text && text.length > 20) {
        window.lastBillText = text;
        window.lastBillLanguage = langToUse;
        window.lastBillGender = preferredGender;
        console.log(`💾 Stored: Text, Language (${langToUse}), Gender (${preferredGender})`);
    }
}

// Load and display all available voices
function loadAndDisplayVoices() {
    const voices = window.speechSynthesis.getVoices();
    console.log('\n🎙️ === ALL AVAILABLE VOICES ===');
    console.log(`Total: ${voices.length} voices\n`);

    // Group by language
    const byLang = {};
    voices.forEach(v => {
        const lang = v.lang.split('-')[0];
        if (!byLang[lang]) byLang[lang] = [];
        byLang[lang].push({
            name: v.name,
            lang: v.lang,
            local: v.localService,
            default: v.default
        });
    });

    // Display voices by language
    Object.keys(byLang).sort().forEach(lang => {
        console.log(`\n📋 ${lang.toUpperCase()} (${byLang[lang].length} voices):`);
        byLang[lang].forEach((v, i) => {
            const marker = v.default ? '⭐' : '  ';
            console.log(`${marker} ${i + 1}. ${v.name} (${v.lang})`);
        });
    });

    // Highlight Hindi voices
    const hindiVoices = voices.filter(v => v.lang.startsWith('hi'));
    if (hindiVoices.length > 0) {
        console.log(`\n🇮🇳 === HINDI VOICES (${hindiVoices.length}) ===`);
        hindiVoices.forEach((v, i) => {
            console.log(`${i + 1}. ${v.name} (${v.lang})`);
        });
    }

    console.log('\n================================\n');
}

// Initialize voices
if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadAndDisplayVoices;
}

// Load voices after a short delay
setTimeout(loadAndDisplayVoices, 500);

// Also update currentLanguage when language selector changes
document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            window.currentLanguage = e.target.value;
            console.log(`🌍 Language changed to: ${window.currentLanguage}`);
        });

        // Set initial value
        window.currentLanguage = languageSelect.value;
        console.log(`🌍 Initial language: ${window.currentLanguage}`);
    }
});
