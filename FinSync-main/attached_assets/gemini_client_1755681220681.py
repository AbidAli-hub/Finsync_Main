# utils/gemini_client.py

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '_1755681198276.env'))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def generate_response_with_file(prompt, file_path):
    if not GEMINI_API_KEY:
        raise ValueError("Gemini API key not found. Check your .env file.")
    # ...existing Gemini API call logic using GEMINI_API_KEY...
