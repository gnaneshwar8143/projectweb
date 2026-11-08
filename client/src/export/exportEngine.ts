import JSZip from 'jszip';
import type { Project, Page, Section, WebElement, ElementStyles, ThemeConfig } from '../types';
import { DEFAULT_THEME, BORDER_RADIUS_MAP } from '../types';

// ─── Style object to CSS string ───────────────────────────────────────────────
function stylesToString(styles: ElementStyles, indent = '  '): string {
  return Object.entries(styles)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => {
      const prop = k.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${indent}${prop}: ${v};`;
    })
    .join('\n');
}

// ─── Element to HTML ──────────────────────────────────────────────────────────
function elementToHtml(el: WebElement, indent = ''): string {
  if (el.hidden) return '';
  const style = stylesToString(el.styles, '');
  const styleAttr = style ? ` style="${style.replace(/\n/g, ' ')}"` : '';
  const i = indent;

  switch (el.type) {
    case 'heading': {
      const t = `h${el.level}`;
      return `${i}<${t}${styleAttr}>${el.content}</${t}>`;
    }
    case 'paragraph':
      return `${i}<p${styleAttr}>${el.content}</p>`;
    case 'button':
      return `${i}<a href="${escapeAttr(el.href)}" target="${el.target}"${styleAttr}>${escapeHtml(el.text)}</a>`;
    case 'image':
      return `${i}<img src="${escapeAttr(el.src)}" alt="${escapeAttr(el.alt)}"${styleAttr} />`;
    case 'video':
      return `${i}<video${styleAttr}${el.autoplay ? ' autoplay' : ''}${el.loop ? ' loop' : ''}${el.muted ? ' muted' : ''}${el.controls ? ' controls' : ''} src="${escapeAttr(el.src)}"></video>`;
    case 'divider':
      return `${i}<hr${styleAttr} />`;
    case 'spacer':
      return `${i}<div${styleAttr}></div>`;
    case 'container':
      return `${i}<div${styleAttr}>\n${el.children?.map(c => elementToHtml(c, i + '  ')).join('\n') ?? ''}\n${i}</div>`;
    case 'navbar':
      return `${i}<nav${styleAttr}>
${i}  <span style="font-weight:700;font-size:20px">${escapeHtml(el.logo)}</span>
${i}  <ul style="display:flex;gap:32px;list-style:none;margin:0;padding:0">
${el.links.map(l => `${i}    <li><a href="${escapeAttr(l.href)}" style="text-decoration:none;color:inherit">${escapeHtml(l.label)}</a></li>`).join('\n')}
${i}  </ul>
${i}</nav>`;
    case 'gallery':
      return `${i}<div${styleAttr}>
${el.images.map(img => `${i}  <img src="${escapeAttr(img.src)}" alt="${escapeAttr(img.alt)}" style="width:100%;object-fit:cover;border-radius:8px" />`).join('\n')}
${i}</div>`;
    case 'card':
      return `${i}<div${styleAttr}>
${el.image ? `${i}  <img src="${escapeAttr(el.image)}" alt="${escapeAttr(el.title)}" style="width:100%;height:200px;object-fit:cover" />` : ''}
${i}  <div style="padding:24px">
${i}    <h3 style="margin:0 0 8px">${escapeHtml(el.title)}</h3>
${el.description ? `${i}    <p style="margin:0 0 16px;opacity:0.7">${escapeHtml(el.description)}</p>` : ''}
${el.buttonText ? `${i}    <a href="${escapeAttr(el.buttonHref ?? '#')}" style="display:inline-block;padding:10px 24px;background:#6370f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">${escapeHtml(el.buttonText)}</a>` : ''}
${i}  </div>
${i}</div>`;
    case 'pricing':
      return `${i}<div${styleAttr}>
${el.plans.map(p => `${i}  <div style="background:${p.highlighted ? '#6370f1' : '#1e2438'};border-radius:16px;padding:40px;border:${p.highlighted ? '2px solid #6370f1' : '1px solid rgba(255,255,255,0.1)'}">
${i}    <p style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;color:rgba(255,255,255,0.6)">${escapeHtml(p.name)}</p>
${i}    <div style="display:flex;align-items:baseline;gap:4px;margin-bottom:8px"><span style="font-size:48px;font-weight:800;color:#fff">${escapeHtml(p.price)}</span><span style="color:rgba(255,255,255,0.5)">${escapeHtml(p.period)}</span></div>
${i}    <ul style="list-style:none;padding:0;margin:24px 0;display:flex;flex-direction:column;gap:12px">${p.features.map(f => `<li style="font-size:14px;color:rgba(255,255,255,0.8)">✓ ${escapeHtml(f)}</li>`).join('')}</ul>
${i}    <a href="#" style="display:block;text-align:center;padding:14px 24px;background:${p.highlighted ? '#fff' : 'rgba(99,112,241,0.2)'};color:${p.highlighted ? '#6370f1' : '#fff'};border-radius:8px;font-weight:700;text-decoration:none">${escapeHtml(p.buttonText)}</a>
${i}  </div>`).join('\n')}
${i}</div>`;
    case 'testimonial':
      return `${i}<div${styleAttr}>
${i}  <div style="display:flex;gap:4px;margin-bottom:16px">${'★'.repeat(el.rating)}</div>
${i}  <p style="font-size:16px;line-height:1.7;font-style:italic;margin-bottom:20px">"${escapeHtml(el.quote)}"</p>
${i}  <div style="display:flex;align-items:center;gap:12px">
${el.avatar ? `${i}    <img src="${escapeAttr(el.avatar)}" alt="${escapeAttr(el.author)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover" />` : ''}
${i}    <div><p style="margin:0;font-weight:700">${escapeHtml(el.author)}</p><p style="margin:0;opacity:0.6;font-size:12px">${escapeHtml(el.role)}</p></div>
${i}  </div>
${i}</div>`;
    case 'form':
      return `${i}<form${styleAttr} method="post">
${el.fields.map(f => `${i}  <div style="margin-bottom:20px">
${i}    <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:500">${escapeHtml(f.label)}${f.required ? ' *' : ''}</label>
${f.type === 'textarea' ? `${i}    <textarea name="${f.type}" placeholder="${escapeAttr(f.placeholder)}"${f.required ? ' required' : ''} style="width:100%;padding:12px;border:1px solid #e2e8f0;border-radius:8px;resize:vertical;font-family:inherit;box-sizing:border-box" rows="4"></textarea>` : `${i}    <input type="${f.type}" name="${f.type}" placeholder="${escapeAttr(f.placeholder)}"${f.required ? ' required' : ''} style="width:100%;padding:12px;border:1px solid #e2e8f0;border-radius:8px;box-sizing:border-box" />`}
${i}  </div>`).join('\n')}
${i}  <button type="submit" style="padding:14px 32px;background:#6370f1;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer">${escapeHtml(el.submitText)}</button>
${i}</form>`;
    case 'footer':
      return `${i}<footer${styleAttr}>
${i}  <div style="text-align:center">
${i}    <span style="font-size:22px;font-weight:700">${escapeHtml(el.logo)}</span>
${el.tagline ? `${i}    <p style="margin:12px 0;opacity:0.6;font-size:14px">${escapeHtml(el.tagline)}</p>` : ''}
${i}    <div style="display:flex;gap:24px;justify-content:center;flex-wrap:wrap;margin:16px 0">
${el.links.map(l => `${i}      <a href="${escapeAttr(l.href)}" style="opacity:0.6;text-decoration:none;font-size:14px">${escapeHtml(l.label)}</a>`).join('\n')}
${i}    </div>
${i}    <p style="margin:0;font-size:12px;opacity:0.4">${escapeHtml(el.copyright)}</p>
${i}  </div>
${i}</footer>`;
    case 'html':
      return `${i}${el.html}`;
    default:
      return '';
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(str: string): string {
  if (!str) return '#';
  // Sanitize: block javascript: URLs
  if (/^javascript:/i.test(str.trim())) return '#';
  return str.replace(/"/g, '&quot;');
}

// ─── Section to HTML ──────────────────────────────────────────────────────────
function sectionToHtml(section: Section): string {
  if (section.hidden) return '';
  const style = stylesToString(section.styles, '');
  const styleAttr = style ? ` style="${style.replace(/\n/g, ' ')}"` : '';
  const inner = section.elements.map(el => elementToHtml(el, '    ')).filter(Boolean).join('\n');
  return `  <section id="${section.id}"${styleAttr}>\n${inner}\n  </section>`;
}

// ─── Page to HTML ─────────────────────────────────────────────────────────────
function pageToHtml(page: Page, project: Project): string {
  const theme = project.theme ?? DEFAULT_THEME;
  const allFonts = Array.from(new Set([theme.headingFont, theme.bodyFont, ...project.settings.fonts].filter(Boolean)));
  const fonts = `<link href="https://fonts.googleapis.com/css2?family=${allFonts.map(f => encodeURIComponent(f) + ':wght@300;400;500;600;700;800').join('&family=')}&display=swap" rel="stylesheet">`;

  const sections = page.sections.map(sectionToHtml).filter(Boolean).join('\n\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(page.meta.title || project.name)}</title>
  <meta name="description" content="${escapeAttr(page.meta.description)}" />
  <meta name="keywords" content="${escapeAttr(page.meta.keywords)}" />
  ${fonts}
  <link rel="stylesheet" href="style.css" />
</head>
<body>
${sections}
</body>
</html>`;
}

// ─── Global CSS (with Theme Design Tokens) ────────────────────────────────────
function generateCSS(project: Project): string {
  const theme: ThemeConfig = project.theme ?? DEFAULT_THEME;
  const br = BORDER_RADIUS_MAP[theme.borderRadius];
  return `/* WebCraft Studio Export */
/* ── Design Tokens ── */
:root {
  --primary-color:    ${theme.primaryColor};
  --secondary-color:  ${theme.secondaryColor};
  --accent-color:     ${theme.accentColor};
  --text-color:       ${theme.textColor};
  --bg-color:         ${theme.backgroundColor};
  --heading-font:     '${theme.headingFont}', system-ui, sans-serif;
  --body-font:        '${theme.bodyFont}', system-ui, sans-serif;
  --border-radius:    ${br};
}

*, *::before, *::after { box-sizing: border-box; }

html {
  -webkit-font-smoothing: antialiased;
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: var(--body-font);
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--bg-color);
}

img, video { max-width: 100%; display: block; }

a { color: inherit; }

input, textarea, button, select {
  font-family: inherit;
}

/* Responsive */
@media (max-width: 768px) {
  body { font-size: 15px; }
}

@media (max-width: 480px) {
  body { font-size: 14px; }
}

${project.settings.globalStyles || ''}
`;
}

// ─── README ───────────────────────────────────────────────────────────────────
function generateReadme(project: Project): string {
  return `# ${project.name}

Exported from WebCraft Studio on ${new Date().toLocaleString()}.

## Files

${project.pages.map(p => `- \`${p.slug || p.name.toLowerCase().replace(/\s+/g, '-')}.html\` — ${p.name} page`).join('\n')}
- \`style.css\` — Shared stylesheet

## Usage

1. Open any \`.html\` file in your browser.
2. To publish, upload all files to any web host (Netlify, Vercel static, GitHub Pages, etc.).

## Notes

- This site uses Google Fonts. An internet connection is required to load fonts.
- Forms are static and require a backend or service like Formspree to process submissions.
`;
}

