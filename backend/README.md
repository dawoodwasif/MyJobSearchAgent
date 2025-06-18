# Backend API for Document Processing

This Python Flask backend handles document text extraction and AI-powered resume optimization.

## Features

- Extract text from PDF and DOCX files
- Parse resume content into structured JSON
- Generate AI-optimized resumes and cover letters
- Provide downloadable optimized documents

## Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Run the server:**
   ```bash
   python app.py
   ```
   
   Or use the helper script:
   ```bash
   python run.py
   ```

3. **Server will start on:** `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns server status

### Extract and Optimize
- **POST** `/api/extract-and-optimize`
- **Form Data:**
  - `file`: PDF or DOCX resume file
  - `job_description`: Job description text
- **Returns:** Extracted text, parsed resume data, and optimization analysis

### Download Resume
- **GET** `/api/download/resume/<file_id>`
- Downloads optimized resume file

### Download Cover Letter
- **GET** `/api/download/cover-letter/<file_id>`
- Downloads optimized cover letter file

## File Structure

```
backend/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── run.py             # Helper script to run server
├── uploads/           # Temporary file uploads (auto-created)
├── generated/         # Generated documents (auto-created)
└── README.md          # This file
```

## Development

The backend includes:
- CORS support for frontend integration
- File upload handling with security
- Text extraction from PDF/DOCX
- Mock AI optimization (replace with actual AI logic)
- Temporary file cleanup
- Error handling and logging

## Next Steps

1. Replace mock AI functions with actual AI/ML models
2. Add authentication and rate limiting
3. Implement more sophisticated resume parsing
4. Add support for more file formats
5. Integrate with external AI services (OpenAI, etc.)