import { useState, useRef, useEffect } from "react";
import "./EditableSpan.css";

export default function EditableSpan({ value, onChange, placeholder, style, multiline, className }) {
  const [editing, setEditing] = useState(false);
  const [tempVal, setTempVal] = useState(value || "");
  const inputRef = useRef(null);

  // Invece di syncare in useEffect, usiamo key nel parent per forzare il remount, 
  // o aggiorniamo il prop tempVal solo se editing è disattivo.
  if (!editing && tempVal !== value) {
    setTempVal(value || "");
  }

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      // Mettiamo il cursore alla fine se si tratta di testo
      if (inputRef.current.setSelectionRange) {
        inputRef.current.setSelectionRange(tempVal.length, tempVal.length);
      }
    }
  }, [editing, tempVal.length]);

  const handleBlur = () => {
    setEditing(false);
    if (tempVal !== value) {
      onChange(tempVal);
    }
  };

  const handleKeyDown = (e) => {
    if (!multiline && e.key === "Enter") {
      inputRef.current?.blur();
    }
    if (e.key === "Escape") {
      setTempVal(value || ""); // Revert
      inputRef.current?.blur();
    }
  };

  if (editing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef}
          value={tempVal}
          onChange={(e) => setTempVal(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`editable-input multiline ${className || ""}`}
          style={{ ...style, resize: "none" }}
          rows={Math.max(1, tempVal.split("\n").length)}
        />
      );
    }
    return (
      <input
        ref={inputRef}
        type="text"
        value={tempVal}
        onChange={(e) => setTempVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`editable-input ${className || ""}`}
        style={style}
      />
    );
  }

  return (
    <span
      className={`editable-text ${className || ""} ${!value ? "empty" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      style={style}
      title="Clicca per modificare"
    >
      {value || placeholder || "Tocca per scrivere..."}
    </span>
  );
}
