import React, { useEffect, useState } from 'react';
import '../styles/containerStyles/Home.scss';
import { settings } from '../assets/exports';


const Home = ({ modpacks, toggleShowSettings, handleSelectModpack, allInstalledVersions }) => {
    const { ipcRenderer } = window.require('electron');

    const [mps, setMps] = useState(modpacks);
    const [installedMps, setInstalledMps] = useState([]);

    useEffect(() => {
        setMps(modpacks);
        if (allInstalledVersions === null) {
          setInstalledMps([]);
        } else {
          setInstalledMps(allInstalledVersions);
        }
    }, [modpacks, allInstalledVersions])

    const renderModpacks = () => {
      try {
        const rows = [];
        for (let i = 0; i < mps.length; i += 4) {
          console.log(mps[i]);
          const row = (
            <div className={`home-modpacks-row`} key={`row-${i}`}>
              {mps[i] && (
                <div className='home-modpacks-thumbnail-container' onClick={() => handleSelectModpack(mps[i])}>
                {!installedMps.some(installed => installed.id === mps[i].id) && (<div className='home-modpacks-thumbnail-overlay' />)}
                <img
                  className={`home-modpacks-thumbnail ${!installedMps.some(installed => installed.id === mps[i].id) ? "not-installed" : ""}`}
                  draggable={false}
                  src={`https://t.minecraftmigos.me/uploads/thumbnails/${mps[i].thumbnail}`}
                />
                </div>
              )}
              {mps[i + 1] && (
                <div className='home-modpacks-thumbnail-container' onClick={() => handleSelectModpack(mps[i + 1])}>
                {!installedMps.some(installed => installed.id === mps[i + 1].id) && (<div className='home-modpacks-thumbnail-overlay' />)}
                <img
                  className={`home-modpacks-thumbnail ${!installedMps.some(installed => installed.id === mps[i + 1].id) ? "not-installed" : ""}`}
                  draggable={false}
                  src={`https://t.minecraftmigos.me/uploads/thumbnails/${mps[i + 1].thumbnail}`}
                />
                </div>
              )}
              {mps[i + 2] && (
                <div className='home-modpacks-thumbnail-container' onClick={() => handleSelectModpack(mps[i + 2])}>
                {!installedMps.some(installed => installed.id === mps[i + 2].id) && (<div className='home-modpacks-thumbnail-overlay' />)}
                <img
                  className={`home-modpacks-thumbnail ${!installedMps.some(installed => installed.id === mps[i + 2].id) ? "not-installed" : ""}`}
                  draggable={false}
                  src={`https://t.minecraftmigos.me/uploads/thumbnails/${mps[i + 2].thumbnail}`}
                />
                </div>
              )}
              {mps[i + 3] && (
                <div className='home-modpacks-thumbnail-container' onClick={() => handleSelectModpack(mps[i + 3])}>
                {!installedMps.some(installed => installed.id === mps[i + 3].id) && (<div className='home-modpacks-thumbnail-overlay' />)}
                <img
                  className={`home-modpacks-thumbnail ${!installedMps.some(installed => installed.id === mps[i + 3].id) ? "not-installed" : ""}`}
                  draggable={false}
                  src={`https://t.minecraftmigos.me/uploads/thumbnails/${mps[i + 3].thumbnail}`}
                />
                </div>
              )}
      
              {!mps[i + 3] && <div className="home-modpacks-placeholder" />}
              {!mps[i + 2] && <div className="home-modpacks-placeholder" />}
              {!mps[i + 1] && <div className="home-modpacks-placeholder" />}
            </div>
          );
          rows.push(row);
        }
        return rows;
      } catch (err) {
        console.log(err);
      };
    };
            

  return (
    <div className='home'>
        <img className="home-settings" draggable={false} src={settings} onClick={() => toggleShowSettings()} /> 
        <p className='home-title'>CHOOSE A MODPACK:</p>
        <div className='home-modpacks'>
            {renderModpacks()}
        </div>
    </div>
  )
};

export default Home;