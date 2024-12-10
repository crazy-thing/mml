import React, { useEffect, useState } from 'react';
import '../styles/componentStyles/Switch.scss';

const Switch = ({ handleInstallModpack, modpack, isActive, setIsActive, update, setUpdate, setShowLiteUpdate }) => {

  const toggleSwitch = () => {
    setIsActive(!isActive);
    setUpdate(!update);
    setShowLiteUpdate(!update);
  };
  return (
    <div className='switch-container'>
        <p className='switch-text'>Toggle LITE</p>
    <div className="switch" onClick={toggleSwitch}>
      <div className={`switch-part ${!isActive ? 'active' : ''}`}>O</div>
      <div className={`switch-part ${isActive ? 'active' : ''}`}>I</div>
    </div>
    </div>
    );
};

export default Switch;
