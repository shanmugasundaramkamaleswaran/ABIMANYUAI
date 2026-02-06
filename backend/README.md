# Abimanyu AI Backend

FastAPI backend for Abimanyu AI application with AI-powered chat, sentiment analysis, and spiritual wisdom integration.

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── auth.py              # Authentication and JWT handling
├── database.py          # Database configuration and session management
├── models.py            # SQLAlchemy database models
├── abimanyu_ai.py       # AI response generation using Google Gemini
├── voice.py             # Text-to-speech synthesis
├── requirements.txt     # Python dependencies
├── data/                # Data files
│   ├── docs/           # PDF documents
│   └── extracted/      # Extracted text files
├── nlp/                 # NLP modules
│   ├── sentiment.py    # Sentiment analysis
│   ├── emotion.py      # Emotion detection
│   └── intent.py       # Intent classification
└── utils/               # Utility functions
    └── extract_pdf.py  # PDF extraction utilities
```

## Features

- 🔐 JWT-based authentication
- 💬 AI-powered chat with Google Generative AI
- 📊 Sentiment and emotion analysis
- 🔮 Bhagavad Gita wisdom integration
- 🎵 Text-to-speech synthesis
- 📱 RESTful API endpoints
- 🔒 HTTPS support with SSL certificates

## Installation

### Prerequisites
- Python 3.10+
- pip

### Setup

1. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create `.env` file:
   ```env
   GOOGLE_API_KEY=your_google_api_key
   SECRET_KEY=your_secret_key_for_jwt
   DATABASE_URL=sqlite:///./abimanyu.db
   ```

4. Run the server:
   ```bash
   python main.py
   ```

Server will start on `https://localhost:8000`

## API Endpoints

### Authentication

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

#### Login User
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "token_string",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

#### Get Current User
```
GET /auth/me
Authorization: Bearer <token>
```

### Chat

#### Send Message
```
POST /chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "What does the Bhagavad Gita say about duty?"
}

Response:
{
  "reply": "AI generated response...",
  "sentiment": "positive",
  "audio": "base64_encoded_audio"
}
```

#### Get Chat History
```
GET /chat/history
Authorization: Bearer <token>

Response: [
  {
    "id": 1,
    "content": "user message",
    "is_ai": false,
    "timestamp": "2024-01-01T12:00:00"
  },
  ...
]
```

#### Clear Chat History
```
DELETE /chat/history
Authorization: Bearer <token>
```

### Health Check
```
GET /health

Response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00"
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google Generative AI API key | Yes |
| `SECRET_KEY` | Secret key for JWT signing | Yes |
| `DATABASE_URL` | SQLite database URL | No (defaults to abimanyu.db) |

## Database

The backend uses SQLite with SQLAlchemy ORM. Models include:

- **User**: User accounts with email and password
- **ChatMessage**: Chat history with sentiment analysis

Database is automatically initialized on first run.

## Dependencies

Key dependencies in `requirements.txt`:

- **fastapi**: Web framework
- **uvicorn**: ASGI server
- **sqlalchemy**: ORM
- **google-generativeai**: AI responses
- **python-jose**: JWT handling
- **passlib**: Password hashing
- **elevenlabs**: Text-to-speech
- **python-dotenv**: Environment variables

## Security

- Passwords hashed with bcrypt
- JWT tokens for session management
- HTTPS/SSL support
- CORS middleware for frontend communication
- Input validation with Pydantic

## Development

### Running with Auto-reload
```bash
python main.py
```

The server includes Uvicorn's reload feature for development.

### Database Reset
Delete `abimanyu.db` and restart the server to reset the database.

## Troubleshooting

### CORS Issues
Ensure CORS middleware is properly configured in `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### SSL Certificate Errors
For development, self-signed certificates are used. Browsers will show a warning, which is normal.

### Database Errors
Ensure `abimanyu.db` has proper write permissions. On Windows, clear the file attributes if locked.

## Contributing

1. Keep code clean and well-documented
2. Follow PEP 8 style guidelines
3. Add docstrings to functions
4. Test API endpoints thoroughly

## License

MIT License
