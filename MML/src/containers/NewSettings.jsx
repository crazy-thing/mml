import React, { useEffect, useState } from 'react';
import '../styles/containerStyles/Settings.scss';
import SettingsSlider from '../components/SettingsSlider';
import SettingsOption from '../components/SettingsOption';
import { backIcon, close, github, globe, house, mml } from '.././assets/exports';

const { ipcRenderer } = window.require('electron');

const NewSettings = ({ toggleShowHome, profile, handleSignOut, handleSignIn }) => {
    const [selectedSettings, setSelectedSettings] = useState('');
    const [profileSkinUrl, setProfileSkinUrl] = useState('');
    const [profileSkin, setProfileSkin] = useState('');
    const [profileVariant, setProfileVariant] = useState('');
    const [activeProfileVariant, setActiveProfileVariant] = useState('');

    const openWebsite = (url) => {
        ipcRenderer.send("open-website", url);
    };

    const getPlayerSkin = async () => {
        try {
        const url = 'https://api.minecraftservices.com/minecraft/profile/';
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Authorization': `Bearer ${profile && profile.MSession && profile.MSession.AccessToken}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            console.log(result);
            const activeSkin = result.skins.find(skin => skin.state === "ACTIVE");

            if (activeSkin) {
                const skin = activeSkin.textureKey;
                const variant = activeSkin.variant;
                setProfileSkin(skin);
                setProfileVariant(variant);
                setActiveProfileVariant(variant);
                console.log(activeSkin);
            } else {
                console.log("No active skin found");
            }
        } else {
            console.log("Error getting skin");
        }
        }
        catch (error) {
            console.log("Error getting skin", error);
        }

    };

    const handleSetProfileVariant = (variant) => {
        setProfileVariant(variant);
        localStorage.setItem('profileVariant', variant);
    };

    useEffect(() => {
        fetchSettings();

        const vari = localStorage.getItem('profileVariant');
        if (vari) {
            setProfileVariant(vari);
        } else {
            console.log("No variant found");
        }

        ipcRenderer.on('settings', (event, result) => {
            setSelectedSettings(result);
            console.log(result);
        });

        try {
        //getPlayerSkin();    
        } catch (error) {
            console.log("Error getting skin", error);
        }
        

        return () => {
            ipcRenderer.removeAllListeners('settings');
        };

    }, [profile]);

    const fetchSettings = async () => {
        ipcRenderer.send("get-settings");
    };

    const handleChangeSetting = (settingName, value) => {
        console.log(`Changing ${settingName} to ${value}`);
    
        let args = [];

        if (settingName === "MaxMem") {
            args.push("MaxMem", value);
            ipcRenderer.send('change-setting', args);
        }
    };
    
    const changeSkin = async (file) => {
        const url = 'https://api.minecraftservices.com/minecraft/profile/skins';

        const formData = new FormData();
        formData.append('variant', profileVariant && profileVariant);
        formData.append('file', file);
        setActiveProfileVariant(profileVariant);
      
        const response = await fetch(url, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Authorization': `Bearer ${profile && profile.MSession && profile.MSession.AccessToken}`
          },
          body: formData
        });

        if (response.ok) {
            console.log("Skin changed", response);  
            await getPlayerSkin();
        } else {
            console.log("Error changing skin");
        }
    };


    return (
        <div className='settings'>
            <div className='settings__top'>
                <svg width="50vh" height="9.4vh" viewBox="0 0 132 21" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <clipPath id="clip-shape">
                    <path d="M125.10196425045291,0L6.25339,0C6.25339,3.44086 3.47078,6.25339 0,6.25339L0,13.998192970225134C3.44086,13.998192970225134 6.25339,16.780792970225136 6.25339,20.251592970225133L125.10196425045291,20.251592970225133C125.10196425045291,16.810692970225134 127.88456425045291,13.998192970225134 131.3553642504529,13.998192970225134L131.3553642504529,6.25339C127.91446425045291,6.25339 125.10196425045291,3.47078 125.10196425045291,0Z" />
                  </clipPath>
                </defs>

                <path
                  d="M125.10196425045291,0L6.25339,0C6.25339,3.44086 3.47078,6.25339 0,6.25339L0,13.998192970225134C3.44086,13.998192970225134 6.25339,16.780792970225136 6.25339,20.251592970225133L125.10196425045291,20.251592970225133C125.10196425045291,16.810692970225134 127.88456425045291,13.998192970225134 131.3553642504529,13.998192970225134L131.3553642504529,6.25339C127.91446425045291,6.25339 125.10196425045291,3.47078 125.10196425045291,0Z"
                  stroke="#868686"
                  strokeWidth="2"
                  fill="#1a1a1a"
                  clipPath="url(#clip-shape)"
                />

                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
                  fill="#ffffff" fontSize={"1.5vh"} fontFamily="var(--font-family)">
                  SETTINGS
                </text>
              </svg>
            </div>

            <p className='settings-title'>SETTINGS</p>
            <img src={house} className='settings-home' draggable={false} onClick={() => toggleShowHome()} />

            <div className='settings-body'>
                <div className='settings-body-left'>
                {profile === null && (
                    <div className={`settings-body-button signIn`} onClick={() => handleSignIn()}>
                            <p className='settings-body-button-text'>{"SIGN IN"}</p>
                    </div>
                )}

                <div className='settings-body-left-main'>
                {profile != null && (
                    <>
                        <p className='settings-profile-name'>{profile && profile.GamerTag}</p>
                         <img src={`https://vzge.me/full/256/${profileSkin && profileSkin}?${activeProfileVariant && activeProfileVariant}`} className='settings-profile-skin' draggable={false} />

                    <span className={`settings-body-button skin`} onClick={() => document.getElementById('fileInput').click()}>
                        CHANGE SKIN
                    </span>
                    </>
                )}
                {profile != null && (
                    <div className={`settings-body-button signOut`} onClick={() => handleSignOut()}>
                        <p className='settings-body-button-text'>SIGN OUT</p>
                    </div>
                )}

                </div>
                {profile != null && (
                <div className='settings-body-left-variants'>
                        <div className='circle-toggle'>
                            <div className='circle-toggle-container'>
                                <span className={`circle-option`} onClick={() => handleSetProfileVariant('classic')}> <span className={`circle-option-selected ${profileVariant === 'CLASSIC' || profileVariant === "classic" ? 'active' : ''}`} /> </span>
                                <p className='circle-option-text'>WIDE</p>
                            </div>
                            <div className='circle-toggle-container'>
                                <span className={`circle-option`} onClick={() => handleSetProfileVariant('slim')} > <span className={`circle-option-selected ${profileVariant === 'slim' || profileVariant === "SLIM" ? 'active' : ''}`} /> </span>
                                <p className='circle-option-text'>SLIM</p>
                            </div>
                        </div>
                </div>
                )}
                </div>

                <div className='settings-body-right'>
                    <p className='settings-setting-header-text'>Allocated Memory for Minecraft Instances</p>
                    <div className='settings-body-ram-text-container'>
                        <p className='settings-body-ram-text star'>*</p>
                        <p className='settings-body-ram-text text'>Should be set to HALF of what your total RAM is. </p>
                    </div>
                    <SettingsSlider handleChangeSetting={handleChangeSetting} ramValue={selectedSettings && selectedSettings.MaxMem} />
                </div>
            </div>
            
            {/* 
            <div className='settings-about'>
                <div className='settings-about-top'>
                    <img className='settings-about-top-logo' draggable={false} src={mml} style={{ cursor: "pointer" }} onClick={() => openWebsite("https://t.minecraftmigos.me.netlify.app/")} />
                    <img className='settings-about-top-git' draggable={false} src={github} onClick={() => openWebsite("https://github.com/crazy-thing/the-mmm-launcher")} />
                </div>
                <p className='settings-about-version'> Minecraft Migos Launcher v2.0.6 </p>
            </div>
            */}
            <p className='settings-version' onClick={() => openWebsite("https://github.com/crazy-thing/mml")}> Minecraft Migos Launcher v3.0.0-dev </p>
            <input type='file' id='fileInput' style={{ display: 'none' }} onChange={(e) => changeSkin(e.target.files[0])} />
        </div>
    );
};

export default NewSettings;