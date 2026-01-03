// DIRECT SPEECH TEST - NO CONVERSIONS
// Add this to test if complete text is being spoken

window.testDirectSpeech = function (text) {
    console.log('🧪 TESTING DIRECT SPEECH');
    console.log('📝 Text to speak:', text);
    console.log('📏 Text length:', text.length);

    // Stop any ongoing speech
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    // Direct speech - NO processing
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.85;
    utterance.pitch = 1.0;

    // Find Hindi voice
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.startsWith('hi'));
    if (hindiVoice) {
        utterance.voice = hindiVoice;
        console.log('🎤 Using:', hindiVoice.name);
    }

    utterance.onstart = () => console.log('▶️ STARTED speaking');
    utterance.onend = () => console.log('✅ FINISHED speaking');
    utterance.onerror = (e) => console.error('❌ ERROR:', e);

    window.speechSynthesis.speak(utterance);
    console.log('🚀 Speech command sent!');
};

console.log('✅ Direct speech test loaded - use: testDirectSpeech("your text")');
