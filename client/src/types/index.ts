// ─── Element Types ────────────────────────────────────────────────────────────
export type ElementType =
  | 'heading'
  | 'paragraph'
  | 'button'
  | 'image'
  | 'video'
  | 'divider'
  | 'container'
  | 'spacer'
  | 'navbar'
  | 'gallery'
  | 'card'
  | 'pricing'
  | 'testimonial'
  | 'form'
  | 'footer'
  | 'html';

// ─── Responsive Breakpoints ───────────────────────────────────────────────────
export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

// ─── Style Overrides per Breakpoint ──────────────────────────────────────────
export type ResponsiveStyles = Partial<Record<Breakpoint, Partial<ElementStyles>>>;

// ─── Element Styles ───────────────────────────────────────────────────────────
export interface ElementStyles {
  // Layout
  display?: string;
  flexDirection?: string;
  alignItems?: string;
  justifyContent?: string;
  flexWrap?: string;
  gap?: string;
  gridTemplateColumns?: string;

  // Sizing
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
  maxHeight?: string;

  // Spacing
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;

  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: string;
  color?: string;
  textDecoration?: string;
  textTransform?: string;

  // Background
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;

  // Border
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRadius?: string;
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: string;

  // Effects
  boxShadow?: string;
  opacity?: string;
  overflow?: string;
  objectFit?: string;
  cursor?: string;
  transition?: string;

  // Position
  position?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: string;
}

// ─── Base Element ─────────────────────────────────────────────────────────────
export interface BaseElement {
  id: string;
  type: ElementType;
  name: string;
  styles: ElementStyles;
  responsiveStyles: ResponsiveStyles;
  locked: boolean;
  hidden: boolean;
  children?: WebElement[];
}

// ─── Concrete Elements ────────────────────────────────────────────────────────
export interface HeadingElement extends BaseElement {
  type: 'heading';
  content: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ParagraphElement extends BaseElement {
  type: 'paragraph';
  content: string;
}

export interface ButtonElement extends BaseElement {
  type: 'button';
  text: string;
  href: string;
  target: '_self' | '_blank';
  variant: 'filled' | 'outlined' | 'ghost';
  hoverStyles?: ElementStyles;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt: string;
  assetId?: string;
}

export interface VideoElement extends BaseElement {
  type: 'video';
  src: string;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  controls: boolean;
  poster?: string;
}

export interface DividerElement extends BaseElement {
  type: 'divider';
}

export interface ContainerElement extends BaseElement {
  type: 'container';
  children: WebElement[];
}

export interface SpacerElement extends BaseElement {
  type: 'spacer';
}

export interface NavbarElement extends BaseElement {
  type: 'navbar';
  logo: string;
  links: { label: string; href: string }[];
}

export interface GalleryElement extends BaseElement {
  type: 'gallery';
  images: { src: string; alt: string; assetId?: string }[];
  columns: number;
}

export interface CardElement extends BaseElement {
  type: 'card';
  image?: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
}

export interface PricingElement extends BaseElement {
  type: 'pricing';
  plans: {
    name: string;
    price: string;
    period: string;
    features: string[];
    buttonText: string;
    highlighted: boolean;
  }[];
}

export interface TestimonialElement extends BaseElement {
  type: 'testimonial';
  quote: string;
  author: string;
  role: string;
  avatar?: string;
  rating: number;
}

export interface FormElement extends BaseElement {
  type: 'form';
  fields: { type: 'text' | 'email' | 'textarea' | 'tel'; label: string; placeholder: string; required: boolean }[];
  submitText: string;
  action?: string;
}

export interface FooterElement extends BaseElement {
  type: 'footer';
  logo: string;
  tagline: string;
  links: { label: string; href: string }[];
  copyright: string;
}

export interface HtmlElement extends BaseElement {
  type: 'html';
  html: string;
}

// ─── Union ────────────────────────────────────────────────────────────────────
export type WebElement =
  | HeadingElement | ParagraphElement | ButtonElement | ImageElement
  | VideoElement | DividerElement | ContainerElement | SpacerElement
  | NavbarElement | GalleryElement | CardElement | PricingElement
  | TestimonialElement | FormElement | FooterElement | HtmlElement;

// ─── Section ──────────────────────────────────────────────────────────────────
export interface Section {
  id: string;
  name: string;
  elements: WebElement[];
  styles: ElementStyles;
  locked: boolean;
  hidden: boolean;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export interface Page {
  id: string;
  name: string;
  slug: string;
  sections: Section[];
  meta: {
    title: string;
    description: string;
    keywords: string;
  };
}

// ─── Theme Config (Feature 1) ─────────────────────────────────────────────────
export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#6370f1',
  secondaryColor: '#1e2438',
  accentColor: '#f59e0b',
  textColor: '#f8fafc',
  backgroundColor: '#0f1117',
  headingFont: 'Inter',
  bodyFont: 'Inter',
  borderRadius: 'md',
};

export const BORDER_RADIUS_MAP: Record<ThemeConfig['borderRadius'], string> = {
  none: '0px',
  sm:   '4px',
  md:   '8px',
  lg:   '12px',
  xl:   '16px',
  full: '9999px',
};

// ─── Project ──────────────────────────────────────────────────────────────────
export interface Project {
  _id: string;
  name: string;
  description: string;
  thumbnail?: string;
  pages: Page[];
  settings: {
    favicon?: string;
    fonts: string[];
    globalStyles: string;
    primaryColor: string;
  };
  theme: ThemeConfig;
  userId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// ─── AI Generate ──────────────────────────────────────────────────────────────
export interface AiGenerateRequest {
  prompt: string;
}
export interface AiGenerateResponse {
  section: Section;
}

// ─── Editor State ─────────────────────────────────────────────────────────────
export interface EditorState {
  project: Project | null;
  activePageId: string | null;
  selectedElementId: string | null;
  selectedSectionId: string | null;
  hoveredElementId: string | null;
  previewMode: Breakpoint;
  isDirty: boolean;
  isSaving: boolean;
  history: HistoryEntry[];
  historyIndex: number;
  sidebarTab: 'elements' | 'templates' | 'assets' | 'pages' | 'layers' | 'theme' | 'ai';
  showGrid: boolean;
}

export interface HistoryEntry {
  pages: Page[];
  timestamp: number;
  description: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