// ─── Main export function ─────────────────────────────────────────────────────
export async function exportWebsite(project: Project): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder(project.name.replace(/[^a-zA-Z0-9-_]/g, '_')) ?? zip;

  // CSS
  folder.file('style.css', generateCSS(project));

  // HTML pages
  for (const page of project.pages) {
    const filename = `${page.slug || page.name.toLowerCase().replace(/\s+/g, '-') || 'index'}.html`;
    folder.file(filename, pageToHtml(page, project));
  }

  // README
  folder.file('README.md', generateReadme(project));

  // Generate and trigger download
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.replace(/[^a-zA-Z0-9-_]/g, '_')}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}


// ─── React Component Exporter (Feature 2) ─────────────────────────────────────

function stylesToTailwind(styles: ElementStyles): string {
  const tw: string[] = [];
  // background
  if (styles.backgroundColor) tw.push(`style={{ backgroundColor: '${styles.backgroundColor}' }}`);
  return tw.join(' ');
}

/** Convert ElementStyles to an inline React style object string */
function stylesToInlineStyle(styles: ElementStyles, extra?: ElementStyles): string {
  const merged = { ...styles, ...extra };
  const entries = Object.entries(merged)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `  ${k}: '${String(v).replace(/'/g, "\\'")}'`);
  if (entries.length === 0) return '';
  return `{{\n${entries.join(',\n')}\n}}`;
}

