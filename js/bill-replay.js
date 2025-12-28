// Bill Replay functionality
(function () {
    console.log('🔊 Bill replay module loaded');

    // Store last spoken bill text
    window.lastBillText = '';

    // Function to replay last bill
    window.replayLastBill = function () {
        if (!window.lastBillText || window.lastBillText === '') {
            showToast('⚠️ No bill to replay');
            alert('No bill scanned yet!\n\nPlease scan a bill first.');
            return;
        }

        console.log('🔊 Replaying bill...');
        showToast('🔊 Replaying bill...');

        // Stop any ongoing speech
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        // Speak the text again
        if (typeof speakText === 'function') {
            speakText(window.lastBillText);
        } else {
            // Fallback
            const speech = new SpeechSynthesisUtterance(window.lastBillText);
            speech.lang = document.getElementById('language')?.value || 'en-US';
            speech.rate = 0.9;
            speech.pitch = 1;
            window.speechSynthesis.speak(speech);
        }

        console.log('✅ Bill replay started');
    };

    // Add floating replay button
    function addReplayButton() {
        // Check if button already exists
        if (document.getElementById('floatingReplayBtn')) {
            return;
        }

        const btn = document.createElement('button');
        btn.id = 'floatingReplayBtn';
        btn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            </svg>
            <span style="font-size: 12px; margin-top: 4px;">Replay</span>
        `;
        btn.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 50%;
            width: 70px;
            height: 70px;
            cursor: pointer;
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
            z-index: 999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            font-weight: 600;
        `;

        btn.onmouseover = function () {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.6)';
        };

        btn.onmouseout = function () {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
        };

        btn.onclick = replayLastBill;

        document.body.appendChild(btn);
        console.log('✅ Floating replay button added');
    }

    // Add button when page loads
    setTimeout(addReplayButton, 2000);

})();

console.log('🔊 Replay module ready');
