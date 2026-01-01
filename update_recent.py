import os
import re
import json
import glob
from datetime import datetime

# Configuration
CONTENT_DIRS = [
    'ai-news',
    'notebooklm',
    'tutorials',
    'substitution'
]
OUTPUT_FILE = 'articles.js'

# Month mapping for sorting
MONTH_MAP = {
    'leden': 1, 'únor': 2, 'březen': 3, 'duben': 4, 'květen': 5, 'červen': 6,
    'červenec': 7, 'srpen': 8, 'září': 9, 'říjen': 10, 'listopad': 11, 'prosinec': 12
}

def parse_date(date_str):
    """
    Parses a date string like "Prosinec 2025" into a comparable value (YYYYMM).
    Returns 0 if parsing fails.
    """
    try:
        parts = date_str.strip().split()
        if len(parts) != 2:
            return 0
        month_name = parts[0].lower()
        year = int(parts[1])
        month_num = MONTH_MAP.get(month_name, 0)
        return year * 100 + month_num
    except:
        return 0

def extract_metadata(file_path):
    """
    Extracts metadata from HTML file.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Extract Title
            title_match = re.search(r'<title>(.*?)</title>', content)
            title = title_match.group(1).split('|')[0].strip() if title_match else "Untitled"
            
            # Extract Description
            desc_match = re.search(r'<meta name="description"\s+content="(.*?)"', content, re.DOTALL)
            description = desc_match.group(1).replace('\n', ' ').strip() if desc_match else ""
            
            # Extract Category and Date
            # Looking for: <span class="article-meta">Category / Date</span>
            meta_match = re.search(r'<span class="article-meta">(.*?)</span>', content)
            
            category = "General"
            date_str = ""
            
            if meta_match:
                meta_text = meta_match.group(1)
                if '/' in meta_text:
                    parts = meta_text.split('/')
                    category = parts[0].strip()
                    date_str = parts[1].strip()
                else:
                    category = meta_text.strip()
            
            # If no date found in meta, try to update based on file mod time or set default
            if not date_str:
                date_str = "Neznámé datum"

            return {
                'title': title,
                'description': description,
                'link': file_path.replace('\\', '/'),
                'date': date_str,
                'category': category,
                'sort_key': parse_date(date_str),
                'mtime': os.path.getmtime(file_path)
            }
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return None

def main():
    articles = []
    
    # Scan directories
    for directory in CONTENT_DIRS:
        if not os.path.exists(directory):
            continue
            
        for file_path in glob.glob(os.path.join(directory, '*.html')):
            if 'index.html' in file_path:
                continue
                
            article = extract_metadata(file_path)
            if article and article['title'] != "Untitled":
                articles.append(article)
    
    # Sort articles by date (descending), then by modification time (descending)
    articles.sort(key=lambda x: (x['sort_key'], x['mtime']), reverse=True)
    
    # Take top 10
    recent_articles = articles[:10]
    
    # Generate JS content
    js_content = "const recentArticles = [\n"
    
    for article in recent_articles:
        js_content += "    {\n"
        js_content += f"        title: \"{article['title']}\",\n"
        js_content += f"        description: \"{article['description']}\",\n"
        js_content += f"        link: \"{article['link']}\",\n"
        js_content += f"        date: \"{article['date']}\",\n"
        js_content += f"        category: \"{article['category']}\"\n"
        js_content += "    },\n"
        
    js_content += "];\n\n"
    js_content += """function renderRecentArticles() {
    const container = document.getElementById('recent-articles-grid');
    if (!container) return;

    const html = recentArticles.map(article => `
        <a href="${article.link}" class="recent-article-card">
            <div class="recent-article-meta">
                <span class="recent-article-category">${article.category}</span>
                <span class="recent-article-date">${article.date}</span>
            </div>
            <h3 class="recent-article-title">${article.title}</h3>
            <p class="recent-article-desc">${article.description}</p>
        </a>
    `).join('');

    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', renderRecentArticles);
"""

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Successfully updated {OUTPUT_FILE} with {len(recent_articles)} articles.")

if __name__ == "__main__":
    main()
