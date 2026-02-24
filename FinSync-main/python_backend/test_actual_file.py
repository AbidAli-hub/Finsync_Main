#!/usr/bin/env python3
import os
import sys
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_with_actual_uploaded_file():
    """Test with the most recent uploaded file"""
    print("=== TESTING WITH ACTUAL UPLOADED FILE ===")
    
    # Create a test file that simulates the uploaded Bill2.pdf
    test_file_path = "temp_uploads/test_bill2.pdf"
    
    # For testing, let's create a sample PDF-like file (or use an existing one if available)
    # First, check if there are any recent files in temp_uploads
    temp_dir = Path("temp_uploads")
    if temp_dir.exists():
        recent_files = sorted(temp_dir.glob("*"), key=lambda p: p.stat().st_mtime, reverse=True)
        if recent_files:
            test_file_path = str(recent_files[0])
            print(f"Using most recent file: {test_file_path}")
        else:
            print("No recent files found, creating test file...")
            # Create a simple test PDF content (this won't be a real PDF but will test the pipeline)
            os.makedirs("temp_uploads", exist_ok=True)
            with open(test_file_path, "w") as f:
                f.write("This is a test file simulating Bill2.pdf content")
    
    if not os.path.exists(test_file_path):
        print(f"Cannot find or create test file: {test_file_path}")
        return False
    
    try:
        print(f"Testing file: {test_file_path}")
        print(f"File size: {os.path.getsize(test_file_path)} bytes")
        
        # Test each step individually
        print("\n1. Testing OCR Agent...")
        from agents.ocr_agent import ocr_agent
        
        state = {"file_path": test_file_path}
        ocr_result = ocr_agent(state)
        
        raw_text = ocr_result.get("raw_text", "")
        print(f"OCR extracted {len(raw_text)} characters")
        
        if raw_text:
            print("Raw text preview:")
            print("-" * 40)
            print(raw_text[:300])
            print("-" * 40)
        else:
            print("ERROR: OCR agent returned no text!")
            
            # Let's try to debug why
            print("\n--- OCR DEBUG ---")
            from utils.gemini_client import generate_response_with_file
            
            # Test direct Gemini call
            try:
                direct_result = generate_response_with_file("What text can you see in this file?", test_file_path)
                print(f"Direct Gemini result: {direct_result[:200] if direct_result else 'No result'}")
            except Exception as e:
                print(f"Direct Gemini call failed: {e}")
            
            # Test PyMuPDF if it's a PDF
            if test_file_path.endswith('.pdf'):
                try:
                    import fitz
                    doc = fitz.open(test_file_path)
                    text_content = ""
                    for page_num in range(len(doc)):
                        page = doc.load_page(page_num)
                        text_content += page.get_text()
                    doc.close()
                    print(f"PyMuPDF extracted: {len(text_content)} characters")
                    if text_content:
                        print(f"PyMuPDF preview: {text_content[:200]}")
                except Exception as e:
                    print(f"PyMuPDF failed: {e}")
            
            return False
        
        print("\n2. Testing Parser Agent...")
        from agents.parser_agent import parser_agent
        
        parser_result = parser_agent(ocr_result)
        gst_data = parser_result.get("gst_data", [])
        
        print(f"Parser extracted {len(gst_data)} GST records")
        
        if gst_data:
            print("GST Data:")
            for i, record in enumerate(gst_data):
                print(f"  Record {i+1}: {record}")
        else:
            print("ERROR: Parser agent returned no GST data!")
            print("This could be because:")
            print("- The PDF contains no invoice-like content")
            print("- The text format is not recognized as an invoice")
            print("- The Gemini parser couldn't extract structured data")
            return False
        
        print("\n3. Testing Full Pipeline...")
        from graphs.gst_extraction_graph import build_gst_graph
        
        graph = build_gst_graph()
        output_path = "output/Test_Bill2_Output.xlsx"
        
        final_result = graph.invoke({
            "file_path": test_file_path,
            "output_path": output_path
        })
        
        final_gst_data = final_result.get("gst_data", [])
        print(f"Full pipeline result: {len(final_gst_data)} GST records")
        
        if final_gst_data:
            print("SUCCESS: Full pipeline working!")
            return True
        else:
            print("FAILURE: Full pipeline produced no results!")
            return False
        
    except Exception as e:
        import traceback
        print(f"ERROR in testing: {e}")
        print("Traceback:")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_with_actual_uploaded_file()
    if success:
        print("\n✓ TEST PASSED - Processing should work for similar files")
    else:
        print("\n✗ TEST FAILED - Processing issues identified")