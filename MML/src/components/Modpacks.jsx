import React, { useState } from 'react';
import '../styles/componentStyles/Modpacks.scss';

const Modpacks = ({ modpacks, handleSelectModpack }) => {
    const thumbnailsUrl = 'https://minecraftmigos.me/uploads/thumbnails/';
    const [activeIndex, setActiveIndex] = useState(null);

    const renderModpacks = () => {
      const rows = [];
      for (let i = 0; i < modpacks.length; i += 2) {
          const row = (
              <div className="modpacks-row" key={`row-${i}`}>
                  <div className='modpacks-modpack' onClick={() => setActiveIndex(i)}>
                      {modpacks[i] && (
                          <img draggable={false} className={`modpacks-modpack-thumbnail ${activeIndex === i ? "active" : " "}`} src={`${thumbnailsUrl}${modpacks[i].thumbnail}`}
                               onClick={() => handleSelectModpack(modpacks[i])} />
                      )}
                  </div>
                  <div className='modpacks-modpack' onClick={() => setActiveIndex(i + 1)}>
                      {modpacks[i + 1] && (
                          <img draggable={false} className={`modpacks-modpack-thumbnail ${activeIndex === i + 1 ? "active" : " "}`} src={`${thumbnailsUrl}${modpacks[i + 1].thumbnail}`} onClick={() => handleSelectModpack(modpacks[i + 1])} />
                      )}
                  </div>
              </div>
          );
          rows.push(row);
      }
      return rows;
  };

    return (
        <div className='modpacks'>
            {modpacks.length > 0 ? (
                <>
                    {renderModpacks()}
                </>
            ) : (
                <p className='modpacks-none'> No modpacks available </p>
            )}
        </div>
    );
};

export default Modpacks;