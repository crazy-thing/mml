import React, { useEffect, useState } from 'react';
import '../styles/containerStyles/SidePanel.scss';
import { settingIcon } from '../assets/exports';
import Button from '../components/Button';
import Modpacks from '../components/Modpacks';
import cobbleBg from "../assets/cobble.png";

const SidePanel = ({ pos, changeSettingPos, handleSelectModpack, modpacks, setIsLoading }) => {
    const { ipcRenderer } = window.require('electron');

    const [ profile, setProfile ] = useState(null);

    const getDefaultAccount = () => {
        ipcRenderer.send('sign-in');
      };
    
    const handleSignIn = async () => {
    ipcRenderer.send('sign-in');
    };

    const handleSignOut = async (gamerTag) => {
    ipcRenderer.send('sign-out', gamerTag);
    setProfile(null);
    };

    useEffect(() => {

        getDefaultAccount();

        ipcRenderer.on('sign-in-reply', (event, result) => {
          console.log(result);
          setProfile(result);
          if (result.ProfilePicture != null) {
            console.log("profile pic", result.ProfilePicture);
            setIsLoading(false);
          }
        });
      
        ipcRenderer.on('default-account-reply', (event, result) => {
          console.log(result);
          setProfile(result);
        });
    
        return () => {
          ipcRenderer.removeAllListeners('sign-in-reply');
          ipcRenderer.removeAllListeners('default-account-reply');
        };

      }, []);

  return (
    <div className='side-panel' style={{right: pos, backgroundImage: `url(${cobbleBg})`}} >

      <img className='side-panel-setting' src={settingIcon} onClick={() => changeSettingPos("0")} draggable={false} />

      <div className='side-panel-content'>

        <div className='side-panel-content-profile-picture'>
          {profile && (
          <img className='side-panel-content-profile-picture-img' src={profile.ProfilePicture} alt='Profile Picture' draggable={false} />
          )}
        </div>
        {profile ? (
          <>
          <div className='side-panel-content-profile-name'>
            <p className='side-panel-content-profile-name-text'> {profile ? profile.GamerTag : ''} </p>
          </div>

          <Button
            onClick={profile ? () => handleSignOut(profile.GamerTag) : () => handleSignIn()}
            text={profile ? "Sign Out" : "Sign In"}
            style={{ width: "11.57vh", height: "4.41vh", background: "var(--primary-background)", borderRadius: "0.4vw"}}
            textStyle={{ fontSize: "2vh", color: "#d94537", fontFamily: "var(--font-family-primary"}}/>
          </>
        ) : (
          <Button
            onClick={profile ? () => handleSignOut(profile.GamerTag) : () => handleSignIn()}
            text={profile ? "Sign Out" : "Sign In"}
            style={{ width: "11.57vh", height: "4.41vh", background: "var(--primary-background)", borderRadius: "0.4vw" }}
            textStyle={{ fontSize: "15px", color: "#fff", fontFamily: "var(--font-family-primary"}}/>
        )}

      </div>

      <Modpacks handleSelectModpack={handleSelectModpack} modpacks={modpacks} />

    </div>
  )
};

export default SidePanel;