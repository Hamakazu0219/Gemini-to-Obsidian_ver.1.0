chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractContent') {
        const data = extractConversation();
        sendResponse(data);
    }
});

function extractConversation() {
    const turns = document.querySelectorAll('user-query, model-response');
    let markdown = '';

    // Extract Title from the sidebar if possible, or use the first user query
    let title = document.title.replace('Gemini - ', '').trim();
    if (!title || title === 'Gemini') {
        const firstQuery = document.querySelector('user-query .query-text');
        if (firstQuery) {
            title = firstQuery.textContent.slice(0, 50).trim();
        } else {
            title = `Conversation ${new Date().toLocaleDateString()}`;
        }
    }

    // Add frontmatter or header
    markdown += `# ${title}\n\n`;
    markdown += `**Date:** ${new Date().toLocaleString()}\n`;
    markdown += `**URL:** ${window.location.href}\n\n---\n\n`;

    turns.forEach((turn) => {
        if (turn.tagName.toLowerCase() === 'user-query') {
            const text = turn.textContent.trim();
            markdown += `## User\n\n${text}\n\n`;
        } else if (turn.tagName.toLowerCase() === 'model-response') {
            const contentDiv = turn.querySelector('.model-response-text, .response-content'); // Adjust selector based on actual DOM
            // Fallback if specific class not found, try to get the main container
            const content = contentDiv ? contentDiv : turn;

            const text = convertHtmlToMarkdown(content);
            markdown += `## Gemini\n\n${text}\n\n`;
        }
    });

    return {
        title: title,
        markdown: markdown
    };
}

function convertHtmlToMarkdown(element) {
    if (!element) return '';

    // Clone to avoid modifying the live DOM
    const clone = element.cloneNode(true);

    // Remove unwanted elements
    const unwanted = clone.querySelectorAll('script, style, button, .response-actions, .thumbs-feedback');
    unwanted.forEach(el => el.remove());

    // Basic HTML to Markdown conversion
    let html = clone.innerHTML;

    // Replace code blocks
    // Gemini often wraps code in <code-block> or similar custom elements, or standard <pre><code>
    // We need a robust strategy. For now, let's try a simple approach for standard elements.
    // Real Gemini DOM is complex/shadow-dom heavy, but scraping outerHTML often works for text.

    // Process code blocks first to protect them
    // Note: A full Turndown implementation is better, but this is a lightweight scratch
    // Let's rely on innerText logic for simple formatting or simple replacements

    // HEADERS
    html = html.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
    html = html.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
    html = html.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');

    // BOLD
    html = html.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    html = html.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');

    // ITALIC
    html = html.replace(/<em[^>]*>(.*?)<\/em>/gi, '_$1_');
    html = html.replace(/<i[^>]*>(.*?)<\/i>/gi, '_$1_');

    // LISTS
    html = html.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    html = html.replace(/<ul[^>]*>/gi, '\n');
    html = html.replace(/<\/ul>/gi, '\n');
    html = html.replace(/<ol[^>]*>/gi, '\n');
    html = html.replace(/<\/ol>/gi, '\n');

    // PARAGRAPHS
    html = html.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

    // LINKS
    html = html.replace(/<a[^>]+href="(.*?)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

    // CODE BLOCKS (Simple heuristic)
    // Gemini often puts code in <pre class="code-block"><code>...
    html = html.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (match, code) => {
        // Decode entities in code
        const decoded = decodeHTMLEntities(code);
        return `\`\`\`\n${decoded}\n\`\`\`\n`;
    });

    // INLINE CODE
    html = html.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

    // Newlines
    html = html.replace(/<br\s*\/?>/gi, '\n');

    // Create a temporary element to get text content to strip remaining tags safely
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.innerText.trim();
}

function decodeHTMLEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}
