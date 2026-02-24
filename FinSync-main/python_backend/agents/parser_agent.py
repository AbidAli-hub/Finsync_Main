import json
from utils.gemini_client import generate_response_with_file

def parser_agent(state: dict):
    raw_text = state.get("raw_text", "")
    file_path = state.get("file_path", "")

    if not raw_text:
        print("[Parser Agent] No raw text to parse")
        return {**state, "gst_data": []}

    print("[Parser Agent] Parsing raw GST data using text-only processing...")
    prompt = (
        "You are an expert GST data extractor.\n"
        "Extract all relevant invoice fields, including line items, from the following text in this JSON format:\n\n"
        "Rules:\n"
        "- If the Shop name is too long, adjust it by writing in two lines in each cell with proper alignment when uploading to excel\n"
        "- For each line item, extract ONLY the numeric HSN code (6-8 digits, digits only) from the text. If no HSN code is present, assign the value as 0, do not guess, do not copy\n"
        "- If there is no IGST value, assign the value as N/A\n\n"
        "[\n"
        "  {\n"
        "    \"Shop Name\": \"...\",\n"
        "    \"GSTIN\": \"...\",\n"
        "    \"Invoice Number\": \"...\",\n"
        "    \"Invoice Date\": \"...\",\n"
        "    \"Total Amount\": \"...\",\n"
        "    \"Tax Amount\": \"...\",\n"
        "    \"CGST\": \"...\",\n"
        "    \"SGST\": \"...\",\n"
        "    \"IGST\": \"...\",\n"
        "    \"Items\": [\n"
        "      { \"HSN Code\": \"...\" }\n"
        "    ]\n"
        "  }\n"
        "]\n\n"
        f"Text to parse:\n{raw_text}"
    )

    try:
        # Use text-only processing instead of file processing to avoid path issues
        from utils.gemini_client import gemini_model
        response = gemini_model.generate_content(prompt)
        response_text = response.text
        print("Gemini raw response:... (the full messy response from the model will be here) ...", response_text)

        start = response_text.find('[')
        end = response_text.rfind(']')
        if start != -1 and end != -1 and end > start:
            json_text = response_text[start:end+1]
        else:
            json_text = response_text.strip()

        print("CLEANED RESPONSE FOR JSON PARSING:... (the text your code is trying to parse will be here) ...", repr(json_text))
        parsed = json.loads(json_text)

        # Collect all HSN codes (including duplicates) in order for this bill
        for record in parsed:
            hsn_code_list = []
            items = record.get("Items", [])
            for item in items:
                code = item.get("HSN Code")
                if code:
                    if isinstance(code, list):
                        hsn_code_list.extend(str(c) for c in code)
                    else:
                        hsn_code_list.append(str(code))
            record["HSN Code"] = hsn_code_list if hsn_code_list else ""

        print("[Parser Agent] Parsed successfully.")
        return {**state, "gst_data": parsed}

    except json.JSONDecodeError as e:
        print(f"[Parser Agent] JSON decoding error: {e}")
        return {**state, "gst_data": []}
    except Exception as e:
        print(f"[Parser Agent] Parsing failed: {e}")
        return {**state, "gst_data": []}

print("Loaded parser_agent (confirmed file)")