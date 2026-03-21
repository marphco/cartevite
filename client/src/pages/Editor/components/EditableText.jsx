import { useEffect, useRef } from "react";

const EditableText = ({ text, isEditing, onSync, onBlur, onFocus, onDoubleClick, onPointerDown, style, id, className }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== text) {
      ref.current.innerHTML = text;
    }
  }, [text]);
  return (
    <div
      ref={ref}
      id={id}
      className={className}
      contentEditable={isEditing}
      suppressContentEditableWarning={true}
      onInput={(e) => onSync(e.currentTarget.innerHTML)}
      onBlur={(e) => onBlur(e.currentTarget.innerHTML)}
      onFocus={onFocus}
      onDoubleClick={onDoubleClick}
      onPointerDown={onPointerDown}
      style={style}
    />
  );
};

export default EditableText;
