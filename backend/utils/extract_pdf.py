import pdfplumber

def extract_text_from_pdf(pdf_path, output_txt_path):
    with pdfplumber.open(pdf_path) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    
    with open(output_txt_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f"Text extracted to {output_txt_path}")

if __name__ == "__main__":
    pdf_path = r"c:\Users\HP\ABIMANYU AI\backend\data\docs\The Bhagavad Gita.pdf"
    output_txt_path = "bhagavad_gita_text.txt"
    extract_text_from_pdf(pdf_path, output_txt_path)