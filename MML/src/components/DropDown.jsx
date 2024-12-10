import React, { useEffect, useRef, useState } from 'react';
import '../styles/componentStyles/DropDown.scss';
import { carretDown, dots } from '../assets/exports';

const DropDown = ({toggleUninstall, handleOpenFolder, setShowVersionSelection, switchActive, showLiteUpdate, oldInstall, modpack, update}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState("off");
    const dropDownRef = useRef(null);

    const handleLite = () => {
        toggleShowLite();
    }

    const handleClickOutside = (event) => {
        if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };

    }, []);

    return (
        <div className={`dropdown ${isOpen ? 'open' : ''} dropdown ${showLiteUpdate | oldInstall ? 'update' : ''}`} ref={dropDownRef} onClick={() => setIsOpen(!isOpen)}>
            <img src={dots} className='dropdown-dots' />
            <div className={`dropdown-options ${isOpen ? 'open' : ''}`}>
                    {modpack && modpack.mainVersion && modpack.mainVersion.liteZip && (
                        <div
                        className={`dropdown-options-option`}
                        onClick={() => setShowVersionSelection(true)}
                        >
                            <p className='dropdown-options-option-text'>VERSION SELECT</p>
                        </div>
                    )}

                    <div className='dropdown-options-option' onClick={() => handleOpenFolder()}>
                        <p className='dropdown-options-option-text file'>OPEN FILE LOCATION</p>
                    </div>
                    <div
                        className={`dropdown-options-option`}
                        onClick={toggleUninstall}
                    >
                        <p className='dropdown-options-option-text uninstall'>UNINSTALL?</p>
                    </div>
                </div>
        </div>
    );
};

export default DropDown;