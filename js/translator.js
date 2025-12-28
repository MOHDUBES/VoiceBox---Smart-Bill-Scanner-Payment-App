// Translation Service for VoiceBox
const TranslationService = {
    // Free API: MyMemory Translation API
    // Documentation: https://mymemory.translated.net/doc/spec.php

    async translate(text, targetLang) {
        if (!text || text.trim() === '') return text;

        // Map targetLang to MyMemory codes if necessary
        // hi-IN -> hi, en-US -> en, etc.
        const sourceLang = 'auto'; // Detect automatically
        const target = targetLang.split('-')[0];

        console.log(`🌐 Translating to: ${target}...`);

        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${target}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.responseData && data.responseData.translatedText) {
                console.log('✅ Translation successful');
                return data.responseData.translatedText;
            } else {
                console.warn('⚠️ Translation API returned unexpected format:', data);
                return text;
            }
        } catch (error) {
            console.error('❌ Translation Error:', error);
            return text;
        }
    }
};

window.translateAndSpeak = async function (text, targetLangCode) {
    if (!text || text.trim() === '') {
        showToast('❌ No text to translate');
        return;
    }

    showToast('🌐 Translating to ' + targetLangCode.split('-')[0].toUpperCase() + '...');

    try {
        const translatedText = await TranslationService.translate(text, targetLangCode);

        if (translatedText === text) {
            showToast('⚠️ Using original text (Translation failed)');
        } else {
            showToast('✅ Translation Ready');
        }

        // Wait a bit for voices to be ready if they aren't
        if (window.speechSynthesis.getVoices().length === 0) {
            await new Promise(resolve => {
                window.speechSynthesis.onvoiceschanged = resolve;
                // Timeout after 1s
                setTimeout(resolve, 1000);
            });
        }

        if (typeof speakText === 'function') {
            const originalLang = window.currentLanguage;
            window.currentLanguage = targetLangCode;

            console.log('🔊 Speaking translated text in:', targetLangCode);
            speakText(translatedText);

            // Reset language after a short delay to ensure speakText used it
            setTimeout(() => {
                window.currentLanguage = originalLang;
            }, 100);
        } else {
            const utterance = new SpeechSynthesisUtterance(translatedText);
            utterance.lang = targetLangCode;
            window.speechSynthesis.speak(utterance);
        }
    } catch (error) {
        console.error('Translation process error:', error);
        showToast('❌ Translation service error');
    }
};

console.log('🌐 Translation logic initialized');
