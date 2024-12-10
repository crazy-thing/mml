import React, { useEffect, useState } from 'react';
import '../styles/containerStyles/Home.scss';
import { settings } from '../assets/exports';


const Home = ({ modpacks, toggleShowSettings, handleSelectModpack }) => {
    const { ipcRenderer } = window.require('electron');

    const [mps, setMps] = useState(modpacks);

    useEffect(() => {
        setMps(modpacks);
    }, [modpacks])

    const renderModpacks = () => {
      try {
        const rows = [];
        for (let i = 0; i < mps.length; i += 4) {
          const row = (
            <div className="home-modpacks-row" key={`row-${i}`}>
              {mps[i] && (
                <img
                  className="home-modpacks-thumbnail"
                  draggable={false}
                  src={`https://minecraftmigos.me/uploads/thumbnails/${mps[i].thumbnail}`}
                  onClick={() => handleSelectModpack(mps[i])}
                />
              )}
              {mps[i + 1] && (
                <img
                  className="home-modpacks-thumbnail"
                  draggable={false}
                  src={`https://minecraftmigos.me/uploads/thumbnails/${mps[i + 1].thumbnail}`}
                  onClick={() => handleSelectModpack(mps[i + 1])}
                />
              )}
              {mps[i + 2] && (
                <img
                  className="home-modpacks-thumbnail"
                  draggable={false}
                  src={`https://minecraftmigos.me/uploads/thumbnails/${mps[i + 2].thumbnail}`}
                  onClick={() => handleSelectModpack(mps[i + 2])}
                />
              )}
              {mps[i + 3] && (
                <img
                  className="home-modpacks-thumbnail"
                  draggable={false}
                  src={`https://minecraftmigos.me/uploads/thumbnails/${mps[i + 3].thumbnail}`}
                  onClick={() => handleSelectModpack(mps[i + 3])}
                />
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