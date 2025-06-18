# Node.js Backend API for Document Processing

This Node.js Express backend handles document text extraction and AI-powered resume optimization.

## Features

- Extract text from PDF and DOCX files
- Parse resume content into structured JSON
- Generate AI-optimized resumes and cover letters
- Provide downloadable optimized documents
- CORS support for frontend integration
- File upload handling with security

## Setup

1. **Install Node.js dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Run the server:**
   ```bash
   npm start
   ```
   
   Or for development:
   ```bash
   npm run dev
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

## Dependencies

- **express**: Web framework
- **cors**: Cross-origin resource sharing
- **multer**: File upload handling
- **pdf-parse**: PDF text extraction
- **mammoth**: DOCX text extraction
- **uuid**: Unique ID generation

## File Structure

```
backend/
├── server.js          # Main Express application
├── package.json       # Node.js dependencies
├── uploads/           # Temporary file uploads (auto-created)
├── generated/         # Generated documents (auto-created)
└── README.md          # This file
```

## Development

The backend includes:
- Express.js server with CORS support
- Multer for secure file upload handling
- PDF and DOCX text extraction
- Mock AI optimization (replace with actual AI logic)
- Automatic file cleanup
- Comprehensive error handling
- File size and type validation

## Security Features

- File type validation (PDF, DOC, DOCX only)
- File size limits (10MB max)
- Secure filename handling
- Temporary file cleanup
- Input validation

## Next Steps

1. Replace mock AI functions with actual AI/ML models
2. Add authentication and rate limiting
3. Implement more sophisticated resume parsing
4. Add support for more file formats
5. Integrate with external AI services (OpenAI, etc.)
6. Add logging and monitoring
7. Implement caching for better performance