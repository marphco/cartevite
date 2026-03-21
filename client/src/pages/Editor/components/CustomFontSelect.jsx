import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { getFontPreviewText } from "./EditorHelpers";

const CustomFontSelect = ({ value, onChange, fonts, selectedLayer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const previewText = getFontPreviewText(selectedLayer);

  useEffect(() => {
     const clickOut = (e) => {
       if(containerRef.current && !containerRef.current.contains(e.target) && !e.target.closest('#custom-font-portal')) {
         setIsOpen(false);
       }
     };
     document.addEventListener('mousedown', clickOut);
     return () => document.removeEventListener('mousedown', clickOut);
  }, []);

  return (
    <div ref={containerRef} style={{position: 'relative', width: '100%', marginBottom: '4px'}}>
       <div 
         onClick={() => setIsOpen(!isOpen)}
         style={{
           padding: '8px 12px', 
           border: '1px solid var(--border-color-strong)', 
           borderRadius: 'var(--radius-xs)',
           background: 'var(--bg-surface)',
           cursor: 'pointer',
           display: 'flex',
           justifyContent: 'space-between',
           alignItems: 'center',
           fontFamily: `'${value}'`,
           fontSize: '15px'
         }}
       >
         <span style={{ color: 'var(--text-primary)', fontFamily: `'${value}'` }}>{value}</span>
         <ChevronDown size={14} style={{ color: "var(--text-soft)", transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
       </div>
       
       {isOpen && (
         <div id="custom-font-portal" style={{
           marginTop: '4px',
           width: '100%',
           maxHeight: '300px',
           overflowY: 'auto',
           background: 'var(--bg-surface)',
           border: '1px solid var(--border-color-strong)',
           borderRadius: 'var(--radius-xs)',
           boxShadow: 'var(--shadow-soft)',
           zIndex: 1000
         }} className="custom-scrollbar-mini">
            {fonts.map(f => (
               <div 
                 key={f}
                 onClick={() => {
                   onChange(f);
                   setIsOpen(false);
                 }}
                 style={{
                   padding: '12px 14px',
                   cursor: 'pointer',
                   backgroundColor: value === f ? 'var(--accent)' : 'transparent',
                   color: value === f ? '#ffffff' : 'var(--text-primary)',
                   transition: 'all 0.15s ease',
                   display: 'flex',
                   flexDirection: 'column',
                   gap: '1px'
                 }}
                 onMouseEnter={e => {
                   if(value !== f) {
                     e.currentTarget.style.backgroundColor = 'var(--accent-soft)';
                   }
                 }}
                 onMouseLeave={e => {
                   if(value !== f) {
                     e.currentTarget.style.backgroundColor = 'transparent';
                   }
                 }}
               >
                 <div style={{ fontSize: '10px', fontWeight: 700, opacity: value === f ? 0.7 : 0.4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f}</div>
                 <div style={{ fontFamily: f, fontSize: '20px', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{previewText}</div>
               </div>
            ))}
         </div>
       )}
    </div>
  );
};

export default CustomFontSelect;
