import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Pipette } from "lucide-react";

const CustomColorPicker = ({ color, onChange }) => {
  const [hexInput, setHexInput] = useState(color);
  
  useEffect(() => {
    setHexInput(color);
  }, [color]);

  const handleHexChange = (e) => {
    let val = e.target.value.toUpperCase();
    if (val && !val.startsWith('#')) val = '#' + val;
    setHexInput(val);
    if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
      onChange(val);
    }
  };

  const isColor = (str) => {
    if (!str) return false;
    return str.startsWith('#') || str.startsWith('rgb');
  };

  const displayHex = isColor(hexInput) ? hexInput : '';
  const displayPreview = isColor(color) ? color : 'transparent';

  const handleEyeDropper = async () => {
    if (!window.EyeDropper) return alert("Il tuo browser non supporta EyeDropper API.");
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      onChange(result.sRGBHex);
    } catch (e) {
      // User canceled
    }
  };

  return (
    <div className="custom-color-picker-container" style={{
      position: 'relative',
      zIndex: 105,
      background: '#fff',
      padding: '12px',
      borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      width: '100%',
      minWidth: '240px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      border: '1px solid #ddd'
    }} onClick={(e) => e.stopPropagation()}>
      <div className="custom-colorful-override">
        <HexColorPicker color={color} onChange={onChange} style={{ width: '100%' }} />
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', padding: '0 8px', height: '34px', boxSizing: 'border-box', gap: '8px', background: '#fff' }}>
           <div style={{ width: '18px', height: '18px', minWidth: '18px', minHeight: '18px', flexShrink: 0, borderRadius: '50%', background: displayPreview, border: '1px solid rgba(0,0,0,0.1)' }}></div>
           <input 
             type="text" 
             value={displayHex} 
             onChange={handleHexChange}
             placeholder={!isColor(hexInput) ? "Nessun colore" : ""}
             style={{ border: 'none', background: 'transparent', width: '100%', height: '100%', outline: 'none', fontSize: '14px', color: '#333', fontWeight: 500, fontFamily: 'monospace' }}
           />
        </div>
        {window.EyeDropper && (
          <button onClick={handleEyeDropper} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '6px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#333' }}>
            <Pipette size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomColorPicker;
