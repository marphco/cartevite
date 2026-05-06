export interface Layer {
  id: string;
  blockId?: string;
  type?: 'text' | 'image' | 'custom-widget';
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
  bgColor?: string | undefined;
  bgImage?: string | null | undefined;
  bgX?: number | undefined;
  bgY?: number | undefined;
  bgScale?: number | undefined;
  bgOpacity?: number | undefined;
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
    // Payment widget (digital gifts)
    paymentTitle?: string;
    paymentDescription?: string;
    paymentPresetAmounts?: number[];
    paymentMinAmount?: number;
    paymentMaxAmount?: number;
    paymentTargetAmount?: number;
    paymentShowProgress?: boolean;
    paymentAccentColor?: string;
    paymentMode?: 'gift' | 'donation';
    paymentThankYouMessage?: string;
    paymentCtaLabel?: string;
    paymentAllowCustomAmount?: boolean;
    // Positioning (shared with gallery/video)
    widgetX?: number;
    widgetY?: number;
    mobileOrder?: number;
    // Tableau de mariage configurations
    tableauTables?: Array<{
      id: string;
      name: string;
      capacity: number;
      shape: 'round' | 'rect';
      x: number;
      y: number;
      rotation?: number;
    }>;
    tableauAssignments?: Array<{ guestId: string; tableId: string; guestName?: string }>;
    tableauConstraints?: Array<{ guestId1: string; guestId2: string; type: 'together' | 'avoid' }>;
    tableauIsPublished?: boolean;
    tableauLayout?: 'grid' | 'map';
    tableauSettings?: {
      autoSplitGroups?: boolean;
      showFloorPlan?: boolean;
    };
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
  plan?: "free" | "paid" | string;
  status?: string;
  date?: string;
  dateTBD?: boolean;
  theme: EventTheme;
  layers?: Layer[];
  blocks?: Block[];
  canvas?: CanvasProps;
  editLink?: string;
  rsvps?: any[];
  addons?: {
    tableau?: boolean;
    [key: string]: any;
  };
}
