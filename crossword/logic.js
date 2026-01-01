document.addEventListener('DOMContentLoaded', () => {
    console.log("Crossword Logic Loaded: Version 3.0 (Strict Mode)");
    const tajemkaInput = document.getElementById('tajemkaInput');
    const wordsInput = document.getElementById('wordsInput');
    const generateBtn = document.getElementById('generateBtn');
    const generatePromptBtn = document.getElementById('generatePromptBtn');
    const resultSection = document.getElementById('resultSection');
    const promptSection = document.getElementById('promptSection');
    const copyBtn = document.getElementById('copyBtn');
    const printBtn = document.getElementById('printBtn');
    const copyPromptBtn = document.getElementById('copyPromptBtn');
    const clueModeRadios = document.getElementsByName('clueMode');
    const suggestBtn = document.getElementById('suggestBtn');

    const apiConfig = document.getElementById('apiConfig');
    const apiKeyInput = document.getElementById('apiKey');
    const modelSelect = document.getElementById('modelSelect');

    // Modal elements
    const suggestionModal = document.getElementById('suggestionModal');
    const suggestionList = document.getElementById('suggestionList');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const applySuggestionsBtn = document.getElementById('applySuggestionsBtn');

    // Toggle buttons based on mode
    clueModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'ai_prompt') {
                generateBtn.classList.add('hidden');
                generatePromptBtn.classList.remove('hidden');
                resultSection.classList.add('hidden');
                apiConfig.classList.add('hidden');
            } else if (e.target.value === 'ai_auto') {
                generateBtn.classList.remove('hidden');
                generatePromptBtn.classList.add('hidden');
                promptSection.classList.add('hidden');
                apiConfig.classList.remove('hidden');
            } else {
                generateBtn.classList.remove('hidden');
                generatePromptBtn.classList.add('hidden');
                promptSection.classList.add('hidden');
                apiConfig.classList.add('hidden');
            }
        });
    });

    suggestBtn.addEventListener('click', suggestTajemka);
    generateBtn.addEventListener('click', generateCrossword);

    // Modal Event Listeners
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            suggestionModal.classList.add('hidden');
            generateBtn.disabled = false;
            generateBtn.textContent = 'Vygenerovat Křížovku';
        });
    }

    if (applySuggestionsBtn) {
        applySuggestionsBtn.addEventListener('click', () => {
            const checkboxes = suggestionList.querySelectorAll('input[type="checkbox"]:checked');
            const selectedLines = Array.from(checkboxes).map(cb => cb.value);

            if (selectedLines.length > 0) {
                const currentText = wordsInput.value.trim();
                wordsInput.value = currentText + (currentText ? '\n' : '') + selectedLines.join('\n');
            }

            suggestionModal.classList.add('hidden');
            generateBtn.disabled = false;
            generateBtn.textContent = 'Vygenerovat Křížovku';

            // Auto-retry generation
            setTimeout(() => {
                generateCrossword(true);
            }, 100);
        });
    }

    generatePromptBtn.addEventListener('click', () => {
        const tajemka = tajemkaInput.value.trim().toUpperCase();
        const words = wordsInput.value.trim();

        if (!tajemka) {
            alert('Prosím zadejte tajenku.');
            return;
        }

        const prompt = `Jsi pomocník pro učitele. Vytvoř křížovku s tajenkou "${tajemka}".
        
Použij tato slova (pokud se hodí) nebo přidej vlastní vhodná slova:
${words}

Výstup musí obsahovat:
1. Prázdnou mřížku křížovky (vykreslenou pomocí ASCII nebo Markdown tabulky).
2. Číslované legendy (otázky) pro vodorovná slova.
3. Řešení (vyplněnou křížovku).

Tajenka musí být ve svislém sloupci a musí být jasně vyznačena.`;

        document.getElementById('promptOutput').value = prompt;
        promptSection.classList.remove('hidden');
        resultSection.classList.add('hidden');
    });

    copyPromptBtn.addEventListener('click', () => {
        const text = document.getElementById('promptOutput').value;
        navigator.clipboard.writeText(text).then(() => {
            alert('Prompt zkopírován!');
        });
    });

    copyBtn.addEventListener('click', () => {
        const content = document.getElementById('crosswordPreview');
        const range = document.createRange();
        range.selectNode(content);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        try {
            document.execCommand('copy');
            alert('Křížovka zkopírována! Vložte do Wordu (Ctrl+V).');
        } catch (err) {
            alert('Kopírování selhalo.');
        }
        window.getSelection().removeAllRanges();
    });

    printBtn.addEventListener('click', () => {
        window.print();
    });

    async function generateCrossword() {
        // Sanitize Tajemka: remove spaces and non-letter characters
        let tajemka = tajemkaInput.value.trim().toUpperCase().replace(/[^A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/gi, '');
        tajemkaInput.value = tajemka; // Update the input field with sanitized value

        // --- AI AUTO MODE ---
        const selectedMode = Array.from(clueModeRadios).find(r => r.checked).value;
        if (selectedMode === 'ai_auto') {
            const apiKey = apiKeyInput.value.trim();
            if (!apiKey) {
                alert('Pro automatické generování zadejte API klíč.');
                generateBtn.disabled = false;
                generateBtn.textContent = 'Generovat';
                return;
            }

            const originalBtnText = generateBtn.textContent;
            generateBtn.disabled = true;

            try {
                // ALWAYS detect language from input words first
                let lines = wordsInput.value.trim().split(/[\n]+/);
                let parsedData = lines.map(line => {
                    const parts = line.split(/[-–—−:\t]/);
                    return { word: parts[0].trim().toUpperCase(), originalLine: line };
                }).filter(item => item.word.length > 0);

                // Detect language from input words
                const sampleWords = parsedData.slice(0, 3).map(i => i.word).join(', ');
                const isCzech = /[ÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/i.test(sampleWords);
                const detectedLang = isCzech ? 'CZECH' : 'ENGLISH';
                const langInstruction = isCzech ? 'Czech' : 'English';

                // Store detected language for later use
                window.crosswordLanguage = detectedLang;
                window.crosswordLangInstruction = langInstruction;

                // If no Tajemka and no input words, cannot proceed
                if (!tajemka && parsedData.length === 0) {
                    alert('Zadejte alespoň téma nebo pár slov, aby AI věděla, co vygenerovat.');
                    generateBtn.disabled = false;
                    generateBtn.textContent = originalBtnText;
                    return;
                }

                // 1. Auto-Generate Tajemka if missing
                if (!tajemka) {
                    console.log('DEBUG: AI Auto - No Tajemka provided, generating...');
                    generateBtn.textContent = 'Generuji tajenku...';

                    const promptTajemka = `INPUT WORDS: "${sampleWords}"

IMPORTANT: These words are in ${detectedLang} language. You MUST respond in ${detectedLang}.

Task: Suggest ONE ${langInstruction} noun (8-15 letters) as the hidden solution (Tajenka) related to the topic.

Output ONLY this JSON (no explanation, no code):
{ "tajemka": "${detectedLang}_WORD" }`;

                    const resultTajemka = await callLLM(apiKey, modelSelect.value, promptTajemka);

                    try {
                        let jsonStr = resultTajemka;
                        // Attempt to extract JSON object
                        const firstBrace = resultTajemka.indexOf('{');
                        const lastBrace = resultTajemka.lastIndexOf('}');

                        if (firstBrace !== -1 && lastBrace !== -1) {
                            jsonStr = resultTajemka.substring(firstBrace, lastBrace + 1);
                        } else {
                            throw new Error("No JSON found in response");
                        }

                        const obj = JSON.parse(jsonStr);
                        // Sanitize: remove all non-letter characters including spaces
                        tajemka = obj.tajemka ? obj.tajemka.trim().toUpperCase().replace(/[^A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/gi, '') : "";

                        // Validate: must have at least 3 letters
                        if (tajemka.length < 3) {
                            throw new Error(`Tajenka je příliš krátká: ${tajemka}`);
                        }

                    } catch (e) {
                        console.error("Tajenka error:", e);
                        console.log("Raw response:", resultTajemka);
                        throw new Error(`AI nevrátila platné slovo. (Odpověď: ${resultTajemka.substring(0, 50)}...)`);
                    }

                    tajemkaInput.value = tajemka;
                }

                console.log('DEBUG: AI Auto - Tajemka is:', tajemka);
                // 2. Loop to satisfy missing words (Max 3 retries)
                let attempts = 0;
                while (attempts < 3) {
                    // Re-read current state
                    let currentLines = wordsInput.value.trim().split(/[\n]+/);
                    let currentParsedData = currentLines.map(line => {
                        const parts = line.split(/[-–—−:\t]/);
                        const word = parts[0].trim().toUpperCase();
                        const clue = parts.length > 1 ? parts.slice(1).join(' ').trim() : null;
                        return { word, clue, originalLine: line };
                    }).filter(item => item.word.length > 0);

                    // Check coverage
                    const usedWords = new Set();
                    const missingLetters = [];
                    const availableWords = currentParsedData.map(i => i.word);

                    // Greedy check for missing letters
                    for (let i = 0; i < tajemka.length; i++) {
                        const letter = tajemka[i];
                        const candidateIndex = availableWords.findIndex(w => w.includes(letter) && !usedWords.has(w));
                        if (candidateIndex !== -1) {
                            usedWords.add(availableWords[candidateIndex]);
                            availableWords.splice(candidateIndex, 1);
                        } else {
                            missingLetters.push({ letter, index: i });
                        }
                    }

                    if (missingLetters.length === 0) {
                        console.log('DEBUG: All letters covered, breaking loop');
                        break; // All good!
                    }

                    console.log('DEBUG: Missing letters:', missingLetters.map(m => m.letter).join(', '));

                    // We have missing words, generate them
                    attempts++;
                    generateBtn.textContent = `Generuji slovní zásobu (${attempts}/3)...`;

                    const sampleWords = currentParsedData.slice(0, 3).map(i => i.word).join(', ');

                    // Use stored language or detect again
                    const isCzech = /[ÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/i.test(sampleWords);
                    const detectedLang = window.crosswordLanguage || (isCzech ? 'CZECH' : 'ENGLISH');
                    const langInstruction = window.crosswordLangInstruction || (isCzech ? 'Czech' : 'English');

                    const promptWords = `STUDENT VOCABULARY LIST (in ${detectedLang}): ${sampleWords}
Tajenka: "${tajemka}"

CONTEXT: This is for students to practice their vocabulary. The crossword should primarily use words from their list above.

CRITICAL: I already have words for most letters. I ONLY need words for these specific missing letters:
${missingLetters.map(m => `- Letter '${m.letter}' (position ${m.index + 1} in "${tajemka}")`).join('\n')}

Task: Generate 2-3 ${langInstruction} words for EACH missing letter listed above.
Requirements:
1. Words MUST be in ${detectedLang} language
2. Each word MUST contain the required letter
3. Words should be RELATED to the student vocabulary topic (${sampleWords})
4. Keep words simple and educational
5. Output format: one word per line

Generate ONLY for the missing letters listed above. Do not generate words for letters we already have.`;

                    console.log('DEBUG: Calling AI to generate missing words...');
                    const generatedWords = await callLLM(apiKey, modelSelect.value, promptWords);
                    console.log('DEBUG: AI response for missing words:', generatedWords.substring(0, 200));

                    const newLines = [];
                    const rawLines = generatedWords.split('\n');
                    rawLines.forEach(line => {
                        // Skip header lines like "Position X ('Y'):"
                        if (/^Position\s+\d+/i.test(line) || /^\s*-\s*Letter/i.test(line)) {
                            return; // Skip header lines
                        }

                        // Strict filter: Remove markdown, numbering, bullets
                        let clean = line.replace(/^[\d\-\*\.\)\:]+\s*/, '').replace(/\*\*/g, '').trim();

                        // Remove anything after a dash (clue part)
                        if (clean.includes(' - ')) {
                            clean = clean.split(' - ')[0].trim();
                        }

                        // Filter out lines that look like code or contain special chars
                        if (/[{}\[\];=<>`/\\:\(\)]/.test(clean)) {
                            return; // Skip code lines and lines with colons/parens
                        }

                        // Only keep single words (no spaces) that are letters only
                        if (clean.length > 2 && clean.length < 20 && /^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+$/i.test(clean)) {
                            newLines.push(clean.toUpperCase());
                        }
                    });

                    if (newLines.length > 0) {
                        console.log('DEBUG: Adding new words:', newLines.join(', '));
                        wordsInput.value += (wordsInput.value ? '\n' : '') + newLines.join('\n');
                        // Loop will check again
                    } else {
                        console.warn("DEBUG: AI generated no valid words after filtering.");
                        console.log('DEBUG: Raw lines were:', rawLines.slice(0, 5).join('; '));
                        break; // Stop if AI failing
                    }
                } // end while

                // 3. Compute Solution
                console.log('DEBUG: AI Auto - Computing solution...');
                generateBtn.textContent = 'Sestavuji mřížku...';
                // Final read
                let finalLines = wordsInput.value.trim().split(/[\n]+/);
                let finalParsedData = finalLines.map(line => {
                    const parts = line.split(/[-–—−:\t]/);
                    return { word: parts[0].trim().toUpperCase(), clue: parts.length > 1 ? parts.slice(1).join(' ').trim() : null };
                }).filter(item => item.word.length > 0);

                let solution;
                try {
                    solution = computeSolution(tajemka, finalParsedData);
                } catch (e) {
                    console.error('DEBUG: AI Auto - computeSolution FAILED:', e.message);
                    alert('Nepodařilo se sestavit křížovku ani po doplnění slov: ' + e.message);
                    generateBtn.disabled = false;
                    generateBtn.textContent = originalBtnText;
                    return;
                }
                console.log('DEBUG: AI Auto - Solution computed:', solution);

                // 4. Generate Missing Clues
                const missingClueIndices = [];
                solution.forEach((item, idx) => {
                    if (!item.clue || item.clue.length < 2) missingClueIndices.push(idx);
                });

                if (missingClueIndices.length > 0) {
                    try {
                        generateBtn.textContent = `Generuji nápovědy (${missingClueIndices.length})...`;
                        const wordsToClue = missingClueIndices.map(idx => solution[idx].word);

                        // Batch them to avoid too large prompt (optional, but good practice)
                        const sampleWords = finalParsedData.slice(0, 3).map(i => i.word).join(', ');

                        // Use stored language or detect again
                        const isCzech = /[ÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/i.test(sampleWords);
                        const detectedLang = window.crosswordLanguage || (isCzech ? 'CZECH' : 'ENGLISH');
                        const langInstruction = window.crosswordLangInstruction || (isCzech ? 'Czech' : 'English');
                        const exampleClue = isCzech ? 'PES - Domácí zvíře' : 'DOG - Domestic animal';

                        const promptClues = `EXISTING WORDS (in ${detectedLang}): ${sampleWords}

IMPORTANT: All words are ${detectedLang}. You MUST write clues in ${detectedLang} language.

Generate SHORT ${langInstruction} crossword clues for these words:
${wordsToClue.join(', ')}

Format: WORD - ${detectedLang}_CLUE
Example: ${exampleClue}

Output one per line, clues in ${detectedLang} only.`;

                        const generatedClues = await callLLM(apiKey, modelSelect.value, promptClues);

                        const clueMap = {};
                        generatedClues.split('\n').forEach(l => {
                            const clean = l.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '');
                            const parts = clean.split(/[-–—−:]/);
                            if (parts.length > 1) {
                                clueMap[parts[0].trim().toUpperCase()] = parts.slice(1).join(' ').trim();
                            }
                        });

                        // Update solution AND textarea
                        const allLines = wordsInput.value.trim().split(/[\n]+/);
                        missingClueIndices.forEach(idx => {
                            const item = solution[idx];
                            if (clueMap[item.word]) {
                                item.clue = clueMap[item.word];
                                // Update text area for future reference
                                for (let i = 0; i < allLines.length; i++) {
                                    if (allLines[i].toUpperCase().startsWith(item.word) && !allLines[i].includes('-')) {
                                        allLines[i] = `${item.word} - ${item.clue}`;
                                        break;
                                    }
                                }
                            }
                        });
                        wordsInput.value = allLines.join('\n');
                    } catch (clueError) {
                        console.warn('Clue generation failed, continuing with crossword render:', clueError);
                        // Continue without clues - don't block rendering
                    }
                }

                console.log('About to render crossword with solution:', solution);
                renderCrossword(solution, tajemka);
                generateBtn.textContent = originalBtnText;
                generateBtn.disabled = false;

            } catch (error) {
                console.error(error);
                alert('Chyba: ' + error.message);
                generateBtn.textContent = originalBtnText;
                generateBtn.disabled = false;
            }

        } else {
            // --- MANUAL MODE ---
            if (!tajemka) {
                alert('Prosím zadejte tajenku.');
                return;
            }
            try {
                let lines = wordsInput.value.trim().split(/[\n]+/);
                let parsedData = lines.map(line => {
                    const parts = line.split(/[-–—−:\t]/);
                    return { word: parts[0].trim().toUpperCase(), clue: parts.length > 1 ? parts.slice(1).join(' ').trim() : null };
                }).filter(item => item.word.length > 0);

                const solution = computeSolution(tajemka, parsedData);
                renderCrossword(solution, tajemka);
            } catch (e) {
                alert(e.message);
            }
        }
    }

    function computeSolution(tajemka, parsedData) {
        if (parsedData.length < tajemka.length) {
            throw new Error(`Pro tajenku délky ${tajemka.length} potřebujete alespoň ${tajemka.length} slov.`);
        }

        const usedWords = new Set();
        const solution = [];

        for (let i = 0; i < tajemka.length; i++) {
            const letter = tajemka[i];
            const candidates = parsedData.filter(item => item.word.includes(letter) && !usedWords.has(item.word));

            if (candidates.length === 0) {
                throw new Error(`Nepodařilo se najít slovo obsahující písmeno '${letter}'(pro ${i + 1}.písmeno tajenky).Přidejte více slov.`);
            }

            const item = candidates[Math.floor(Math.random() * candidates.length)];
            usedWords.add(item.word);

            const indices = [];
            for (let j = 0; j < item.word.length; j++) {
                if (item.word[j] === letter) indices.push(j);
            }
            const bestIndex = indices.reduce((prev, curr) => {
                return Math.abs(curr - item.word.length / 2) < Math.abs(prev - item.word.length / 2) ? curr : prev;
            });

            solution.push({ ...item, matchIndex: bestIndex });
        }
        return solution;
    }

    function renderSuggestionsModal(suggestions) {
        suggestionList.innerHTML = '';

        if (Object.keys(suggestions).length === 0) {
            suggestionList.innerHTML = '<p>Žádné návrhy nebyly nalezeny.</p>';
        } else {
            for (const [letter, items] of Object.entries(suggestions)) {
                const group = document.createElement('div');
                group.className = 'suggestion-group';

                const title = document.createElement('h3');
                title.textContent = `Slova pro písmeno "${letter}": `;
                group.appendChild(title);

                items.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'suggestion-item';

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = item;
                    checkbox.id = `sug - ${item.replace(/\s/g, '')} `;

                    const label = document.createElement('label');
                    label.htmlFor = checkbox.id;
                    label.textContent = item;
                    label.style.cursor = 'pointer';
                    label.style.flexGrow = '1';

                    div.appendChild(checkbox);
                    div.appendChild(label);
                    group.appendChild(div);
                });

                suggestionList.appendChild(group);
            }
        }

        suggestionModal.classList.remove('hidden');
    }

    function renderCrossword(solution, tajemka) {
        // Calculate grid dimensions
        let maxBefore = 0;
        let maxAfter = 0;

        solution.forEach(item => {
            maxBefore = Math.max(maxBefore, item.matchIndex);
            maxAfter = Math.max(maxAfter, item.word.length - 1 - item.matchIndex);
        });

        const totalWidth = maxBefore + 1 + maxAfter;
        const totalHeight = solution.length;

        let html = '<div style="font-family: Arial, sans-serif;">';

        // 1. Table
        html += '<table class="crossword-table" border="1" style="border-collapse:collapse; margin-bottom: 20px;">';

        for (let r = 0; r < totalHeight; r++) {
            html += '<tr>';
            const item = solution[r];
            const word = item.word;
            const matchIndex = item.matchIndex;
            const startCol = maxBefore - matchIndex;

            for (let c = 0; c < totalWidth; c++) {
                let cellContent = '';
                let cellClass = 'empty';
                let style = 'border: none; background: transparent;';

                if (c >= startCol && c < startCol + word.length) {
                    cellClass = 'filled';
                    style = 'border: 1px solid black; width: 30px; height: 30px;';

                    if (c === maxBefore) {
                        cellClass = 'tajemka';
                        style += ' background-color: #fff3cd; border: 2px solid black;';
                    }
                }

                let number = '';
                if (c === startCol) {
                    number = `<span style="font-size: 10px; position: absolute; top: 1px; left: 2px;">${r + 1}</span>`;
                }

                html += `<td class="${cellClass}" style="${style} position: relative;">${number}${cellContent}</td>`;
            }
            html += '</tr>';
        }
        html += '</table>';

        // 2. Clues (Legend)
        const hasAnyClue = solution.some(item => item.clue);

        html += '<div style="margin-top: 20px;"><h3>Legenda:</h3><ol>';
        solution.forEach((item, index) => {
            if (item.clue) {
                html += `<li>${item.clue}</li>`;
            } else {
                html += `<li>................................................................<span style="color: #999; font-size: 0.8em;">(Pro slovo: ${item.word})</span></li>`;
            }
        });
        html += '</ol>';

        if (!hasAnyClue) {
            html += '<p style="color: #666; font-style: italic; margin-top: 10px;">(Tip: Zadavejte slova ve formátu: SLOVO - NÁPOVĚDA, aby se zde vygeneroval i text.)</p>';
        }
        html += '</div>';

        // 3. Solution (Hidden by default or at bottom) for TEACHERS
        html += '<div style="margin-top: 30px; border-top: 1px dashed #ccc; padding-top: 10px; page-break-before: always;">';
        html += '<p><strong>Řešení (pro učitele):</strong></p>';
        html += `<p>Tajenka: <strong>${tajemka}</strong></p>`;
        html += '<ul>';
        solution.forEach((item, index) => {
            const clueText = item.clue ? ` - <em>${item.clue}</em>` : '';
            html += `<li>${index + 1}.<strong>${item.word}</strong>${clueText}</li>`;
        });
        html += '</ul></div>';

        html += '</div>';

        document.getElementById('crosswordPreview').innerHTML = html;
        resultSection.classList.remove('hidden');
        promptSection.classList.add('hidden');
    }

    function suggestTajemka() {
        const lines = wordsInput.value.trim().split(/[\n]+/);
        const wordsRaw = lines.map(line => {
            const parts = line.split(/[-–—:]/);
            return parts[0].trim().toUpperCase();
        }).filter(w => w.length > 0);

        if (wordsRaw.length < 3) {
            alert('Pro návrh tajenky zadejte alespoň 3 slova.');
            return;
        }

        // Try to find a word from the list that can be formed by the OTHER words
        let bestCandidate = null;
        let maxCoverage = -1;

        // Shuffle words to get random results if multiple are equally good
        const shuffledWords = [...wordsRaw].sort(() => Math.random() - 0.5);

        for (const candidate of shuffledWords) {
            const otherWords = wordsRaw.filter(w => w !== candidate);

            // Check if we can form this candidate using otherWords
            // We need to find a unique word for each letter of candidate
            const usedWords = new Set();
            let coveredLetters = 0;

            for (const letter of candidate) {
                const match = otherWords.find(w => w.includes(letter) && !usedWords.has(w));
                if (match) {
                    usedWords.add(match);
                    coveredLetters++;
                }
            }

            // We prefer candidates that are fully covered
            if (coveredLetters === candidate.length) {
                bestCandidate = candidate;
                break; // Found a perfect match!
            }

            // Or keep track of the best partial match
            if (coveredLetters > maxCoverage) {
                maxCoverage = coveredLetters;
                bestCandidate = candidate;
            }
        }

        if (bestCandidate) {
            tajemkaInput.value = bestCandidate;
            // Optional: Highlight or animate to show it was filled
            tajemkaInput.style.backgroundColor = '#e0f7fa';
            setTimeout(() => tajemkaInput.style.backgroundColor = '', 1000);
        } else {
            alert('Nepodařilo se najít vhodnou tajenku z vašich slov.');
        }
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
                'Authorization': `Bearer ${apiKey} `
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: "You are a specialized linguistic assistant for crosswords. You output ONLY structured data or text lists. DO NOT write code, scripts, or explanations. Never use markdown code blocks." },
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
                    parts: [{ text: "You are a specialized linguistic assistant for crosswords. You output ONLY structured data or text lists. DO NOT write code. " + prompt }]
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
});
