import React from 'react';
const { ipcRenderer } = window.require('electron');
import '../styles/componentStyles/TopBar.scss';
import { close, closeRed, max, mini, mml } from '../assets/exports';

const TopBar = () => {

    const closeWindow = () => {
        ipcRenderer.send('close-window');
    };

    const minimizeWindow = () => {
        ipcRenderer.send('minimize-window');
    };

    const maximizeWindow = () => {
        ipcRenderer.send('maximize-window');
    };

  return (
    <div className='top-bar'>
        <img src={mml} className='top-bar-icon' />
        <div className='top-bar-drag-region'></div>
        <div className='top-bar-buttons'>
            <div className='top-bar-button minimize-button' onClick={minimizeWindow}> <img draggable={false} src={mini} /></div>
            <div className='top-bar-button maximize-button' onClick={maximizeWindow}> <img draggable={false} src={max} /></div>
            <div className='top-bar-button close-button' onClick={closeWindow}> <img draggable={false} src={closeRed} /> </div>

        </div>
    </div>
  )
};

export default TopBar;