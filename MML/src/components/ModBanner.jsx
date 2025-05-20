import React from 'react';

const API = "https://t.minecraftmigos.me/uploads/";

const ModBanner = ({ thumbnail, name}) => {
  return (
    <div className='mod-banner'>
        <img className='mod-banner-thumbnail' src={`${API}/thumbnails/${thumbnail}`} draggable='false' alt='thumbnail'/>
        <p className='mod-banner-name'>{name}</p>
    </div>
  )
};

export default ModBanner;