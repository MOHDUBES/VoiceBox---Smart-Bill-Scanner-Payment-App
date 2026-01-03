// VoiceBox App - Main JavaScript

// ===== Firebase Configuration =====
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase (only if not already initialized)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// ===== Global State =====
window.currentLanguage = 'en-US';
let currentLanguage = window.currentLanguage;
let scannedBills = JSON.parse(localStorage.getItem('scannedBills')) || [];
let currentBillImage = null;
let currentBillText = '';
let recognition = null;
let synthesis = window.speechSynthesis;
let currentUser = null;

// ===== Authentication Check =====
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";

if (isFirebaseConfigured) {
    // Firebase authentication
    auth.onAuthStateChanged((user) => {
        if (!user) {
            // User not logged in, redirect to login
            window.location.href = 'login.html';
        } else {
            currentUser = user;
            console.log('User logged in:', user.email);
        }
    });
} else {
    // LocalStorage authentication (Demo Mode)
    const storedUser = localStorage.getItem('voicebox_current_user') ||
        sessionStorage.getItem('voicebox_current_user');

    if (!storedUser) {
        // Not logged in
        window.location.href = 'login.html';
    } else {
        currentUser = JSON.parse(storedUser);
        console.log('User logged in (Demo Mode):', currentUser.email);
    }
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeScanner();
    initializeVoice();
    initializeHistory();
    initializePayment();
    initializeLogout();
    loadHistory();

    // Show welcome notification
    showWelcomeNotification();

    // Request notification permission
    requestNotificationPermission();
});

// ===== Logout Logic =====
function initializeLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

function handleLogout() {
    const confirm = window.confirm('🚪 Are you sure you want to logout?');

    if (!confirm) return;

    // Clear session
    sessionStorage.removeItem('voicebox_current_user');

    // Check if Firebase configured
    const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";

    if (isFirebaseConfigured && typeof auth !== 'undefined') {
        // Firebase logout
        auth.signOut().then(() => {
            console.log('✅ Logged out from Firebase');
            redirectToLogin();
        }).catch((error) => {
            console.error('Logout error:', error);
            redirectToLogin();
        });
    } else {
        // localStorage logout
        console.log('✅ Logged out (Demo Mode)');
        redirectToLogin();
    }
}

function redirectToLogin() {
    showToast('👋 Logged out successfully!');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 500);
}

// ===== Welcome Notification =====
function showWelcomeNotification() {
    if (currentUser) {
        const userName = currentUser.displayName || currentUser.name || currentUser.email?.split('@')[0] || 'User';
        const loginTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

        // Show toast notification
        setTimeout(() => {
            showToast(`🎉 Welcome back, ${userName}! You're logged in successfully. (${loginTime})`);
        }, 500);

        // Show browser notification if permitted
        showBrowserNotification(userName);
    }
}

// ===== Request Notification Permission =====
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        // Don't auto-request, just check permission
        console.log('Browser notifications available. Permission:', Notification.permission);
    }
}

// ===== Browser Notification =====
function showBrowserNotification(userName) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('VoiceBox - Login Successful', {
            body: `Welcome back, ${userName}! You are now logged in.`,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%236366f1"/><path d="M50 25 L75 50 L50 75 L25 50 Z" fill="white"/></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%236366f1"/></svg>',
            tag: 'voicebox-login',
            requireInteraction: false,
            silent: false
        });

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        // Send email notification
        sendEmailNotification(userName, currentUser.email);

    } else if ('Notification' in window && Notification.permission === 'default') {
        // Ask for permission on first login
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showBrowserNotification(userName);
            }
        });
    }
}

// ===== Email Notification Service =====
function sendEmailNotification(userName, userEmail) {
    // Using Web3Forms - Real email delivery!
    const formData = {
        access_key: "81160c87-1830-48f3-9cad-e52e539311e5", // Your Web3Forms key
        from_name: "VoiceBox Security",
        subject: "🔐 VoiceBox - Login Alert",
        email: userEmail,
        name: userName,
        message: `
Hello ${userName},

✅ Your VoiceBox account login was SUCCESSFUL!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Login Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🕐 Time: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
📅 Date: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
💻 Device: ${navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Computer'}
🌐 Browser: ${getBrowserName()}
📍 Location: ${Intl.DateTimeFormat().resolvedOptions().timeZone}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ SECURITY NOTICE:
If this login wasn't you, please contact support immediately!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Best regards,
VoiceBox Security Team

--
This is an automated security notification.
Please do not reply to this email.
        `
    };

    // Send email via Web3Forms API
    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ EMAIL SENT SUCCESSFULLY!');
                console.log('📧 Email delivered to:', userEmail);
                console.log('📬 Check your Gmail inbox!');
                showToast('📧 Login notification sent to your Gmail!');
            } else {
                console.log('❌ Email send failed:', data.message);
                console.log('📧 Showing email preview instead...');
                simulateEmailNotification(userName, userEmail);
            }
        })
        .catch(error => {
            console.log('⚠️ Network error:', error);
            console.log('📧 Email preview (offline mode)');
            simulateEmailNotification(userName, userEmail);
        });
}

