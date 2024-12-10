import React from 'react';
import '../styles/componentStyles/Button.scss';
import { close } from '../assets/exports';

const Button = ({ onClick, text, style, textStyle, icon, small }) => {


  return (
    <div className='button' onClick={onClick} style={style}>
        <p style={textStyle} className='button-text'> {text} </p>
        {icon && (
        <img src={icon} className={`button-icon ${small ? "small" : ''}`} />
        )}
    </div>
  )
};

export default Button;