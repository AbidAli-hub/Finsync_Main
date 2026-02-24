#!/usr/bin/env python3
import json
import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_clean_json_output():
    """Test that the JSON output is clean and parseable"""
    print("=== TESTING CLEAN JSON OUTPUT ===")
    
    # Simulate the Python processing with clean output
    sample_invoices = [
        {
            "Shop Name": "Test Electronics",
            "GSTIN": "29AABCT1332L000",
            "Invoice Number": "INV-001",
            "Invoice Date": "2024-01-15",
            "Total Amount": 11800,
            "Tax Amount": 1800,
            "CGST": 900,
            "SGST": 900,
            "IGST": "N/A",
            "Items": [{"HSN Code": "8517"}]
        }
    ]
    
    # Create the result as the Python script would
    result = {
        "success": True,
        "message": f"Successfully processed 1 files and extracted {len(sample_invoices)} invoices",
        "output_file": "output/test.xlsx",
        "invoices_count": len(sample_invoices)
    }
    
    # Print status messages
    print(f"[SUCCESS] Total extracted invoices: {len(sample_invoices)}", flush=True)
    for i, invoice in enumerate(sample_invoices):
        shop_name = invoice.get('Shop Name', 'Unknown')
        amount = invoice.get('Total Amount', 'N/A')
        print(f"[INVOICE {i+1}] {shop_name} - Amount: {amount}", flush=True)
    
    # Print clean JSON result (this is what Node.js will parse)
    json_output = json.dumps(result, separators=(',', ':'))
    print(f"[RESULT] {json_output}", flush=True)
    
    # Test parsing the JSON output (simulate Node.js parsing)
    try:
        # Extract JSON like Node.js does
        output_text = f"[SUCCESS] Total extracted invoices: {len(sample_invoices)}\n[INVOICE 1] Test Electronics - Amount: 11800\n[RESULT] {json_output}\n"
        
        # Test the regex pattern from Node.js
        import re
        result_match = re.search(r'\[RESULT\]\s*({[^}]*(?:{[^}]*}[^}]*)*})', output_text, re.DOTALL)
        
        if result_match:
            parsed_result = json.loads(result_match.group(1))
            print(f"✅ JSON parsing test PASSED")
            print(f"   Parsed success: {parsed_result['success']}")
            print(f"   Parsed invoices_count: {parsed_result['invoices_count']}")
            print(f"   Parsed message: {parsed_result['message']}")
            return True
        else:
            print("❌ JSON parsing test FAILED - No regex match")
            return False
            
    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing test FAILED - JSON error: {e}")
        return False
    except Exception as e:
        print(f"❌ JSON parsing test FAILED - Error: {e}")
        return False

if __name__ == "__main__":
    success = test_clean_json_output()
    if success:
        print("\n✅ JSON OUTPUT TEST PASSED - Node.js should be able to parse the output correctly")
    else:
        print("\n❌ JSON OUTPUT TEST FAILED - There may still be parsing issues")