// Helper: Get Browser Name
function getBrowserName() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Google Chrome';
    if (userAgent.includes('Firefox')) return 'Mozilla Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Microsoft Edge';
    return 'Unknown Browser';
}

// ===== Simulate Email Notification (Demo Mode) =====
function simulateEmailNotification(userName, userEmail) {
    const emailContent = `
╔═══════════════════════════════════════════════════╗
║           📧 EMAIL NOTIFICATION (Demo)             ║
╠═══════════════════════════════════════════════════╣
║  To: ${userEmail}
║  Subject: VoiceBox - Login Alert
║
║  Dear ${userName},
║
║  Your VoiceBox account was accessed successfully!
║
║  Login Details:
║  🕐 Time: ${new Date().toLocaleTimeString('en-IN')}
║  📅 Date: ${new Date().toLocaleDateString('en-IN')}
║  💻 Device: ${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}
║  🌐 Browser: ${navigator.userAgent.split('/').pop().split(' ')[0]}
║
║  If this wasn't you, please contact support.
║
║  Best regards,
║  VoiceBox Security Team
╚═══════════════════════════════════════════════════╝
    `;

    console.log(emailContent);
    console.log('📧 In production, email will be sent to:', userEmail);
    console.log('💡 Setup EmailJS to send real emails. Check EMAIL_SETUP.md');
}

// ===== Navigation =====
function initializeNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn[data-section]');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            navBtns.forEach(b => b.classList.remove('active'));

            // Add active to clicked button
            btn.classList.add('active');

            // Hide all sections
            const allSections = document.querySelectorAll('.section');
            allSections.forEach(s => s.style.display = 'none');

            // Show selected section
            const sectionName = btn.dataset.section;
            const sectionId = sectionName + 'Section'; // scanner → scannerSection
            let section = document.getElementById(sectionId);

            // Fallback: try without "Section" suffix
            if (!section) {
                section = document.getElementById(sectionName);
            }

            if (section) {
                section.style.display = 'block';

                // Load account profile if account section
                if (sectionName === 'account' || sectionId === 'accountSection') {
                    // Small delay to ensure DOM is ready
                    setTimeout(() => {
                        if (typeof loadAccountProfile === 'function') {
                            loadAccountProfile();
                        }
                    }, 100);
                }

                console.log('✅ Navigated to:', sectionName);
            } else {
                console.error('❌ Section not found:', sectionId, 'or', sectionName);
            }
        });
    });

    // Show scanner by default
    const firstSection = document.querySelector('.section');
    if (firstSection) {
        firstSection.style.display = 'block';
    }
}

// ===== Scanner Functionality =====
function initializeScanner() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const scanBtn = document.getElementById('scanBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');
    const newScanBtn = document.getElementById('newScanBtn');
    const languageSelect = document.getElementById('language');

    // Language selection
    languageSelect.addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        window.currentLanguage = e.target.value; // Update global variable too
        console.log('🌐 Language changed to:', e.target.value);
        showToast('Language changed to ' + e.target.options[e.target.selectedIndex].text);
    });

    // Upload button - Prevent double trigger because it's inside uploadArea
    uploadBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent bubbling to uploadArea
        fileInput.click();
    });

    // File input
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            displayPreview(file);
        }
    });

    // Clicking anywhere in the area triggers upload
    uploadArea.addEventListener('click', (e) => {
        // Only trigger if we didn't click the button (which already handles it)
        if (e.target !== uploadBtn && !uploadBtn.contains(e.target)) {
            fileInput.click();
        }
    });

    // Scan button
    scanBtn.addEventListener('click', scanBill);

    // Cancel button
    cancelBtn.addEventListener('click', resetScanner);

    // Save button
    saveBtn.addEventListener('click', saveBill);

    // New scan button
    newScanBtn.addEventListener('click', resetScanner);

    // Speak button
    document.getElementById('speakBtn').addEventListener('click', () => {
        speakText(currentBillText);
    });
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        displayPreview(file);
    }
}

function displayPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        currentBillImage = e.target.result;
        document.getElementById('previewImage').src = currentBillImage;
        document.getElementById('uploadArea').classList.add('hidden');
        document.getElementById('previewArea').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

