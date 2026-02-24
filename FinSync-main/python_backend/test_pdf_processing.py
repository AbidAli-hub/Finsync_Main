#!/usr/bin/env python3
import os
import sys
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_pdf_processing():
    """Test PDF processing with enhanced debugging"""
    print("Testing PDF processing...")
    
    try:
        from utils.gemini_client import generate_response_with_file
        
        # Test with a simple prompt to see if Gemini can read files at all
        print("\n1. Testing basic file reading capability...")
        
        # Create a simple test file
        test_file_path = "test_sample.txt"
        with open(test_file_path, "w") as f:
            f.write("This is a test file with some sample text.")
        
        response = generate_response_with_file("What does this file contain?", test_file_path)
        print(f"Basic file test response: {response[:100]}...")
        
        # Clean up
        os.remove(test_file_path)
        
        # Now test with actual OCR agent
        print("\n2. Testing OCR agent directly...")
        from agents.ocr_agent import ocr_agent
        
        # Look for any existing PDF in temp_uploads or create a dummy state
        temp_uploads = Path("temp_uploads")
        pdf_files = list(temp_uploads.glob("*.pdf"))
        
        if pdf_files:
            test_state = {"file_path": str(pdf_files[0])}
            print(f"Testing with existing PDF: {pdf_files[0]}")
            result = ocr_agent(test_state)
            print(f"OCR result keys: {result.keys()}")
            print(f"Raw text length: {len(result.get('raw_text', ''))}")
            if result.get('raw_text'):
                print(f"First 200 chars: {result['raw_text'][:200]}...")
            else:
                print("No text extracted!")
        else:
            print("No PDF files found in temp_uploads for testing")
        
        print("\n3. Testing parser agent...")
        from agents.parser_agent import parser_agent
        
        # Test with sample raw text
        sample_text = """
        Invoice Number: INV-001
        Shop Name: ABC Electronics
        GSTIN: 29AABCT1332L000
        Invoice Date: 2024-01-15
        Total Amount: 11800
        CGST: 900
        SGST: 900
        HSN: 8517
        """
        
        test_state = {
            "raw_text": sample_text,
            "file_path": "dummy.pdf"
        }
        
        result = parser_agent(test_state)
        print(f"Parser result: {result.get('gst_data', [])}")
        
    except Exception as e:
        import traceback
        print(f"Error in PDF processing test: {e}")
        print(f"Traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    test_pdf_processing()