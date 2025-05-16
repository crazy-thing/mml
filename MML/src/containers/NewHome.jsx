import React, { useEffect, useState } from 'react';
import { arrows, dropdown, settingIcon } from '../assets/exports';
import '../styles/containerStyles/Home.scss';
import { getAllModpacks } from '../util/api';

const NewHome = ({ selectModpack, toggleShowSettings }) => {
    const [modpacks, setModpacks] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const fetchModpacks = async () => {
            try {
                const mps = await getAllModpacks();
                setModpacks(mps);
            } catch (error) {
                console.error('Error fetching modpacks:', error);
            }
        };
        fetchModpacks();
    }, []);

    const getRowCount = () => {
        const count = isExpanded ? modpacks.length : Math.min(modpacks.length, 5);
        return Math.ceil(count / 5);
    };

    const renderModpacks = () => {
        if (modpacks.length === 0) return;

        const visibleModpacks = isExpanded ? modpacks : modpacks.slice(0, 5);
        const rows = [];

        for (let i = 0; i < visibleModpacks.length; i += 5) {
            const rowItems = visibleModpacks.slice(i, i + 5);
            rows.push(
                <div className='modpack-row' key={i}>
                    {rowItems.map((modpack, index) => (
                        <div className='modpack-card' key={index} onClick={() => selectModpack(modpack)}>
                            <img
                                src={`https://minecraftmigos.me/uploads/thumbnails/${modpack.thumbnail}`}
                                alt={modpack.name}
                                className='modpack-card__image'
                            />
                            {modpack.status === "dev" && (<span className='modpack-card__status'>DEV</span>)}
                        </div>

                    ))}
                </div>
            );
        }

        return rows;
    };

    const rowCount = getRowCount();
    const height = `${11 * rowCount}vh`;

    return (
        <>
        <div className={`home-overlay ${isExpanded ? "active" : ""}`} onClick={() => setIsExpanded(false)} />
        <div className='home' style={{ height }}>
            <div className='home__top'>
                <img
                    src={settingIcon}
                    alt="Settings"
                    className='home__top-settings'
                    draggable={false}
                    onClick={(e) => toggleShowSettings(e)}
                />
                <div className='home__top-content'>
                    {renderModpacks()}
                </div>
                <img
                    src={dropdown}
                    alt="Toggle"
                    className={`home__top-arrows ${isExpanded ? 'rotated' : ''}`}
                    draggable={false}
                    onClick={rowCount > 1 ? () => setIsExpanded(prev => !prev) : console.log("Not enough modpacks to expand")}
                />
            </div>
        </div>
        </>
    );
};

export default NewHome;
