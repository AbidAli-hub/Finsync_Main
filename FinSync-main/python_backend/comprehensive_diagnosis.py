#!/usr/bin/env python3
import os
import sys
import json
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def comprehensive_pdf_diagnosis():
    """Comprehensive diagnosis of PDF processing issues"""
    print("=== COMPREHENSIVE PDF PROCESSING DIAGNOSIS ===")
    
    try:
        # Test 1: Check temp_uploads directory for recent files
        print("\n1. CHECKING TEMP UPLOADS...")
        temp_dir = Path("temp_uploads")
        if temp_dir.exists():
            files = list(temp_dir.glob("*"))
            print(f"Found {len(files)} files in temp_uploads:")
            for f in files:
                if f.is_file():
                    size = f.stat().st_size
                    print(f"  - {f.name}: {size} bytes")
                    if "Bill2" in f.name:
                        print(f"    >>> Found Bill2.pdf! Processing this file...")
                        return test_specific_file(str(f))
        else:
            print("temp_uploads directory doesn't exist")
            
        # Test 2: Look for Bill2.pdf in other common locations
        print("\n2. SEARCHING FOR Bill2.pdf...")
        search_paths = [
            Path("."),
            Path(".."),
            Path("../temp_uploads"),
            Path("temp_uploads")
        ]
        
        for search_path in search_paths:
            if search_path.exists():
                bill_files = list(search_path.glob("*Bill2*"))
                if bill_files:
                    print(f"Found Bill2 files in {search_path}:")
                    for f in bill_files:
                        print(f"  - {f}")
                        if f.suffix.lower() == '.pdf':
                            return test_specific_file(str(f))
        
        # Test 3: Create a mock test with sample PDF processing
        print("\n3. TESTING WITH SAMPLE PDF PROCESSING...")
        return test_pdf_processing_pipeline()
        
    except Exception as e:
        import traceback
        print(f"ERROR in diagnosis: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return False

def test_specific_file(file_path):
    """Test processing of a specific file"""
    print(f"\n=== TESTING SPECIFIC FILE: {file_path} ===")
    
    try:
        # Test file existence and basic info
        if not os.path.exists(file_path):
            print(f"ERROR: File does not exist: {file_path}")
            return False
            
        file_size = os.path.getsize(file_path)
        print(f"File size: {file_size} bytes")
        
        if file_size == 0:
            print("ERROR: File is empty!")
            return False
            
        # Test Step 1: OCR Agent
        print("\nSTEP 1: Testing OCR Agent...")
        from agents.ocr_agent import ocr_agent
        
        state = {"file_path": file_path}
        result = ocr_agent(state)
        
        raw_text = result.get("raw_text", "")
        print(f"OCR Result - Text length: {len(raw_text)}")
        
        if raw_text:
            print(f"First 500 characters of extracted text:")
            print("-" * 50)
            print(raw_text[:500])
            print("-" * 50)
        else:
            print("WARNING: No text extracted by OCR agent!")
            return False
            
        # Test Step 2: Parser Agent
        print("\nSTEP 2: Testing Parser Agent...")
        from agents.parser_agent import parser_agent
        
        parser_result = parser_agent(result)
        gst_data = parser_result.get("gst_data", [])
        
        print(f"Parser Result - GST data entries: {len(gst_data)}")
        
        if gst_data:
            print("Extracted GST Data:")
            for i, entry in enumerate(gst_data):
                print(f"  Entry {i+1}: {entry}")
        else:
            print("WARNING: No GST data extracted by parser!")
            
        # Test Step 3: Validator Agent  
        print("\nSTEP 3: Testing Validator Agent...")
        from agents.validator_agent import validator_agent
        
        validator_result = validator_agent(parser_result)
        validated = validator_result.get("validated", False)
        
        print(f"Validator Result - Validated: {validated}")
        
        # Test Step 4: Full Pipeline
        print("\nSTEP 4: Testing Full Pipeline...")
        from graphs.gst_extraction_graph import build_gst_graph
        
        graph = build_gst_graph()
        output_path = "output/Test_Output.xlsx"
        
        final_result = graph.invoke({
            "file_path": file_path,
            "output_path": output_path
        })
        
        final_gst_data = final_result.get("gst_data", [])
        print(f"Full Pipeline Result - GST data entries: {len(final_gst_data)}")
        
        if final_gst_data:
            print("SUCCESS: Full pipeline extracted GST data!")
            return True
        else:
            print("FAILURE: Full pipeline did not extract any GST data!")
            return False
            
    except Exception as e:
        import traceback
        print(f"ERROR in file processing: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return False

def test_pdf_processing_pipeline():
    """Test the PDF processing pipeline with enhanced debugging"""
    print("\n=== TESTING PDF PROCESSING PIPELINE ===")
    
    try:
        # Test API connectivity first
        print("\nTesting Gemini API connectivity...")
        from utils.gemini_client import gemini_model
        
        test_response = gemini_model.generate_content("Say 'API test successful'")
        print(f"API Test: {test_response.text[:50]}...")
        
        # Test with mock PDF content
        print("\nTesting with mock invoice content...")
        
        # Create a simple test file to simulate PDF processing
        test_content = """
        INVOICE
        Shop Name: Test Electronics Store
        GSTIN: 29AABCT1332L000
        Invoice Number: INV-2024-001
        Invoice Date: 2024-01-15
        
        Items:
        1. Mobile Phone - HSN: 8517 - Amount: 10000
        
        Tax Details:
        CGST (9%): 900
        SGST (9%): 900
        Total Tax: 1800
        Total Amount: 11800
        """
        
        # Test parser with this content
        from agents.parser_agent import parser_agent
        
        test_state = {
            "raw_text": test_content,
            "file_path": "test_invoice.pdf"  # Mock path
        }
        
        result = parser_agent(test_state)
        gst_data = result.get("gst_data", [])
        
        if gst_data:
            print("SUCCESS: Mock content processing works!")
            print(f"Extracted: {gst_data}")
            return True
        else:
            print("FAILURE: Even mock content processing failed!")
            return False
            
    except Exception as e:
        import traceback
        print(f"ERROR in pipeline test: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    success = comprehensive_pdf_diagnosis()
    if success:
        print("\n✓ DIAGNOSIS COMPLETE - Processing should work")
    else:
        print("\n✗ DIAGNOSIS FAILED - Issues found in processing pipeline")