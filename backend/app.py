from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
import tempfile
import uuid
from datetime import datetime
from pdfminer.high_level import extract_text
import docx2txt
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
GENERATED_FOLDER = 'generated'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(GENERATED_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    """Extract text from PDF file"""
    try:
        return extract_text(file_path)
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")

def extract_text_from_docx(file_path):
    """Extract text from DOCX file"""
    try:
        return docx2txt.process(file_path)
    except Exception as e:
        raise Exception(f"Error extracting text from DOCX: {str(e)}")

def extract_text_from_upload(file_path, file_type):
    """Extract text from uploaded file based on type"""
    if file_type == "application/pdf":
        return extract_text_from_pdf(file_path)
    elif file_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"]:
        return extract_text_from_docx(file_path)
    elif file_type == "application/json":
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()

def escape_for_latex(data):
    """Escape special characters for LaTeX"""
    if isinstance(data, dict):
        new_data = {}
        for key in data.keys():
            new_data[key] = escape_for_latex(data[key])
        return new_data
    elif isinstance(data, list):
        return [escape_for_latex(item) for item in data]
    elif isinstance(data, str):
        latex_special_chars = {
            "&": r"\&",
            "%": r"\%",
            "$": r"\$",
            "#": r"\#",
            "_": r"\_",
            "{": r"\{",
            "}": r"\}",
            "~": r"\textasciitilde{}",
            "^": r"\^{}",
            "\\": r"\textbackslash{}",
            "\n": "\\newline%\n",
            "-": r"{-}",
            "\xA0": "~",
            "[": r"{[}",
            "]": r"{]}",
        }
        return "".join([latex_special_chars.get(c, c) for c in data])
    return data

def parse_resume_text(text):
    """Parse extracted text into structured JSON format"""
    # This is a simplified parser - you can enhance this with more sophisticated NLP
    lines = text.split('\n')
    
    resume_data = {
        "personal": {
            "name": "",
            "email": "",
            "phone": "",
            "location": "",
            "linkedin": "",
            "website": ""
        },
        "summary": "",
        "experience": [],
        "education": [],
        "skills": [],
        "projects": [],
        "certifications": []
    }
    
    # Simple parsing logic (you can enhance this)
    current_section = None
    current_experience = {}
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Detect email
        if '@' in line and not resume_data["personal"]["email"]:
            resume_data["personal"]["email"] = line
            
        # Detect phone (simple pattern)
        if any(char.isdigit() for char in line) and ('(' in line or '-' in line or len([c for c in line if c.isdigit()]) >= 10):
            if not resume_data["personal"]["phone"]:
                resume_data["personal"]["phone"] = line
                
        # Detect sections
        line_lower = line.lower()
        if 'experience' in line_lower or 'employment' in line_lower:
            current_section = 'experience'
        elif 'education' in line_lower:
            current_section = 'education'
        elif 'skill' in line_lower:
            current_section = 'skills'
        elif 'project' in line_lower:
            current_section = 'projects'
        elif 'certification' in line_lower or 'certificate' in line_lower:
            current_section = 'certifications'
    
    # If no name detected, use first non-empty line as name
    if not resume_data["personal"]["name"] and lines:
        resume_data["personal"]["name"] = lines[0].strip()
    
    return resume_data

def generate_optimized_resume(resume_data, job_description):
    """Generate optimized resume content"""
    # This is a mock implementation - replace with actual AI logic
    optimized_content = f"""
OPTIMIZED RESUME

{resume_data.get('personal', {}).get('name', 'John Doe')}
{resume_data.get('personal', {}).get('email', 'john.doe@email.com')}
{resume_data.get('personal', {}).get('phone', '+1 (555) 123-4567')}

PROFESSIONAL SUMMARY
Experienced professional with strong background in the requirements mentioned in the job posting.
Optimized based on job description keywords and requirements.

EXPERIENCE
• Enhanced experience descriptions based on job requirements
• Quantified achievements with relevant metrics
• Highlighted skills that match the job posting

SKILLS
• Technical skills aligned with job requirements
• Soft skills relevant to the position
• Industry-specific competencies

EDUCATION
• Relevant educational background
• Certifications that match job requirements

This resume has been optimized using AI to match the job description provided.
Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
    return optimized_content

def generate_cover_letter(resume_data, job_description):
    """Generate optimized cover letter"""
    # This is a mock implementation - replace with actual AI logic
    name = resume_data.get('personal', {}).get('name', 'John Doe')
    
    cover_letter_content = f"""
COVER LETTER

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
{name}

Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
    return cover_letter_content

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Backend is running"})

@app.route('/api/extract-and-optimize', methods=['POST'])
def extract_and_optimize():
    """Extract text from uploaded file and generate optimized documents"""
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        job_description = request.form.get('job_description', '')
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400
        
        # Save uploaded file temporarily
        filename = secure_filename(file.filename)
        file_id = str(uuid.uuid4())
        temp_filename = f"{file_id}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, temp_filename)
        file.save(file_path)
        
        try:
            # Extract text from file
            extracted_text = extract_text_from_upload(file_path, file.content_type)
            
            # Parse text into structured format
            resume_data = parse_resume_text(extracted_text)
            
            # Generate optimized documents
            optimized_resume = generate_optimized_resume(resume_data, job_description)
            optimized_cover_letter = generate_cover_letter(resume_data, job_description)
            
            # Save generated documents
            resume_filename = f"resume_{file_id}.txt"
            cover_letter_filename = f"cover_letter_{file_id}.txt"
            
            resume_path = os.path.join(GENERATED_FOLDER, resume_filename)
            cover_letter_path = os.path.join(GENERATED_FOLDER, cover_letter_filename)
            
            with open(resume_path, 'w', encoding='utf-8') as f:
                f.write(optimized_resume)
            
            with open(cover_letter_path, 'w', encoding='utf-8') as f:
                f.write(optimized_cover_letter)
            
            # Generate download URLs
            base_url = request.url_root.rstrip('/')
            resume_url = f"{base_url}/api/download/resume/{file_id}"
            cover_letter_url = f"{base_url}/api/download/cover-letter/{file_id}"
            
            # Mock analysis results
            analysis_results = {
                "matchScore": 85,
                "summary": "Your resume shows strong alignment with this position, with excellent technical skills and relevant experience. The AI optimization has enhanced keyword density and improved content structure for better ATS compatibility.",
                "strengths": [
                    "Strong technical background in required technologies",
                    "Relevant industry experience with measurable achievements",
                    "Good educational background aligned with job requirements",
                    "Demonstrated leadership and project management skills"
                ],
                "gaps": [
                    "Missing some specific certifications mentioned in job posting",
                    "Could emphasize cloud computing experience more prominently",
                    "Limited mention of agile methodology experience"
                ],
                "suggestions": [
                    "Add specific metrics to quantify your achievements",
                    "Include more industry-specific keywords throughout the resume",
                    "Highlight collaborative projects and team leadership examples",
                    "Consider adding a professional summary section"
                ],
                "optimizedResumeUrl": resume_url,
                "optimizedCoverLetterUrl": cover_letter_url,
                "keywordAnalysis": {
                    "coverageScore": 78,
                    "coveredKeywords": ["JavaScript", "React", "Node.js", "AWS", "Git", "Agile", "Team Leadership"],
                    "missingKeywords": ["Docker", "Kubernetes", "CI/CD", "Microservices"]
                },
                "experienceOptimization": [
                    {
                        "company": "Tech Solutions Inc",
                        "position": "Senior Developer",
                        "relevanceScore": 92,
                        "included": True
                    },
                    {
                        "company": "StartupXYZ",
                        "position": "Full Stack Developer",
                        "relevanceScore": 85,
                        "included": True
                    }
                ],
                "skillsOptimization": {
                    "technicalSkills": ["JavaScript", "React", "Node.js", "Python", "AWS", "MongoDB"],
                    "softSkills": ["Team Leadership", "Problem Solving", "Communication", "Project Management"],
                    "missingSkills": ["Docker", "Kubernetes", "GraphQL", "TypeScript"]
                },
                "parsedResume": resume_data
            }
            
            return jsonify({
                "success": True,
                "message": "Documents processed and optimized successfully",
                "extractedText": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text,
                "resumeData": resume_data,
                "analysis": analysis_results
            })
            
        finally:
            # Clean up uploaded file
            if os.path.exists(file_path):
                os.remove(file_path)
                
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/download/resume/<file_id>', methods=['GET'])
def download_resume(file_id):
    """Download optimized resume"""
    try:
        filename = f"resume_{file_id}.txt"
        file_path = os.path.join(GENERATED_FOLDER, filename)
        
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
        
        return send_file(
            file_path,
            as_attachment=True,
            download_name=f"optimized_resume_{datetime.now().strftime('%Y%m%d')}.txt",
            mimetype='text/plain'
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/download/cover-letter/<file_id>', methods=['GET'])
def download_cover_letter(file_id):
    """Download optimized cover letter"""
    try:
        filename = f"cover_letter_{file_id}.txt"
        file_path = os.path.join(GENERATED_FOLDER, filename)
        
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
        
        return send_file(
            file_path,
            as_attachment=True,
            download_name=f"optimized_cover_letter_{datetime.now().strftime('%Y%m%d')}.txt",
            mimetype='text/plain'
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)