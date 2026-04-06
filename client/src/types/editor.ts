export interface Layer {
  id: string;
  blockId?: string;
  type?: 'text' | 'image';
  x: number | 'center';
  y: number | 'center';
  z?: number;
  text?: string;
  src?: string;
  w?: number;
  h?: number;
  width?: number | 'max-content';
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  textDecoration?: string;
  letterSpacing?: number;
  lineHeight?: number;
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  opacity?: number;
  // Binari Separati (Mobile vs Desktop)
  mobileOrder?: number;
  hiddenMobile?: boolean;
  hiddenDesktop?: boolean;
}

export interface CanvasProps {
  width: number;
  height: number;
  bgColor?: string;
  bgImage?: string | null;
  bgX?: number;
  bgY?: number;
  bgScale?: number;
  bgOpacity?: number;
}

export interface SelectionBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export interface SnapGuide {
  axis: 'x' | 'y';
  position: number;
}

export interface Block {
  id?: string;
  _id?: string;
  type: string;
  x?: number;
  y: number;
  width?: number;
  height?: number;
  order?: number;
  mobileOrder?: number;
  props?: any;
  bgColor?: string;
  // Widget Data
  widgetProps?: {
    address?: string;
    zoom?: number;
    mapStyle?: string;
    // RSVP specific configurations
    rsvpTitle?: string;
    rsvpDescription?: string;
    rsvpAskGuests?: boolean;
    rsvpAskIntolerances?: boolean;
    rsvpConfirmationMessage?: string;
    // Nuovi campi per stile "Jewelry"
    formPrimaryColor?: string;
    formTextColor?: string;
    formInputBg?: string;
    // Gestione domande extra
    customFields?: Array<{
      id: string;
      label: string;
      type: 'text' | 'checkbox';
      required?: boolean;
    }>;
    [key: string]: any;
  };
}

export interface EventTheme {
  accent: string;
  background: string;
  preset: string;
  fonts: { heading: string; body: string };
  heroBg?: string | null;
  heroBgColor?: string;
  heroBgOpacity?: number;
  heroBgPosition?: string;
  envelopeFormat?: "vertical" | "horizontal";
  coverBg?: string;
  coverPocketColor?: string | null;
  coverLiner?: string | null;
  coverPocketLiner?: string | null;
  coverLinerColor?: string;
  coverText?: string;
  linerX?: number;
  linerY?: number;
  linerScale?: number;
  linerOpacity?: number;
  linerColor?: string | null;
}

export interface EventData {
  id?: string;
  _id?: string;
  slug?: string;
  title: string;
  status?: string;
  date?: string;
  dateTBD?: boolean;
  theme: EventTheme;
  layers?: Layer[];
  blocks?: Block[];
  canvas?: CanvasProps;
  editLink?: string;
}
