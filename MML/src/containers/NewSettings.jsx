import React, { useEffect, useState } from 'react';
import '../styles/containerStyles/Settings.scss';
import SettingsSlider from '../components/SettingsSlider';
import SettingsOption from '../components/SettingsOption';
import { backIcon, close, github, globe, house, mml } from '.././assets/exports';

const { ipcRenderer } = window.require('electron');

const NewSettings = ({ toggleShowHome, profile, handleSignOut, handleSignIn }) => {
    const [selectedSettings, setSelectedSettings] = useState('');

    const openWebsite = (url) => {
        ipcRenderer.send("open-website", url);
    };

    useEffect(() => {

        fetchSettings();
    
        ipcRenderer.on('settings', (event, result) => {
            setSelectedSettings(result);
            console.log(result);
        });
    
        return () => {
            ipcRenderer.removeAllListeners('settings');
        };

    }, []);

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


    return (
        <div className='settings'>
            <p className='settings-title'>SETTINGS</p>
            <img src={house} className='settings-home' draggable={false} onClick={() => toggleShowHome()} / >

            <div className='settings-body'>

                <div className='settings-body-left'>
                {profile != null && (
                    <>
                        <img src={profile && profile.ProfilePicture} className='settings-profile-picture' draggable={false} />
                        <p className='settings-profile-name'>{profile && profile.GamerTag}</p>
                    </>
                )}
                    <div className={`settings-body-button ${profile != null ? "signOut" : "signIn"}`}onClick={profile != null ? () => handleSignOut() : () => handleSignIn()}>
                        <p className='settings-body-button-text'>{profile != null ? "SIGN OUT" : "SIGN IN"}</p>
                    </div>
                </div>

                <div className='settings-body-right'>
                    <p className='settings-setting-header-text'>Allocated Memory for Minecraft Instances</p>
                    <div className='settings-body-ram-text-container'>
                        <p className='settings-body-ram-text star'>*</p>
                        <p className='settings-body-ram-text text'>Should be set to HALF of what<br></br> your total RAM is. </p>
                    </div>
                    <SettingsSlider handleChangeSetting={handleChangeSetting} ramValue={selectedSettings && selectedSettings.MaxMem} />
                </div>
            </div>




            <div className='settings-about'>
                <div className='settings-about-top'>

                <img className='settings-about-top-logo' draggable={false} src={mml} style={{cursor: "pointer"}} onClick={() => openWebsite("https://minecraftmigos.netlify.app/")}/>
                <img className='settings-about-top-git ' draggable={false} src={github} onClick={() => openWebsite("https://github.com/crazy-thing/the-mmm-launcher") } />

                </div>
                    <p className='settings-about-version'> Minecraft Migos Launcher v2.0.6 </p>
            </div>
         </div>
    );
};

export default NewSettings;