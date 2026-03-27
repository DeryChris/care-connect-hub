// src/lib/printDocument.ts
// Opens a new window with fully-styled HTML content and triggers browser print.
// Works for PDF (Save as PDF) and direct printer output.

export interface PrintOptions {
  title: string;
  content: string;        // markdown string
  meta?: {
    author?: string;
    date?: string;
    category?: string;
    status?: string;
    tags?: string[];
  };
}

export function printDocument({ title, content, meta }: PrintOptions) {
  // Convert minimal markdown to HTML for the print window
  const html = markdownToHtml(content);

  const metaHtml = meta ? `
    <div class="meta">
      ${meta.category ? `<span class="badge">${meta.category.replace('_', ' ')}</span>` : ''}
      ${meta.status   ? `<span class="badge">${meta.status}</span>` : ''}
      ${meta.author   ? `<span class="author">By ${meta.author}</span>` : ''}
      ${meta.date     ? `<span class="date">${meta.date}</span>` : ''}
    </div>
    ${meta.tags?.length ? `<div class="tags">${meta.tags.map(t => `<span class="tag">#${t}</span>`).join('')}</div>` : ''}
  ` : '';

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Please allow pop-ups to print this document.');
    return;
  }

  printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.7;
      color: #1a1a1a;
      background: #fff;
      padding: 0;
    }

    .page {
      max-width: 21cm;
      margin: 0 auto;
      padding: 2cm 2.5cm;
    }

    /* Header */
    .doc-header {
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
    }

    h1.doc-title {
      font-size: 22pt;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 0.5rem;
      color: #111;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-top: 0.4rem;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 9pt;
      color: #555;
    }

    .badge {
      background: #e8e8e8;
      color: #333;
      border-radius: 4px;
      padding: 1px 6px;
      text-transform: capitalize;
      font-size: 8pt;
      font-weight: 600;
    }

    .author { font-size: 9pt; }
    .date   { font-size: 9pt; }

    .tags {
      margin-top: 0.3rem;
      display: flex;
      gap: 0.3rem;
      flex-wrap: wrap;
    }

    .tag {
      color: #555;
      font-size: 8pt;
      font-family: 'Helvetica Neue', Arial, sans-serif;
    }

    /* Content typography */
    .content h1 { font-size: 18pt; margin: 1.4rem 0 0.5rem; border-bottom: 1px solid #ddd; padding-bottom: 0.3rem; }
    .content h2 { font-size: 15pt; margin: 1.2rem 0 0.4rem; border-bottom: 1px solid #eee; padding-bottom: 0.2rem; }
    .content h3 { font-size: 13pt; margin: 1rem 0 0.3rem; }
    .content h4 { font-size: 12pt; margin: 0.8rem 0 0.2rem; }

    .content p  { margin: 0.6rem 0; }

    .content ul, .content ol {
      margin: 0.5rem 0 0.5rem 1.5rem;
    }
    .content li { margin: 0.2rem 0; }

    .content strong { font-weight: 700; }
    .content em     { font-style: italic; }

    .content a { color: #1a56db; text-decoration: underline; }

    .content code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 10pt;
      background: #f3f3f3;
      border: 1px solid #ddd;
      border-radius: 3px;
      padding: 0 4px;
    }

    .content pre {
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 0.8rem 1rem;
      overflow: auto;
      margin: 0.8rem 0;
      page-break-inside: avoid;
    }

    .content pre code {
      background: none;
      border: none;
      padding: 0;
      font-size: 9.5pt;
    }

    .content blockquote {
      border-left: 4px solid #ccc;
      padding: 0.4rem 0.8rem;
      margin: 0.8rem 0;
      color: #555;
      background: #fafafa;
    }

    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.8rem 0;
      font-size: 10pt;
      page-break-inside: avoid;
    }

    .content th {
      background: #f0f0f0;
      border: 1px solid #ccc;
      padding: 6px 10px;
      text-align: left;
      font-weight: 600;
    }

    .content td {
      border: 1px solid #ccc;
      padding: 5px 10px;
    }

    .content tr:nth-child(even) td {
      background: #fafafa;
    }

    .content hr {
      border: none;
      border-top: 1px solid #ddd;
      margin: 1rem 0;
    }

    .content img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      page-break-inside: avoid;
    }

    /* Checkbox lists (GFM task lists) */
    .content input[type="checkbox"] { margin-right: 4px; }

    /* Footer */
    .doc-footer {
      margin-top: 2rem;
      padding-top: 0.8rem;
      border-top: 1px solid #ddd;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 8pt;
      color: #888;
      display: flex;
      justify-content: space-between;
    }

    /* Print rules */
    @media print {
      body { padding: 0; }
      .page { padding: 1.5cm 2cm; }
      .no-print { display: none !important; }
      h1, h2, h3, h4 { page-break-after: avoid; }
      p, li { orphans: 3; widows: 3; }
      pre, table, blockquote { page-break-inside: avoid; }
    }

    /* Print button (hidden on actual print) */
    .print-btn {
      position: fixed;
      top: 1rem;
      right: 1rem;
      background: #1a56db;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 11pt;
      cursor: pointer;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .print-btn:hover { background: #1e429f; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">
    🖨️ Print / Save as PDF
  </button>

  <div class="page">
    <div class="doc-header">
      <h1 class="doc-title">${escapeHtml(title)}</h1>
      ${metaHtml}
    </div>

    <div class="content">
      ${html}
    </div>

    <div class="doc-footer">
      <span>Care Connect Hub</span>
      <span>Printed on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
    </div>
  </div>

  <script>
    // Auto-focus so keyboard shortcut Ctrl+P works immediately
    window.focus();
  </script>
</body>
</html>`);

  printWindow.document.close();
}

// ── Minimal but complete markdown → HTML converter ──────────────────────────
// Handles: headings, bold, italic, code blocks, inline code, blockquotes,
// ordered/unordered lists, task lists, tables, horizontal rules, links, images

function markdownToHtml(md: string): string {
  let html = escapeHtmlContent(md);

  // Fenced code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code${lang ? ` class="language-${lang}"` : ''}>${code.trimEnd()}</code></pre>`
  );

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote><p>$1</p></blockquote>');

  // HR
  html = html.replace(/^(---|\*\*\*|___)\s*$/gm, '<hr>');

  // Headings
  html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.+)$/gm,  '<h5>$1</h5>');
  html = html.replace(/^#### (.+)$/gm,   '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm,    '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm,     '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm,      '<h1>$1</h1>');

  // Tables (GFM)
  html = html.replace(/^\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/gm, (_, header, rows) => {
    const ths  = header.split('|').filter((c: string) => c.trim()).map((c: string) => `<th>${c.trim()}</th>`).join('');
    const trs  = rows.trim().split('\n').map((row: string) => {
      const tds = row.split('|').filter((c: string) => c.trim() !== '').map((c: string) => `<td>${c.trim()}</td>`).join('');
      return `<tr>${tds}</tr>`;
    }).join('');
    return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
  });

  // Task list items
  html = html.replace(/^- \[x\] (.+)$/gim, '<li><input type="checkbox" checked disabled> $1</li>');
  html = html.replace(/^- \[ \] (.+)$/gim, '<li><input type="checkbox" disabled> $1</li>');

  // Unordered lists
  html = html.replace(/((?:^- .+\n?)+)/gm, (block) => {
    const items = block.trim().split('\n').map(l => `<li>${l.replace(/^- /, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
    const items = block.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });

  // Inline formatting
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g,     '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g,     '<em>$1</em>');
  html = html.replace(/_(.+?)_/g,       '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g,     '<del>$1</del>');
  html = html.replace(/`(.+?)`/g,       '<code>$1</code>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Paragraphs — wrap bare lines not already in a block element
  html = html.replace(/^(?!<[huptboil]|<table|<pre|<block)(.+)$/gm, '<p>$1</p>');

  // Collapse extra blank lines
  html = html.replace(/\n{3,}/g, '\n\n');

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Escape only & < > to preserve markdown syntax for subsequent processing
function escapeHtmlContent(str: string): string {
  return str
    .replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;')
    .replace(/<(?!\/?(?:pre|code|blockquote|ul|ol|li|table|thead|tbody|tr|th|td|h[1-6]|p|hr|br|strong|em|del|a|img)\b)/g, '&lt;');
}