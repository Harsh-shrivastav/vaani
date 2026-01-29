<div align="center">

# 🎙️ Vaani

### Real-Time AI Captioning & Sign Language Assistant

*Breaking communication barriers for the Deaf and Hard-of-Hearing community*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Now-6366f1?style=for-the-badge)](https://vaani-app.vercel.app)
[![Tech Stack](https://img.shields.io/badge/Built_With-Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<img src="https://img.shields.io/badge/TechSprint-2026-a78bfa?style=for-the-badge" alt="TechSprint 2026"/>

---

**Vaani** transforms spoken words into accessible content through real-time captions, AI-simplified text, and Indian Sign Language (ISL) video playback — all running entirely in your browser.

</div>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Live Demo](#-live-demo)
- [Social Impact](#-social-impact)
- [Future Scope](#-future-scope)
- [Team](#-team)
- [License](#-license)

---

## 🎯 Problem Statement

> **63 million people in India** live with significant hearing impairment. Yet, most live events, classrooms, and meetings remain inaccessible.

### The Challenge

- **Live lectures & meetings** rarely have real-time captions
- **Complex vocabulary** makes captions hard to follow for many Deaf users
- **Sign language interpreters** are expensive and not always available
- **Existing solutions** require expensive hardware or complex setup
- **Low-resource environments** lack access to assistive technology

The Deaf and Hard-of-Hearing community faces daily communication barriers that limit their participation in education, workplace, and social settings.

---

## 💡 Our Solution

**Vaani** is a browser-based accessibility tool that provides:

1. **Real-Time Captions** — Instant speech-to-text transcription
2. **AI Simplification** — Complex sentences converted to easy-to-read English
3. **Sign Language Videos** — Automatic ISL video playback for each word

All running **100% in the browser** — no installations, no backend servers, no waiting.

### Why Vaani?

| Traditional Solutions | Vaani |
|----------------------|-------|
| Requires installation | Zero installation |
| Needs powerful hardware | Works on any device |
| Expensive subscriptions | Completely free |
| Complex setup | Open and use |
| Text-only captions | Captions + Sign Language |

---

## ✨ Key Features

### 🎤 Real-Time Speech Recognition
Captures spoken words instantly using the Web Speech API with support for multiple accents and natural speech patterns.

### 📝 Live Captioning
Displays raw transcription in real-time, allowing users to follow along with live conversations.

### 🧠 AI-Powered Simplification
Google Gemini AI transforms complex sentences into simple, deaf-friendly English using 5th-grade vocabulary.

### 🤟 Sign Language Video Playback
Automatically plays corresponding Indian Sign Language (ISL) videos from a library of **150+ pre-recorded signs**.

### ⚡ Zero Backend Architecture
Runs entirely in the browser — no server delays, no cold starts, instant response.

### 📱 Universal Compatibility
Works on desktop, tablet, and mobile. Chrome, Edge, and other modern browsers supported.

### 🌙 Dark/Light Mode
Accessibility-first design with theme toggle for comfortable viewing in any environment.

---

## 🔄 How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER SPEAKS                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              🎙️ WEB SPEECH API (Speech Recognition)             │
│                   Converts speech to raw text                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                📝 RAW TRANSCRIPTION DISPLAY                      │
│                  Shows live speech-to-text                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              🧠 GOOGLE GEMINI AI (Text Simplification)           │
│           Converts complex text to simple English                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               ✅ DEAF-FRIENDLY CAPTION DISPLAY                   │
│                Shows simplified, clear text                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              🤟 SIGN LANGUAGE VIDEO PLAYER                       │
│         Plays ISL videos for each word sequentially              │
└─────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Flow

1. **Click "Start Listening"** — Microphone activates
2. **Speak naturally** — Raw text appears in real-time
3. **AI processes** — Gemini simplifies the text
4. **Simplified caption appears** — Easy-to-read output displayed
5. **Sign language plays** — Corresponding ISL videos play automatically

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Speech Recognition** | Web Speech API |
| **AI Processing** | Google Gemini 1.5 Flash |
| **Animations** | GSAP (GreenSock) |
| **Sign Language** | Pre-recorded ISL MP4 videos |
| **Hosting** | Vercel (Static) |
| **Design** | Atkinson Hyperlegible Font (Accessibility-optimized) |

### Why This Stack?

- **No Backend** = No cold starts, no server costs, instant availability
- **Web Speech API** = Native browser support, no external dependencies
- **Gemini Flash** = Fast, accurate AI at minimal latency
- **Static Hosting** = 99.99% uptime, global CDN distribution

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                           VAANI ARCHITECTURE                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐    │
│   │   Browser   │────▶│ Web Speech  │────▶│   Raw Transcript    │    │
│   │ Microphone  │     │    API      │     │      Display        │    │
│   └─────────────┘     └─────────────┘     └──────────┬──────────┘    │
│                                                       │               │
│                                                       ▼               │
│                              ┌────────────────────────────────────┐   │
│                              │     Google Gemini API (Cloud)      │   │
│                              │     Text Simplification Engine     │   │
│                              └────────────────────────────────────┘   │
│                                                       │               │
│                                                       ▼               │
│   ┌─────────────────────┐     ┌─────────────────────────────────┐    │
│   │  ISL Video Library  │◀────│   Simplified Caption Display    │    │
│   │   (150+ videos)     │     │                                 │    │
│   └─────────────────────┘     └─────────────────────────────────┘    │
│            │                                                          │
│            ▼                                                          │
│   ┌─────────────────────┐                                            │
│   │  Video Player       │                                            │
│   │  (Sequential Play)  │                                            │
│   └─────────────────────┘                                            │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Edge, or Firefox)
- Microphone access
- Internet connection (for Gemini API)

### Run Locally

```bash
# Clone the repository
git clone https://github.com/your-username/vaani.git

# Navigate to project
cd vaani

# Start local server (Python)
cd client
python -m http.server 8080

# Or use any static server
npx serve client
```

Open `http://localhost:8080` in your browser.

### Project Structure

```
vaani/
├── client/
│   ├── index.html        # Main application
│   ├── app.js            # Core logic
│   ├── style.css         # Styling
│   ├── env.js            # API configuration
│   ├── gsap.min.js       # Animation library
│   ├── assets/           # ISL video library (150+ videos)
│   │   ├── Hello.mp4
│   │   ├── Good.mp4
│   │   └── ...
│   ├── about.html        # About page
│   └── features.html     # Features page
├── vercel.json           # Deployment config
└── README.md
```

---

## 🌐 Live Demo

> **Try Vaani now:** [https://vaani-app.vercel.app](https://vaani-app.vercel.app)

### Demo Instructions

1. Open the link in Chrome or Edge
2. Allow microphone access when prompted
3. Click **"Start Listening"**
4. Speak clearly into your microphone
5. Watch real-time captions and sign language videos appear!

---

## 🌍 Social Impact

### Who Benefits?

| User Group | Impact |
|------------|--------|
| **Deaf Students** | Follow lectures in real-time without interpreters |
| **Hard-of-Hearing Professionals** | Participate fully in meetings |
| **Sign Language Learners** | Learn ISL through visual word-to-sign mapping |
| **Educators** | Make classrooms more inclusive |
| **Event Organizers** | Provide instant accessibility at events |

### Alignment with UN SDGs

- **SDG 4: Quality Education** — Equal access to learning for all
- **SDG 10: Reduced Inequalities** — Breaking communication barriers
- **SDG 11: Sustainable Cities** — Inclusive community spaces

### Impact Potential

- **63M+ Deaf individuals in India** can benefit
- **Zero cost** removes economic barriers
- **Browser-based** ensures universal access
- **No training required** for immediate adoption

---

## 🔮 Future Scope

| Feature | Description | Status |
|---------|-------------|--------|
| **Regional Languages** | Hindi, Tamil, Marathi caption support | 🔄 Planned |
| **Custom Vocabulary** | Domain-specific word simplification | 🔄 Planned |
| **Offline Mode** | Cached videos + local speech recognition | 🔄 Research |
| **Mobile App** | React Native / Flutter apps | 🔄 Planned |
| **AI Sign Generation** | Real-time avatar-based signing | 🔄 Research |
| **Classroom Integration** | LMS plugins (Moodle, Canvas) | 🔄 Planned |
| **Multi-Speaker Detection** | Identify and label different speakers | 🔄 Research |

---

## 👥 Team

<div align="center">

| Role | Member |
|------|--------|
| **Developer** | Team Vaani |
| **AI Integration** | Team Vaani |
| **UI/UX Design** | Team Vaani |
| **Accessibility Research** | Team Vaani |

*Built with ❤️ for TechSprint 2026*

</div>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Team Vaani

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">

### 🎙️ Vaani — Making Every Voice Visible

**Built for accessibility. Designed for everyone.**

[![GitHub Stars](https://img.shields.io/github/stars/your-username/vaani?style=social)](https://github.com/your-username/vaani)

</div>
