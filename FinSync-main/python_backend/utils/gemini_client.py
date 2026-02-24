# utils/gemini_client.py

import os
import google.generativeai as genai
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from multiple possible locations
load_dotenv()  # Load from current directory
load_dotenv(Path(__file__).parent.parent / '.env')  # Load from python_backend/.env
load_dotenv(Path(__file__).parent.parent.parent / '.env')  # Load from project root/.env

api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

if not api_key:
    print("ERROR: Google API key not found!")
    print("Please set GOOGLE_API_KEY environment variable.")
    print("Get your API key from: https://makersuite.google.com/app/apikey")
    raise ValueError("Missing Google API key")

genai.configure(api_key=api_key)

gemini_model = genai.GenerativeModel("gemini-1.5-flash")

def generate_response_with_file(prompt, file_path):
    try:
        from pathlib import Path
        
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"[Gemini Client] File not found: {file_path}")
            return ""
        
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            print(f"[Gemini Client] File is empty: {file_path}")
            return ""
        
        print(f"[Gemini Client] Processing file: {file_path} ({file_size} bytes)")
        
        # Determine mime type based on file extension
        ext = Path(file_path).suffix.lower()
        if ext == '.pdf':
            mime_type = "application/pdf"
        elif ext in ['.png', '.jpg', '.jpeg']:
            mime_type = f"image/{ext[1:]}" if ext != '.jpg' else "image/jpeg"
        elif ext == '.txt':
            # For text files, just read and process as text
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text_content = f.read()
            response = gemini_model.generate_content(f"{prompt}\n\nText content:\n{text_content}")
            return response.text
        else:
            mime_type = "application/pdf"  # default
        
        with open(file_path, "rb") as f:
            file_data = f.read()

        parts = [
            {"mime_type": mime_type, "data": file_data},
            {"text": prompt}
        ]

        print(f"[Gemini Client] Sending {mime_type} file to Gemini API...")
        response = gemini_model.generate_content(parts)
        
        if response and response.text:
            print(f"[Gemini Client] Successfully received response ({len(response.text)} chars)")
            return response.text
        else:
            print("[Gemini Client] Empty response from Gemini")
            return ""

    except Exception as e:
        print(f"[Gemini Client] Error in generate_response_with_file: {e}")
        return ""