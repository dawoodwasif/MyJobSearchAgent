const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create directories
const UPLOAD_FOLDER = path.join(__dirname, 'uploads');
const GENERATED_FOLDER = path.join(__dirname, 'generated');

async function ensureDirectories() {
  try {
    await fs.mkdir(UPLOAD_FOLDER, { recursive: true });
    await fs.mkdir(GENERATED_FOLDER, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_FOLDER);
  },
  filename: function (req, file, cb) {
    const fileId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${fileId}_${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'), false);
    }
  }
});

// Utility functions
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`Error extracting text from PDF: ${error.message}`);
  }
}

async function extractTextFromDocx(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    throw new Error(`Error extracting text from DOCX: ${error.message}`);
  }
}

async function extractTextFromFile(filePath, mimeType) {
  if (mimeType === 'application/pdf') {
    return await extractTextFromPDF(filePath);
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
             mimeType === 'application/msword') {
    return await extractTextFromDocx(filePath);
  } else {
    // Fallback for text files
    return await fs.readFile(filePath, 'utf-8');
  }
}

function parseResumeText(text) {
  // Simple resume parsing logic
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  const resumeData = {
    personal: {
      name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: ""
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  };
  
  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    resumeData.personal.email = emailMatch[0];
  }
  
  // Extract phone (simple pattern)
  const phoneRegex = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    resumeData.personal.phone = phoneMatch[0];
  }
  
  // Use first non-empty line as name if no name detected
  if (!resumeData.personal.name && lines.length > 0) {
    resumeData.personal.name = lines[0];
  }
  
  // Extract skills (look for common skill keywords)
  const skillKeywords = ['javascript', 'python', 'react', 'node', 'sql', 'aws', 'git', 'docker', 'kubernetes'];
  const foundSkills = [];
  const textLower = text.toLowerCase();
  
  skillKeywords.forEach(skill => {
    if (textLower.includes(skill)) {
      foundSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });
  
  resumeData.skills = foundSkills;
  
  return resumeData;
}

function generateOptimizedResume(resumeData, jobDescription) {
  const name = resumeData.personal.name || 'John Doe';
  const email = resumeData.personal.email || 'john.doe@email.com';
  const phone = resumeData.personal.phone || '+1 (555) 123-4567';
  
  return `OPTIMIZED RESUME

${name}
${email}
${phone}

PROFESSIONAL SUMMARY
Experienced professional with strong background in the requirements mentioned in the job posting.
Optimized based on job description keywords and requirements.

EXPERIENCE
• Enhanced experience descriptions based on job requirements
• Quantified achievements with relevant metrics
• Highlighted skills that match the job posting

SKILLS
${resumeData.skills.length > 0 ? resumeData.skills.join(', ') : 'Technical skills aligned with job requirements'}
• Soft skills relevant to the position
• Industry-specific competencies

EDUCATION
• Relevant educational background
• Certifications that match job requirements

This resume has been optimized using AI to match the job description provided.
Generated on: ${new Date().toISOString()}
`;
}

function generateCoverLetter(resumeData, jobDescription) {
  const name = resumeData.personal.name || 'John Doe';
  
  return `COVER LETTER

Dear Hiring Manager,

I am writing to express my strong interest in the position described in your job posting. 
Based on my background and the requirements outlined, I believe I would be an excellent 
fit for this role.

My experience includes:
• Relevant skills that match your job requirements
• Proven track record of success in similar roles
• Strong technical and interpersonal abilities

I am particularly excited about this opportunity because it aligns perfectly with my 
career goals and expertise. The job description highlights several areas where my 
background would be valuable.

I would welcome the opportunity to discuss how my skills and experience can contribute 
to your team's success. Thank you for considering my application.

Sincerely,
${name}

Generated on: ${new Date().toISOString()}
`;
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Backend is running' });
});

