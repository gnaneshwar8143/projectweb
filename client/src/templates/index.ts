import { v4 as uuid } from 'uuid';
import type { Page, Section, WebElement } from '../types';

// ─── Helper builders ─────────────────────────────────────────────────────────
const heading = (content: string, level: 1|2|3|4 = 1, styles = {}): WebElement => ({
  id: uuid(), type: 'heading', name: 'Heading', content, level,
  locked: false, hidden: false,
  styles: { fontSize: level === 1 ? '52px' : level === 2 ? '36px' : '24px', fontWeight: '700', color: '#ffffff', marginBottom: '16px', ...styles },
  responsiveStyles: { mobile: { fontSize: level === 1 ? '32px' : level === 2 ? '24px' : '18px' } },
});

const para = (content: string, styles = {}): WebElement => ({
  id: uuid(), type: 'paragraph', name: 'Paragraph', content,
  locked: false, hidden: false,
  styles: { fontSize: '16px', lineHeight: '1.7', color: 'rgba(255,255,255,0.75)', marginBottom: '24px', maxWidth: '640px', ...styles },
  responsiveStyles: {},
});

const btn = (text: string, href = '#', bg = '#6370f1', styles = {}): WebElement => ({
  id: uuid(), type: 'button', name: 'Button', text, href, target: '_self', variant: 'filled',
  locked: false, hidden: false,
  styles: { backgroundColor: bg, color: '#ffffff', padding: '14px 32px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', display: 'inline-block', cursor: 'pointer', border: 'none', textDecoration: 'none', ...styles },
  responsiveStyles: {},
});

const img = (src: string, alt: string, styles = {}): WebElement => ({
  id: uuid(), type: 'image', name: 'Image', src, alt,
  locked: false, hidden: false,
  styles: { width: '100%', borderRadius: '12px', objectFit: 'cover', ...styles },
  responsiveStyles: {},
});

const spacer = (h = '60px'): WebElement => ({
  id: uuid(), type: 'spacer', name: 'Spacer',
  locked: false, hidden: false,
  styles: { height: h, display: 'block' },
  responsiveStyles: { mobile: { height: '32px' } },
});

const divider = (color = 'rgba(255,255,255,0.1)'): WebElement => ({
  id: uuid(), type: 'divider', name: 'Divider',
  locked: false, hidden: false,
  styles: { width: '100%', borderTop: `1px solid ${color}`, margin: '0' },
  responsiveStyles: {},
});

