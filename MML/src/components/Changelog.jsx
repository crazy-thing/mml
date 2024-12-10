import React, { useState } from 'react';
import '../styles/componentStyles/Changelog.scss';
import Release from './Release';

const Changelog = ({ versions }) => {
  const [showNewest, setShowNewest] = useState(true);

  const visibleVersions = versions.filter(version => version.visible === "true");
  const sortedVersions = showNewest ? [...visibleVersions].reverse() : visibleVersions;
  
  
  return (
    <div className='changelog'>
      <div className='changelog-sort-by'>
        <p className='changelog-sort-by-header'>SORT BY:</p>
        <span 
          className='changelog-sort-by-option' 
          onClick={() => setShowNewest(true)} 
          style={showNewest ? { background: "#a7a7a7dc" } : {}}
        >
          NEWEST
        </span>
        <span 
          className='changelog-sort-by-option' 
          onClick={() => setShowNewest(false)} 
          style={!showNewest ? { background: "#a7a7a7dc" } : {}}
        >
          OLDEST
        </span>
      </div>
      <div className='changelog-versions'>
        {sortedVersions.map((version, index) => (
          <Release key={index} version={version} />
        ))}
      </div>
    </div>
  );
};

export default Changelog;