async function scanBill() {
    const loading = document.getElementById('loading');
    const previewArea = document.getElementById('previewArea');
    const resultsArea = document.getElementById('resultsArea');

    previewArea.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        console.log('🔍 Starting enhanced OCR...');
        showToast('📄 Processing image...');

        // Preprocess image for better OCR
        const processedImage = await preprocessImage(currentBillImage);

        console.log('✅ Image preprocessed');
        showToast('📖 Reading bill text...');

        let text = '';
        let ocrSuccess = false;

        // Enhanced Tesseract config for better accuracy
        const tesseractConfig = {
            lang: 'eng',
            logger: m => {
                if (m.status === 'recognizing text') {
                    const progress = Math.round(m.progress * 100);
                    if (progress % 20 === 0) {
                        showToast(`📖 Reading... ${progress}%`);
                    }
                }
            },
            // Enhanced OCR parameters
            tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz₹/-:.,() ',
            tessedit_pageseg_mode: Tesseract.PSM.AUTO,
            preserve_interword_spaces: '1'
        };

        try {
            const result = await Tesseract.recognize(processedImage, tesseractConfig.lang, tesseractConfig);
            text = result.data.text;
            ocrSuccess = true;
            console.log('✅ OCR Success');
        } catch (error) {
            console.error('❌ OCR failed:', error);
            throw new Error('OCR processing failed');
        }

        // Post-process text to fix common OCR errors
        text = postProcessOCRText(text);

        currentBillText = text;
        document.getElementById('scannedText').textContent = text || 'No text detected';

        loading.classList.add('hidden');
        resultsArea.classList.remove('hidden');

        if (text && text.length > 0) {
            showToast('✅ Bill scanned successfully!');
            console.log('📄 Extracted text:', text.substring(0, 100) + '...');
            console.log('📏 Text length:', text.length, 'characters');

            // Store for replay
            window.lastBillText = text;
            console.log('💾 Bill text stored for replay');

            // Speak the actual bill content
            setTimeout(() => {
                console.log('🔊 Speaking bill text...');
                speakText(text);
            }, 500);
        } else {
            showToast('⚠️ No text found in bill');
            speakText('No text detected in the bill image');
        }
    } catch (error) {
        console.error('❌ OCR Error:', error);
        showToast('❌ Error scanning bill. Please try again with a clearer image.');
        loading.classList.add('hidden');
        previewArea.classList.remove('hidden');
    }
}

// Image preprocessing for better OCR
async function preprocessImage(imageSource) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Set canvas size
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw original image
            ctx.drawImage(img, 0, 0);

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Enhance contrast and brightness
            for (let i = 0; i < data.length; i += 4) {
                // Increase contrast
                const contrast = 1.3;
                data[i] = ((data[i] - 128) * contrast) + 128;     // Red
                data[i + 1] = ((data[i + 1] - 128) * contrast) + 128; // Green
                data[i + 2] = ((data[i + 2] - 128) * contrast) + 128; // Blue

                // Convert to grayscale for better OCR
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

                // Apply threshold for sharper text
                const threshold = avg > 128 ? 255 : 0;
                data[i] = threshold;
                data[i + 1] = threshold;
                data[i + 2] = threshold;
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL());
        };

        img.src = imageSource;
    });
}

// Post-process OCR text to fix common errors
function postProcessOCRText(text) {
    let processed = text;

    // Fix common OCR mistakes
    processed = processed.replace(/[X×xX]\s*(\d)/g, '₹$1');  // X40 → ₹40
    processed = processed.replace(/Rs\.?\s*(\d)/gi, '₹$1');   // Rs 40 → ₹40
    processed = processed.replace(/INR\s*(\d)/gi, '₹$1');     // INR 40 → ₹40

    // Fix date format issues
    processed = processed.replace(/(\d{2})\/0\/(\d{4})/g, '$1/01/$2'); // 03/0/2026 → 03/01/2026

    // Fix common letter-number confusions
    processed = processed.replace(/\bTL\b/g, '1L');   // TL → 1L
    processed = processed.replace(/\bO(\d)/g, '0$1'); // O5 → 05
    processed = processed.replace(/(\d)O\b/g, '$10'); // 5O → 50

    // Fix spacing in invoice numbers
    processed = processed.replace(/Rf\s*1\s+(\d+)/g, 'RF1$1'); // Rf1 2345 → RF12345

    // Clean up excessive spaces
    processed = processed.replace(/\s+/g, ' ').trim();

    return processed;
}


function getOCRLanguage(lang) {
    const langMap = {
        'en-US': 'eng',
        'hi-IN': 'hin',
        'ar-SA': 'ara',
        'es-ES': 'spa',
        'fr-FR': 'fra',
        'de-DE': 'deu',
        'zh-CN': 'chi_sim',
        'ja-JP': 'jpn',
        'ko-KR': 'kor'
    };
    return langMap[lang] || 'eng';
}

