// Voice Control - Stop/Pause functionality
(function () {
    console.log('🎙️ Voice control module loaded');

    // Global stop function
    window.stopSpeaking = function () {
        if (window.speechSynthesis) {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
                console.log('🔇 Speech stopped');
                showToast('🔇 Voice stopped');
            } else {
                showToast('ℹ️ No voice playing');
            }
        }
    };

    // Add floating stop button
    function addStopButton() {
        // Check if button already exists
        if (document.getElementById('floatingStopBtn')) {
            return;
        }

        const btn = document.createElement('button');
        btn.id = 'floatingStopBtn';
        btn.innerHTML = `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
            <span style="font-size: 11px; margin-top: 2px; font-weight: 600;">Stop</span>
        `;
        btn.style.cssText = `
            position: fixed;
            bottom: 170px;
            right: 20px;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            border: none;
            border-radius: 50%;
            width: 70px;
            height: 70px;
            cursor: pointer;
            box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
            z-index: 999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            opacity: 0;
            pointer-events: none;
        `;

        btn.onmouseover = function () {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 12px 32px rgba(239, 68, 68, 0.6)';
        };

        btn.onmouseout = function () {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.4)';
        };

        btn.onclick = stopSpeaking;

        document.body.appendChild(btn);
        console.log('✅ Floating stop button added');
    }

    // Show/hide stop button based on speech state
    function monitorSpeech() {
        const stopBtn = document.getElementById('floatingStopBtn');
        if (!stopBtn) return;

        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            // Speaking - show button
            stopBtn.style.opacity = '1';
            stopBtn.style.pointerEvents = 'auto';
        } else {
            // Not speaking - hide button
            stopBtn.style.opacity = '0';
            stopBtn.style.pointerEvents = 'none';
        }
    }

    // Add button when page loads
    setTimeout(addStopButton, 2000);

    // Monitor speech state every 200ms
    setInterval(monitorSpeech, 200);

})();

console.log('🔇 Voice stop control ready');
