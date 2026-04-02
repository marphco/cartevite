import React from 'react';
import { motion } from 'framer-motion';
import { Mouse, ChevronDown } from 'lucide-react';

interface ScrollHintProps {
  isMobile: boolean;
  color?: string;
}

export const ScrollHint: React.FC<ScrollHintProps> = ({ isMobile, color = '#ffffff' }) => {
  // Utilizziamo un bianco sporco/grigio chiaro per rendere l'effetto 'difference' più discreto
  const hintColor = '#cccccc'; 

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 1.5 }}
      style={{
        position: 'absolute',
        bottom: '35px',
        left: '0',
        right: '0',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 100,
        pointerEvents: 'none',
        // Inverte i colori rispetto allo sfondo per visibilità, ma con intensità ridotta dal colore base
        mixBlendMode: 'difference' 
      }}
    >
      {isMobile ? (
        <motion.div
          animate={{ 
            y: [0, 5, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <ChevronDown size={32} color={hintColor} strokeWidth={2} />
        </motion.div>
      ) : (
        <motion.div
          animate={{ 
            y: [0, 4, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px' }}
        >
          <Mouse size={24} color={hintColor} strokeWidth={1.2} />
          <ChevronDown size={14} color={hintColor} strokeWidth={2.5} style={{ marginTop: '-4px' }} />
        </motion.div>
      )}
    </motion.div>
  );
};

export default ScrollHint;