function saveBill() {
    const bill = {
        id: Date.now(),
        image: currentBillImage,
        text: currentBillText,
        date: new Date().toISOString(),
        language: currentLanguage
    };

    scannedBills.unshift(bill);
    localStorage.setItem('scannedBills', JSON.stringify(scannedBills));

    showToast('Bill saved successfully!');
    speakText('Bill saved');
    loadHistory();
}

function resetScanner() {
    document.getElementById('uploadArea').classList.remove('hidden');
    document.getElementById('previewArea').classList.add('hidden');
    document.getElementById('resultsArea').classList.add('hidden');
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('fileInput').value = '';
    currentBillImage = null;
    currentBillText = '';
}

// ===== Voice Functionality =====
function initializeVoice() {
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    const voiceTranscript = document.getElementById('voiceTranscript');

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;

        voiceBtn.addEventListener('click', () => {
            if (voiceBtn.classList.contains('active')) {
                recognition.stop();
                voiceBtn.classList.remove('active');
                voiceStatus.textContent = 'Tap to speak';
            } else {
                recognition.lang = currentLanguage;
                recognition.start();
                voiceBtn.classList.add('active');
                voiceStatus.textContent = 'Listening...';
            }
        });

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            voiceTranscript.textContent = transcript;
        };

        recognition.onend = () => {
            voiceBtn.classList.remove('active');
            voiceStatus.textContent = 'Tap to speak';
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            voiceBtn.classList.remove('active');
            voiceStatus.textContent = 'Error occurred';
        };
    } else {
        voiceStatus.textContent = 'Voice not supported';
        voiceBtn.disabled = true;
    }
}

window.speakText = speakText;
function speakText(text) {
    if (!text || text.trim() === '') {
        console.warn('⚠️ No text to speak');
        return;
    }

    if (synthesis.speaking) {
        synthesis.cancel();
    }

    // Get language and gender preference
    const langToUse = window.currentLanguage || currentLanguage;
    const voiceGenderSelect = document.getElementById('voiceGender');
    const preferredGender = voiceGenderSelect ? voiceGenderSelect.value : 'female';

    console.log(`🔊 Speaking with ${preferredGender.toUpperCase()} voice in ${langToUse}`);
    console.log(`📝 Text length: ${text.length} characters`);
    console.log(`📄 Text preview: ${text.substring(0, 100)}...`);

    // Clean and prepare text for better speech
    let cleanText = text.trim();

    // For Hindi/Urdu, ensure proper text encoding
    if (langToUse.startsWith('hi') || langToUse.startsWith('ur')) {
        // Remove excessive whitespace but keep structure
        cleanText = cleanText.replace(/\s+/g, ' ');
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langToUse;
    utterance.rate = 0.85; // Slightly slower for better clarity
    utterance.volume = 1.0; // Full volume

    // IMPORTANT: Different pitch for male/female
    utterance.pitch = preferredGender === 'female' ? 1.2 : 0.8;

    // Wait for voices to load if needed
    let voices = synthesis.getVoices();
    if (voices.length === 0) {
        console.log('⏳ Waiting for voices to load...');
        synthesis.addEventListener('voiceschanged', () => {
            voices = synthesis.getVoices();
            selectAndSpeak();
        }, { once: true });
        return;
    }

    selectAndSpeak();

    function selectAndSpeak() {
        const voices = synthesis.getVoices();
        const langCode = langToUse.split('-')[0];

        console.log(`🔍 Total available voices: ${voices.length}`);

        // Filter by language - be more flexible with matching
        let langVoices = voices.filter(v => {
            const vLang = v.lang.toLowerCase();
            const targetLang = langToUse.toLowerCase();
            return vLang.startsWith(langCode) || vLang === targetLang || vLang.includes(langCode);
        });

        console.log(`✅ Found ${langVoices.length} voices for ${langCode}`);

        // If no exact match, try broader search
        if (langVoices.length === 0) {
            console.log('⚠️ No exact language match, trying broader search...');
            langVoices = voices.filter(v => v.lang.includes(langCode));
        }

        // Log available voices for debugging
        if (langVoices.length > 0) {
            console.log('📢 Available voices:', langVoices.map(v => `${v.name} (${v.lang})`).join(', '));
        }

        let selectedVoice = null;

        if (preferredGender === 'female') {
            // FORCE FEMALE VOICE - Enhanced matching
            selectedVoice = langVoices.find(v => {
                const name = v.name.toLowerCase();
                return name.includes('female') ||
                    name.includes('zira') ||
                    name.includes('heera') ||
                    name.includes('kalpana') ||
                    name.includes('swara') ||
                    name.includes('hemant') === false; // Exclude male names
            });

            if (!selectedVoice) {
                // Exclude known male voices
                selectedVoice = langVoices.find(v => {
                    const name = v.name.toLowerCase();
                    return !name.includes('male') &&
                        !name.includes('david') &&
                        !name.includes('mark') &&
                        !name.includes('hemant');
                });
            }
        } else {
            // MALE VOICE - Enhanced matching
            selectedVoice = langVoices.find(v => {
                const name = v.name.toLowerCase();
                return name.includes('male') ||
                    name.includes('david') ||
                    name.includes('hemant');
            });
        }

        // Fallback to first available voice for the language
        if (!selectedVoice && langVoices.length > 0) {
            selectedVoice = langVoices[0];
            console.log('⚠️ Using fallback voice');
        }

        // Last resort: use any available voice
        if (!selectedVoice && voices.length > 0) {
            selectedVoice = voices[0];
            console.log('⚠️ Using default system voice');
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log(`🎤 Selected Voice: ${selectedVoice.name} (${selectedVoice.lang})`);
            console.log(`🎵 Pitch: ${utterance.pitch}, Rate: ${utterance.rate}`);
        } else {
            console.warn('⚠️ No voice selected, using browser default');
        }

        // Add event listeners for debugging
        utterance.onstart = () => {
            console.log('🔊 Speech started');
        };

        utterance.onend = () => {
            console.log('✅ Speech completed');
        };

        utterance.onerror = (event) => {
            console.error('❌ Speech error:', event.error);
            if (event.error === 'interrupted') {
                console.log('Speech was interrupted');
            }
        };

        // Speak the text
        synthesis.speak(utterance);
        console.log('🚀 Speech synthesis started');

        // Store for replay
        if (cleanText && cleanText.length > 20) {
            window.lastBillText = cleanText;
            console.log('💾 Bill text stored for replay');
        }
    }
}

// ===== History Functionality =====
function initializeHistory() {
    const searchInput = document.getElementById('searchInput');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        filterHistory(query);
    });

    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all history?')) {
            scannedBills = [];
            localStorage.removeItem('scannedBills');
            loadHistory();
            showToast('History cleared');
        }
    });
}

