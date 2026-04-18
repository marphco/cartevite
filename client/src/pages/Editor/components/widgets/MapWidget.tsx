import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { getAdaptivePalette } from '../../../../utils/colorUtils';

interface MapWidgetProps {
  address?: string | undefined;
  title?: string | undefined;
  zoom?: number | undefined;
  style?: {
    borderRadius?: string;
    border?: string;
    boxShadow?: string;
  };
  previewMobile?: boolean;
  /**
   * Sfondo effettivo della sezione — serve per calcolare l'adaptive palette.
   * Se non passato il widget assume sfondo chiaro (testo scuro).
   */
  sectionBg?: string | null;
  accentColor?: string;
}

const MapWidget: React.FC<MapWidgetProps> = ({
  address = '',
  title = 'Come Arrivare',
  zoom = 15,
  style = {},
  previewMobile = false,
  sectionBg,
  accentColor = 'var(--accent)'
}) => {
  const rawAddress = typeof address === 'string' ? address.trim() : '';
  const hasAddress = rawAddress.length > 0;
  const encodedAddress = encodeURIComponent(rawAddress);
  const fallbackUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=${zoom}&hl=it&ie=UTF8&iwloc=&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  // Palette adattiva: sezione scura → testo bianco; sezione chiara → testo nero.
  const palette = getAdaptivePalette(sectionBg, accentColor);

  const padTop = previewMobile ? 10 : 28;
  const padBottom = previewMobile ? 10 : 24;
  const gutter = previewMobile ? '12px' : 'clamp(1.25rem, 5vw, 2.5rem)';

  return (
    <div
      className="map-widget-wrapper"
      style={{
        width: '100%',
        maxWidth: 'min(640px, 100%)',
        margin: '0 auto',
        padding: `${padTop}px ${gutter} ${padBottom}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxSizing: 'border-box',
        color: palette.text
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <h3 style={{
          margin: 0,
          fontSize: previewMobile ? '18px' : '22px',
          fontWeight: 700,
          color: palette.text,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <MapPin size={previewMobile ? 18 : 22} color={accentColor} />
          {title}
        </h3>
        {hasAddress ? (
          <p style={{
            margin: 0,
            fontSize: previewMobile ? '13px' : '14px',
            color: palette.textSoft,
          }}>
            {rawAddress}
          </p>
        ) : (
          <p style={{
            margin: 0,
            fontSize: previewMobile ? '13px' : '14px',
            color: palette.textSoft,
            fontStyle: 'italic',
            opacity: 0.85
          }}>
            Nessun indirizzo indicato — aggiungilo dall’editor della pagina evento.
          </p>
        )}
      </div>

      <div className="map-widget-container" style={{
        width: '100%',
        maxWidth: '100%',
        height: previewMobile ? '280px' : '360px',
        borderRadius: style.borderRadius || '16px',
        overflow: 'hidden',
        border: style.border || `1px solid ${palette.border}`,
        boxShadow: style.boxShadow || '0 10px 30px rgba(0,0,0,0.08)',
        position: 'relative',
        background: palette.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
      }}>
        {hasAddress ? (
          <>
            <iframe
              title="Event Location"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              src={fallbackUrl}
              allowFullScreen
            />
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
              pointerEvents: 'none'
            }} />
          </>
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 16px',
            textAlign: 'center',
            fontSize: previewMobile ? '13px' : '14px',
            lineHeight: 1.5,
            color: palette.textSoft,
          }}>
            Inserisci un indirizzo nella barra laterale per mostrare la mappa qui.
          </div>
        )}
      </div>

      {hasAddress ? (() => {
        const isHex = /^#[0-9a-fA-F]{6}$/.test(accentColor);
        const bgLight = isHex ? `${accentColor}1A` : 'rgba(var(--accent-rgb), 0.1)';
        const borderLight = isHex ? `${accentColor}40` : 'rgba(var(--accent-rgb), 0.25)';
        return (
          <div style={{ width: '100%', boxSizing: 'border-box' }}>
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '100px',
                background: palette.isDark ? 'rgba(255,255,255,0.1)' : bgLight,
                color: palette.isDark ? '#ffffff' : accentColor,
                fontSize: '14px',
                fontWeight: 600,
                border: `1px solid ${palette.isDark ? 'rgba(255,255,255,0.25)' : borderLight}`,
                transition: 'all 0.2s ease'
              }}
            >
              <ExternalLink size={16} />
              Apri su Google Maps
            </a>
          </div>
        );
      })() : null}
    </div>
  );
};

export default MapWidget;
