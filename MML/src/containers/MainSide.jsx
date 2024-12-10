import React from 'react';
import ModBanner from '../components/ModBanner';

const MainSide = ({ modpack, profile, }) => {

    const [isInstalling, setIsInstalling] = useState(false);
    const [installedVersion, setInstalledVersion] = useState(null);
    const [installText, setInstallText] = useState('');
    const [progress, setProgress] = useState(100);
    const [buttonText, setButtonText] = useState('PLAY');

    const [gameRunning, setGameRunning] = useState(false);

    const [showLiteUpdate, setShowLiteUpdate] = useState(false);
    const [showUninstall, setShowUninstall] = useState(false);


    const getButton = () => {
        if (modpack.mainVersion.id === "null") {
            return (
              <Button
                onClick={() => console.log("Coming soon!")}
                text={"COMING SOON!"}
                style={comingSoonBtnStyle}
                textStyle={{ color: "#fff", fontSize: "3vh" }}
              />
            );
          }
        
          if (gameRunning) {
            return (
              <Button
                onClick={handleStopGame}
                text={"RUNNING"}
                style={stopBtnStyle}
                textStyle={{ color: "#fff", fontSize: "3vh" }}
                icon={close}
              />
            );
          }
        
          if (showUninstall) {
            return (
              <Button
                onClick={handleDeleteModpack}
                text={"UNINSTALL"}
                style={uninstallBtnStyle}
                textStyle={{ color: "#fff", fontSize: "3vh" }}
              />
            );
          }
        
          if (showLiteUpdate) {
            return (
              <Button
                onClick={() => handleInstallModpack(modpack)}
                text={update && oldInstall || installedVersion ? "UPDATE" : "INSTALL"}
                style={update && oldInstall || installedVersion ? blueBtnStyle : greenBtnStyle}
                textStyle={{ color: "#fff", fontSize: "3vh" }}
                handleProg={handleProg}
                progress={progress}
              />
            );
          }
        
          if (installedVersion) {
            return (
              <Button
                onClick={isInstalling ? () => console.log("already installing") : handleLaunch}
                text={isInstalling ? `${buttonText}%` : "PLAY"}
                style={isInstalling ? installBtnStyle : installedBtnStyle}
                textStyle={{ color: "#fff", fontSize: "3vh" }}
                handleProg={handleProg}
                progress={progress}
              />
            );
          }
        
          return (
            <Button
              onClick={isInstalling ? () => console.log('already installing') : () => handleInstallModpack(modpack)}
              text={isInstalling ? `${buttonText}%` : update ? "UPDATE" : "INSTALL"}
              style={update ? installedBtnStyle : installBtnStyle}
              textStyle={{ color: "#fff", fontSize: "3vh" }}
              handleProg={handleProg}
              progress={progress}
            />
          );
        };

    const installBtnStyle = {
        width: "14.25vw",
        height: "8.55vh",
        marginLeft: "0vh", // Scaled down by 5%,
        borderRadius: "5px",
        border: `2px solid ${update ? "#1383df" : "#49a749"}`,
        background: `${update ? "#1383df" : `linear-gradient(90deg, #49a749 ${progress}%, transparent ${progress}%)`}`,
        willChange: "background"
    };
        
    const installedBtnStyle = {
        width: "14.25vw",
        height: "8.55vh",
        marginLeft: "0vh", // Scaled down by 5%,
        borderRadius: update ? "5px" : "5px 0px 0px 5px",
        border: `2px solid ${update ? "#1383df" : "#49a749"}`,
        background: `${update ? "#1383df" : `linear-gradient(90deg, #49a749 ${progress}%, transparent ${progress}%)`}`,
        willChange: "background"
    };
        
    const uninstallBtnStyle = {
        width: "14.25vw",
        height: "8.55vh",
        marginLeft: "0vh", // Scaled down by 5%,
        borderRadius: "5px 0px 0px 5px",
        border: "2px solid #c40808",
        background: "#c40808",
    };
        
    const stopBtnStyle = {
        width: "14.25vw",
        height: "8.55vh",
        marginLeft: "0vh", // Scaled down by 5%,
        borderRadius: "5px",
        border: "2px solid #1383df",
        background: "#1383df",
    };
        
    const comingSoonBtnStyle = {
        width: "14.25vw",
        height: "8.55vh",
        marginLeft: "0vh", // Scaled down by 5%,
        borderRadius: "5px",
        border: "2px solid #898989",
        background: "#898989",
    };
    const greenBtnStyle = {
        width: "14.25vw",
        height: "8.55vh",
        marginLeft: "0vh", // Scaled down by 5%,
        borderRadius: "5px",
        border: `2px solid "#49a749"`,
        background: `linear-gradient(90deg, #49a749 ${progress}%, transparent ${progress}%)`,
        willChange: "background"
      }
    
      const blueBtnStyle = {
        width: "14.25vw",
        height: "8.55vh",
        marginLeft: "0vh", // Scaled down by 5%,
        borderRadius: "5px",
        border: `2px solid #1383df`,
        background: `#1383df`,
        willChange: "background"
      };

    return (
    <div className='main-side'>
        <div className='main-side-header'>
            <img className='main-side-header-home' src='home.png' alt='home'/>
            <p className='main-side-header-account'>{profile.name}</p>
        </div>
        <ModBanner thumbnail={modpack.thumbnail} name='Minecraft Mod Loader'/>
        
    </div>
  )
};

export default MainSide;