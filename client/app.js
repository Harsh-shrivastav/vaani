// ============================================
// Vaani - MVP (Frontend-Only)
// Real-time speech → Simple text → Sign language
// ============================================

// API Key - Try env first, fallback to hardcoded for demo
const GEMINI_API_KEY = window.ENV?.GEMINI_API_KEY || "AIzaSyCFgcS4IZagaybF9lHSbu5iaEB7B0r4U34";

console.log("Vaani MVP loaded. API Key present:", !!GEMINI_API_KEY);

// ============================================
// TEXT SIMPLIFICATION (Gemini API)
// ============================================
async function simplifyText(text) {
    if (!text || text.trim().length === 0) return text;
    
    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Convert this to simple English for deaf students. Return ONLY the simplified text, nothing else: "${text}"`
                        }]
                    }]
                })
            }
        );

        if (!res.ok) {
            console.warn("Gemini API error:", res.status);
            return text; // Return original on error
        }

        const data = await res.json();
        let result = data?.candidates?.[0]?.content?.parts?.[0]?.text || text;
        
        // Clean AI artifacts
        result = result.replace(/\[.*?\]/g, "").replace(/^(Sure|Here.*?:)/i, "").trim();
        
        return result || text;
    } catch (e) {
        console.error("Simplify error:", e);
        return text; // Return original on error
    }
}

// ============================================
// SIGN LANGUAGE VIDEO PLAYER
// ============================================
function playSignLanguage(text) {
    const videoPlayer = document.getElementById("videoPlayer");
    const statusText = document.getElementById("sign-language-status");
    const testBtn = document.getElementById("test-video-btn");
    
    if (!videoPlayer) {
        console.error("Video player not found!");
        return;
    }
    
    // Hide test button when playing
    if (testBtn) testBtn.style.display = 'none';
    
    // Parse words and create video queue
    const words = text.replace(/[^\w\s]/g, "").split(/\s+/).filter(w => w.length > 0);
    const videoQueue = words.map(word => {
        const titleCase = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        return { word: titleCase, src: `assets/${titleCase}.mp4` };
    });
    
    console.log("Video queue:", videoQueue.map(v => v.word));
    
    if (videoQueue.length === 0) return;
    
    let index = 0;
    let playedAny = false;
    
    function playNext() {
        if (index >= videoQueue.length) {
            if (!playedAny && statusText) {
                statusText.textContent = "No videos for these words";
                statusText.style.display = 'block';
                videoPlayer.style.display = 'none';
            }
            if (testBtn) testBtn.style.display = 'block';
            return;
        }
        
        const current = videoQueue[index];
        console.log(`Playing [${index + 1}/${videoQueue.length}]: ${current.word}`);
        
        // Setup video
        videoPlayer.style.display = 'block';
        if (statusText) statusText.style.display = 'none';
        
        videoPlayer.onloadeddata = () => {
            videoPlayer.play().then(() => {
                playedAny = true;
            }).catch(e => {
                console.warn(`Play error: ${current.word}`, e.message);
                index++;
                setTimeout(playNext, 50);
            });
        };
        
        videoPlayer.onerror = () => {
            console.warn(`Video not found: ${current.word}`);
            index++;
            setTimeout(playNext, 50);
        };
        
        videoPlayer.onended = () => {
            index++;
            playNext();
        };
        
        videoPlayer.src = current.src;
        videoPlayer.muted = true;
        videoPlayer.load();
    }
    
    if (statusText) {
        statusText.textContent = "Loading...";
        statusText.style.display = 'block';
    }
    
    playNext();
}

// Global test function
window.testVideo = function() {
    console.log("Testing video...");
    playSignLanguage("Hello");
};

// ============================================
// SPEECH RECOGNITION
// ============================================
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!window.SpeechRecognition) {
    alert("Speech recognition not supported. Use Chrome or Edge.");
} else {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    const toggleBtn = document.getElementById('toggle-btn');
    const clearBtn = document.getElementById('clear-btn');
    const resimplifyBtn = document.getElementById('resimplify-btn');
    const rawOutput = document.getElementById('raw-text-output');
    const simpleOutput = document.getElementById('simple-text-output');
    
    let isListening = false;
    let rawHistory = '';
    let simpleHistory = '';
    
    // Toggle listening
    if (toggleBtn) {
        toggleBtn.onclick = () => {
            isListening = !isListening;
            if (isListening) {
                rawHistory = '';
                simpleHistory = '';
                if (rawOutput) rawOutput.value = '';
                if (simpleOutput) simpleOutput.textContent = '';
                recognition.start();
                toggleBtn.textContent = '🔴 Stop Listening';
                toggleBtn.classList.add('listening');
                console.log("Started listening");
            } else {
                recognition.stop();
                toggleBtn.textContent = '🎤 Start Listening';
                toggleBtn.classList.remove('listening');
                console.log("Stopped listening");
            }
        };
    }
    
    // Clear button
    if (clearBtn) {
        clearBtn.onclick = () => {
            rawHistory = '';
            simpleHistory = '';
            if (rawOutput) rawOutput.value = '';
            if (simpleOutput) simpleOutput.textContent = '';
        };
    }
    
    // Re-simplify button
    if (resimplifyBtn) {
        resimplifyBtn.onclick = async () => {
            const text = rawOutput?.value?.trim();
            if (!text) return;
            
            if (simpleOutput) simpleOutput.textContent = "Processing...";
            
            const simplified = await simplifyText(text);
            simpleHistory = simplified;
            if (simpleOutput) simpleOutput.textContent = simplified;
            
            playSignLanguage(simplified);
        };
    }
    
    // Speech results
    recognition.onresult = async (event) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                final += transcript.trim() + ' ';
            } else {
                interim += transcript;
            }
        }
        
        // Update raw output
        if (rawOutput) {
            rawOutput.value = rawHistory + interim;
        }
        
        // Process final transcript
        if (final) {
            rawHistory += final;
            console.log("Final:", final);
            
            if (simpleOutput) simpleOutput.textContent = simpleHistory + "Processing...";
            
            const simplified = await simplifyText(final);
            console.log("Simplified:", simplified);
            
            simpleHistory += simplified + ' ';
            if (simpleOutput) simpleOutput.textContent = simpleHistory;
            
            // Play sign language
            playSignLanguage(simplified);
        } else if (interim && simpleOutput) {
            simpleOutput.textContent = simpleHistory + "🎧 Listening...";
        }
    };
    
    // Auto-restart on end
    recognition.onend = () => {
        if (isListening) {
            recognition.start();
        } else if (toggleBtn) {
            toggleBtn.textContent = '🎤 Start Listening';
            toggleBtn.classList.remove('listening');
        }
    };
    
    // Error handling
    recognition.onerror = (e) => {
        console.error("Speech error:", e.error);
        if (e.error === 'not-allowed') {
            alert("Please allow microphone access.");
            isListening = false;
            if (toggleBtn) {
                toggleBtn.textContent = '🎤 Start Listening';
                toggleBtn.classList.remove('listening');
            }
        }
    };
}

// ============================================
// THEME TOGGLE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeBtn.textContent = '☀️';
    }
    
    themeBtn.onclick = () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        themeBtn.textContent = isLight ? '☀️' : '🌙';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    };
});

// ============================================
// GSAP ANIMATIONS (if available)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap !== 'undefined') {
        gsap.to('h1', { opacity: 1, y: -20, duration: 0.5, delay: 0.2 });
        gsap.to('p', { opacity: 1, y: -10, duration: 0.4, delay: 0.3 });
        gsap.to('.controls', { opacity: 1, duration: 0.5, delay: 0.4 });
        gsap.to('.caption-box', { opacity: 1, stagger: 0.2, duration: 0.5, delay: 0.5 });
    }
});

console.log("✅ Vaani MVP ready!");
