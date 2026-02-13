const recentArticles = [
    {
        title: "Moltbook: Sociální síť, kde žijí pouze AI agenti",
        description: "Moltbook je nová sociální síť „ve stylu Redditu“, kterou neobývají lidé, ale téměř výhradně autonomní AI agenti.",
        link: "ai-news/moltbook-ai-social-network.html",
        date: "Únor 2026",
        category: "AI Pulse"
    },
    {
        title: "OpenAI Prism: Revoluce ve vědeckém psaní a výuce",
        description: "Nový AI-native workspace pro vědce a učitele. LaTeX editor, GPT-5.2 asistence a týmová spolupráce v jednom nástroji.",
        link: "ai-news/openai-prism.html",
        date: "Leden 2026",
        category: "AI Pulse"
    },
    {
        title: "AI v roce 2026: Trendy, nástroje a praktický dopad",
        description: "Kompletní přehled klíčových trendů: evoluce LLM, multimodální generace, podnikové nástroje a dopady na vzdělávání.",
        link: "ai-news/ai-trendy-2026.html",
        date: "Leden 2026",
        category: "AI Pulse"
    },
    {
        title: "8 AI promptů pro soukromí",
        description: "Jak využít AI k ochraně vašeho soukromí, bezpečí a duševního klidu. Sada 8 praktických promptů pro digitální i reálný život.",
        link: "ai-news/ai-prompty-soukromi.html",
        date: "Leden 2026",
        category: "AI Pulse"
    },
    {
        title: "NotebookLM a příprava na zkoušky",
        description: "Kompletní systém pro přípravu na zkoušky. Studijní průvodce, kartičky, kvízy a odhalení slabých míst.",
        link: "ai-news/notebooklm-priprava-zkousky.html",
        date: "Leden 2026",
        category: "AI Lab"
    },
    {
        title: "NotebookLM jako studijní asistent",
        description: "Kompletní průvodce pro studenty. Jak využít NotebookLM pro přehledy, otázky a audio shrnutí z vlastních materiálů.",
        link: "ai-news/notebooklm-studijni-asistent.html",
        date: "Leden 2026",
        category: "AI Lab"
    },
    {
        title: "Anthropic představuje Claude for Healthcare",
        description: "Závod o AI ve zdravotnictví se zostřuje. Anthropic uvedl Claude for Healthcare pouhé dny po OpenAI.",
        link: "ai-news/claude-healthcare.html",
        date: "Leden 2026",
        category: "AI Pulse"
    },
    {
        title: "OpenAI spouští zdravotního asistenta s AI",
        description: "ChatGPT Health pro spotřebitele a ChatGPT for Healthcare pro nemocnice. Nejambicióznější expanze AI do zdravotnictví.",
        link: "ai-news/chatgpt-health.html",
        date: "Leden 2026",
        category: "AI Pulse"
    },
    {
        title: "OpenAI testuje reklamy v ChatGPT",
        description: "OpenAI oznámilo testování reklam v ChatGPT pro bezplatné uživatele. Co to znamená pro uživatele a jaká jsou bezpečnostní opatření?",
        link: "ai-news/chatgpt-reklamy.html",
        date: "Leden 2026",
        category: "AI Pulse"
    },
    {
        title: "AI ve vzdělávání 2025-2026",
        description: "Komplexní přehled klíčových iniciativ, nástrojů a trendů v oblasti AI ve vzdělávání. Program základka.ai, kurikulum AI dětem, praktické nástroje pro pedagogy.",
        link: "ai-news/ai-ve-vzdelavani-2025-2026.html",
        date: "Leden 2026",
        category: "AI Pulse"
    },
    {
        title: "Konec administrativního chaosu",
        description: "Jak využít NotebookLM pro zvládnutí školní administrativy. ŠVP, směrnice a zápisy z porad pod kontrolou AI.",
        link: "notebooklm/notebooklm-chaos.html",
        date: "Prosinec 2025",
        category: "NotebookLM"
    },
    {
        title: "Data v NotebookLM: Bezpečnost a Formáty",
        description: "Vše co potřebujete vědět o datech v NotebookLM. Bezpečnost, podporované formáty, limity a tipy pro přípravu podkladů.",
        link: "notebooklm/notebooklm-data.html",
        date: "Prosinec 2025",
        category: "NotebookLM"
    },
    {
        title: "NotebookLM: Velké prosincové novinky",
        description: "NotebookLM přináší revoluční novinky: přizpůsobitelné Audio přehledy, poslech na pozadí a nové možnosti sdílení.",
        link: "notebooklm/novinky-prosinec-2025.html",
        date: "Prosinec 2025",
        category: "NotebookLM"
    },
    {
        title: "Kdy dostanou hlasy z NotebookLM i tvář?",
        description: "Funkce Audio Overview je revoluční, ale chybí jí obraz. Kdy uvidíme moderátorům do tváře a jaká je budoucnost výukového videa?",
        link: "notebooklm/notebooklm-avatary.html",
        date: "Prosinec 2025",
        category: "NotebookLM"
    },
    {
        title: "NotebookLM a Gemini: Synergie",
        description: "Jak propojit NotebookLM a Gemini pro maximální efektivitu ve výuce. 4 expertní scénáře pro učitele.",
        link: "notebooklm/notebook-gemini-synergie.html",
        date: "Prosinec 2025",
        category: "NotebookLM"
    },
    {
        title: "Chytrá výuka s Adobe AI a ChatGPT",
        description: "Jak propojení Photoshopu, Expressu a Acrobatu zjednoduší učiteli práci. Praktický průvodce využitím Adobe AI ve výuce.",
        link: "ai-news/chytr-vyuka-s-adobe-ai.html",
        date: "Prosinec 2025",
        category: "AI Toolkit"
    },
    {
        title: "Studium s Gemini: Jak využívat odkazy pro efektivní učení",
        description: "Gemini není jen vyhledávač. Naučte se, jak využít odkazy na články a videa k efektivnímu studiu, přípravě na testy a pochopení složité látky.",
        link: "ai-news/studium-s-gemini.html",
        date: "Prosinec 2025",
        category: "AI Lab"
    },
    {
        title: "Tvorba pracovních listů s ChatGPT",
        description: "Praktický návod pro učitele: jak vytvořit perfektní pracovní list s ChatGPT od prvního promptu po hotový materiál.",
        link: "tutorials/tvorba-pracovnich-listu-s-chatgpt.html",
        date: "Prosinec 2025",
        category: "Návody"
    },
    {
        title: "Gemini 3.5: Hype vs Realita",
        description: "Co je skutečně známo o Google Gemini 3.5? Rozbor úniků o Fierce Falcon, Ghost Falcon a realita vs. hype na sociálních sítích.",
        link: "ai-news/gemini-3-5.html",
        date: "Prosinec 2025",
        category: "AI Pulse"
    },
    {
        title: "Přehled týdne: AI modely & Regulace",
        description: "Týdenní přehled AI novinek: Claude Opus 4.5, DeepSeek V3.2, Google Gemini 3, regulace USA a další.",
        link: "ai-news/novinky-tyden-50-2025.html",
        date: "Prosinec 2025",
        category: "Novinky"
    },
    {
        title: "TOP 5 AI nástrojů pro hodnocení",
        description: "Přehled 5 nejlepších AI nástrojů zdarma pro tvorbu testů, kvízů a automatické hodnocení studentů.",
        link: "ai-news/5-ai-nastroju-pro-hodnoceni.html",
        date: "Prosinec 2025",
        category: "Nástroje"
    },
    {
        title: "AI generátory obrázků ve výuce",
        description: "Jak AI generátory obrázků mění výuku. Praktické tipy, nástroje a cvičení pro učitele.",
        link: "ai-news/ai-images-for-teachers.html",
        date: "Prosinec 2025",
        category: "Učitelé"
    },
];

function renderRecentArticles() {
    const container = document.getElementById('recent-articles-grid');
    if (!container) return;

    const html = recentArticles.slice(0, 9).map(article => `
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
