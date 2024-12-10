import React from 'react';
import '../styles/componentStyles/Release.scss';

const Release = ({ version }) => {
  return (
    <div className='release'>
      <div className='release-header'>
        <p className='release-header-version'> {version.name} </p>
        <p className='release-header-date'> {version.date} </p>
      </div>
        <div className='release-changelog' dangerouslySetInnerHTML={{__html: version.changelog }}/>
    </div>
  )
};

export default Release;