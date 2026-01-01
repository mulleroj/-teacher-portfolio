document.addEventListener('DOMContentLoaded', () => {
    // State
    let selectedTime = '30';

    // Elements
    const subjectInput = document.getElementById('subject');
    const topicInput = document.getElementById('topic');
    const timeButtons = document.querySelectorAll('.time-btn');
    const generateBtn = document.getElementById('generateBtn');
    const advancedToggle = document.getElementById('advancedToggle');
    const advancedOptions = document.getElementById('advancedOptions');
    const resultSection = document.getElementById('resultSection');
    const promptOutput = document.getElementById('promptOutput');
    const outputContent = document.getElementById('outputContent');
    const copyPromptBtn = document.getElementById('copyPromptBtn');
    const copyWordBtn = document.getElementById('copyWordBtn');
    const printBtn = document.getElementById('printBtn');
    const apiKeyInput = document.getElementById('apiKey');
    const modelSelect = document.getElementById('modelSelect');

    // Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Event Listeners
    timeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            timeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTime = btn.dataset.time;
        });
    });

    advancedToggle.addEventListener('click', () => {
        advancedOptions.classList.toggle('hidden');
    });

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;

            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabContents.forEach(c => c.classList.remove('active'));
            document.getElementById(`${tabName}Tab`).classList.add('active');
        });
    });

    copyPromptBtn.addEventListener('click', () => {
        copyToClipboard(promptOutput.value);
        showFeedback(copyPromptBtn, 'Zkopírováno!');
    });

    copyWordBtn.addEventListener('click', () => {
        const content = outputContent.innerHTML;
        const blob = new Blob(['<html><body>' + content + '</body></html>'], { type: 'text/html' });
        const item = new ClipboardItem({ 'text/html': blob });

        if (navigator.clipboard && navigator.clipboard.write) {
            navigator.clipboard.write([item]).then(() => {
                showFeedback(copyWordBtn, 'Zkopírováno!');
            }).catch(err => {
                console.warn('Clipboard API failed, trying fallback text copy', err);
                copyToClipboard(outputContent.innerText);
                showFeedback(copyWordBtn, 'Zkopírováno (text)!');
            });
        } else {
            // Fallback for environments without Clipboard Item support
            copyToClipboard(outputContent.innerText);
            showFeedback(copyWordBtn, 'Zkopírováno (text)!');
        }
    });

    printBtn.addEventListener('click', () => {
        window.print();
    });

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(err => {
                console.warn('Clipboard writeText failed', err);
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback copy failed', err);
            alert('Kopírování se nezdařilo. Prosím zkopírujte text ručně.');
        }

        document.body.removeChild(textArea);
    }

    function showFeedback(btn, message) {
        const originalText = btn.textContent;
        btn.textContent = message;
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }

    generateBtn.addEventListener('click', async () => {
        const subject = subjectInput.value.trim();
        const topic = topicInput.value.trim();

        if (!subject || !topic) {
            alert('Prosím vyplňte předmět a téma.');
            return;
        }

        setLoading(true);

        // Construct Prompt
        const prompt = constructPrompt(subject, topic, selectedTime);
        promptOutput.value = prompt;

        // Check for API Key
        const apiKey = apiKeyInput.value.trim();

        if (apiKey) {
            try {
                const response = await callLLM(apiKey, modelSelect.value, prompt);
                renderResult(response);
                // Switch to preview tab
                document.querySelector('[data-tab="preview"]').click();
            } catch (error) {
                console.error(error);
                renderResult(`### Chyba při komunikaci s API\n\n${error.message}\n\nZkuste zkontrolovat API klíč nebo použijte vygenerovaný prompt manuálně.`);
                document.querySelector('[data-tab="preview"]').click();
            }
        } else {
            // No API key, just show prompt and instructions
            renderResult(`### Připraveno k použití!\n\nProtože nebyl zadán API klíč, vygeneroval jsem pro vás **perfektní prompt**.\n\n1. Přejděte na záložku **"Zobrazit Prompt"**.\n2. Zkopírujte text.\n3. Vložte ho do ChatGPT, Claude nebo Gemini.\n\nVýsledek bude obsahovat aktivitu, instrukce a pracovní list přesně podle vašich požadavků.`);
            document.querySelector('[data-tab="prompt"]').click();
        }

        resultSection.classList.remove('hidden');
        setLoading(false);

        // Smooth scroll to results
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    function constructPrompt(subject, topic, time) {
        return `Jsi zkušený pedagog a expert na suplování. Tvým úkolem je připravit "rychlou aktivitu" pro suplovanou hodinu.

ZADÁNÍ:
- Předmět: ${subject}
- Téma: ${topic}
- Časová dotace: ${time} minut

VÝSTUP MUSÍ OBSAHOVAT PŘESNĚ TYTO TŘI ČÁSTI:

1. AKTIVITA
- Název aktivity
- Stručný popis (max 2 věty)
- Cíl aktivity (co se žáci naučí/procvičí)

2. INSTRUKCE PRO UČITELE
- Krok za krokem, jak aktivitu uvést a řídit.
- Rozpis času (např. 5 min úvod, 15 min práce, 10 min reflexe).

3. PRACOVNÍ LIST (nebo zadání na tabuli)
- Konkrétní otázky, příklady nebo úkoly pro žáky.
- Pokud jde o diskuzi, seznam otázek.
- Pokud jde o kvíz, 5-10 otázek s řešením (řešení uveď zvlášť na konci).

Formátuj výstup pomocí Markdownu (nadpisy, odrážky, tučné písmo) pro maximální přehlednost. Buď kreativní, ale praktický.`;
    }

    async function callLLM(apiKey, model, prompt) {
        if (model.includes('gpt')) {
            return await callOpenAI(apiKey, model, prompt);
        } else if (model.includes('gemini')) {
            return await callGemini(apiKey, model, prompt);
        }
    }

    async function callOpenAI(apiKey, model, prompt) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: "Jsi pomocník pro učitele." },
                    { role: "user", content: prompt }
                ]
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Chyba OpenAI API');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async function callGemini(apiKey, model, prompt) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Chyba Gemini API');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    function renderResult(markdown) {
        outputContent.innerHTML = marked.parse(markdown);
    }

    function setLoading(isLoading) {
        const btnText = document.querySelector('.btn-text');
        const loader = document.querySelector('.loader');

        if (isLoading) {
            btnText.classList.add('hidden');
            loader.classList.remove('hidden');
            generateBtn.disabled = true;
        } else {
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
            generateBtn.disabled = false;
        }
    }
});
