import React from "react";

const MobileIconBtn = ({ icon: Icon, label, onClick, disabled, variant = "ghost", className = "", style = {} }) => (
  <button 
    onClick={onClick} 
    disabled={disabled} 
    className={`mobile-icon-btn variant-${variant} ${className}`}
    style={style}
  >
    <Icon size={18} className="mib-icon"/>
    <span className="mib-label">{label}</span>
  </button>
);

export default MobileIconBtn;
