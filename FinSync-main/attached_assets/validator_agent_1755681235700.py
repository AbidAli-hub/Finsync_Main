from .gemini_client_1755681220681 import generate_response_with_file
import os

def validator_agent(state: dict):
    gst_data = state.get("gst_data", [])
    file_path = state.get("file_path", "")

    if not gst_data:
        print("[Validator Agent] ⚠️ No gst_data found for validation.")
        return {**state, "validated": False, "error": "No gst_data"}

    if not file_path or not os.path.exists(file_path):
        print(f"[Validator Agent] ⚠️ File not found: {file_path}")
        return {**state, "validated": False, "error": "File not found"}

    print("[Validator Agent] 🧪 Validating parsed GST data using Gemini...")
    prompt = (
        "Check if this GST data is valid JSON and contains all the necessary fields. "
        "Reply with only one word: 'Valid' or 'Invalid'.\n\n"
        f"{gst_data}"
    )
    try:
        response = generate_response_with_file(prompt, file_path)
        print("🔍 Gemini response:", response)
        is_valid = "valid" in response.lower()
        print(f"[Validator Agent] ✅ Validation: {is_valid}")
        return {**state, "validated": is_valid, "gemini_response": response}
    except Exception as e:
        print(f"[Validator Agent] ❌ Error during validation: {e}")
        return {**state, "validated": False, "error": str(e)}

print("✅ Validator Agent loaded (confirmed fresh file)")
