
import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def get_docx_text(path):
    try:
        with zipfile.ZipFile(path) as document:
            xml_content = document.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            text_nodes = []
            for node in tree.iter():
                if node.tag.endswith('}t'):
                    if node.text:
                        text_nodes.append(node.text)
                elif node.tag.endswith('}p'):
                    text_nodes.append('\n')
            
            return "".join(text_nodes)
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    file_path = "temp_adobe.docx"
    with open("adobe_content.txt", "w", encoding="utf-8") as f:
        f.write(get_docx_text(file_path))
    print("Done writing to adobe_content.txt")
