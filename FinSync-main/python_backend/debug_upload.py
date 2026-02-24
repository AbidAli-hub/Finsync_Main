#!/usr/bin/env python3
import os
import sys
import time
import json
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def monitor_and_debug_uploads():
    """Monitor uploads and provide real-time debugging"""
    print("=== REAL-TIME UPLOAD DEBUGGING ===")
    print("Monitoring temp_uploads for new files...")
    print("When a file is uploaded, detailed analysis will be shown")
    print("Press Ctrl+C to stop")
    print("-" * 60)
    
    temp_dir = Path("temp_uploads")
    seen_files = set()
    
    try:
        while True:
            if temp_dir.exists():
                current_files = set(temp_dir.glob("*"))
                
                # Check for new files
                new_files = current_files - seen_files
                for new_file in new_files:
                    if new_file.is_file():
                        print(f"\n🆕 NEW FILE DETECTED: {new_file.name}")
                        analyze_uploaded_file(str(new_file))
                
                seen_files = current_files
            
            time.sleep(1)  # Check every second
            
    except KeyboardInterrupt:
        print("\n⏹️ Monitoring stopped")

def analyze_uploaded_file(file_path):
    """Analyze a specific uploaded file in detail"""
    print(f"\n📋 ANALYZING: {file_path}")
    print("=" * 50)
    
    try:
        # Basic file info
        file_size = os.path.getsize(file_path)
        print(f"📁 File size: {file_size} bytes")
        
        if file_size == 0:
            print("❌ ERROR: File is empty!")
            return
        
        # Test PyMuPDF
        print("\n🔍 TESTING PyMuPDF extraction...")
        try:
            import fitz
            doc = fitz.open(file_path)
            print(f"📄 PDF has {len(doc)} pages")
            
            text_content = ""
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                page_text = page.get_text()
                text_content += page_text
                print(f"   Page {page_num + 1}: {len(page_text)} characters")
            
            doc.close()
            
            if text_content.strip():
                print(f"✅ PyMuPDF SUCCESS: Extracted {len(text_content)} characters")
                print("Sample text:")
                print("-" * 30)
                print(text_content[:200])
                print("-" * 30)
            else:
                print("⚠️ PyMuPDF: No text found (possibly image-based PDF)")
        except Exception as e:
            print(f"❌ PyMuPDF FAILED: {e}")
        
        # Test Gemini Vision
        print("\n🤖 TESTING Gemini Vision...")
        try:
            from utils.gemini_client import generate_response_with_file
            
            prompt = "Extract all readable text from this document. Focus on any invoice information."
            response = generate_response_with_file(prompt, file_path)
            
            if response and response.strip():
                print(f"✅ GEMINI SUCCESS: Got {len(response)} characters")
                print("Sample response:")
                print("-" * 30)
                print(response[:300])
                print("-" * 30)
            else:
                print("❌ GEMINI: No response or empty response")
        except Exception as e:
            print(f"❌ GEMINI FAILED: {e}")
        
        # Test full OCR agent
        print("\n🔧 TESTING Full OCR Agent...")
        try:
            from agents.ocr_agent import ocr_agent
            
            state = {"file_path": file_path}
            result = ocr_agent(state)
            
            raw_text = result.get("raw_text", "")
            if raw_text:
                print(f"✅ OCR AGENT SUCCESS: {len(raw_text)} characters")
                print("Sample extracted text:")
                print("-" * 30)
                print(raw_text[:300])
                print("-" * 30)
            else:
                print("❌ OCR AGENT: No text extracted")
        except Exception as e:
            print(f"❌ OCR AGENT FAILED: {e}")
        
        # Test parser
        if 'raw_text' in locals() and raw_text:
            print("\n📊 TESTING Parser Agent...")
            try:
                from agents.parser_agent import parser_agent
                
                parser_state = {"raw_text": raw_text, "file_path": file_path}
                parser_result = parser_agent(parser_state)
                
                gst_data = parser_result.get("gst_data", [])
                if gst_data:
                    print(f"✅ PARSER SUCCESS: Found {len(gst_data)} GST records")
                    for i, record in enumerate(gst_data):
                        shop_name = record.get("Shop Name", "N/A")
                        amount = record.get("Total Amount", "N/A")
                        print(f"   Record {i+1}: {shop_name} - Amount: {amount}")
                else:
                    print("❌ PARSER: No GST data found")
            except Exception as e:
                print(f"❌ PARSER FAILED: {e}")
        
        print(f"\n✅ Analysis complete for {os.path.basename(file_path)}")
        
    except Exception as e:
        import traceback
        print(f"❌ ANALYSIS FAILED: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    monitor_and_debug_uploads()