function elementToJsx(el: WebElement, indent = '    '): string {
  if (el.hidden) return '';
  const i = indent;
  const style = stylesToInlineStyle(el.styles);
  const styleAttr = style ? ` style=${style}` : '';

  switch (el.type) {
    case 'heading': {
      const Tag = `h${el.level}`;
      return `${i}<${Tag}${styleAttr} dangerouslySetInnerHTML={{ __html: \`${el.content.replace(/`/g, '\\`')}\` }} />`;
    }
    case 'paragraph':
      return `${i}<p${styleAttr} dangerouslySetInnerHTML={{ __html: \`${el.content.replace(/`/g, '\\`')}\` }} />`;
    case 'button':
      return `${i}<a href="${el.href}" target="${el.target}"${styleAttr}>${el.text}</a>`;
    case 'image':
      return `${i}<img src="${el.src}" alt="${el.alt}"${styleAttr} />`;
    case 'video':
      return [
        `${i}<video${styleAttr}`,
        el.autoplay ? ' autoPlay' : '',
        el.loop ? ' loop' : '',
        el.muted ? ' muted' : '',
        el.controls ? ' controls' : '',
        ` src="${el.src}" />`,
      ].join('');
    case 'divider':
      return `${i}<hr${styleAttr} />`;
    case 'spacer':
      return `${i}<div${styleAttr} />`;
    case 'container': {
      const kids = el.children?.map(c => elementToJsx(c, i + '  ')).join('\n') ?? '';
      return `${i}<div${styleAttr}>\n${kids}\n${i}</div>`;
    }
    case 'navbar':
      return `${i}<nav${styleAttr}>
${i}  <span style={{ fontWeight: 700, fontSize: '20px' }}>${el.logo}</span>
${i}  <ul style={{ display: 'flex', gap: '32px', listStyle: 'none', margin: 0, padding: 0 }}>
${el.links.map(l => `${i}    <li><a href="${l.href}" style={{ textDecoration: 'none', color: 'inherit' }}>${l.label}</a></li>`).join('\n')}
${i}  </ul>
${i}</nav>`;
    case 'gallery':
      return `${i}<div${styleAttr} style={{ display: 'grid', gridTemplateColumns: 'repeat(${el.columns}, 1fr)', gap: '12px' }}>
${el.images.map(img => `${i}  <img src="${img.src}" alt="${img.alt}" style={{ width: '100%', objectFit: 'cover', borderRadius: '8px' }} />`).join('\n')}
${i}</div>`;
    case 'card':
      return `${i}<div${styleAttr}>
${el.image ? `${i}  <img src="${el.image}" alt="${el.title}" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />` : ''}
${i}  <div style={{ padding: '24px' }}>
${i}    <h3 style={{ margin: '0 0 8px' }}>${el.title}</h3>
${el.description ? `${i}    <p style={{ margin: '0 0 16px', opacity: 0.7 }}>${el.description}</p>` : ''}
${el.buttonText ? `${i}    <a href="${el.buttonHref ?? '#'}" style={{ display: 'inline-block', padding: '10px 24px', background: 'var(--primary-color)', color: '#fff', borderRadius: 'var(--border-radius)', textDecoration: 'none', fontWeight: 600 }}>${el.buttonText}</a>` : ''}
${i}  </div>
${i}</div>`;
    case 'pricing':
      return `${i}<div${styleAttr}>
${el.plans.map(p => `${i}  <div style={{ background: '${p.highlighted ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)'}', borderRadius: '16px', padding: '40px' }}>
${i}    <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>${p.name}</p>
${i}    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
${i}      <span style={{ fontSize: '48px', fontWeight: 800 }}>${p.price}</span>
${i}      <span style={{ opacity: 0.5 }}>${p.period}</span>
${i}    </div>
${i}    <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0' }}>
${p.features.map(f => `${i}      <li>✓ ${f}</li>`).join('\n')}
${i}    </ul>
${i}    <a href="#" style={{ display: 'block', textAlign: 'center', padding: '14px 24px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', background: '${p.highlighted ? '#fff' : 'rgba(99,112,241,0.2)'}', color: '${p.highlighted ? 'var(--primary-color)' : '#fff'}' }}>${p.buttonText}</a>
${i}  </div>`).join('\n')}
${i}</div>`;
    case 'testimonial':
      return `${i}<div${styleAttr}>
${i}  <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>{'★'.repeat(${el.rating})}</div>
${i}  <p style={{ fontSize: '16px', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '20px' }}>"{el.quote}"</p>
${i}  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
${el.avatar ? `${i}    <img src="${el.avatar}" alt="${el.author}" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />` : ''}
${i}    <div>
${i}      <p style={{ margin: 0, fontWeight: 700 }}>${el.author}</p>
${i}      <p style={{ margin: 0, opacity: 0.6, fontSize: '12px' }}>${el.role}</p>
${i}    </div>
${i}  </div>
${i}</div>`;
    case 'form':
      return `${i}<form${styleAttr} onSubmit={e => e.preventDefault()}>
${el.fields.map(f => `${i}  <div style={{ marginBottom: '20px' }}>
${i}    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>${f.label}${f.required ? ' *' : ''}</label>
${f.type === 'textarea'
  ? `${i}    <textarea placeholder="${f.placeholder}"${f.required ? ' required' : ''} rows={4} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />`
  : `${i}    <input type="${f.type}" placeholder="${f.placeholder}"${f.required ? ' required' : ''} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box' }} />`}
${i}  </div>`).join('\n')}
${i}  <button type="submit" style={{ padding: '14px 32px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>${el.submitText}</button>
${i}</form>`;
    case 'footer':
      return `${i}<footer${styleAttr}>
${i}  <div style={{ textAlign: 'center' }}>
${i}    <span style={{ fontSize: '22px', fontWeight: 700 }}>${el.logo}</span>
${el.tagline ? `${i}    <p style={{ margin: '12px 0', opacity: 0.6, fontSize: '14px' }}>${el.tagline}</p>` : ''}
${i}    <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', margin: '16px 0' }}>
${el.links.map(l => `${i}      <a href="${l.href}" style={{ opacity: 0.6, textDecoration: 'none', fontSize: '14px' }}>${l.label}</a>`).join('\n')}
${i}    </div>
${i}    <p style={{ margin: 0, fontSize: '12px', opacity: 0.4 }}>${el.copyright}</p>
${i}  </div>
${i}</footer>`;
    case 'html':
      return `${i}<div${styleAttr} dangerouslySetInnerHTML={{ __html: \`${el.html.replace(/`/g, '\\`')}\` }} />`;
    default:
      return '';
  }
}

