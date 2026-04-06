import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

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
}

const MapWidget: React.FC<MapWidgetProps> = ({ 
  address = "Piazza del Duomo, Milano", 
  title = "Come Arrivare",
  zoom = 15,
  style = {},
  previewMobile = false
}) => {
  const encodedAddress = encodeURIComponent(address);
  // Use a reliable embed URL with common fallback
  const fallbackUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  return (
    <div className="map-widget-wrapper" style={{
      width: '100%',
      padding: previewMobile ? '10px' : '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      boxSizing: 'border-box'
    }}>
      {/* Title & Address Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: previewMobile ? '18px' : '22px', 
          fontWeight: 700, 
          color: 'var(--text-main)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <MapPin size={previewMobile ? 18 : 22} color="var(--accent)" />
          {title}
        </h3>
        <p style={{ 
          margin: 0, 
          fontSize: previewMobile ? '13px' : '14px', 
          color: 'var(--text-soft)', 
          opacity: 0.8 
        }}>
          {address}
        </p>
      </div>

      {/* Map Container */}
      <div className="map-widget-container" style={{
        width: '100%',
        height: previewMobile ? '280px' : '360px',
        borderRadius: style.borderRadius || '16px',
        overflow: 'hidden',
        border: style.border || '1px solid rgba(var(--accent-rgb), 0.2)',
        boxShadow: style.boxShadow || '0 10px 30px rgba(0,0,0,0.05)',
        position: 'relative'
      }}>
        <iframe
          title="Event Location"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          src={fallbackUrl}
          allowFullScreen
        />
        
        {/* Overlay for editor selection interaction */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          pointerEvents: 'none'
        }} />
      </div>

      {/* Action Button */}
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
          background: 'rgba(var(--accent-rgb), 0.1)',
          color: 'var(--accent)',
          fontSize: '14px',
          fontWeight: 600,
          border: '1px solid rgba(var(--accent-rgb), 0.2)',
          transition: 'all 0.2s ease'
        }}
      >
        <ExternalLink size={16} />
        Apri su Google Maps
      </a>
    </div>
  );
};

export default MapWidget;
