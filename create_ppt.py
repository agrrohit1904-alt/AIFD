from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN

prs = Presentation()

# Slide 1: Title
slide_layout = prs.slide_layouts[0] # Title slide
slide = prs.slides.add_slide(slide_layout)
title = slide.shapes.title
subtitle = slide.placeholders[1]

title.text = "Next-Gen AI-Powered Identity Verification & Anti-Spoofing System"
subtitle.text = "Team Name: [Insert Your Team Name]\nSmart India Hackathon 2026"

# Slide 2: Proposed Solution
slide_layout = prs.slide_layouts[1] # Title and Content
slide = prs.slides.add_slide(slide_layout)
title = slide.shapes.title
title.text = "Proposed Solution"

content = slide.placeholders[1]
tf = content.text_frame
tf.text = "Detailed Explanation:"
p = tf.add_paragraph()
p.text = "Robust, automated 4-stage KYC pipeline to instantly verify identity documents and live selfies."
p.level = 1
p = tf.add_paragraph()
p.text = "Integrates OCR, metadata analysis, and deep learning facial recognition."
p.level = 1

p = tf.add_paragraph()
p.text = "How it Addresses the Problem:"
p.level = 0
p = tf.add_paragraph()
p.text = "Eliminates manual verification bottlenecks by fully automating KYC onboarding."
p.level = 1
p = tf.add_paragraph()
p.text = "Prevents identity fraud by detecting forged documents and spoofed photos in real-time."
p.level = 1

p = tf.add_paragraph()
p.text = "Innovation and Uniqueness:"
p.level = 0
p = tf.add_paragraph()
p.text = "Multi-layered Defense: Error Level Analysis (ELA) + EXIF data extraction for pixel-level tampering."
p.level = 1
p = tf.add_paragraph()
p.text = "Deep Learning Matching: ArcFace neural network embeddings handle massive age gaps/lighting."
p.level = 1

# Slide 3: Technical Approach
slide_layout = prs.slide_layouts[1]
slide = prs.slides.add_slide(slide_layout)
title = slide.shapes.title
title.text = "Technical Approach"

content = slide.placeholders[1]
tf = content.text_frame
tf.text = "Technologies Used:"
p = tf.add_paragraph()
p.text = "Frontend: React, Vite, Tailwind CSS, WebRTC."
p.level = 1
p = tf.add_paragraph()
p.text = "Backend: FastAPI (Python), SQLite (Audit Database)."
p.level = 1
p = tf.add_paragraph()
p.text = "AI/ML: InsightFace (RetinaFace + ArcFace), PyTesseract (OCR), OpenCV."
p.level = 1

p = tf.add_paragraph()
p.text = "Methodology and Implementation:"
p.level = 0
p = tf.add_paragraph()
p.text = "Step 1: Ingestion via Live Webcam Capture."
p.level = 1
p = tf.add_paragraph()
p.text = "Step 2: OCR Extraction and MRZ Parsing."
p.level = 1
p = tf.add_paragraph()
p.text = "Step 3: Interpol Blacklist & Document Tampering validation."
p.level = 1
p = tf.add_paragraph()
p.text = "Step 4: 512-D ArcFace embedding for Face Verification."
p.level = 1
p = tf.add_paragraph()
p.text = "Step 5: Weighted Risk Scoring and SQLite Audit Logging."
p.level = 1

# Slide 4: Feasibility and Viability
slide_layout = prs.slide_layouts[1]
slide = prs.slides.add_slide(slide_layout)
title = slide.shapes.title
title.text = "Feasibility and Viability"

content = slide.placeholders[1]
tf = content.text_frame
tf.text = "Analysis of Feasibility:"
p = tf.add_paragraph()
p.text = "High Feasibility: Prototype is fully functional, containerizable, and built on open-source libraries."
p.level = 1
p = tf.add_paragraph()
p.text = "Scalability: Stateless FastAPI architecture allows easy horizontal scaling."
p.level = 1

p = tf.add_paragraph()
p.text = "Potential Challenges & Risks:"
p.level = 0
p = tf.add_paragraph()
p.text = "Processing bottlenecks from heavy Deep Learning inferences during traffic spikes."
p.level = 1
p = tf.add_paragraph()
p.text = "OCR failures on extremely damaged or blurry documents."
p.level = 1

p = tf.add_paragraph()
p.text = "Strategies for Overcoming Challenges:"
p.level = 0
p = tf.add_paragraph()
p.text = "Hardware Acceleration: Deploy InsightFace models on GPU-accelerated cloud instances."
p.level = 1
p = tf.add_paragraph()
p.text = "Image Preprocessing: Automated OpenCV enhancement (contrast/sharpening) prior to OCR."
p.level = 1

# Slide 5: Impact and Benefits
slide_layout = prs.slide_layouts[1]
slide = prs.slides.add_slide(slide_layout)
title = slide.shapes.title
title.text = "Impact and Benefits"

content = slide.placeholders[1]
tf = content.text_frame
tf.text = "Potential Impact on Target Audience:"
p = tf.add_paragraph()
p.text = "Financial Institutions & Govt: Enables instant, frictionless onboarding with strict compliance."
p.level = 1
p = tf.add_paragraph()
p.text = "End Users: Completely eliminates frustrating wait times for manual account approvals."
p.level = 1

p = tf.add_paragraph()
p.text = "Benefits (Social & Economic):"
p.level = 0
p = tf.add_paragraph()
p.text = "Economic: Drastically reduces operational costs and mitigates financial losses from fraud."
p.level = 1
p = tf.add_paragraph()
p.text = "Security: State-of-the-art Deep Learning prevents sophisticated spoofing attacks."
p.level = 1
p = tf.add_paragraph()
p.text = "Accountability: Automated SQLite audit logging ensures permanent transparency."
p.level = 1

# Save the presentation
prs.save('c:/Users/agrro/Desktop/SIH/SIH_Idea_Presentation.pptx')
print("PPT created successfully.")
