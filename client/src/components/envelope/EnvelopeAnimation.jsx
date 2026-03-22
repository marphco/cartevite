import React from 'react';
import EnvelopeSquare from './EnvelopeSquare';
import EnvelopeRectangular from './EnvelopeRectangular';

export default function EnvelopeAnimation(props) {
  const { canvasProps, envelopeFormat = 'horizontal' } = props;
  
  const isRectangular = canvasProps?.width && canvasProps?.height && Math.abs(canvasProps.width - canvasProps.height) > 10;
  
  if (!isRectangular) {
    return <EnvelopeSquare {...props} />;
  }
  
  return <EnvelopeRectangular {...props} envelopeFormat={envelopeFormat} />;
}
