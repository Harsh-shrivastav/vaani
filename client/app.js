// ============================================
// Vaani - Frontend-Only Application
// No Backend Required - Direct Gemini API
// API Key loaded from window.ENV (injected at build)
// ============================================

// Get API key from environment (injected by build.sh)
const GEMINI_API_KEY = window.ENV?.GEMINI_API_KEY || "";

// Page load animation using GSAP
document.addEventListener('DOMContentLoaded', () => {
    const tl = gsap.timeline();
    tl.to('h1', { opacity: 1, visibility: 'visible', y: -20, duration: 0.5, delay: 0.2 })
      .to('p', { opacity: 1, visibility: 'visible', y: -10, duration: 0.4 }, "-=0.3")
      .to('.language-selector', { opacity: 1, visibility: 'visible', duration: 0.5 }, "-=0.2")
      .to('.controls', { opacity: 1, visibility: 'visible', duration: 0.5 }, "-=0.3")
      .to('.caption-box', { opacity: 1, visibility: 'visible', stagger: 0.2, duration: 0.5 }, "-=0.3");
});

// Direct Gemini API call for text simplification
async function simplifyText(text) {
    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Convert the following sentence into very simple easy English for deaf students. Return ONLY the simplified sentence. No explanation. No extra words. Sentence: "${text}"`
                        }]
                    }]
                })
            }
        );

        if (!res.ok) throw new Error();

        const data = await res.json();

        let simplified = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // CLEAN unwanted AI text
        simplified = simplified
            .replace(/\[.*?\]/g, "")
            .replace(/^(Sure|Here.*?:)/i, "")
            .trim();

        return simplified;

    } catch {
        return "";
    }
}

// Speech Recognition Setup
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!window.SpeechRecognition) {
    alert("Sorry, your browser doesn't support live speech recognition. Please use Chrome or Edge.");
} else {
    const speechRecognition = new SpeechRecognition();
    const toggleButton = document.getElementById('toggle-btn');
    const rawTranscript = document.getElementById('raw-text-output');
    const simplifiedCaption = document.getElementById('simple-text-output');
    const clearButton = document.getElementById('clear-btn');
    const resimplifyButton = document.getElementById('resimplify-btn');
    const languageSelector = document.querySelector('.language-selector');
    const langButtons = document.querySelectorAll('.lang-btn');
    const simplifiedBox = simplifiedCaption.closest('.caption-box');

    let isListening = false;
    let rawTextHistory = '';
    let simplifiedTextHistory = '';
    let targetLanguage = 'English';

    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.lang = 'en-IN';

    // Start or stop speech recognition
    toggleButton.addEventListener('click', () => {
        isListening = !isListening;
        if (isListening) {
            rawTranscript.value = "";
            simplifiedCaption.textContent = "";
            rawTextHistory = "";
            simplifiedTextHistory = "";
            speechRecognition.start();
            toggleButton.textContent = 'Stop Listening';
            toggleButton.classList.add('listening');
        } else {
            speechRecognition.stop();
            toggleButton.textContent = 'Start Listening';
            toggleButton.classList.remove('listening');
        }
    });

    // Clear all transcripts
    clearButton.addEventListener('click', () => {
        rawTextHistory = '';
        simplifiedTextHistory = '';
        rawTranscript.value = '';
        simplifiedCaption.textContent = '';
    });

    // Re-simplify manually edited text
    resimplifyButton.addEventListener('click', async () => {
        const editedText = rawTranscript.value.trim();
        if (!editedText) return;
        simplifiedCaption.textContent = "Processing...";
        
        const simplified = await simplifyText(editedText);
        
        // Only update if we got a valid response
        if (simplified) {
            simplifiedTextHistory = simplified;
            simplifiedCaption.textContent = simplified;
            
            // Visual feedback
            gsap.to(simplifiedBox, {
                boxShadow: "0 0 40px 10px rgba(99, 102, 241, 0.3)",
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: "power1.inOut"
            });
            
            playSignLanguage(simplified);
        } else {
            // Fallback: show original text if API fails
            simplifiedCaption.textContent = simplifiedTextHistory || editedText;
        }
    });

    // Language selection handler
    languageSelector.addEventListener('click', (e) => {
        if (e.target.classList.contains('lang-btn')) {
            langButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            targetLanguage = e.target.dataset.lang;
        }
    });

    // Process speech recognition results
    speechRecognition.onresult = async (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript.trim() + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        rawTranscript.value = rawTextHistory + interimTranscript;

        if (finalTranscript) {
            rawTextHistory += finalTranscript;
            simplifiedCaption.textContent = simplifiedTextHistory + "Processing...";
            
            // Call Gemini API directly
            const simplified = await simplifyText(finalTranscript);
            console.log("Final transcript:", finalTranscript);
            console.log("Simplified result:", simplified);
            
            // Only update if we got a valid response
            if (simplified) {
                // Visual feedback animation
                gsap.to(simplifiedBox, {
                    boxShadow: "0 0 40px 10px rgba(99, 102, 241, 0.3)",
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1,
                    ease: "power1.inOut"
                });

                simplifiedTextHistory += simplified + ' ';
                simplifiedCaption.textContent = simplifiedTextHistory;
                console.log("Playing sign language for:", simplified);
                playSignLanguage(simplified);
            } else {
                // Fallback: use raw text if API fails, still play sign language
                simplifiedTextHistory += finalTranscript;
                simplifiedCaption.textContent = simplifiedTextHistory;
                console.log("API failed, playing sign language for raw:", finalTranscript);
                playSignLanguage(finalTranscript);
            }
        } else if (interimTranscript) {
            simplifiedCaption.textContent = simplifiedTextHistory + "Listening...";
        }
    };

    function playSignLanguage(text) {
        const videoPlayer = document.getElementById("videoPlayer");
        const statusText = document.getElementById("sign-language-status");
        
        if (!videoPlayer) {
            console.error("Video player element not found!");
            return;
        }

        // Clean the text and create the playlist
        const words = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/);
        const videoQueue = words
            .filter(word => word.length > 0)
            .map(word => {
                // Title Case: first letter uppercase, rest lowercase
                const titleCase = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                // Use absolute path for Vercel static hosting
                return `/assets/${titleCase}.mp4`;
            });
        
        console.log("Sign Language Queue:", videoQueue);
        
        if (videoQueue.length === 0) return;

        let currentVideoIndex = 0;
        let hasPlayedAny = false;

        // Clear previous event listeners
        videoPlayer.onended = null;
        videoPlayer.onerror = null;
        videoPlayer.onloadeddata = null;
        videoPlayer.oncanplay = null;

        function playNextVideo() {
            if (currentVideoIndex >= videoQueue.length) {
                if (!hasPlayedAny && statusText) {
                    statusText.textContent = "No sign language videos available for these words.";
                    statusText.style.display = 'block';
                    videoPlayer.style.display = 'none';
                }
                return;
            }
            
            const nextVideoSrc = videoQueue[currentVideoIndex];
            console.log("Trying to play:", nextVideoSrc);
            
            // Set up event handlers BEFORE setting src
            videoPlayer.oncanplay = function() {
                console.log("Can play:", nextVideoSrc);
                videoPlayer.play()
                    .then(() => {
                        console.log("Playing:", nextVideoSrc);
                        hasPlayedAny = true;
                        if (statusText) statusText.style.display = 'none';
                    })
                    .catch(e => {
                        console.warn(`Video play failed: ${nextVideoSrc}`, e.message);
                        currentVideoIndex++;
                        setTimeout(playNextVideo, 100);
                    });
            };
            
            videoPlayer.onerror = function() {
                console.warn(`Video error, skipping: ${nextVideoSrc}`);
                currentVideoIndex++;
                setTimeout(playNextVideo, 100);
            };
            
            videoPlayer.onended = function() {
                console.log("Video ended:", nextVideoSrc);
                currentVideoIndex++;
                playNextVideo();
            };
            
            // Show video player
            videoPlayer.style.display = 'block';
            videoPlayer.muted = true;
            videoPlayer.playsInline = true;
            
            // Set source and load
            videoPlayer.src = nextVideoSrc;
            videoPlayer.load();
        }

        if (statusText) {
            statusText.textContent = "Loading sign language...";
            statusText.style.display = 'block';
        }
        playNextVideo();
    }

    // Auto-reconnect if recognition stops unexpectedly
    speechRecognition.onend = () => {
        if (isListening) speechRecognition.start();
        else {
            toggleButton.textContent = 'Start Listening';
            toggleButton.classList.remove('listening');
        }
    };

    // Handle speech recognition errors
    speechRecognition.onerror = (event) => {
        if (['not-allowed', 'permission-denied'].includes(event.error)) {
            isListening = false;
            toggleButton.textContent = 'Start Listening';
            toggleButton.classList.remove('listening');
            alert("Please allow microphone access to use this feature.");
        } else if (event.error !== 'network') {
            alert(`Error: ${event.error}`);
        }
    };
}

// Theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const root = document.documentElement;

    if (localStorage.getItem('theme') === 'light') enableLightMode();
    else enableDarkMode();

    themeToggle.addEventListener('click', () => {
        if (root.classList.contains('light-mode')) enableDarkMode();
        else enableLightMode();
    });

    function enableLightMode() {
        root.classList.add('light-mode');
        document.body.style.backgroundColor = '#f7f7ff';
        document.body.style.color = '#111';
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    }

    function enableDarkMode() {
        root.classList.remove('light-mode');
        document.body.style.backgroundColor = '#121212';
        document.body.style.color = '#e0e0e0';
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    }
});

// Global test function for video playback
function testVideo() {
    const videoPlayer = document.getElementById("videoPlayer");
    const statusText = document.getElementById("sign-language-status");
    
    console.log("Testing video playback...");
    
    // Test with a known video file
    const testVideos = ["/assets/Hello.mp4", "/assets/A.mp4", "/assets/Good.mp4"];
    let testIndex = 0;
    
    function tryNextVideo() {
        if (testIndex >= testVideos.length) {
            console.error("All test videos failed!");
            if (statusText) {
                statusText.textContent = "Video test failed - check console";
                statusText.style.display = 'block';
            }
            return;
        }
        
        const testSrc = testVideos[testIndex];
        console.log("Testing:", testSrc);
        
        videoPlayer.oncanplay = function() {
            console.log("✓ Can play:", testSrc);
            videoPlayer.play()
                .then(() => {
                    console.log("✓ Playing:", testSrc);
                    if (statusText) statusText.style.display = 'none';
                })
                .catch(e => {
                    console.error("✗ Play failed:", e);
                    testIndex++;
                    tryNextVideo();
                });
        };
        
        videoPlayer.onerror = function(e) {
            console.error("✗ Error loading:", testSrc, e);
            testIndex++;
            tryNextVideo();
        };
        
        videoPlayer.style.display = 'block';
        videoPlayer.muted = true;
        videoPlayer.src = testSrc;
        videoPlayer.load();
    }
    
    tryNextVideo();
}