function loadHistory() {
    const historyGrid = document.getElementById('historyGrid');
    const emptyState = document.getElementById('emptyState');

    if (scannedBills.length === 0) {
        historyGrid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    historyGrid.innerHTML = scannedBills.map(bill => `
        <div class="history-item" onclick="viewBill(${bill.id})">
            <img src="${bill.image}" alt="Bill">
            <div class="history-item-header">
                <h4>Bill #${bill.id}</h4>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="history-item-date">${formatDate(bill.date)}</span>
                    <button class="btn-voice-small" onclick="event.stopPropagation(); speakSpecificBill(${bill.id})" title="Listen again">
                        🔊 Suniye
                    </button>
                </div>
            </div>
            <div class="history-item-text">${bill.text.substring(0, 150)}...</div>
        </div>
    `).join('');
}

// Global function to speak a specific bill from history
window.speakSpecificBill = function (billId) {
    const bill = scannedBills.find(b => b.id === billId);
    if (bill && bill.text) {
        console.log('🔊 Replaying specific bill:', billId);
        showToast('🔊 Playing bill summary...');
        speakText(bill.text);
    }
};

function filterHistory(query) {
    const items = document.querySelectorAll('.history-item');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'block' : 'none';
    });
}

function viewBill(billId) {
    const bill = scannedBills.find(b => b.id === billId);
    if (!bill) return;

    const modal = document.getElementById('billModal');
    document.getElementById('modalTitle').textContent = `Bill #${bill.id} `;
    document.getElementById('modalImage').src = bill.image;
    document.getElementById('modalText').textContent = bill.text;

    modal.classList.remove('hidden');

    document.getElementById('modalSpeakBtn').onclick = () => speakText(bill.text);
    document.getElementById('modalDeleteBtn').onclick = () => deleteBill(billId);
}

function deleteBill(billId) {
    if (confirm('Delete this bill?')) {
        scannedBills = scannedBills.filter(b => b.id !== billId);
        localStorage.setItem('scannedBills', JSON.stringify(scannedBills));
        closeModal();
        loadHistory();
        showToast('Bill deleted');
    }
}

function closeModal() {
    document.getElementById('billModal').classList.add('hidden');
}

document.getElementById('modalClose').addEventListener('click', closeModal);

