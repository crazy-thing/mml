import React, { useEffect } from 'react';
import '../styles/componentStyles/Choose.scss';
import { close, closeRed } from '../assets/exports';

const Choose = ({ toggleShowLite, setShowVersionSelection, handleInstallModpack, mp, switchActive, installedVersion, setSwitchActive, oldInstall }) => {

    const handleSelection = (bool) => {
        setSwitchActive(bool);
        handleInstallModpack(mp, bool);
        setShowVersionSelection(false);
    };

    useEffect(() => {

        console.log(`old install is ${oldInstall}`);
    }, []);

  return (
    <div className='choose'>
        <div className='choose-content'>
            <p className='choose-content-title'>Choose a version:</p>
            <img src={closeRed} className='choose-content-close' onClick={() => setShowVersionSelection(false)} />
            <div className='choose-content-versions'>
                <div className='choose-content-versions-version'>
                    <p className='choose-content-versions-version-text'>Full Version</p>
                    <span className={`choose-content-versions-version-text-button ${(!switchActive && (installedVersion || oldInstall)) ? "active" : ""}`}
                    onClick={ (!switchActive && (installedVersion || oldInstall)) ? () => console.log("already chosen") : () => handleSelection()} >{(!switchActive && (installedVersion || oldInstall)) ? "INSTALLED" : "CHOOSE"}</span>
                    <span className='choose-content-versions-version-text-info full'>The full version of the modpack, with all the bells and whistles!</span>
                </div>
                <div className='choose-content-versions-version'>
                    <p className='choose-content-versions-version-text'>LITE Edition</p>
                    <span className={`choose-content-versions-version-text-button ${ (switchActive && (installedVersion || oldInstall)) ? "active" : ""} `}
                    onClick={ (switchActive && (installedVersion || oldInstall)) ? () => console.log("already chosen") : () => handleSelection(true)} > {(switchActive && (installedVersion || oldInstall)) ? "INSTALLED" : "CHOOSE"}</span>
                    <span className='choose-content-versions-version-text-info lite'>A lighter weight version of the modpack designed to run better on older hardware WITHOUT missing any core features.</span>
                </div>
            </div>
        </div>
    </div>
  )
};

export default Choose;