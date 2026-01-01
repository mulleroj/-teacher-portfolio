
import xml.etree.ElementTree as ET
import os

file_path = 'texty/temp_extract/word/document.xml'

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

try:
    tree = ET.parse(file_path)
    root = tree.getroot()
    
    full_text = []
    
    # Iterate over all elements
    for elem in root.iter():
        # Check if the element is a paragraph
        if elem.tag.endswith('}p'):
            full_text.append('\n')
        # Check if the element is a text node
        elif elem.tag.endswith('}t'):
            if elem.text:
                full_text.append(elem.text)
                
    with open('texty/kouzla_content.txt', 'w', encoding='utf-8') as f:
        f.write(''.join(full_text))

except Exception as e:
    print(f"Error parsing XML: {e}")