// ===== Payment Functionality =====
function initializePayment() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const paymentForm = document.getElementById('paymentForm');
    const qrForm = document.getElementById('qrForm');
    const scanQrBtn = document.getElementById('scanQrBtn');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            switchTab(targetTab);

            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Require PIN security before processing payment
        if (typeof requirePaymentPIN === 'function') {
            requirePaymentPIN(() => {
                processPayment();
            });
        } else {
            processPayment();
        }
    });

    qrForm.addEventListener('submit', (e) => {
        e.preventDefault();
        generateQRCode();
    });

    scanQrBtn.addEventListener('click', () => {
        alert('Camera QR scanning would open here.\nIn a real app, this would use device camera to scan QR codes.');
    });

    document.getElementById('downloadQrBtn').addEventListener('click', downloadQR);
    document.getElementById('shareQrBtn').addEventListener('click', shareQR);
}

function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
}

function processPayment() {
    const amount = document.getElementById('amount').value;
    const recipient = document.getElementById('recipient').value;
    const note = document.getElementById('note').value || 'Payment';

    if (!amount || !recipient) {
        alert('Please enter amount and recipient UPI ID/Phone');
        return;
    }

    // Extract recipient name from UPI (before @)
    const recipientName = recipient.includes('@') ? recipient.split('@')[0] : recipient;

    // Create UPI payment string for QR
    const upiString = `upi://pay?pa=${recipient}&am=${amount}&tn=${encodeURIComponent(note)}`;

    // Show sending notification
    showToast(`💸 Generating payment QR for ₹${amount}`);

    // Generate QR for payment
    generateSendPaymentQR(upiString, amount, recipient, recipientName, note);

    console.log('Payment QR generated for:', recipient);
}

// Generate QR for sending payment
function generateSendPaymentQR(upiString, amount, recipient, recipientName, note) {
    // Create or get QR display
    let sendQrDisplay = document.getElementById('sendQrDisplay');
    if (!sendQrDisplay) {
        sendQrDisplay = document.createElement('div');
        sendQrDisplay.id = 'sendQrDisplay';
        sendQrDisplay.className = 'qr-display';
        sendQrDisplay.style.cssText = 'margin-top: 1.5rem; padding: 1.5rem; background: white; border-radius: 12px; text-align: center;';

        const paymentCard = document.querySelector('#send .payment-card');
        if (paymentCard) {
            paymentCard.appendChild(sendQrDisplay);
        }
    }

    sendQrDisplay.innerHTML = '';

    // Title
    const title = document.createElement('h3');
    title.textContent = '📱 Scan to Pay';
    title.style.cssText = 'color: #f59e0b; margin: 0 0 10px;';
    sendQrDisplay.appendChild(title);

    // Amount display
    const amountDiv = document.createElement('div');
    amountDiv.innerHTML = `
        <div style="font-size: 14px; color: #666; margin-bottom: 5px;">Amount to Pay:</div>
        <div style="font-size: 32px; font-weight: bold; color: #ea580c; margin-bottom: 10px;">₹ ${amount}</div>
        <div style="font-size: 14px; color: #666; margin-bottom: 15px;">To: ${recipientName}</div>
    `;
    sendQrDisplay.appendChild(amountDiv);

    // Generate QR using API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;

    const qrImg = document.createElement('img');
    qrImg.src = qrApiUrl;
    qrImg.alt = 'Payment QR Code';
    qrImg.style.cssText = 'max-width: 250px; height: 250px; border: 4px solid #f59e0b; border-radius: 8px; margin: 10px auto; display: block;';

    // Loading
    const loadingDiv = document.createElement('div');
    loadingDiv.textContent = '⏳ Generating payment QR...';
    loadingDiv.style.cssText = 'padding: 125px 0; color: #666;';
    sendQrDisplay.appendChild(loadingDiv);

    qrImg.onload = function () {
        loadingDiv.remove();
        sendQrDisplay.appendChild(qrImg);

        // Instructions
        const instructions = document.createElement('div');
        instructions.style.cssText = 'margin-top: 15px; padding: 15px; background: #fff7ed; border-radius: 8px; border: 2px solid #fb923c;';
        instructions.innerHTML = `
            <div style="font-size: 14px; font-weight: bold; color: #9a3412; margin-bottom: 8px;">📱 How to Pay:</div>
            <div style="font-size: 12px; color: #7c2d12; text-align: left;">
                1. Scan this QR with any UPI app<br>
                2. Verify amount: ₹${amount}<br>
                3. Verify recipient: ${recipientName}<br>
                4. Complete payment<br>
            </div>
        `;
        sendQrDisplay.appendChild(instructions);

        // Action buttons
        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'display: flex; gap: 10px; margin-top: 15px;';

        // Download button
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '📥 Download QR';
        downloadBtn.className = 'btn-secondary';
        downloadBtn.style.cssText = 'flex: 1;';
        downloadBtn.onclick = function () {
            const link = document.createElement('a');
            link.href = qrApiUrl;
            link.download = `payment-qr-${amount}.png`;
            link.click();
            showToast('✅ QR downloaded');
        };
        btnContainer.appendChild(downloadBtn);

        // Mark as Paid button
        const paidBtn = document.createElement('button');
        paidBtn.textContent = '✅ Mark as Paid';
        paidBtn.className = 'btn-primary';
        paidBtn.style.cssText = 'flex: 1; background: #10b981;';
        paidBtn.onclick = function () {
            markPaymentAsPaid(amount, recipient, recipientName, note);
        };
        btnContainer.appendChild(paidBtn);

        sendQrDisplay.appendChild(btnContainer);

        console.log('✅ Send payment QR generated');
        showToast('✅ QR Code ready! Scan to pay');
        speakText(`Payment QR generated for ${recipientName}. Amount ${amount} rupees`);
    };

    qrImg.onerror = function () {
        loadingDiv.innerHTML = '<div style="color: #991b1b;">Failed to generate QR. Please try again.</div>';
    };
}

