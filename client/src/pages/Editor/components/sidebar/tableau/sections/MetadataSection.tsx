import React from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '../../../../../../ui';
import CustomColorPicker from '../../../CustomColorPicker';

interface MetadataSectionProps {
  config: any;
  patchConfig: (patch: any) => void;
  displayColorPicker: boolean | string;
  setDisplayColorPicker: React.Dispatch<React.SetStateAction<boolean | string>>;
}

const MetadataSection: React.FC<MetadataSectionProps> = ({
  config,
  patchConfig,
  displayColorPicker,
  setDisplayColorPicker,
}) => {
  return (
    <>
      {/* TITOLI E DESCRIZIONE */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '8px', display: 'block', letterSpacing: '0.05em' }}>Titolo Tableau</label>
        <div style={{ display: 'flex', alignItems: 'center', background: 'transparent', borderRadius: '0' }}>
          <Pencil size={14} style={{ color: 'var(--text-soft)', marginRight: '12px', flexShrink: 0 }} />
          <input
            type="text"
            value={config.tableauTitle ?? 'TABLEAU DE MARIAGE'}
            onChange={e => patchConfig({ tableauTitle: e.target.value })}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', minWidth: 0 }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '8px', display: 'block', letterSpacing: '0.05em' }}>Descrizione Tableau</label>
        <div style={{ display: 'flex', alignItems: 'flex-start', background: 'transparent', borderRadius: '0' }}>
          <Pencil size={14} style={{ color: 'var(--text-soft)', marginRight: '12px', marginTop: '3px', flexShrink: 0 }} />
          <textarea
            value={config.tableauDescription ?? 'Cerca il tuo nome per trovare il tuo posto.'}
            onChange={e => patchConfig({ tableauDescription: e.target.value })}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: 'var(--text-primary)', minWidth: 0, resize: 'vertical' }}
            rows={2}
          />
        </div>
      </div>

      {/* COLORE ACCENTO WIDGET - GLOBALE */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
          Stile
        </label>
        <Button
          variant={displayColorPicker === 'tableauAccent' ? 'primary' : 'subtle'}
          onClick={() => setDisplayColorPicker(displayColorPicker === 'tableauAccent' ? false : 'tableauAccent')}
          style={{ width: '100%', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '100px' }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Pulsanti & Accenti</span>
          <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: config.tableauAccentColor || 'var(--accent)', border: '1px solid rgba(0,0,0,0.1)' }} />
        </Button>
        {displayColorPicker === 'tableauAccent' && (
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '8px' }}>
            <CustomColorPicker
              color={config.tableauAccentColor || '#1a1a1a'}
              onChange={(color) => patchConfig({ tableauAccentColor: color })}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default MetadataSection;
