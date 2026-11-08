import React, { type JSX } from 'react';
import type { WebElement, ElementStyles } from '../../types';
import { useEditorStore } from '../../store/editorStore';
import { createElement } from './elementFactory';

// Convert our ElementStyles object to a React CSSProperties object
// Injects CSS custom property fallbacks for theme-aware values
export function stylesToCSS(styles: ElementStyles): React.CSSProperties {
  return styles as React.CSSProperties;
}

// Theme-aware style helpers — use CSS vars as defaults when no explicit value given
function primaryBg(explicit?: string): string {
  return explicit || 'var(--primary-color, #6370f1)';
}
function accentBg(explicit?: string): string {
  return explicit || 'var(--accent-color, #f59e0b)';
}

interface ElementRendererProps {
  element: WebElement;
  isSelected: boolean;
  isHovered: boolean;
  onClick: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onContentChange?: (content: string) => void;
  previewMode?: 'desktop' | 'tablet' | 'mobile';
}

export function ElementRenderer({
  element, isSelected, isHovered, onClick, onMouseEnter, onMouseLeave, onContentChange, previewMode = 'desktop'
}: ElementRendererProps) {
  if (element.hidden) return null;

  // Merge responsive styles
  const styles = { ...element.styles };
  if (previewMode === 'tablet' && element.responsiveStyles?.tablet) {
    Object.assign(styles, element.responsiveStyles.tablet);
  } else if (previewMode === 'mobile' && element.responsiveStyles?.mobile) {
    Object.assign(styles, element.responsiveStyles.mobile);
  }

  const baseProps = {
    onClick,
    onMouseEnter,
    onMouseLeave,
    style: stylesToCSS(styles),
    className: [
      'web-element',
      isSelected ? 'element-selected outline-none' : '',
      isHovered && !isSelected ? 'element-hovered' : '',
      element.locked ? 'pointer-events-none' : '',
    ].filter(Boolean).join(' '),
    'data-element-id': element.id,
  };

  switch (element.type) {
    case 'heading': {
      const Tag = `h${element.level}` as keyof JSX.IntrinsicElements;
      return (
        <Tag
          {...baseProps}
          contentEditable={isSelected && !element.locked}
          suppressContentEditableWarning
          onBlur={(e) => onContentChange?.(e.currentTarget.innerHTML)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              (e.currentTarget as HTMLElement).blur();
            }
          }}
          dangerouslySetInnerHTML={{ __html: element.content }}
        />
      );
    }

    case 'paragraph':
      return (
        <p
          {...baseProps}
          contentEditable={isSelected && !element.locked}
          suppressContentEditableWarning
          onBlur={(e) => onContentChange?.(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: element.content }}
        />
      );

    case 'button':
      return (
        <a
          href="#"
          {...baseProps}
          onClick={(e) => { e.preventDefault(); onClick(e); }}
          contentEditable={isSelected && !element.locked}
          suppressContentEditableWarning
          onBlur={(e) => onContentChange?.(e.currentTarget.innerText)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              (e.currentTarget as HTMLElement).blur();
            }
          }}
          style={{
            ...stylesToCSS(styles),
            display: 'inline-block',
            cursor: 'pointer',
            textDecoration: 'none',
            backgroundColor: (styles.backgroundColor as string) || 'var(--primary-color, #6370f1)',
            borderRadius: (styles.borderRadius as string) || 'var(--border-radius, 8px)',
          }}
        >
          {element.text}
        </a>
      );

    case 'image':
      return (
        <img
          {...baseProps}
          src={element.src || 'https://placehold.co/600x400/1e2438/6370f1?text=Image'}
          alt={element.alt}
        />
      );

    case 'video':
      return (
        <video
          {...baseProps}
          src={element.src}
          autoPlay={element.autoplay}
          loop={element.loop}
          muted={element.muted}
          controls={element.controls}
          poster={element.poster}
        />
      );

    case 'divider':
      return <hr {...baseProps} />;

    case 'spacer':
      return <div {...baseProps} />;

    case 'container': {
      const children = element.children ?? [];
      const { selectedElementId, selectElement } = useEditorStore.getState();
      return (
        <div {...baseProps}>
          {children.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-4 border border-dashed border-surface-600/40 rounded-lg text-center bg-surface-800/10 hover:bg-surface-800/20 transition-all w-full min-h-[90px]">
              <p className="text-[11px] text-surface-400 mb-2 font-medium">Empty Column / Container</p>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {(['heading', 'paragraph', 'button', 'image'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newEl = createElement(t);
                      useEditorStore.getState().pushHistory(`Add ${t} to column`);
                      useEditorStore.getState().addElementToContainer(element.id, newEl);
                    }}
                    className="btn-secondary text-[10px] py-0.5 px-2 capitalize flex items-center gap-1 hover:border-brand-500 hover:text-brand-300"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            children.map(child => (
              <ElementRenderer
                key={child.id}
                element={child}
                isSelected={selectedElementId === child.id}
                isHovered={false}
                onClick={(e) => {
                  e.stopPropagation();
                  selectElement(null, child.id);
                }}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onContentChange={(val) => {
                  useEditorStore.getState().updateElement('', child.id, {
                    ...(child.type === 'button' ? { text: val } : { content: val })
                  });
                }}
                previewMode={previewMode}
              />
            ))
          )}
        </div>
      );
    }

    case 'navbar':
      return (
        <nav {...baseProps}>
          <span style={{ fontWeight: 700, fontSize: '20px', color: 'inherit', letterSpacing: '-0.5px' }}>
            {element.logo}
          </span>
          <ul style={{ display: 'flex', gap: '32px', listStyle: 'none', margin: 0, padding: 0 }}>
            {element.links.map((link, i) => (
              <li key={i}>
                <a href="#" onClick={e => e.preventDefault()}
                  style={{ color: 'inherit', opacity: 0.85, textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      );

    case 'gallery':
      return (
        <div {...baseProps} style={{ ...stylesToCSS(styles), display: 'grid', gridTemplateColumns: `repeat(${element.columns}, 1fr)`, gap: '12px' }}>
          {element.images.map((img, i) => (
            <img key={i} src={img.src} alt={img.alt} style={{ width: '100%', objectFit: 'cover', borderRadius: 'var(--border-radius, 8px)' }} />
          ))}
        </div>
      );

    case 'card':
      return (
        <div {...baseProps}>
          {element.image && (
            <img src={element.image} alt={element.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
          )}
          <div style={{ padding: element.image ? '24px' : '0' }}>
            <h3 style={{ margin: '0 0 8px', color: 'inherit', fontSize: '18px', fontWeight: 600 }}>{element.title}</h3>
            {element.description && <p style={{ margin: '0 0 16px', color: 'inherit', opacity: 0.75, fontSize: '14px', lineHeight: '1.6' }}>{element.description}</p>}
            {element.buttonText && (
              <a href={element.buttonHref || '#'} onClick={e => e.preventDefault()}
                style={{ display: 'inline-block', padding: '10px 24px', backgroundColor: primaryBg(), color: '#fff', borderRadius: 'var(--border-radius, 8px)', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                {element.buttonText}
              </a>
            )}
          </div>
        </div>
      );

    case 'pricing':
      return (
        <div {...baseProps}>
          {element.plans.map((plan, i) => (
            <div key={i} style={{
              backgroundColor: plan.highlighted ? primaryBg() : 'rgba(125,125,125,0.06)',
              borderRadius: 'var(--border-radius, 16px)', padding: '40px', border: plan.highlighted ? `2px solid ${primaryBg()}` : '1px solid rgba(125,125,125,0.18)',
              transform: plan.highlighted ? 'scale(1.05)' : 'none',
              color: plan.highlighted ? '#ffffff' : 'inherit',
            }}>
              <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: plan.highlighted ? 'rgba(255,255,255,0.9)' : 'inherit', opacity: plan.highlighted ? 1 : 0.7 }}>{plan.name}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                <span style={{ fontSize: '48px', fontWeight: 800, color: plan.highlighted ? '#fff' : 'inherit' }}>{plan.price}</span>
                <span style={{ color: plan.highlighted ? 'rgba(255,255,255,0.7)' : 'inherit', opacity: 0.6, fontSize: '14px' }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ fontSize: '14px', color: plan.highlighted ? 'rgba(255,255,255,0.95)' : 'inherit', opacity: plan.highlighted ? 1 : 0.85, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: plan.highlighted ? '#fff' : primaryBg() }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <a href="#" onClick={e => e.preventDefault()} style={{
                display: 'block', textAlign: 'center', padding: '14px 24px',
                backgroundColor: plan.highlighted ? '#ffffff' : primaryBg(),
                color: plan.highlighted ? primaryBg() : '#ffffff',
                borderRadius: 'var(--border-radius, 8px)', fontWeight: 700, fontSize: '14px', textDecoration: 'none',
              }}>{plan.buttonText}</a>
            </div>
          ))}
        </div>
      );

    case 'testimonial':
      return (
        <div {...baseProps}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
            {Array.from({ length: element.rating }).map((_, i) => (
              <span key={i} style={{ color: '#f59e0b', fontSize: '18px' }}>★</span>
            ))}
          </div>
          <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'inherit', opacity: 0.9, fontStyle: 'italic', marginBottom: '20px' }}>"{element.quote}"</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {element.avatar && <img src={element.avatar} alt={element.author} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />}
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: 'inherit', fontSize: '14px' }}>{element.author}</p>
              <p style={{ margin: 0, color: 'inherit', opacity: 0.6, fontSize: '12px' }}>{element.role}</p>
            </div>
          </div>
        </div>
      );

    case 'form':
      return (
        <form {...baseProps} onSubmit={e => e.preventDefault()}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {element.fields.map((field, i) => (
              <div key={i}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: 'inherit', opacity: 0.85 }}>
                  {field.label}{field.required && ' *'}
                </label>
                {field.type === 'textarea' ? (
                  <textarea placeholder={field.placeholder} rows={4} style={{ width: '100%', padding: '12px 16px', backgroundColor: 'rgba(125,125,125,0.06)', border: '1px solid rgba(125,125,125,0.2)', borderRadius: 'var(--border-radius, 8px)', color: 'inherit', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                ) : (
                  <input type={field.type} placeholder={field.placeholder} style={{ width: '100%', padding: '12px 16px', backgroundColor: 'rgba(125,125,125,0.06)', border: '1px solid rgba(125,125,125,0.2)', borderRadius: 'var(--border-radius, 8px)', color: 'inherit', fontSize: '14px', boxSizing: 'border-box' }} />
                )}
              </div>
            ))}
            <button type="submit" style={{ padding: '14px 32px', backgroundColor: primaryBg(), color: '#fff', border: 'none', borderRadius: 'var(--border-radius, 8px)', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginTop: '8px' }}>
              {element.submitText}
            </button>
          </div>
        </form>
      );

    case 'footer':
      return (
        <footer {...baseProps} style={{ ...stylesToCSS(styles), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center' }}>
          <span style={{ fontSize: '22px', fontWeight: 700, color: 'inherit' }}>{element.logo}</span>
          {element.tagline && <p style={{ margin: 0, fontSize: '14px', color: 'inherit', opacity: 0.7 }}>{element.tagline}</p>}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {element.links.map((link, i) => (
              <a key={i} href="#" onClick={e => e.preventDefault()} style={{ color: 'inherit', opacity: 0.75, textDecoration: 'none', fontSize: '14px' }}>{link.label}</a>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'inherit', opacity: 0.5 }}>{element.copyright}</p>
        </footer>
      );

    case 'html':
      return <div {...baseProps} dangerouslySetInnerHTML={{ __html: element.html }} />;

    default:
      return <div {...baseProps}><span style={{ color: '#ef4444', fontSize: '12px' }}>Unknown element</span></div>;
  }
}
