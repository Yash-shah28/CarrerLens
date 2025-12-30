import pdfplumber

def extract_text_from_pdf(file):
    text = ""
    links = []
    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
            
            # Extract links
            if page.hyperlinks:
                for link in page.hyperlinks:
                    if "uri" in link:
                        links.append(link["uri"])
                        
    return {"text": text.strip(), "links": list(set(links))}