function sectionToJsx(section: Section): string {
  if (section.hidden) return '';
  const style = stylesToInlineStyle(section.styles);
  const styleAttr = style ? ` style=${style}` : '';
  const inner = section.elements.map(el => elementToJsx(el, '      ')).filter(Boolean).join('\n');
  return `    <section id="${section.id}"${styleAttr}>\n${inner}\n    </section>`;
}

function pageToJsx(page: Page, compName: string): string {
  const sections = page.sections.map(sectionToJsx).filter(Boolean).join('\n\n');
  return `export default function ${compName}() {
  return (
    <main>
${sections}
    </main>
  );
}`;
}

/** Export the entire project as a React TSX component (zipped) */
export async function exportToReactComponent(project: Project): Promise<void> {
  const zip = new JSZip();
  const projectSlug = project.name.replace(/[^a-zA-Z0-9]/g, '');
  const folder = zip.folder(`${projectSlug}-react`) ?? zip;
  const theme = project.theme ?? DEFAULT_THEME;
  const br = BORDER_RADIUS_MAP[theme.borderRadius];
  const allFonts = Array.from(new Set([theme.headingFont, theme.bodyFont].filter(Boolean)));

  // ── CSS Variables (globals.css) ────────────────────────────────────────────
  const globalsCss = `/* WebCraft Studio — React Export */
@import url('https://fonts.googleapis.com/css2?family=${allFonts.map(f => encodeURIComponent(f) + ':wght@300;400;500;600;700;800').join('&family=')}&display=swap');

:root {
  --primary-color:   ${theme.primaryColor};
  --secondary-color: ${theme.secondaryColor};
  --accent-color:    ${theme.accentColor};
  --text-color:      ${theme.textColor};
  --bg-color:        ${theme.backgroundColor};
  --heading-font:    '${theme.headingFont}', system-ui, sans-serif;
  --body-font:       '${theme.bodyFont}', system-ui, sans-serif;
  --border-radius:   ${br};
}

*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  font-family: var(--body-font);
  background: var(--bg-color);
  color: var(--text-color);
}
img, video { max-width: 100%; display: block; }

${project.settings.globalStyles || ''}`;

  folder.file('globals.css', globalsCss);

  // ── One TSX file per page ──────────────────────────────────────────────────
  const pageImports: string[] = [];
  for (const page of project.pages) {
    const compName = (page.name.replace(/[^a-zA-Z0-9]/g, '') || 'Page') + 'Page';
    const fileName = `${compName}.tsx`;
    const header = `import React from 'react';\nimport './globals.css';\n\n`;
    folder.file(fileName, header + pageToJsx(page, compName));
    pageImports.push({ name: compName, file: fileName } as any);
  }

  // ── App.tsx ────────────────────────────────────────────────────────────────
  const firstComp = project.pages[0]
    ? (project.pages[0].name.replace(/[^a-zA-Z0-9]/g, '') || 'Page') + 'Page'
    : 'HomePage';
  const appTsx = `import React from 'react';
import ${firstComp} from './${firstComp}';

export default function App() {
  return <${firstComp} />;
}`;
  folder.file('App.tsx', appTsx);

  // ── package.json ───────────────────────────────────────────────────────────
  const pkg = JSON.stringify({
    name: projectSlug.toLowerCase() || 'webcraft-export',
    version: '1.0.0',
    scripts: { dev: 'vite', build: 'tsc && vite build', preview: 'vite preview' },
    dependencies: { react: '^18.3.0', 'react-dom': '^18.3.0' },
    devDependencies: { '@types/react': '^18.3.0', '@types/react-dom': '^18.3.0', typescript: '^5.6.0', vite: '^6.0.0', '@vitejs/plugin-react': '^4.0.0' },
  }, null, 2);
  folder.file('package.json', pkg);

  // ── README ─────────────────────────────────────────────────────────────────
  folder.file('README.md', `# ${project.name} — React Export

Generated by WebCraft Studio on ${new Date().toLocaleString()}.

## Getting started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Pages
${project.pages.map(p => `- \`${(p.name.replace(/[^a-zA-Z0-9]/g, '') || 'Page') + 'Page'}.tsx\` — ${p.name}`).join('\n')}
`);

  // ── Trigger download ───────────────────────────────────────────────────────
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectSlug}-react.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
