#!/usr/bin/env python3
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents.writer_agent import writer_agent

# Sample GST data with multiple invoices to showcase professional formatting
sample_gst_data = [
    {
        "Shop Name": "WESTSIDE\nSjr Zion, Survey",
        "GSTIN": "29AAACL1838J1ZC",
        "Invoice Number": "W089 100169940",
        "Invoice Date": "2024-09-28",
        "Total Amount": "4045.01",
        "Tax Amount": "173.91",
        "CGST": "173.91",
        "SGST": "173.91",
        "IGST": "N/A",
        "HSN Code": ["996211", "62052000", "62052000", "62046200", "48194000", "33072000", "39264099"]
    },
    {
        "Shop Name": "Tech Solutions Ltd",
        "GSTIN": "27ABCDE1234F1Z5",
        "Invoice Number": "INV-2024-001",
        "Invoice Date": "2024-10-15",
        "Total Amount": "12500.00",
        "Tax Amount": "2250.00",
        "CGST": "1125.00",
        "SGST": "1125.00",
        "IGST": "N/A",
        "HSN Code": ["998313", "998314"]
    },
    {
        "Shop Name": "Global Enterprises\nMumbai Branch",
        "GSTIN": "19FGHIJ5678K2L3",
        "Invoice Number": "GE-2024-789",
        "Invoice Date": "2024-11-02",
        "Total Amount": "8750.50",
        "Tax Amount": "1575.09",
        "CGST": "N/A",
        "SGST": "N/A",
        "IGST": "1575.09",
        "HSN Code": ["854299", "854301", "854302"]
    }
]

# Generate Excel file
output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "Professional_GST_Report.xlsx")

print(f"Generating professional Excel report with clean structured formatting...")
writer_agent(sample_gst_data, output_path)
print(f"Professional Excel report created: {output_path}")
print(f"Report contains: {len(sample_gst_data)} invoice(s) with clean professional structure")