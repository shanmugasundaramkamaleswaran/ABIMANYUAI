# Abimanyu AI - Machine Learning Architecture

This document describes the Machine Learning (ML) and Artificial Intelligence (AI) components used in the Abimanyu AI application.

## 1. Large Language Models (LLM)
**Purpose:** Core conversational intelligence.
- **Primary Model:** Google Gemini (1.5 Flash) via `google-generativeai`.
- **Secondary Model:** OpenAI (GPT-4o-mini) via `openai`.
- **Functionality:** Interprets user inputs and generates context-aware, persona-based responses.
- **Implementation:** `backend/services/ai_service.py`

## 2. Retrieval-Augmented Generation (RAG)
**Purpose:** Enhances LLM responses with specific knowledge from uploaded documents (e.g., PDFs).
- **Embedding Model:** `all-MiniLM-L6-v2` (via `sentence-transformers`).
- **Vector Database:** `FAISS` (Facebook AI Similarity Search).
- **Process:** 
  1. Extracts text from PDFs (`backend/utils/rag_pipeline.py`).
  2. Chunks text into segments.
  3. Embeds chunks into vectors.
  4. Stores vectors in FAISS index.
  5. Retrieves relevant chunks based on query similarity.

## 3. Natural Language Processing (NLP)
**Purpose:** Analyzes the emotional tone of user messages.
- **Library:** `TextBlob`.
- **Logic:** Calculates `polarity` score (-1.0 to +1.0).
  - **Negative:** < -0.3
  - **Positive:** > 0.3
  - **Neutral:** -0.3 to 0.3
- **Implementation:** `backend/nlp/sentiment.py`

## 4. Text-to-Speech (TTS)
**Purpose:** Converts AI responses into spoken audio.
- **Provider:** ElevenLabs API.
- **Functionality:** Generates high-quality voice audio from text.
- **Implementation:** `backend/voice.py`

## Summary Table

| Component | Technology | File |
| :--- | :--- | :--- |
| **Chat Generation** | Google Gemini / OpenAI | `backend/services/ai_service.py` |
| **Knowledge Retrieval** | SentenceTransformer + FAISS | `backend/utils/rag_pipeline.py` |
| **Sentiment Analysis** | TextBlob | `backend/nlp/sentiment.py` |
| **Voice Synthesis** | ElevenLabs | `backend/voice.py` |
