import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { v4 as uuid } from 'uuid';

const router = Router();

// ─── Helpers to build default elements ───────────────────────────────────────
function makeId() { return uuid(); }

// ─── POST /api/ai/generate-section ───────────────────────────────────────────
// Uses OpenAI Chat Completions (JSON mode) or Gemini if GOOGLE_API_KEY is set.
// Falls back to a smart rule-based generator when no API key is provided.
router.post('/generate-section', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body as { prompt?: string };
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      res.status(400).json({ success: false, error: 'A descriptive prompt is required.' });
      return;
    }

    const p = prompt.toLowerCase();

    // ── Try OpenAI first ────────────────────────────────────────────────────
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    const GEMINI_KEY = process.env.GOOGLE_API_KEY;

    if (OPENAI_KEY) {
      const section = await generateWithOpenAI(prompt, OPENAI_KEY);
      res.json({ success: true, data: { section } });
      return;
    }

    if (GEMINI_KEY) {
      const section = await generateWithGemini(prompt, GEMINI_KEY);
      res.json({ success: true, data: { section } });
      return;
    }

    // ── Fallback: rule-based generator ──────────────────────────────────────
    const section = generateRuleBased(p, prompt);
    res.json({ success: true, data: { section } });

  } catch (err: any) {
    console.error('AI generate error:', err);
    res.status(500).json({ success: false, error: err.message ?? 'AI generation failed' });
  }
});

// ─── OpenAI generator ────────────────────────────────────────────────────────
async function generateWithOpenAI(prompt: string, apiKey: string): Promise<object> {
  const systemPrompt = buildSystemPrompt();
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a website section for: ${prompt}` },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });
  const data = await response.json() as any;
  if (!response.ok) throw new Error(data.error?.message ?? 'OpenAI request failed');
  const parsed = JSON.parse(data.choices[0].message.content);
  return hydrateSectionIds(parsed.section ?? parsed);
}

// ─── Gemini generator ────────────────────────────────────────────────────────
async function generateWithGemini(prompt: string, apiKey: string): Promise<object> {
  const systemPrompt = buildSystemPrompt();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\nUser request: ${prompt}` }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7, maxOutputTokens: 2000 },
    }),
  });
  const data = await response.json() as any;
  if (!response.ok) throw new Error(data.error?.message ?? 'Gemini request failed');
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
  const parsed = JSON.parse(text);
  return hydrateSectionIds(parsed.section ?? parsed);
}

// ─── System prompt ────────────────────────────────────────────────────────────
function buildSystemPrompt(): string {
  return `You are a website section generator for WebCraft Studio. 
Return a valid JSON object matching this exact schema:

{
  "section": {
    "id": "PLACEHOLDER",
    "name": "string — short descriptive name",
    "locked": false,
    "hidden": false,
    "styles": {
      "padding": "80px 40px",
      "backgroundColor": "#hexcolor",
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "gap": "32px"
    },
    "elements": [ /* array of WebElement objects */ ]
  }
}

Supported element types and their required fields:
- heading: { type, id, name, locked, hidden, styles, responsiveStyles, content, level (1-6) }
- paragraph: { type, id, name, locked, hidden, styles, responsiveStyles, content }
- button: { type, id, name, locked, hidden, styles, responsiveStyles, text, href, target, variant }
- image: { type, id, name, locked, hidden, styles, responsiveStyles, src, alt }
- divider: { type, id, name, locked, hidden, styles, responsiveStyles }
- spacer: { type, id, name, locked, hidden, styles, responsiveStyles }
- card: { type, id, name, locked, hidden, styles, responsiveStyles, title, description, image, buttonText, buttonHref }
- pricing: { type, id, name, locked, hidden, styles, responsiveStyles, plans: [{ name, price, period, features, buttonText, highlighted }] }
- testimonial: { type, id, name, locked, hidden, styles, responsiveStyles, quote, author, role, avatar, rating }
- form: { type, id, name, locked, hidden, styles, responsiveStyles, fields: [{ type, label, placeholder, required }], submitText }
- navbar: { type, id, name, locked, hidden, styles, responsiveStyles, logo, links: [{ label, href }] }
- footer: { type, id, name, locked, hidden, styles, responsiveStyles, logo, tagline, links, copyright }

Rules:
- Use IDs as "PLACEHOLDER" (they will be replaced server-side)
- Use realistic, complete content — no placeholder text like "Lorem ipsum"
- Apply tasteful styles with good color contrast
- Match the user's described theme (dark/light, colors, layout)
- Return ONLY the JSON object, no markdown`;
}

// ─── Re-assign unique IDs to all elements in the section ─────────────────────
function hydrateSectionIds(section: any): any {
  section.id = uuid();
  if (Array.isArray(section.elements)) {
    section.elements = section.elements.map((el: any) => ({ ...el, id: uuid(), responsiveStyles: el.responsiveStyles ?? {} }));
  }
  return section;
}

