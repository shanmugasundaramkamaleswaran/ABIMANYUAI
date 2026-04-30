# Abimanyu AI - Project Workflow

This document outlines the end-to-end workflow of the **Abimanyu AI** project, covering user interaction, technical data flow, and development processes.

## 1. User Interaction Flow
1. **Login/Auth:** User logs in via the Frontend (React) using JWT authentication.
2. **Chat Interface:** User types a message or uses voice input.
3. **Processing:** The message is sent to the Backend (FastAPI) via **HTTPS**.
4. **Response:**
   - **RAG:** The system searches the **Bhagavad Gita** and other docs for relevant wisdom.
   - **LLM:** Google Gemini generates a spiritual, persona-based response using the retrieved context.
   - **Sentiment:** The system analyzes the user's emotion (Positive/Negative) to adjust the tone.
5. **Output:** The user receives a text response and an audio readout (Voice).

## 2. Technical Data Flow
```mermaid
graph TD
    User[User (Frontend)] -->|HTTPS| API[FastAPI Backend]
    API -->|Auth Check| JWT[JWT Validator]
    API -->|Text| Sentiment[Sentiment Analysis]
    
    subgraph "AI Processing"
        API -->|Query| RAG[RAG Pipeline]
        RAG -->|Vectors| FAISS[Vector DB]
        FAISS -->|Context| LLM[Google Gemini / OpenAI]
        LLM -->|Response| API
    end
    
    subgraph "Voice"
        API -->|Text| TTS[ElevenLabs API]
        TTS -->|Audio| User
    end
```

## 3. Development Workflow
1. **Code Changes:** Developers modify React (Frontend) or Python (Backend) code.
2. **Testing:**
   - Run `npm run dev` for Frontend.
   - Run `uvicorn main:app` for Backend.
3. **Version Control:** Changes are committed to Git and pushed to GitHub.
   - *Protected branches prevent pushing secrets.*
4. **Deployment:** The app is deployed to a server or cloud provider (e.g., Vercel/Render).

## 4. Mobile App Workflow (Future)
1. **PWA:** The web app is installed on a phone via the browser.
2. **Access:** It connects to the backend server (currently your PC's IP).
3. **Usage:** Works like a native app with touch optimizations.
