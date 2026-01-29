// ============================================
// Vaani - Frontend Application
// Google Cloud Technology Stack
// ============================================

// Configuration - Auto-detect environment
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : '/api';  // Vercel serverless

// Page load animation using GSAP
document.addEventListener('DOMContentLoaded', () => {
    const tl = gsap.timeline();
    tl.to('h1', { opacity: 1, visibility: 'visible', y: -20, duration: 0.5, delay: 0.2 })
      .to('p', { opacity: 1, visibility: 'visible', y: -10, duration: 0.4 }, "-=0.3")
      .to('.language-selector', { opacity: 1, visibility: 'visible', duration: 0.5 }, "-=0.2")
      .to('.controls', { opacity: 1, visibility: 'visible', duration: 0.5 }, "-=0.3")
      .to('.caption-box', { opacity: 1, visibility: 'visible', stagger: 0.2, duration: 0.5 }, "-=0.3");
});


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
    resimplifyButton.addEventListener('click', () => {
        const editedText = rawTranscript.value.trim();
        if (!editedText) return;
        simplifiedCaption.textContent = "Processing...";
        sendToBackend(editedText, true, targetLanguage);
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
    speechRecognition.onresult = (event) => {
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
            sendToBackend(finalTranscript, false, targetLanguage);
        } else if (interimTranscript) {
            simplifiedCaption.textContent = simplifiedTextHistory + "Listening...";
        }
    };

    // Send text to backend for AI simplification (Google Gemini)
    async function sendToBackend(textToSimplify, isFullReplace = false, language) {
        try {
            const response = await fetch(`${API_URL}/simplify-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToSimplify, language })
            });

            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            const data = await response.json();

            // Visual feedback animation
            gsap.to(simplifiedBox, {
                boxShadow: "0 0 40px 10px rgba(99, 102, 241, 0.3)",
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: "power1.inOut"
            });

            if (isFullReplace) {
                simplifiedTextHistory = data.simple_text;
            } else {
                simplifiedTextHistory += data.simple_text + ' ';
            }
            simplifiedCaption.textContent = simplifiedTextHistory;
            playSignLanguage(data.simple_text);
        } catch (error) {
            simplifiedCaption.textContent = "[Error processing text]";
        }
    }

    function playSignLanguage(text) {
        const videoPlayer = document.getElementById("videoPlayer");
        const statusText = document.getElementById("sign-language-status");
        
        if (!videoPlayer) {
            console.error("Video player element not found!");
            return;
        }

        // Clean the text and create the playlist
        // Convert to Title Case to match video filenames (e.g., Hello.mp4, Thank.mp4)
        const words = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/);
        const videoQueue = words
            .filter(word => word.length > 0)
            .map(word => {
                // Convert to Title Case (first letter uppercase, rest lowercase)
                const titleCase = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                return `assets/${titleCase}.mp4`;
            });
        
        if (videoQueue.length === 0) {
            return;
        }

        let currentVideoIndex = 0;
        let hasPlayedAny = false;

        // Function to play the next video in the queue
        function playNextVideo() {
            if (currentVideoIndex < videoQueue.length) {
                const nextVideoSrc = videoQueue[currentVideoIndex];
                
                // Check if video exists before trying to play
                fetch(nextVideoSrc, { method: 'HEAD' })
                    .then(response => {
                        if (response.ok) {
                            // Video exists, play it
                            if (statusText) statusText.style.display = 'none';
                            videoPlayer.style.display = 'block';
                            videoPlayer.src = nextVideoSrc;
                            videoPlayer.load();
                            videoPlayer.play().catch(e => {
                                console.error(`Failed to play video: ${nextVideoSrc}`, e);
                                currentVideoIndex++;
                                playNextVideo();
                            });
                            hasPlayedAny = true;
                        } else {
                            // Video doesn't exist, skip to next
                            console.warn(`Video not found: ${nextVideoSrc}`);
                            currentVideoIndex++;
                            playNextVideo();
                        }
                    })
                    .catch(() => {
                        // Network error, skip to next
                        currentVideoIndex++;
                        playNextVideo();
                    });
            } else if (!hasPlayedAny) {
                // No videos were played, show message
                if (statusText) {
                    statusText.textContent = "No sign language videos available for these words.";
                    statusText.style.display = 'block';
                }
                videoPlayer.style.display = 'none';
            }
        }

        // Event listener to automatically play the next video when one ends
        videoPlayer.onended = () => {
            currentVideoIndex++;
            playNextVideo();
        };

        // Start playing the first video
        if (statusText) statusText.textContent = "Loading sign language...";
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