app.post('/api/extract-and-optimize', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    const jobDescription = req.body.job_description || '';
    const filePath = req.file.path;
    const fileId = path.basename(req.file.filename, path.extname(req.file.filename)).split('_')[0];
    
    try {
      // Extract text from file
      const extractedText = await extractTextFromFile(filePath, req.file.mimetype);
      
      // Parse text into structured format
      const resumeData = parseResumeText(extractedText);
      
      // Generate optimized documents
      const optimizedResume = generateOptimizedResume(resumeData, jobDescription);
      const optimizedCoverLetter = generateCoverLetter(resumeData, jobDescription);
      
      // Save generated documents
      const resumeFilename = `resume_${fileId}.txt`;
      const coverLetterFilename = `cover_letter_${fileId}.txt`;
      
      const resumePath = path.join(GENERATED_FOLDER, resumeFilename);
      const coverLetterPath = path.join(GENERATED_FOLDER, coverLetterFilename);
      
      await fs.writeFile(resumePath, optimizedResume, 'utf-8');
      await fs.writeFile(coverLetterPath, optimizedCoverLetter, 'utf-8');
      
      // Generate download URLs
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const resumeUrl = `${baseUrl}/api/download/resume/${fileId}`;
      const coverLetterUrl = `${baseUrl}/api/download/cover-letter/${fileId}`;
      
      // Mock analysis results
      const analysisResults = {
        matchScore: 85,
        summary: "Your resume shows strong alignment with this position, with excellent technical skills and relevant experience. The AI optimization has enhanced keyword density and improved content structure for better ATS compatibility.",
        strengths: [
          "Strong technical background in required technologies",
          "Relevant industry experience with measurable achievements",
          "Good educational background aligned with job requirements",
          "Demonstrated leadership and project management skills"
        ],
        gaps: [
          "Missing some specific certifications mentioned in job posting",
          "Could emphasize cloud computing experience more prominently",
          "Limited mention of agile methodology experience"
        ],
        suggestions: [
          "Add specific metrics to quantify your achievements",
          "Include more industry-specific keywords throughout the resume",
          "Highlight collaborative projects and team leadership examples",
          "Consider adding a professional summary section"
        ],
        optimizedResumeUrl: resumeUrl,
        optimizedCoverLetterUrl: coverLetterUrl,
        keywordAnalysis: {
          coverageScore: 78,
          coveredKeywords: ["JavaScript", "React", "Node.js", "AWS", "Git", "Agile", "Team Leadership"],
          missingKeywords: ["Docker", "Kubernetes", "CI/CD", "Microservices"]
        },
        experienceOptimization: [
          {
            company: "Tech Solutions Inc",
            position: "Senior Developer",
            relevanceScore: 92,
            included: true
          },
          {
            company: "StartupXYZ",
            position: "Full Stack Developer",
            relevanceScore: 85,
            included: true
          }
        ],
        skillsOptimization: {
          technicalSkills: ["JavaScript", "React", "Node.js", "Python", "AWS", "MongoDB"],
          softSkills: ["Team Leadership", "Problem Solving", "Communication", "Project Management"],
          missingSkills: ["Docker", "Kubernetes", "GraphQL", "TypeScript"]
        },
        parsedResume: resumeData
      };
      
      res.json({
        success: true,
        message: "Documents processed and optimized successfully",
        extractedText: extractedText.length > 500 ? extractedText.substring(0, 500) + "..." : extractedText,
        resumeData: resumeData,
        analysis: analysisResults
      });
      
    } finally {
      // Clean up uploaded file
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error cleaning up uploaded file:', error);
      }
    }
    
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/download/resume/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const filename = `resume_${fileId}.txt`;
    const filePath = path.join(GENERATED_FOLDER, filename);
    
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const downloadName = `optimized_resume_${new Date().toISOString().split('T')[0]}.txt`;
    res.download(filePath, downloadName);
    
  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/download/cover-letter/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const filename = `cover_letter_${fileId}.txt`;
    const filePath = path.join(GENERATED_FOLDER, filename);
    
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const downloadName = `optimized_cover_letter_${new Date().toISOString().split('T')[0]}.txt`;
    res.download(filePath, downloadName);
    
  } catch (error) {
    console.error('Error downloading cover letter:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 10MB.' });
    }
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ error: error.message || 'Internal server error' });
});

// Start server
async function startServer() {
  await ensureDirectories();
  
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📁 Upload folder: ${UPLOAD_FOLDER}`);
    console.log(`📄 Generated folder: ${GENERATED_FOLDER}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer().catch(console.error);