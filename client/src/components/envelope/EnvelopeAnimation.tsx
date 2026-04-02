import React from 'react';
import EnvelopeSquare from './EnvelopeSquare';
import EnvelopeVertical from './EnvelopeVertical';
import EnvelopeHorizontal from './EnvelopeHorizontal';

interface EnvelopeAnimationProps {
  children?: React.ReactNode;
  preview?: boolean;
  guestName?: string;
  envelopeColor?: string;
  linerImg?: string | null;
  pocketLinerImg?: string | null;
  pocketColor?: string | null;
  canvasProps?: { width: number; height: number } | null;
  onOpenComplete?: () => void;
  envelopeFormat?: 'horizontal' | 'vertical';
  editMode?: boolean;
  manualPhase?: 'closed' | 'flap_open' | 'extracting' | 'extracted' | null;
  linerX?: number;
  linerY?: number;
  linerScale?: number;
  isEditingLiner?: boolean;
  onLinerChange?: (updates: { x?: number; y?: number; scale?: number; opacity?: number }) => void;
  linerOpacity?: number;
  linerColor?: string | null;
  scale?: number | null;
  isEventPage?: boolean;
  isBuilder?: boolean;
  isMobile?: boolean;
}

export default function EnvelopeAnimation(props: EnvelopeAnimationProps) {
  const { canvasProps, envelopeFormat = 'vertical' } = props;
  
  // LOGICA DI SELEZIONE FORMATO NETTA
  // 1. Se è esattamente quadrato (width == height) -> EnvelopeSquare
  // 2. Se envelopeFormat è 'horizontal' -> EnvelopeHorizontal
  // 3. Altrimenti -> EnvelopeVertical (default per portrait)
  
  const isSquare = !!(canvasProps?.width && canvasProps?.height && Math.abs(canvasProps.width - canvasProps.height) < 10);
  
  if (isSquare) {
    return <EnvelopeSquare {...props} />;
  }
  
  if (envelopeFormat === 'horizontal') {
    return <EnvelopeHorizontal {...props} />;
  }
  
  return <EnvelopeVertical {...props} />;
}