// Mark payment as paid (after customer pays)
function markPaymentAsPaid(amount, recipient, recipientName, note) {
    if (confirm(`Confirm payment of ₹${amount} to ${recipientName}?`)) {
        // Create payment record
        const payment = {
            type: 'sent',
            amount: amount,
            recipient: recipient,
            recipientName: recipientName,
            note: note,
            timestamp: new Date().toISOString(),
            id: 'SENT' + Date.now()
        };

        // Trigger payment sent handler from payment-notifications.js
        if (typeof handlePaymentSent === 'function') {
            handlePaymentSent(payment);
        } else {
            // Fallback if function not available
            showToast(`✅ Payment of ₹${amount} sent to ${recipientName}`);
            speakText(`Payment sent! Rupees ${amount} to ${recipientName}. Transaction successful.`);

            // Save to history manually
            const history = JSON.parse(localStorage.getItem('payment_history') || '[]');
            history.unshift(payment);
            localStorage.setItem('payment_history', JSON.stringify(history));
        }

        // Clear form and hide QR
        document.getElementById('paymentForm').reset();
        const sendQrDisplay = document.getElementById('sendQrDisplay');
        if (sendQrDisplay) {
            sendQrDisplay.remove();
        }

        console.log('✅ Payment marked as sent:', payment);
    }
}

function generateQRCode() {
    console.log('🔄 Starting QR code generation...');

    const amount = document.getElementById('qrAmount').value;
    const upi = document.getElementById('qrUpi').value;
    const note = document.getElementById('qrNote').value || 'Payment';

    console.log('Amount:', amount);
    console.log('UPI:', upi);
    console.log('Note:', note);

    if (!amount || !upi) {
        alert('❌ Please fill Amount and UPI ID fields!');
        return;
    }

    const upiString = `upi://pay?pa=${upi}&am=${amount}&tn=${encodeURIComponent(note)}`;
    console.log('✅ UPI String:', upiString);

    // Show QR display section immediately
    const qrDisplay = document.getElementById('qrDisplay');
    if (!qrDisplay) {
        alert('Error: QR display element not found');
        return;
    }

    qrDisplay.classList.remove('hidden');

    const canvas = document.getElementById('qrCanvas');

    if (!canvas) {
        console.error('❌ Canvas element not found!');
        return;
    }

    // Try using QRCode library if available
    if (typeof QRCode !== 'undefined') {
        console.log('✅ Using QRCode library...');

        QRCode.toCanvas(canvas, upiString, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        }, (error) => {
            if (error) {
                console.error('❌ QR library error:', error);
                showManualQRMethod(canvas, upiString, amount, upi);
            } else {
                console.log('✅ QR Code generated with library!');
                showToast('✅ QR Code generated!');
                speakText('QR code ready for ₹' + amount);
            }
        });
    } else {
        // Library not available - use manual method
        console.log('⚠️ QRCode library not available, using manual method');
        showManualQRMethod(canvas, upiString, amount, upi);
    }
}

