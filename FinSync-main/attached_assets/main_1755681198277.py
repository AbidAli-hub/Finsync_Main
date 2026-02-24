from graphs.gst_extraction_graph import build_gst_graph
from pathlib import Path
from agents.writer_agent import writer_agent  # Import your excel writer agent

def run_pipeline():
    invoice_dir = Path("input_invoices")
    output_path = Path("output/Consolidated_Invoices_Output.xlsx")
    invoice_files = list(invoice_dir.glob("*.pdf")) + list(invoice_dir.glob("*.png"))

    graph = build_gst_graph()
    all_invoices = []  # collect all invoices here

    for file in invoice_files:
        print(f"📄 Processing: {file.name}")
        result_state = graph.invoke({"file_path": file, "output_path": output_path})
        gst_data = result_state.get("gst_data", [])
        all_invoices.extend(gst_data)

    # Write all invoices to single Excel file once
    writer_agent(all_invoices, output_path)

if __name__ == "__main__":
    run_pipeline()
