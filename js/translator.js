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

    console.log('🌐 Translation Request:');
    console.log('  📝 Text length:', text.length, 'characters');
    console.log('  🎯 Target language:', targetLangCode);
    console.log('  📄 Text preview:', text.substring(0, 100) + '...');

    showToast('🌐 Translating to ' + targetLangCode.split('-')[0].toUpperCase() + '...');

    try {
        const translatedText = await TranslationService.translate(text, targetLangCode);

        console.log('✅ Translation Result:');
        console.log('  📝 Translated length:', translatedText.length, 'characters');
        console.log('  📄 Translated preview:', translatedText.substring(0, 100) + '...');

        if (translatedText === text) {
            showToast('⚠️ Using original text (Translation may have failed)');
            console.warn('⚠️ Translation returned same text - using original');
        } else {
            showToast('✅ Translation Ready - Now Speaking...');
        }

        // Ensure voices are loaded before speaking
        let voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
            console.log('⏳ Waiting for voices to load...');
            await new Promise(resolve => {
                window.speechSynthesis.onvoiceschanged = () => {
                    console.log('✅ Voices loaded');
                    resolve();
                };
                // Timeout after 2 seconds
                setTimeout(() => {
                    console.log('⚠️ Voice loading timeout - proceeding anyway');
                    resolve();
                }, 2000);
            });
        }

        // Use speakText function if available
        if (typeof speakText === 'function') {
            const originalLang = window.currentLanguage;

            console.log('🔄 Switching language:');
            console.log('  From:', originalLang);
            console.log('  To:', targetLangCode);

            // Set the target language globally
            window.currentLanguage = targetLangCode;

            // Small delay to ensure language is set
            await new Promise(resolve => setTimeout(resolve, 100));

            console.log('🔊 Calling speakText with translated content...');
            speakText(translatedText);

            // Reset language after speech starts (longer delay)
            setTimeout(() => {
                window.currentLanguage = originalLang;
                console.log('🔄 Language reset to:', originalLang);
            }, 500);
        } else {
            // Fallback: Direct speech synthesis
            console.log('⚠️ speakText function not found, using direct synthesis');

            const utterance = new SpeechSynthesisUtterance(translatedText);
            utterance.lang = targetLangCode;
            utterance.rate = 0.85;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Try to find appropriate voice
            const voices = window.speechSynthesis.getVoices();
            const langCode = targetLangCode.split('-')[0];
            const matchingVoice = voices.find(v => v.lang.startsWith(langCode));

            if (matchingVoice) {
                utterance.voice = matchingVoice;
                console.log('🎤 Using voice:', matchingVoice.name);
            }

            utterance.onstart = () => console.log('🔊 Speech started');
            utterance.onend = () => console.log('✅ Speech completed');
            utterance.onerror = (e) => console.error('❌ Speech error:', e.error);

            window.speechSynthesis.speak(utterance);
        }
    } catch (error) {
        console.error('❌ Translation process error:', error);
        showToast('❌ Translation service error');
    }
};

console.log('🌐 Translation logic initialized');
