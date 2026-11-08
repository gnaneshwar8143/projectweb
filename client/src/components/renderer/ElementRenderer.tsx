import React, { type JSX } from 'react';
import type { WebElement, ElementStyles } from '../../types';
import { useEditorStore } from '../../store/editorStore';
import { createElement } from './elementFactory';

// Convert our ElementStyles object to a React CSSProperties object
// Injects CSS custom property fallbacks for theme-aware values
export function stylesToCSS(styles: ElementStyles): React.CSSProperties {
  const css: React.CSSProperties = { ...styles as React.CSSProperties };

  // Combine 3D transforms if any are set
  const transforms: string[] = [];
  if (styles.perspective) transforms.push(`perspective(${styles.perspective})`);
  if (styles.rotateX) transforms.push(`rotateX(${styles.rotateX})`);
  if (styles.rotateY) transforms.push(`rotateY(${styles.rotateY})`);
  if (styles.rotateZ) transforms.push(`rotateZ(${styles.rotateZ})`);
  if (styles.translateZ) transforms.push(`translateZ(${styles.translateZ})`);

  if (transforms.length > 0) {
    css.transform = transforms.join(' ');
  }
  if (styles.transformStyle) {
    (css as any).transformStyle = styles.transformStyle;
  }
  return css;
}

function Model3DViewer({ element }: { element: any }) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (element.provider !== 'interactive-crystal') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const onResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 400;
      height = canvas.height = canvas.parentElement.clientHeight || 400;
    };
    window.addEventListener('resize', onResize);

    const vertices = [
      { x: 0, y: -130, z: 0 },
      { x: 90, y: 0, z: 90 },
      { x: -90, y: 0, z: 90 },
      { x: -90, y: 0, z: -90 },
      { x: 90, y: 0, z: -90 },
      { x: 0, y: 130, z: 0 },
    ];
    const faces = [
      [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
      [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4]
    ];
    const faceColors = [
      'rgba(0, 245, 255, 0.45)',
      'rgba(168, 85, 247, 0.45)',
      'rgba(59, 130, 246, 0.45)',
      'rgba(236, 72, 153, 0.45)',
      'rgba(16, 185, 129, 0.45)',
      'rgba(0, 245, 255, 0.35)',
      'rgba(168, 85, 247, 0.35)',
      'rgba(236, 72, 153, 0.35)'
    ];

    let angleX = 0;
    let angleY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angleX += 0.008;
      angleY += 0.012;

      const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY), sinY = Math.sin(angleY);

      const projected = vertices.map(v => {
        const y1 = v.y * cosX - v.z * sinX;
        const z1 = v.y * sinX + v.z * cosX;
        const x2 = v.x * cosY + z1 * sinY;
        const z2 = -v.x * sinY + z1 * cosY;
        const scale = 360 / (360 + z2);
        return {
          x: x2 * scale + width / 2,
          y: y1 * scale + height / 2,
          z: z2,
        };
      });

      const sortedFaces = faces.map((f, idx) => {
        const avgZ = (projected[f[0]].z + projected[f[1]].z + projected[f[2]].z) / 3;
        return { indices: f, avgZ, color: faceColors[idx] };
      }).sort((a, b) => b.avgZ - a.avgZ);

      sortedFaces.forEach(face => {
        const p1 = projected[face.indices[0]];
        const p2 = projected[face.indices[1]];
        const p3 = projected[face.indices[2]];

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fillStyle = face.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
    };
  }, [element.provider]);

  if (element.provider === 'interactive-crystal') {
    return (
      <div style={{ width: '100%', height: '100%', minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        <div style={{ position: 'absolute', bottom: '12px', left: '16px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', color: '#00f5ff', border: '1px solid rgba(0,245,255,0.3)', pointerEvents: 'none' }}>
          Interactive WebGL Crystal
        </div>
      </div>
    );
  }

  if (element.provider === 'spline') {
    return (
      <iframe
        src={element.src || 'https://my.spline.design/interactivecubes-9b8e8f81014e037be7dc4fb01d22f6d2/'}
        frameBorder="0"
        width="100%"
        height="100%"
        style={{ width: '100%', height: '100%', minHeight: '400px', border: 'none', display: 'block', borderRadius: 'inherit' }}
        allow="fullscreen"
        title={element.alt || 'Spline 3D'}
      />
    );
  }

  // Google <model-viewer> custom element
  return React.createElement('model-viewer', {
    src: element.src || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    alt: element.alt || '3D Model',
    'auto-rotate': element.autoRotate ? '' : undefined,
    'camera-controls': element.cameraControls ? '' : undefined,
    'shadow-intensity': element.shadowIntensity ?? 1,
    poster: element.poster,
    style: {
      width: '100%',
      height: '100%',
      minHeight: '380px',
      display: 'block',
      backgroundColor: 'transparent',
    },
  });
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
                {(['heading', 'paragraph', 'button', 'image', 'model3d'] as const).map(t => (
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
                    + {t === 'model3d' ? '3D' : t}
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

    case 'model3d':
      return (
        <div {...baseProps} style={{ ...stylesToCSS(styles), overflow: 'hidden' }}>
          <Model3DViewer element={element} />
        </div>
      );

    default:
      return <div {...baseProps}><span style={{ color: '#ef4444', fontSize: '12px' }}>Unknown element</span></div>;
  }
}