// Generate QR using online API (works always!)
function showManualQRMethod(canvas, upiString, amount, upi) {
    console.log('🔄 Generating QR using API method...');

    // Hide canvas, show image instead
    canvas.style.display = 'none';

    // Get or create QR image container
    let qrImageContainer = document.getElementById('qrImageContainer');
    if (!qrImageContainer) {
        qrImageContainer = document.createElement('div');
        qrImageContainer.id = 'qrImageContainer';
        qrImageContainer.style.cssText = 'text-align: center; padding: 20px; background: white; border-radius: 12px;';
        canvas.parentNode.insertBefore(qrImageContainer, canvas);
    }

    // Clear previous content
    qrImageContainer.innerHTML = '';

    // Create title
    const title = document.createElement('h3');
    title.textContent = '💰 Scan to Pay';
    title.style.cssText = 'color: #6366f1; margin: 0 0 10px;';
    qrImageContainer.appendChild(title);

    // Create amount display
    const amountDiv = document.createElement('div');
    amountDiv.innerHTML = `<div style="font-size: 14px; color: #666; margin-bottom: 5px;">Amount:</div>
                           <div style="font-size: 32px; font-weight: bold; color: #10b981; margin-bottom: 15px;">₹ ${amount}</div>`;
    qrImageContainer.appendChild(amountDiv);

    // Generate QR code using API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;

    const qrImg = document.createElement('img');
    qrImg.src = qrApiUrl;
    qrImg.alt = 'UPI Payment QR Code';
    qrImg.style.cssText = 'max-width: 250px; height: 250px; border: 4px solid #6366f1; border-radius: 8px; margin: 10px auto; display: block;';

    // Loading state
    const loadingDiv = document.createElement('div');
    loadingDiv.textContent = '⏳ Generating QR code...';
    loadingDiv.style.cssText = 'padding: 125px 0; color: #666;';
    qrImageContainer.appendChild(loadingDiv);

    qrImg.onload = function () {
        // Remove loading, show QR
        loadingDiv.remove();
        qrImageContainer.appendChild(qrImg);

        // Add UPI ID below QR
        const upiDiv = document.createElement('div');
        upiDiv.style.cssText = 'margin-top: 15px; padding: 10px; background: #f0f0f0; border-radius: 6px;';
        upiDiv.innerHTML = `<div style="font-size: 12px; color: #666;">UPI ID:</div>
                            <div style="font-size: 14px; font-weight: bold; color: #333; word-break: break-all;">${upi}</div>`;
        qrImageContainer.appendChild(upiDiv);

        // Add instructions
        const instructions = document.createElement('div');
        instructions.style.cssText = 'margin-top: 15px; padding: 15px; background: #fffbeb; border-radius: 8px; border: 2px solid #fbbf24;';
        instructions.innerHTML = `
            <div style="font-size: 14px; font-weight: bold; color: #92400e; margin-bottom: 8px;">📱 How to Receive Payment:</div>
            <div style="font-size: 12px; color: #78350f; text-align: left;">
                1. Show this QR code to customer<br>
                2. Customer scans with any UPI app<br>
                3. Payment will come to: ${upi}<br>
                4. Amount: ₹${amount}
            </div>
        `;
        qrImageContainer.appendChild(instructions);

        // Add copy link button
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋 Copy UPI Link';
        copyBtn.className = 'btn-secondary';
        copyBtn.style.cssText = 'margin-top: 15px; width: 100%;';
        copyBtn.onclick = function () {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(upiString).then(() => {
                    showToast('✅ UPI link copied!');
                    copyBtn.textContent = '✅ Copied!';
                    setTimeout(() => {
                        copyBtn.textContent = '📋 Copy UPI Link';
                    }, 2000);
                });
            } else {
                alert('UPI Link:\n\n' + upiString);
            }
        };
        qrImageContainer.appendChild(copyBtn);

        console.log('✅ QR code generated successfully using API!');
        showToast('✅ QR Code ready! Show to customer');
        speakText('QR code ready for ₹' + amount);
    };

    qrImg.onerror = function () {
        console.error('❌ QR API failed, showing fallback');
        loadingDiv.innerHTML = `
            <div style="padding: 20px; background: #fee2e2; border-radius: 8px; color: #991b1b;">
                <div style="font-weight: bold; margin-bottom: 10px;">⚠️ QR Generation Failed</div>
                <div style="font-size: 14px; margin-bottom: 15px;">Manual UPI Link:</div>
                <div style="background: white; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #333;">
                    ${upiString}
                </div>
                <div style="margin-top: 15px; font-size: 12px;">
                    Copy this link and share with customer<br>
                    They can paste it in any UPI app to pay
                </div>
            </div>
        `;
    };
}

function downloadQR() {
    const canvas = document.getElementById('qrCanvas');
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-qr-${Date.now()}.png`;
    a.click();
    showToast('QR code downloaded!');
}

function shareQR() {
    const canvas = document.getElementById('qrCanvas');
    canvas.toBlob((blob) => {
        const file = new File([blob], 'payment-qr.png', { type: 'image/png' });

        if (navigator.share) {
            navigator.share({
                files: [file],
                title: 'Payment QR Code',
                text: 'Scan to pay'
            }).then(() => {
                showToast('Shared successfully!');
            }).catch(() => {
                fallbackShare();
            });
        } else {
            fallbackShare();
        }
    });
}

function fallbackShare() {
    alert('Share via your preferred method.\nQR code can be downloaded and shared manually.');
}

// ===== Utility Functions =====
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
}

// Initialize speech synthesis voices
if (synthesis) {
    synthesis.onvoiceschanged = () => {
        synthesis.getVoices();
    };
}
