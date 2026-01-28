# Vaani – Real-Time AI Captioning & Sign Language Assistant

> **Powered by Google Cloud** – A production-ready accessibility application for Deaf and Hard-of-Hearing users.

![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Ready-4285F4?style=flat&logo=google-cloud)
![Firebase](https://img.shields.io/badge/Firebase-Hosting-FFCA28?style=flat&logo=firebase)
![Gemini](https://img.shields.io/badge/Gemini-AI-8E75B2?style=flat&logo=google)

---

##  What is Vaani?

Vaani is a real-time speech-to-text application that:
- **Captures live speech** using Google Cloud Speech-to-Text
- **Simplifies complex language** using Google Gemini AI
- **Displays sign language videos** for each word
- **Stores transcripts** in Cloud Firestore

Built specifically for **accessibility** – making spoken communication accessible to everyone.

---

##  Architecture

```
Firebase Hosting (Static Frontend)
           
           
Google Cloud Run (FastAPI Backend)
     Gemini AI (Simplify)
     Speech-to-Text
     Firestore (Database)
           
           
Firebase Storage (Sign Language Videos)
```

---

##  Project Structure

```
vaani/
 client/                      # Frontend (Firebase Hosting)
    index.html              # Main UI
    app.js                  # Application logic
    style.css               # Styling
    assets/                 # Sign language videos

 server/                      # Backend (Cloud Run)
    main.py                 # FastAPI application
    requirements.txt        # Python dependencies
    .env                    # Environment variables

 modules/                     # Shared modules
    simplifier/             # AI text simplification (Gemini)
    speech/                 # Speech-to-Text (Google)
    storage/                # Firebase Storage
    database/               # Cloud Firestore

 Dockerfile                   # Cloud Run container
 cloudbuild.yaml             # Cloud Build config
 firebase.json               # Firebase config
```

---

##  Google Cloud Services Used

| Service | Purpose |
|---------|---------|
| **Gemini 3 Flash** | AI text simplification |
| **Cloud Speech-to-Text** | Real-time audio transcription |
| **Cloud Firestore** | Transcript storage & history |
| **Firebase Storage** | Sign language video hosting |
| **Firebase Hosting** | Static frontend hosting |
| **Cloud Run** | Containerized backend API |

---

##  Local Development

### 1. Configure Environment

```bash
cp server/.env.example server/.env
# Edit .env with your GOOGLE_API_KEY
```

### 2. Install & Run Backend

```bash
cd server
pip install -r requirements.txt
python main.py
```

### 3. Run Frontend

```bash
cd client
python -m http.server 8080
```

Open: http://localhost:8080

---

##  Cloud Deployment

### Deploy to Cloud Run

```bash
gcloud builds submit --config cloudbuild.yaml
```

### Deploy to Firebase

```bash
firebase deploy --only hosting
```

---

##  Features

- Real-time speech recognition
- AI-powered text simplification (Gemini)
- Multi-language support
- Sign language video playback
- Dark/Light theme toggle
- Transcript history (Firestore)
- Production-ready architecture

---

Built with Google Cloud for accessibility.
