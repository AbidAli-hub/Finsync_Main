from openpyxl import Workbook
from openpyxl.styles import Font, Alignment

def writer_agent(data: list, file_path: str):
    wb = Workbook()
    ws = wb.active
    ws.title = "GST Report"

    bold_font = Font(bold=True)
    headers = [
        "Shop Name", "GSTIN", "Invoice Number", "Invoice Date", "Total Amount",
        "Tax Amount", "CGST", "SGST", "IGST", "HSN Code"
    ]

    for col, header in enumerate(headers, start=1):
        cell = ws.cell(row=1, column=col)
        cell.value = header
        cell.font = bold_font
        ws.column_dimensions[chr(64 + col)].width = 30 if header == "HSN Code" else 18

    for row_idx, record in enumerate(data, start=2):
        for col_idx, header in enumerate(headers, start=1):
            value = record.get(header, "")
            # Mark as 'N/A' if value is None, empty, "null" (string), or 0/0.0
            if value in (None, "", "null", 0, 0.0):
                value = "N/A"
            if header == "HSN Code":
                if isinstance(value, list):
                    value = "\n".join(str(x) for x in value)
                elif isinstance(value, str) and "," in value:
                    value = "\n".join(x.strip() for x in value.split(","))
                cell = ws.cell(row=row_idx, column=col_idx)
                cell.value = value
                cell.alignment = Alignment(wrap_text=True, vertical='top')
            else:
                ws.cell(row=row_idx, column=col_idx).value = value

    wb.save(file_path)
    print(f"📝 Excel report with 'N/A' for empty values saved to: {file_path}")
