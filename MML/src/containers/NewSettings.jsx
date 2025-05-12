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

        getPlayerSkin();

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
                    <img className='settings-about-top-logo' draggable={false} src={mml} style={{ cursor: "pointer" }} onClick={() => openWebsite("https://minecraftmigos.netlify.app/")} />
                    <img className='settings-about-top-git' draggable={false} src={github} onClick={() => openWebsite("https://github.com/crazy-thing/the-mmm-launcher")} />
                </div>
                <p className='settings-about-version'> Minecraft Migos Launcher v2.0.6 </p>
            </div>
            */}
            <p className='settings-version' onClick={() => openWebsite("https://github.com/crazy-thing/mml")}> Minecraft Migos Launcher v2.0.11 </p>
            <input type='file' id='fileInput' style={{ display: 'none' }} onChange={(e) => changeSkin(e.target.files[0])} />
        </div>
    );
};

export default NewSettings;