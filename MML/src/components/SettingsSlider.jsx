import React, { useEffect, useState } from 'react';
import '../styles/componentStyles/SettingsSlider.scss';

const SettingsSlider = ({ handleChangeSetting, ramValue }) => {
    const [ramValueGB, setRamValueGB] = useState(8); // 8 GB default

    useEffect(() => {
        setRamValueGB(ramValue / 1024); // Convert MB to GB
    }, [ramValue]);

    useEffect(() => {
        const track = document.querySelector('.settings-slider-slide-bar');
        const percent = (ramValueGB * 1024) / 32768 * 100;
        if (track) {
            track.style.background = `linear-gradient(to right, #e2e2e2 0%, #e2e2e2 ${percent}%, #2e2e2e ${percent}%, #2e2e2e 100%)`;
        }
    }, [ramValueGB]);

    const handleInputChange = (e) => {
        let value = parseFloat(e.target.value);
        if (isNaN(value)) {
            setRamValueGB('');
        } else {
            if (value > 32) value = 32;
            if (value < 0.25) value = 0.25;
            setRamValueGB(value);
            handleChangeSetting("MaxMem", Math.round(value * 1024));
        }
    };

    const handleSliderChange = (e) => {
        const valueGB = parseFloat(e.target.value);
        setRamValueGB(valueGB);
        handleChangeSetting("MaxMem", Math.round(valueGB * 1024));
    };

    return (
        <div className='settings-slider'>
            <input
                type='range'
                id='ramSlider'
                className='settings-slider-slide-bar'
                value={ramValueGB}
                onChange={handleSliderChange}
                min={1}
                max={32}
                step={1}
                style={{ width: "92%", color: "#fff" }}
            />
            <div className="settings-slider-input-container">
                <input
                    type='number'
                    id='ramInput'
                    className='settings-slider-input'
                    value={ramValueGB}
                    onChange={handleInputChange}
                    min={1}
                    max={32}
                    step={1}
                />
                <p className="settings-slider-text">GB</p>
            </div>
        </div>
    );
};

export default SettingsSlider;
