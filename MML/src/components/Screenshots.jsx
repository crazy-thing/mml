import React, { useState, useEffect } from 'react';
import '../styles/componentStyles/Screenshots.scss';
import { fullscreen, glass1 } from '../assets/exports';

const Screenshots = ({ screenshots, onClick, visible }) => {

    const renderScreenshots = () => {
        const rows = [];
        const totalScreenshots = screenshots.length;
        const placeholdersCount = 3 - (totalScreenshots % 3 === 0 ? 3 : totalScreenshots % 3);
        
        const filteredScreenshots = screenshots.filter(screenshot => screenshot !== null && screenshot !== "null");

        for (let i = 0; i < totalScreenshots; i += 3) {
            const rowScreenshots = filteredScreenshots.slice(i, i + 3);
            rows.push(
                <div className={`screenshots-row`} key={`row-${i}`}>
                    {rowScreenshots.map((screenshot, index) => (
                        <div className="screenshot-container" key={`screenshot-container-${i}-${index}`} onClick={() => onClick(screenshot, i + index)}>
                            <img draggable={false} src={glass1} className='screenshot-overlay' />
                            <img
                                key={`screenshot-${i}-${index}`}
                                className='screenshots-screenshot'
                                src={`https://minecraftmigos.me/uploads/screenshots/${screenshot}`}
                                alt={`Screenshot ${i + index}`}
                                draggable={false}
                            />
                        </div>
                    ))}
                    {i >= totalScreenshots - 3 && Array.from({ length: placeholdersCount }).map((_, placeholderIndex) => (
                        <div className="screenshot-container placeholder" key={`placeholder-${placeholderIndex}`}>
                            <div className="placeholder-content"></div>
                        </div>
                    ))}
                </div>
            )
        }
        return rows;
    }

    return (
        <div className={`screenshots`}>
            {renderScreenshots()}
        </div>
    )
};

export default Screenshots;
