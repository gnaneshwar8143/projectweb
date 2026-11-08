import { v4 as uuid } from 'uuid';
import type { WebElement, ElementType, Section } from '../../types';

export function createElement(type: ElementType): WebElement {
  const base = { id: uuid(), locked: false, hidden: false, responsiveStyles: {} };

  switch (type) {
    case 'heading':
      return { ...base, type, name: 'Heading', content: 'Your Heading Here', level: 2,
        styles: { fontSize: '36px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', lineHeight: '1.2' } };

    case 'paragraph':
      return { ...base, type, name: 'Paragraph', content: 'Write your content here. Click to edit this text.',
        styles: { fontSize: '16px', lineHeight: '1.7', color: '#64748b', marginBottom: '16px' } };

    case 'button':
      return { ...base, type, name: 'Button', text: 'Click Me', href: '#', target: '_self', variant: 'filled',
        styles: { backgroundColor: '#6370f1', color: '#ffffff', padding: '12px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600', display: 'inline-block', border: 'none', cursor: 'pointer', textDecoration: 'none' } };

    case 'image':
      return { ...base, type, name: 'Image', src: '', alt: 'Image description',
        styles: { width: '100%', borderRadius: '8px', objectFit: 'cover' } };

    case 'video':
      return { ...base, type, name: 'Video', src: '', autoplay: false, loop: false, muted: true, controls: true,
        styles: { width: '100%', borderRadius: '8px' } };

    case 'divider':
      return { ...base, type, name: 'Divider',
        styles: { width: '100%', borderTop: '1px solid #e2e8f0', margin: '24px 0' } };

    case 'container':
      return { ...base, type, name: 'Container', children: [],
        styles: { display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', border: '1px dashed rgba(125,125,125,0.3)', borderRadius: '8px', minHeight: '80px', width: '100%' } };

    case 'spacer':
      return { ...base, type, name: 'Spacer',
        styles: { height: '60px', display: 'block' } };

    case 'navbar':
      return { ...base, type, name: 'Navbar', logo: 'Brand Name',
        links: [{ label: 'Home', href: '#' }, { label: 'About', href: '#' }, { label: 'Contact', href: '#' }],
        styles: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', color: '#1e293b' } };

    case 'gallery':
      return { ...base, type, name: 'Gallery', columns: 3,
        images: [
          { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', alt: 'Gallery 1' },
          { src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80', alt: 'Gallery 2' },
          { src: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&q=80', alt: 'Gallery 3' },
        ],
        styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' } };

    case 'card':
      return { ...base, type, name: 'Card', title: 'Card Title', description: 'Card description goes here.', buttonText: 'Learn More', buttonHref: '#',
        styles: { backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' } };

    case 'pricing':
      return { ...base, type, name: 'Pricing Table',
        plans: [
          { name: 'Basic', price: '$9', period: '/month', features: ['Feature 1', 'Feature 2', 'Feature 3'], buttonText: 'Get Started', highlighted: false },
          { name: 'Pro', price: '$29', period: '/month', features: ['Everything in Basic', 'Feature 4', 'Feature 5', 'Priority Support'], buttonText: 'Get Started', highlighted: true },
          { name: 'Enterprise', price: '$99', period: '/month', features: ['Everything in Pro', 'Custom Features', 'Dedicated Support', 'SLA'], buttonText: 'Contact Us', highlighted: false },
        ],
        styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' } };

    case 'testimonial':
      return { ...base, type, name: 'Testimonial', quote: 'This product has completely changed how we work. Highly recommend!', author: 'Jane Smith', role: 'CEO, Acme Inc.', rating: 5,
        styles: { backgroundColor: '#f8fafc', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0' } };

    case 'form':
      return { ...base, type, name: 'Contact Form',
        fields: [
          { type: 'text', label: 'Name', placeholder: 'Your name', required: true },
          { type: 'email', label: 'Email', placeholder: 'your@email.com', required: true },
          { type: 'textarea', label: 'Message', placeholder: 'Your message...', required: false },
        ],
        submitText: 'Send Message',
        styles: { padding: '32px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' } };

    case 'footer':
      return { ...base, type, name: 'Footer', logo: 'Brand', tagline: 'Building great things.',
        links: [{ label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }],
        copyright: `© ${new Date().getFullYear()} Company. All rights reserved.`,
        styles: { padding: '40px 0', borderTop: '1px solid #e2e8f0', textAlign: 'center' } };

    case 'html':
      return { ...base, type, name: 'Custom HTML', html: '<div style="padding:20px;background:#f1f5f9;border-radius:8px"><p>Custom HTML block</p></div>',
        styles: {} };

    case 'model3d':
      return {
        ...base,
        type,
        name: '3D Model',
        src: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
        provider: 'model-viewer',
        autoRotate: true,
        cameraControls: true,
        shadowIntensity: 1,
        alt: 'Interactive 3D Model',
        styles: {
          width: '100%',
          height: '420px',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'block',
        },
      };

    default:
      return { ...base, type: 'paragraph' as any, name: 'Element', content: 'Element', styles: {} };
  }
}

export function createSection(name = 'New Section'): Section {
  return {
    id: uuid(),
    name,
    elements: [],
    locked: false,
    hidden: false,
    styles: { width: '100%', padding: '60px 40px', backgroundColor: 'transparent', minHeight: '120px' },
  };
}

export function createColumns(cols: 2 | 3): WebElement {
  const colChildren: WebElement[] = Array.from({ length: cols }).map((_, i) => ({
    id: uuid(),
    type: 'container' as const,
    name: `Column ${i + 1}`,
    locked: false,
    hidden: false,
    responsiveStyles: {},
    children: [],
    styles: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '20px',
      border: '1px dashed rgba(125,125,125,0.25)',
      borderRadius: '8px',
      minHeight: '120px',
      width: '100%',
    },
  }));

  return {
    id: uuid(),
    type: 'container',
    name: `${cols} Columns Layout`,
    locked: false,
    hidden: false,
    responsiveStyles: {
      mobile: {
        gridTemplateColumns: '1fr',
      },
    },
    children: colChildren,
    styles: {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: '24px',
      width: '100%',
      padding: '12px 0',
      alignItems: 'center',
    },
  };
}
