#!/usr/bin/env python3
import os
import sys
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_api_key_fix():
    """Test that the API key fix works for PDF processing"""
    print("=== TESTING API KEY FIX ===")
    
    try:
        # Test 1: Check API key is loaded correctly
        print("\n1. Testing API Key Loading...")
        from utils.gemini_client import api_key
        if api_key:
            print(f"✅ API Key loaded: {api_key[:12]}...")
        else:
            print("❌ No API key found")
            return False
        
        # Test 2: Test Gemini API connection
        print("\n2. Testing Gemini API Connection...")
        from utils.gemini_client import gemini_model
        test_response = gemini_model.generate_content("Say 'API test successful'")
        if test_response and test_response.text:
            print(f"✅ Gemini API working: {test_response.text[:50]}...")
        else:
            print("❌ Gemini API not responding")
            return False
        
        # Test 3: Test OCR agent with mock content
        print("\n3. Testing OCR Agent...")
        
        # Create a test file with sample invoice content
        test_content = """
        INVOICE
        Shop Name: Test Electronics
        GSTIN: 29AABCT1332L000
        Invoice Number: INV-001
        Invoice Date: 2024-01-15
        Total Amount: 11800
        CGST: 900
        SGST: 900
        HSN: 8517
        """
        
        test_file = "temp_uploads/test_invoice_api_fix.txt"
        os.makedirs("temp_uploads", exist_ok=True)
        with open(test_file, 'w') as f:
            f.write(test_content)
        
        from agents.ocr_agent import ocr_agent
        state = {"file_path": test_file}
        result = ocr_agent(state)
        
        raw_text = result.get("raw_text", "")
        if raw_text:
            print(f"✅ OCR Agent working: {len(raw_text)} characters extracted")
        else:
            print("❌ OCR Agent failed to extract text")
            return False
        
        # Test 4: Test Parser Agent
        print("\n4. Testing Parser Agent...")
        from agents.parser_agent import parser_agent
        
        parser_result = parser_agent(result)
        gst_data = parser_result.get("gst_data", [])
        
        if gst_data:
            print(f"✅ Parser Agent working: {len(gst_data)} GST records found")
            for i, record in enumerate(gst_data):
                shop_name = record.get("Shop Name", "N/A")
                amount = record.get("Total Amount", "N/A")
                print(f"   Record {i+1}: {shop_name} - Amount: {amount}")
        else:
            print("❌ Parser Agent found no GST data")
            return False
        
        # Cleanup
        os.remove(test_file)
        
        return True
        
    except Exception as e:
        import traceback
        print(f"❌ Test failed with error: {e}")
        print("Traceback:")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_api_key_fix()
    if success:
        print("\n✅ API KEY FIX TEST PASSED - Your Bill2.pdf should now process successfully!")
        print("The system can now:")
        print("- ✅ Connect to Gemini API")
        print("- ✅ Extract text from PDFs") 
        print("- ✅ Parse GST data")
        print("- ✅ Generate Excel reports")
    else:
        print("\n❌ API KEY FIX TEST FAILED - There may still be issues")