import React, { useEffect, useState } from 'react';
import '../styles/componentStyles/LauncherChangelog.scss';

const LauncherChangelog = ({ ver }) => {

    const [launcherChangelog, setLauncherChangelog] = useState('');

  const getLauncherChangelog = async () => {
    const url = `https://api.github.com/repos/crazy-thing/mml/releases/tags/${ver}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("Changelog: ", data.body);
      setLauncherChangelog(data.body);  
      return data.body;
    } catch (error) {
      console.error(`An error occurred fetching data ${error}`);
    }
  };


  useEffect(() => {

    getLauncherChangelog();

  }, [ver]);

  return (
    <div className='launcher-changelog' onClick={(e) => e.stopPropagation()}>
      <p className='launcher-changelog-header'>Changelog:</p>
      <p className='launcher-changelog-version'> v{ver && ver}</p>
      <div className='launcher-changelog-body'>
        {launcherChangelog && launcherChangelog.split('\n').map((line, index) => (
          line.startsWith('-') ? (
            <li key={index} className='launcher-changelog-line'>{line.substring(1).trim()}</li>
          ) : (
            <p key={index} className='launcher-changelog-line'>{line}</p>
          )
        ))}
      </div>
    </div>
  );
};

export default LauncherChangelog;