const mkSection = (name: string, elements: WebElement[], styles = {}): Section => ({
  id: uuid(), name, elements, locked: false, hidden: false,
  styles: { width: '100%', padding: '80px 40px', ...styles },
});

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 1: Personal Portfolio
// ═══════════════════════════════════════════════════════════════════════════════
export const portfolioTemplate = (): Page[] => {
  const heroSection = mkSection('Hero', [
    { id: uuid(), type: 'navbar', name: 'Navbar', logo: 'Alex Chen', links: [
        { label: 'About', href: '#about' }, { label: 'Work', href: '#work' },
        { label: 'Skills', href: '#skills' }, { label: 'Contact', href: '#contact' },
      ],
      locked: false, hidden: false,
      styles: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0 40px 0', color: '#ffffff' },
      responsiveStyles: {},
    },
    heading('Hello, I\'m Alex Chen', 1, { fontSize: '68px', lineHeight: '1.1', marginBottom: '24px' }),
    heading('Full-Stack Developer & UI Designer', 2, { fontSize: '28px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }),
    para('I craft beautiful, performant web experiences. Passionate about clean code and thoughtful design.', { fontSize: '18px', marginBottom: '40px' }),
    { id: uuid(), type: 'container', name: 'CTA Buttons', children: [
        btn('View My Work', '#work', '#6370f1'),
        btn('Download CV', '#', 'transparent', { border: '2px solid rgba(255,255,255,0.4)', marginLeft: '16px' }),
      ],
      locked: false, hidden: false,
      styles: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
      responsiveStyles: {},
    },
  ], { background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' });

  const aboutSection = mkSection('About', [
    heading('About Me', 2, { color: '#1e293b', textAlign: 'center', marginBottom: '48px' }),
    { id: uuid(), type: 'container', name: 'About Grid', children: [
        img('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80', 'Alex Chen', { height: '400px', objectFit: 'cover' }),
        { id: uuid(), type: 'container', name: 'About Text', children: [
            heading('5+ Years of Experience', 3, { color: '#1e293b' }),
            para('I specialize in building modern web applications using React, Node.js, and cloud technologies. I love solving complex problems with elegant solutions.', { color: '#64748b' }),
            para('When I\'m not coding, you\'ll find me hiking, reading design books, or experimenting with generative art.', { color: '#64748b' }),
            btn('Get In Touch', '#contact', '#6370f1'),
          ],
          locked: false, hidden: false,
          styles: { display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px' },
          responsiveStyles: {},
        },
      ],
      locked: false, hidden: false,
      styles: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' },
      responsiveStyles: { mobile: { gridTemplateColumns: '1fr' } },
    },
  ], { backgroundColor: '#f8fafc', padding: '100px 80px' });

  const skillsSection = mkSection('Skills', [
    heading('Skills & Technologies', 2, { color: '#ffffff', textAlign: 'center', marginBottom: '12px' }),
    para('Tools and technologies I use to build products.', { textAlign: 'center', marginBottom: '60px', margin: '0 auto 60px' }),
    { id: uuid(), type: 'container', name: 'Skills Grid', children: [
        ...['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Figma', 'GraphQL', 'Redis', 'Kubernetes'].map(skill => ({
          id: uuid(), type: 'card' as const, name: skill, title: skill, description: '',
          locked: false, hidden: false,
          styles: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' },
          responsiveStyles: {},
        })),
      ],
      locked: false, hidden: false,
      styles: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
      responsiveStyles: { tablet: { gridTemplateColumns: 'repeat(3, 1fr)' }, mobile: { gridTemplateColumns: 'repeat(2, 1fr)' } },
    },
  ], { background: 'linear-gradient(135deg, #1e1c4c, #302b63)', padding: '100px 80px' });

  const workSection = mkSection('Work', [
    heading('Featured Projects', 2, { color: '#1e293b', textAlign: 'center', marginBottom: '48px' }),
    { id: uuid(), type: 'container', name: 'Projects Grid', children: [
        ...[
          { title: 'E-Commerce Platform', desc: 'Full-stack shopping platform with React, Node.js & Stripe', img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80' },
          { title: 'Analytics Dashboard', desc: 'Real-time data visualization for enterprise clients', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80' },
          { title: 'Mobile Banking App', desc: 'Fintech app with React Native, security-first design', img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80' },
        ].map(p => ({
          id: uuid(), type: 'card' as const, name: p.title, title: p.title, description: p.desc, image: p.img, buttonText: 'View Case Study', buttonHref: '#',
          locked: false, hidden: false,
          styles: { backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
          responsiveStyles: {},
        })),
      ],
      locked: false, hidden: false,
      styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' },
      responsiveStyles: { tablet: { gridTemplateColumns: 'repeat(2, 1fr)' }, mobile: { gridTemplateColumns: '1fr' } },
    },
  ], { backgroundColor: '#f8fafc', padding: '100px 80px' });

  const contactSection = mkSection('Contact', [
    heading('Let\'s Work Together', 2, { color: '#ffffff', textAlign: 'center' }),
    para('Open for freelance projects and full-time opportunities.', { textAlign: 'center', margin: '0 auto 48px' }),
    {
      id: uuid(), type: 'form', name: 'Contact Form',
      fields: [
        { type: 'text', label: 'Name', placeholder: 'Your name', required: true },
        { type: 'email', label: 'Email', placeholder: 'your@email.com', required: true },
        { type: 'textarea', label: 'Message', placeholder: 'Tell me about your project...', required: true },
      ],
      submitText: 'Send Message',
      locked: false, hidden: false,
      styles: { maxWidth: '600px', margin: '0 auto', backgroundColor: 'rgba(255,255,255,0.05)', padding: '48px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' },
      responsiveStyles: {},
    },
  ], { background: 'linear-gradient(135deg, #0f0c29, #302b63)', padding: '100px 80px', textAlign: 'center' });

  const footerSection = mkSection('Footer', [{
    id: uuid(), type: 'footer', name: 'Footer', logo: 'Alex Chen', tagline: 'Building things for the web.',
    links: [{ label: 'GitHub', href: '#' }, { label: 'LinkedIn', href: '#' }, { label: 'Twitter', href: '#' }],
    copyright: '© 2025 Alex Chen. All rights reserved.',
    locked: false, hidden: false,
    styles: { color: '#94a3b8' },
    responsiveStyles: {},
  }], { backgroundColor: '#0f172a', padding: '60px 80px' });

  return [{ id: uuid(), name: 'Home', slug: 'home', sections: [heroSection, aboutSection, skillsSection, workSection, contactSection, footerSection], meta: { title: 'Alex Chen — Developer & Designer', description: 'Portfolio of Alex Chen, Full-Stack Developer', keywords: 'developer, designer, portfolio' } }];
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 2: Gym & Fitness
// ═══════════════════════════════════════════════════════════════════════════════
export const gymTemplate = (): Page[] => {
  const heroSection = mkSection('Hero', [
    { id: uuid(), type: 'navbar', name: 'Navbar', logo: 'IRON FORGE', links: [
        { label: 'Programs', href: '#programs' }, { label: 'Trainers', href: '#trainers' },
        { label: 'Pricing', href: '#pricing' }, { label: 'Contact', href: '#contact' },
      ],
      locked: false, hidden: false,
      styles: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0 48px 0', color: '#ffffff' },
      responsiveStyles: {},
    },
    heading('FORGE YOUR', 1, { fontSize: '80px', fontWeight: '900', letterSpacing: '-2px', lineHeight: '1', color: '#ffffff', marginBottom: '0' }),
    heading('BEST SELF', 1, { fontSize: '80px', fontWeight: '900', letterSpacing: '-2px', lineHeight: '1', color: '#e63946', marginBottom: '32px' }),
    para('Elite training programs designed to transform your body and mind. Join 5,000+ members who already made the change.', { fontSize: '18px', marginBottom: '48px' }),
    { id: uuid(), type: 'container', name: 'Hero CTAs', children: [
        btn('Start Free Trial', '#pricing', '#e63946', { fontSize: '16px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', padding: '16px 40px' }),
        btn('View Programs', '#programs', 'transparent', { border: '2px solid rgba(255,255,255,0.4)', marginLeft: '16px', fontSize: '16px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', padding: '16px 40px' }),
      ],
      locked: false, hidden: false,
      styles: { display: 'flex', flexWrap: 'wrap', gap: '16px' },
      responsiveStyles: {},
    },
    spacer('40px'),
    { id: uuid(), type: 'container', name: 'Stats', children: [
        ...[ { n: '5,000+', l: 'Members' }, { n: '50+', l: 'Trainers' }, { n: '200+', l: 'Classes/Week' }, { n: '15', l: 'Years of Excellence' } ].map(s => ({
          id: uuid(), type: 'card' as const, name: s.n, title: s.n, description: s.l,
          locked: false, hidden: false,
          styles: { textAlign: 'center', color: '#ffffff', borderRight: '1px solid rgba(255,255,255,0.15)', padding: '0 40px 0 0' },
          responsiveStyles: {},
        })),
      ],
      locked: false, hidden: false,
      styles: { display: 'flex', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '40px', flexWrap: 'wrap', gap: '32px' },
      responsiveStyles: {},
    },
  ], { background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80) center/cover', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px' });

  const pricingSection = mkSection('Pricing', [
    heading('Simple, Transparent Pricing', 2, { color: '#ffffff', textAlign: 'center' }),
    para('Choose the plan that fits your goals. Cancel anytime.', { textAlign: 'center', margin: '0 auto 60px' }),
    { id: uuid(), type: 'pricing', name: 'Pricing Plans',
      plans: [
        { name: 'STARTER', price: '$29', period: '/month', features: ['Gym Access', '2 Group Classes/week', 'Locker Room', 'Basic App Access'], buttonText: 'Get Started', highlighted: false },
        { name: 'PRO', price: '$59', period: '/month', features: ['Unlimited Gym Access', 'Unlimited Group Classes', 'Personal Trainer (2x/month)', 'Nutrition Consultation', 'Priority Booking'], buttonText: 'Most Popular', highlighted: true },
        { name: 'ELITE', price: '$99', period: '/month', features: ['Everything in Pro', 'Dedicated Personal Trainer', 'Custom Meal Plan', 'Recovery Suite Access', 'Supplement Discount'], buttonText: 'Go Elite', highlighted: false },
      ],
      locked: false, hidden: false,
      styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
      responsiveStyles: { mobile: { gridTemplateColumns: '1fr' } },
    },
  ], { backgroundColor: '#0a0a0a', padding: '100px 80px' });

  const testimonialSection = mkSection('Testimonials', [
    heading('Real Results, Real People', 2, { color: '#ffffff', textAlign: 'center', marginBottom: '48px' }),
    { id: uuid(), type: 'container', name: 'Testimonials Grid', children: [
        ...[
          { quote: 'Iron Forge completely transformed my life. Lost 40lbs in 6 months!', author: 'Sarah M.', role: 'Member since 2022', rating: 5 },
          { quote: 'Best gym in the city. Trainers are world-class and facilities are top-notch.', author: 'James K.', role: 'Member since 2021', rating: 5 },
          { quote: 'The nutrition coaching alone was worth the membership price.', author: 'Priya R.', role: 'Member since 2023', rating: 5 },
        ].map(t => ({ id: uuid(), type: 'testimonial' as const, name: 'Testimonial', ...t, avatar: '',
          locked: false, hidden: false,
          styles: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)' },
          responsiveStyles: {},
        })),
      ],
      locked: false, hidden: false,
      styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
      responsiveStyles: { mobile: { gridTemplateColumns: '1fr' } },
    },
  ], { backgroundColor: '#111111', padding: '100px 80px' });

  return [{ id: uuid(), name: 'Home', slug: 'home', sections: [heroSection, pricingSection, testimonialSection], meta: { title: 'Iron Forge Gym — Transform Your Body', description: 'Elite fitness training center', keywords: 'gym, fitness, personal training' } }];
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 3: Restaurant
// ═══════════════════════════════════════════════════════════════════════════════
export const restaurantTemplate = (): Page[] => {
  const heroSection = mkSection('Hero', [
    { id: uuid(), type: 'navbar', name: 'Navbar', logo: 'La Maison', links: [
        { label: 'Menu', href: '#menu' }, { label: 'About', href: '#about' },
        { label: 'Gallery', href: '#gallery' }, { label: 'Reserve', href: '#reserve' },
      ],
      locked: false, hidden: false,
      styles: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0 60px 0', color: '#ffffff' },
      responsiveStyles: {},
    },
    para('Fine Dining Experience', { fontSize: '14px', letterSpacing: '4px', textTransform: 'uppercase', color: '#d4af37', marginBottom: '16px' }),
    heading('Where Every Meal', 1, { fontSize: '72px', fontWeight: '300', lineHeight: '1.1', fontStyle: 'italic', marginBottom: '0' }),
    heading('Tells a Story', 1, { fontSize: '72px', fontWeight: '700', lineHeight: '1.1', marginBottom: '32px' }),
    para('Award-winning French cuisine crafted with locally sourced ingredients and passion for perfection.', { fontSize: '18px', marginBottom: '48px', maxWidth: '500px' }),
    { id: uuid(), type: 'container', name: 'CTAs', children: [
        btn('Reserve a Table', '#reserve', '#d4af37', { color: '#1a1a1a', fontWeight: '700', padding: '16px 40px', letterSpacing: '1px' }),
        btn('View Menu', '#menu', 'transparent', { border: '1px solid rgba(255,255,255,0.5)', marginLeft: '16px', padding: '16px 40px', letterSpacing: '1px' }),
      ],
      locked: false, hidden: false,
      styles: { display: 'flex', flexWrap: 'wrap', gap: '16px' },
      responsiveStyles: {},
    },
  ], { background: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80) center/cover', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px' });

  const menuSection = mkSection('Menu', [
    heading('Our Menu', 2, { color: '#1a1a1a', textAlign: 'center', fontStyle: 'italic', fontWeight: '300' }),
    heading('Chef\'s Selections', 3, { color: '#d4af37', textAlign: 'center', marginBottom: '60px', fontWeight: '400', letterSpacing: '2px', fontSize: '14px', textTransform: 'uppercase' }),
    { id: uuid(), type: 'container', name: 'Menu Grid', children: [
        ...[
          { title: 'Foie Gras Terrine', description: 'Duck liver, Sauternes jelly, brioche toast', img: 'https://images.unsplash.com/photo-1551183053-bf91798d792b?w=400&q=80' },
          { title: 'Bouillabaisse', description: 'Provençal fish stew, saffron rouille, croutons', img: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400&q=80' },
          { title: 'Beef Wellington', description: '28-day aged fillet, mushroom duxelles, puff pastry', img: 'https://images.unsplash.com/photo-1544025162-d76538485e15?w=400&q=80' },
          { title: 'Crème Brûlée', description: 'Madagascar vanilla, caramelized sugar crust', img: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&q=80' },
        ].map(item => ({
          id: uuid(), type: 'card' as const, name: item.title, ...item, image: item.img,
          locked: false, hidden: false,
          styles: { backgroundColor: '#fff', borderRadius: '0', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' },
          responsiveStyles: {},
        })),
      ],
      locked: false, hidden: false,
      styles: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' },
      responsiveStyles: { tablet: { gridTemplateColumns: 'repeat(2, 1fr)' }, mobile: { gridTemplateColumns: '1fr' } },
    },
  ], { backgroundColor: '#faf9f7', padding: '100px 80px' });

  const reserveSection = mkSection('Reserve', [
    heading('Make a Reservation', 2, { color: '#ffffff', textAlign: 'center', fontStyle: 'italic', fontWeight: '300' }),
    para('We look forward to welcoming you. For parties of 8+, please call us directly.', { textAlign: 'center', margin: '0 auto 48px' }),
    { id: uuid(), type: 'form', name: 'Reservation Form',
      fields: [
        { type: 'text', label: 'Name', placeholder: 'Full name', required: true },
        { type: 'email', label: 'Email', placeholder: 'Email address', required: true },
        { type: 'tel', label: 'Phone', placeholder: 'Phone number', required: true },
        { type: 'text', label: 'Date & Time', placeholder: 'Preferred date & time', required: true },
      ],
      submitText: 'Request Reservation',
      locked: false, hidden: false,
      styles: { maxWidth: '560px', margin: '0 auto', backgroundColor: 'rgba(255,255,255,0.05)', padding: '48px', borderRadius: '4px', border: '1px solid rgba(212,175,55,0.3)' },
      responsiveStyles: {},
    },
  ], { background: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=1600&q=80) center/cover', padding: '100px 80px' });

  return [{ id: uuid(), name: 'Home', slug: 'home', sections: [heroSection, menuSection, reserveSection], meta: { title: 'La Maison — Fine Dining', description: 'Award-winning French fine dining restaurant', keywords: 'restaurant, fine dining, french cuisine' } }];
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 4: Startup Landing Page
// ═══════════════════════════════════════════════════════════════════════════════
export const startupTemplate = (): Page[] => {
  const heroSection = mkSection('Hero', [
    { id: uuid(), type: 'navbar', name: 'Navbar', logo: 'Nexus AI', links: [
        { label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' },
        { label: 'Blog', href: '#' }, { label: 'Sign In', href: '#' },
      ],
      locked: false, hidden: false,
      styles: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0 80px 0', color: '#ffffff' },
      responsiveStyles: {},
    },
    { id: uuid(), type: 'paragraph', name: 'Badge', content: '✦  Launching Soon — Join 10,000+ on waitlist',
      locked: false, hidden: false,
      styles: { display: 'inline-block', backgroundColor: 'rgba(99,112,241,0.2)', border: '1px solid rgba(99,112,241,0.4)', borderRadius: '100px', padding: '8px 20px', fontSize: '13px', color: '#a5bbfc', marginBottom: '32px' },
      responsiveStyles: {},
    },
    heading('The AI Platform for\nFaster Product Teams', 1, { fontSize: '72px', fontWeight: '800', lineHeight: '1.05', letterSpacing: '-2px', marginBottom: '24px' }),
    para('Nexus AI accelerates your product development cycle with intelligent automation, real-time collaboration, and predictive analytics.', { fontSize: '20px', lineHeight: '1.6', marginBottom: '48px' }),
    { id: uuid(), type: 'container', name: 'Hero CTAs', children: [
        btn('Start for Free', '#pricing', '#6370f1', { padding: '16px 40px', fontSize: '16px', fontWeight: '700' }),
        btn('Watch Demo', '#', 'transparent', { border: '1px solid rgba(255,255,255,0.3)', marginLeft: '16px', padding: '16px 40px', fontSize: '16px' }),
      ],
      locked: false, hidden: false,
      styles: { display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '80px' },
      responsiveStyles: {},
    },
    img('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80', 'Nexus AI Dashboard', { borderRadius: '16px', boxShadow: '0 40px 120px rgba(99,112,241,0.25)', border: '1px solid rgba(255,255,255,0.1)' }),
  ], { background: 'radial-gradient(ellipse at top, #1e1c4c 0%, #080c18 60%)', padding: '60px 80px', textAlign: 'center' });

  const featuresSection = mkSection('Features', [
    heading('Everything you need to ship faster', 2, { color: '#ffffff', textAlign: 'center', marginBottom: '12px' }),
    para('Powerful tools that integrate into your existing workflow.', { textAlign: 'center', margin: '0 auto 60px' }),
    { id: uuid(), type: 'container', name: 'Features Grid', children: [
        ...[
          { title: 'AI Code Review', description: 'Automated code reviews powered by GPT-4. Catch bugs, security issues and style violations before they merge.', icon: '🤖' },
          { title: 'Smart Deployments', description: 'One-click deployments to any cloud. Automatic rollbacks, canary releases, and zero-downtime updates.', icon: '🚀' },
          { title: 'Real-time Analytics', description: 'Track performance metrics, error rates, and user behavior in a unified dashboard with AI-powered insights.', icon: '📊' },
          { title: 'Team Collaboration', description: 'Live collaborative editing, async review workflows, and integrated communication tools.', icon: '👥' },
          { title: 'Security First', description: 'SOC2 Type II certified. End-to-end encryption, SSO, SAML, and automated vulnerability scanning.', icon: '🔒' },
          { title: 'API Integrations', description: 'Connect 200+ tools including GitHub, Jira, Slack, Linear, Figma and more.', icon: '🔌' },
        ].map(f => ({
          id: uuid(), type: 'card' as const, name: f.title, title: `${f.icon}  ${f.title}`, description: f.description,
          locked: false, hidden: false,
          styles: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '32px', border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff' },
          responsiveStyles: {},
        })),
      ],
      locked: false, hidden: false,
      styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
      responsiveStyles: { tablet: { gridTemplateColumns: 'repeat(2, 1fr)' }, mobile: { gridTemplateColumns: '1fr' } },
    },
  ], { backgroundColor: '#0d1117', padding: '100px 80px' });

  const pricingSection = mkSection('Pricing', [
    heading('Simple pricing, powerful results', 2, { color: '#ffffff', textAlign: 'center' }),
    para('Start free. Scale as you grow. No hidden fees.', { textAlign: 'center', margin: '0 auto 60px' }),
    { id: uuid(), type: 'pricing', name: 'Pricing Plans',
      plans: [
        { name: 'Starter', price: 'Free', period: 'forever', features: ['Up to 3 projects', '5 team members', '10GB storage', 'Community support'], buttonText: 'Get Started', highlighted: false },
        { name: 'Growth', price: '$49', period: '/month', features: ['Unlimited projects', '25 team members', '100GB storage', 'AI code review', 'Priority support', 'Custom domains'], buttonText: 'Start Free Trial', highlighted: true },
        { name: 'Enterprise', price: 'Custom', period: 'contact us', features: ['Unlimited everything', 'SSO & SAML', 'Dedicated infra', 'SLA guarantee', 'Onboarding support', 'Custom contracts'], buttonText: 'Contact Sales', highlighted: false },
      ],
      locked: false, hidden: false,
      styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
      responsiveStyles: { mobile: { gridTemplateColumns: '1fr' } },
    },
  ], { background: 'radial-gradient(ellipse at bottom, #1e1c4c 0%, #080c18 60%)', padding: '100px 80px' });

  const footerSection = mkSection('Footer', [{
    id: uuid(), type: 'footer', name: 'Footer', logo: 'Nexus AI', tagline: 'The AI platform for faster product teams.',
    links: [{ label: 'Twitter', href: '#' }, { label: 'LinkedIn', href: '#' }, { label: 'GitHub', href: '#' }, { label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }],
    copyright: '© 2025 Nexus AI, Inc. All rights reserved.',
    locked: false, hidden: false,
    styles: { color: '#64748b' },
    responsiveStyles: {},
  }], { backgroundColor: '#080c18', padding: '60px 80px', borderTop: '1px solid rgba(255,255,255,0.06)' });

  return [{ id: uuid(), name: 'Home', slug: 'home', sections: [heroSection, featuresSection, pricingSection, footerSection], meta: { title: 'Nexus AI — Ship Faster', description: 'AI platform for faster product teams', keywords: 'AI, startup, product, development' } }];
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 5: 3D Spatial & CyberTech Studio
// ═══════════════════════════════════════════════════════════════════════════════
export const threeDStudioTemplate = (): Page[] => {
  const interactive3dSrcDoc = `&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;style&gt;
    body { margin: 0; background: transparent; overflow: hidden; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: -apple-system, sans-serif; }
    canvas { width: 100%; height: 100%; cursor: grab; }
    canvas:active { cursor: grabbing; }
    .badge { position: absolute; bottom: 14px; right: 14px; background: rgba(8,12,24,0.85); color: #00f5ff; font-size: 11px; font-weight: 600; padding: 6px 12px; border-radius: 20px; border: 1px solid rgba(0,245,255,0.4); backdrop-filter: blur(8px); pointer-events: none; letter-spacing: 0.5px; box-shadow: 0 0 15px rgba(0,245,255,0.2); }
  &lt;/style&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;canvas id="c"&gt;&lt;/canvas&gt;
  &lt;div class="badge"&gt;✦ Drag to Orbit 3D&lt;/div&gt;
  &lt;script&gt;
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let width, height;
    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const phi = (1 + Math.sqrt(5)) / 2;
    const rawNodes = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ];
    const nodes = rawNodes.map(([x,y,z]) => ({ x: x*75, y: y*75, z: z*75 }));
    const edges = [
      [0,11],[0,5],[0,1],[0,7],[0,10],[1,5],[1,9],[1,8],[1,7],
      [2,11],[2,10],[2,6],[2,3],[2,4],[3,4],[3,9],[3,8],[3,6],
      [4,11],[4,5],[4,9],[5,9],[6,10],[6,7],[6,8],[7,8],[8,9],[10,11]
    ];

    let rotX = 0.35, rotY = 0.45;
    let isDown = false, lastX = 0, lastY = 0;

    window.addEventListener('mousedown', e => { isDown = true; lastX = e.clientX; lastY = e.clientY; });
    window.addEventListener('mousemove', e => {
      if (!isDown) return;
      rotY += (e.clientX - lastX) * 0.012;
      rotX += (e.clientY - lastY) * 0.012;
      lastX = e.clientX; lastY = e.clientY;
    });
    window.addEventListener('mouseup', () => isDown = false);
    window.addEventListener('touchstart', e => { isDown = true; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; });
    window.addEventListener('touchmove', e => {
      if (!isDown) return;
      rotY += (e.touches[0].clientX - lastX) * 0.012;
      rotX += (e.touches[0].clientY - lastY) * 0.012;
      lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
    });
    window.addEventListener('touchend', () => isDown = false);

    function loop() {
      if (!isDown) {
        rotY += 0.009;
        rotX += 0.004;
      }
      ctx.clearRect(0, 0, width, height);

      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

      const proj = nodes.map(n => {
        let x = n.x * cosY - n.z * sinY;
        let z = n.z * cosY + n.x * sinY;
        let y = n.y * cosX - z * sinX;
        z = z * cosX + n.y * sinX;
        const scale = 400 / (400 + z);
        return { x: x * scale + width / 2, y: y * scale + height / 2, z };
      });

      edges.forEach(([i, j]) => {
        const p1 = proj[i], p2 = proj[j];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        grad.addColorStop(0, '#00f5ff');
        grad.addColorStop(1, '#a855f7');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00f5ff';
        ctx.shadowBlur = 14;
        ctx.stroke();
      });

      proj.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 15;
        ctx.fill();
      });

      requestAnimationFrame(loop);
    }
    loop();
  &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;`;

  const heroSection = mkSection('Hero 3D', [
    {
      id: uuid(), type: 'navbar', name: 'Navbar', logo: 'CYBER//SPATIAL',
      links: [
        { label: '3D Engine', href: '#features' },
        { label: 'Showcase', href: '#showcase' },
        { label: 'Cloud GPU', href: '#pricing' },
        { label: 'Documentation', href: '#' },
      ],
      locked: false, hidden: false,
      styles: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0 48px 0', color: '#00f5ff' },
      responsiveStyles: {},
    },
    {
      id: uuid(), type: 'container', name: 'Hero 3D Split',
      locked: false, hidden: false,
      responsiveStyles: { mobile: { gridTemplateColumns: '1fr' } },
      styles: { display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '48px', alignItems: 'center' },
      children: [
        {
          id: uuid(), type: 'container', name: 'Hero Content',
          locked: false, hidden: false, responsiveStyles: {},
          styles: { display: 'flex', flexDirection: 'column', gap: '16px' },
          children: [
            heading('Next-Gen 3D Web Experiences', 1, {
              fontSize: '56px', fontWeight: '900', color: '#ffffff',
              lineHeight: '1.08', letterSpacing: '-1.5px', marginBottom: '8px',
              textShadow: '0 0 40px rgba(0,245,255,0.25)',
            }),
            para('Design, animate, and deploy real-time interactive 3D spatial scenes directly in your browser with zero latency.', {
              fontSize: '17px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', maxWidth: '500px',
            }),
            {
              id: uuid(), type: 'container', name: 'CTA Row',
              locked: false, hidden: false, responsiveStyles: {},
              styles: { display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', flexWrap: 'wrap' },
              children: [
                btn('Launch 3D Studio', '#', '#00f5ff', {
                  color: '#080c18', padding: '16px 36px', borderRadius: '12px', fontWeight: '800',
                  boxShadow: '0 0 30px rgba(0,245,255,0.4)',
                }),
                btn('Explore SDK', '#', 'transparent', {
                  color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', padding: '16px 28px', borderRadius: '12px',
                }),
              ],
            },
          ],
        },
        {
          id: uuid(), type: 'html', name: 'Interactive 3D Hologram',
          locked: false, hidden: false, responsiveStyles: {},
          styles: {
            width: '100%', height: '420px', borderRadius: '24px', overflow: 'hidden',
            border: '1px solid rgba(0,245,255,0.3)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(0,245,255,0.15)',
            backgroundImage: 'radial-gradient(circle at center, rgba(168,85,247,0.12) 0%, rgba(8,12,24,0.95) 70%)',
          },
          html: `<iframe srcdoc="${interactive3dSrcDoc}" style="width:100%;height:100%;border:none;" title="Interactive 3D Viewport"></iframe>`,
        },
      ],
    },
  ], {
    backgroundImage: 'radial-gradient(ellipse at 80% 20%, rgba(0,245,255,0.08) 0%, rgba(8,10,16,1) 60%)',
    backgroundColor: '#080a10',
    padding: '60px 48px 100px',
    minHeight: '90vh',
  });

  const featuresSection = mkSection('Features 3D', [
    heading('Spatial Computing Architecture', 2, {
      textAlign: 'center', color: '#ffffff', fontSize: '38px', fontWeight: '800', marginBottom: '8px',
    }),
    para('Engineered for ultra-low latency WebGL & WebGPU rendering at 120 FPS.', {
      textAlign: 'center', margin: '0 auto 60px', color: 'rgba(255,255,255,0.6)',
    }),
    {
      id: uuid(), type: 'container', name: '3D Feature Cards',
      locked: false, hidden: false,
      responsiveStyles: { mobile: { gridTemplateColumns: '1fr' } },
      styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
      children: [
        {
          id: uuid(), type: 'card', name: 'Feature 1',
          title: 'Real-Time Raytracing',
          description: 'Physically based rendering with dynamic global illumination and soft shadow maps calculated on client GPU.',
          buttonText: 'Learn More', buttonHref: '#',
          locked: false, hidden: false, responsiveStyles: {},
          styles: {
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(0,245,255,0.2)',
            borderRadius: '20px',
            padding: '24px',
            color: '#ffffff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          },
        },
        {
          id: uuid(), type: 'card', name: 'Feature 2',
          title: '3D Neural Splats',
          description: 'Convert real-world video scans into photorealistic 3D Gaussian splatting scenes with sub-millimeter precision.',
          buttonText: 'View Demo', buttonHref: '#',
          locked: false, hidden: false, responsiveStyles: {},
          styles: {
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: '20px',
            padding: '24px',
            color: '#ffffff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          },
        },
        {
          id: uuid(), type: 'card', name: 'Feature 3',
          title: 'Spatial Audio Engine',
          description: 'Head-related transfer function (HRTF) binaural sound synthesis synchronized with 3D object motion.',
          buttonText: 'Listen Audio', buttonHref: '#',
          locked: false, hidden: false, responsiveStyles: {},
          styles: {
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(0,245,255,0.2)',
            borderRadius: '20px',
            padding: '24px',
            color: '#ffffff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          },
        },
      ],
    },
  ], {
    backgroundColor: '#06080e',
    padding: '100px 48px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  });

  const pricingSection = mkSection('Pricing 3D', [
    heading('Spatial Compute Plans', 2, { textAlign: 'center', color: '#ffffff', marginBottom: '8px' }),
    para('Scale effortlessly from indie 3D creators to enterprise spatial networks.', { textAlign: 'center', margin: '0 auto 48px', color: 'rgba(255,255,255,0.6)' }),
    {
      id: uuid(), type: 'pricing', name: '3D Pricing Grid',
      locked: false, hidden: false, responsiveStyles: {},
      styles: { width: '100%', maxWidth: '1000px', margin: '0 auto' },
      plans: [
        { name: 'Hobby', price: '$0', period: '/forever', features: ['5 Interactive 3D Scenes', 'WebAudio Engine', 'Community Discord'], buttonText: 'Start Free', highlighted: false },
        { name: 'Spatial Pro', price: '$49', period: '/month', features: ['Unlimited 3D Models', '4K Texture Streaming', 'Draco Compression', 'Priority Cloud Rendering'], buttonText: 'Upgrade to Pro', highlighted: true },
        { name: 'Studio', price: '$199', period: '/month', features: ['Dedicated GPU Cluster', 'Custom Shader Pipelines', 'SLA Guarantee', '24/7 Spatial Support'], buttonText: 'Contact Team', highlighted: false },
      ],
    },
  ], {
    backgroundColor: '#080a10',
    padding: '100px 48px',
  });

  const footerSection = mkSection('Footer', [
    {
      id: uuid(), type: 'footer', name: '3D Footer', logo: 'CYBER//SPATIAL',
      tagline: 'The next evolution of the spatial web.',
      links: [
        { label: 'GitHub', href: '#' },
        { label: 'Discord', href: '#' },
        { label: 'Documentation', href: '#' },
        { label: 'Privacy', href: '#' },
      ],
      copyright: '© 2026 CyberSpatial 3D Studio. All rights reserved.',
      locked: false, hidden: false,
      styles: { color: 'rgba(255,255,255,0.6)' },
      responsiveStyles: {},
    },
  ], {
    backgroundColor: '#040508',
    padding: '60px 48px',
    borderTop: '1px solid rgba(0,245,255,0.15)',
  });

  return [{
    id: uuid(),
    name: 'Home',
    slug: 'home',
    sections: [heroSection, featuresSection, pricingSection, footerSection],
    meta: {
      title: 'CyberSpatial 3D — Real-Time Spatial Web Studio',
      description: 'Interactive 3D web experience built with WebCraft Studio',
      keywords: '3D, WebGL, Spatial Web, Spline, Three.js, Cyberpunk',
    },
  }];
};

// ─── Template Registry ────────────────────────────────────────────────────────
export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  build: () => Page[];
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'threed',
    name: '3D Spatial CyberStudio',
    description: 'Futuristic 3D website with an interactive orbitable 3D hologram canvas, neon glassmorphism cards, and spatial computing layout.',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    category: '3D & Spatial',
    build: threeDStudioTemplate,
  },
  {
    id: 'portfolio',
    name: 'Personal Portfolio',
    description: 'Clean, minimal portfolio for developers and designers.',
    thumbnail: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&q=80',
    category: 'Portfolio',
    build: portfolioTemplate,
  },
  {
    id: 'gym',
    name: 'Gym & Fitness',
    description: 'High-energy fitness website with pricing and testimonials.',
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
    category: 'Business',
    build: gymTemplate,
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Elegant fine dining website with menu and reservations.',
    thumbnail: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
    category: 'Business',
    build: restaurantTemplate,
  },
  {
    id: 'startup',
    name: 'Startup Landing Page',
    description: 'Modern SaaS landing page with features and pricing.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
    category: 'Startup',
    build: startupTemplate,
  },
];
