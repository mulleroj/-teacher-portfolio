
import zipfile
import xml.etree.ElementTree as ET
import os

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as zf:
            xml_content = zf.read('word/document.xml')
        
        root = ET.fromstring(xml_content)
        
        # Word namespaces
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        text_parts = []
        for p in root.findall('.//w:p', ns):
            texts = p.findall('.//w:t', ns)
            if texts:
                line = ''.join([t.text for t in texts if t.text])
                text_parts.append(line)
            else:
                text_parts.append('') # Paragraph break
                
        return '\n'.join(text_parts)
    except Exception as e:
        return f"Error extracting {docx_path}: {str(e)}"

docx_files = [
    r'c:\Users\mulle\OneDrive\Dokumenty\Antigravity_agent\teacher-portfolio\texty\data_vnotebooku.docx',
    r'c:\Users\mulle\OneDrive\Dokumenty\Antigravity_agent\teacher-portfolio\texty\Konec administrativního chaosu.docx'
]

for docx_file in docx_files:
    print(f"--- Content of {os.path.basename(docx_file)} ---")
    print(extract_text_from_docx(docx_file))
    print("\n" + "="*50 + "\n")