// ─── Rule-based fallback generator ───────────────────────────────────────────
function generateRuleBased(p: string, originalPrompt: string): object {
  const isDark = p.includes('dark') || p.includes('night') || !p.includes('light');
  const bg = isDark ? '#0f1117' : '#ffffff';
  const textColor = isDark ? '#f8fafc' : '#1e293b';
  const accent = p.includes('green') ? '#10b981' : p.includes('red') ? '#ef4444' : p.includes('orange') ? '#f97316' : '#6370f1';

  // Pricing section
  if (p.includes('pricing') || p.includes('plan') || p.includes('tier')) {
    const tiers = p.includes('2') ? 2 : p.includes('4') ? 4 : 3;
    const tierNames = ['Starter', 'Pro', 'Enterprise', 'Ultimate'].slice(0, tiers);
    const prices = ['$0', '$29', '$79', '$149'].slice(0, tiers);
    return {
      id: makeId(), name: 'Pricing Section', locked: false, hidden: false,
      styles: { padding: '80px 40px', backgroundColor: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '48px' },
      elements: [
        { id: makeId(), type: 'heading', name: 'Pricing Heading', locked: false, hidden: false, responsiveStyles: {}, content: 'Simple, Transparent Pricing', level: 2, styles: { fontSize: '40px', fontWeight: '800', color: textColor, textAlign: 'center', margin: '0' } },
        { id: makeId(), type: 'paragraph', name: 'Pricing Subtext', locked: false, hidden: false, responsiveStyles: {}, content: originalPrompt, styles: { fontSize: '16px', color: textColor, opacity: '0.6', textAlign: 'center', maxWidth: '560px', lineHeight: '1.7', margin: '0' } },
        {
          id: makeId(), type: 'pricing', name: 'Pricing Table', locked: false, hidden: false, responsiveStyles: {},
          styles: { display: 'grid', gridTemplateColumns: `repeat(${tiers}, 1fr)`, gap: '24px', width: '100%', maxWidth: '900px' },
          plans: tierNames.map((name, i) => ({
            name, price: prices[i], period: '/mo', highlighted: i === 1,
            features: ['Unlimited projects', 'Priority support', 'Custom domain', 'Analytics dashboard', 'Team collaboration'].slice(0, 3 + i),
            buttonText: i === 0 ? 'Get Started Free' : `Choose ${name}`,
          })),
        },
      ],
    };
  }

  // Hero section
  if (p.includes('hero') || p.includes('landing') || p.includes('banner')) {
    return {
      id: makeId(), name: 'Hero Section', locked: false, hidden: false,
      styles: { padding: '100px 40px', backgroundColor: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center', minHeight: '90vh', justifyContent: 'center' },
      elements: [
        { id: makeId(), type: 'heading', name: 'Hero Heading', locked: false, hidden: false, responsiveStyles: {}, content: 'Build Something Amazing', level: 1, styles: { fontSize: '56px', fontWeight: '900', color: textColor, lineHeight: '1.1', maxWidth: '700px', margin: '0' } },
        { id: makeId(), type: 'paragraph', name: 'Hero Subtitle', locked: false, hidden: false, responsiveStyles: {}, content: originalPrompt, styles: { fontSize: '18px', color: textColor, opacity: '0.7', maxWidth: '540px', lineHeight: '1.7', margin: '0' } },
        { id: makeId(), type: 'button', name: 'CTA Button', locked: false, hidden: false, responsiveStyles: {}, text: 'Get Started Free', href: '#', target: '_self' as const, variant: 'filled' as const, styles: { padding: '16px 40px', backgroundColor: accent, color: '#fff', borderRadius: '8px', fontSize: '16px', fontWeight: '700', display: 'inline-block', textDecoration: 'none', cursor: 'pointer', border: 'none' } },
      ],
    };
  }

  // Testimonials
  if (p.includes('testimonial') || p.includes('review') || p.includes('feedback')) {
    return {
      id: makeId(), name: 'Testimonials Section', locked: false, hidden: false,
      styles: { padding: '80px 40px', backgroundColor: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '48px' },
      elements: [
        { id: makeId(), type: 'heading', name: 'Testimonials Heading', locked: false, hidden: false, responsiveStyles: {}, content: 'What Our Customers Say', level: 2, styles: { fontSize: '36px', fontWeight: '800', color: textColor, textAlign: 'center', margin: '0' } },
        ...[
          { quote: 'This product completely transformed how our team works. Incredible value for money.', author: 'Sarah Johnson', role: 'CEO at TechCorp', rating: 5 },
          { quote: 'I\'ve tried many similar tools, but nothing comes close to the quality and ease of use here.', author: 'Marcus Lee', role: 'Product Designer', rating: 5 },
          { quote: 'Outstanding customer support and a genuinely powerful feature set. Highly recommend.', author: 'Priya Patel', role: 'Startup Founder', rating: 5 },
        ].map(t => ({
          id: makeId(), type: 'testimonial' as const, name: `Testimonial — ${t.author}`, locked: false, hidden: false, responsiveStyles: {},
          ...t, avatar: undefined,
          styles: { padding: '32px', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderRadius: '16px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, maxWidth: '340px' },
        })),
      ],
    };
  }

  // Contact form
  if (p.includes('contact') || p.includes('form') || p.includes('reach')) {
    return {
      id: makeId(), name: 'Contact Section', locked: false, hidden: false,
      styles: { padding: '80px 40px', backgroundColor: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' },
      elements: [
        { id: makeId(), type: 'heading', name: 'Contact Heading', locked: false, hidden: false, responsiveStyles: {}, content: 'Get In Touch', level: 2, styles: { fontSize: '36px', fontWeight: '800', color: textColor, textAlign: 'center', margin: '0' } },
        { id: makeId(), type: 'paragraph', name: 'Contact Sub', locked: false, hidden: false, responsiveStyles: {}, content: 'Have a question? We\'d love to hear from you. Send us a message and we\'ll get back within 24 hours.', styles: { fontSize: '16px', color: textColor, opacity: '0.6', textAlign: 'center', maxWidth: '480px', lineHeight: '1.7', margin: '0' } },
        {
          id: makeId(), type: 'form', name: 'Contact Form', locked: false, hidden: false, responsiveStyles: {},
          styles: { width: '100%', maxWidth: '520px', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', padding: '40px', borderRadius: '16px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}` },
          fields: [
            { type: 'text', label: 'Full Name', placeholder: 'John Doe', required: true },
            { type: 'email', label: 'Email Address', placeholder: 'john@example.com', required: true },
            { type: 'textarea', label: 'Message', placeholder: 'Tell us how we can help…', required: true },
          ],
          submitText: 'Send Message',
        },
      ],
    };
  }

  // Features / cards
  if (p.includes('feature') || p.includes('card') || p.includes('service') || p.includes('benefit')) {
    return {
      id: makeId(), name: 'Features Section', locked: false, hidden: false,
      styles: { padding: '80px 40px', backgroundColor: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '48px' },
      elements: [
        { id: makeId(), type: 'heading', name: 'Features Heading', locked: false, hidden: false, responsiveStyles: {}, content: 'Everything You Need', level: 2, styles: { fontSize: '36px', fontWeight: '800', color: textColor, textAlign: 'center', margin: '0' } },
        ...[
          { title: 'Lightning Fast', description: 'Optimized for performance from the ground up. Load times under 1 second guaranteed.' },
          { title: 'Fully Customizable', description: 'Every element adapts to your brand. No compromises on design.' },
          { title: 'Enterprise Security', description: 'Bank-grade encryption and SOC 2 compliance keep your data safe.' },
        ].map(c => ({
          id: makeId(), type: 'card' as const, name: `Feature — ${c.title}`, locked: false, hidden: false, responsiveStyles: {},
          ...c, image: undefined, buttonText: undefined, buttonHref: undefined,
          styles: { padding: '32px', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderRadius: '16px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`, flex: '1', minWidth: '240px' },
        })),
      ],
    };
  }

  // Generic fallback — pretty content section
  return {
    id: makeId(), name: 'Generated Section', locked: false, hidden: false,
    styles: { padding: '80px 40px', backgroundColor: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' },
    elements: [
      { id: makeId(), type: 'heading', name: 'Section Heading', locked: false, hidden: false, responsiveStyles: {}, content: originalPrompt.length < 60 ? originalPrompt : 'Your New Section', level: 2, styles: { fontSize: '36px', fontWeight: '800', color: textColor, textAlign: 'center', margin: '0' } },
      { id: makeId(), type: 'paragraph', name: 'Section Description', locked: false, hidden: false, responsiveStyles: {}, content: 'This section was generated based on your prompt. Click any element to customize its content and styles.', styles: { fontSize: '16px', color: textColor, opacity: '0.6', textAlign: 'center', maxWidth: '560px', lineHeight: '1.7', margin: '0' } },
      { id: makeId(), type: 'button', name: 'CTA Button', locked: false, hidden: false, responsiveStyles: {}, text: 'Get Started', href: '#', target: '_self' as const, variant: 'filled' as const, styles: { padding: '14px 32px', backgroundColor: accent, color: '#fff', borderRadius: '8px', fontWeight: '700', fontSize: '15px', display: 'inline-block', textDecoration: 'none', border: 'none', cursor: 'pointer' } },
    ],
  };
}

export default router;
