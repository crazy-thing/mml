import NewHome from './NewHome'
import '../styles/containerStyles/Main.scss'
import { useEffect, useState } from 'react';
import { dots, folderIcon, trashIcon } from '../assets/exports';
import Changelog from '../components/Changelog';

const Main = ({mp, fetchData, selectedModpackId, style }) => {

    const { ipcRenderer } = window.require('electron');

    const [installedVersion, setInstalledVersion] = useState(null);

    const [update, setUpdate] = useState(false);

    const [isInstalling, setIsInstalling] = useState(false);
    const [buttonText, setButtonText] = useState("0");
    const [installText, setInstallText] = useState("");
    const [progress, setProgress] = useState(100);
    const [gameRunning, setGameRunning] = useState(false);
    const [verInstalling, setVerInstalling] = useState(null);

    const [showUninstall, setShowUninstall] = useState(false);
    const [showStopGame, setShowStopGame] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showMain, setShowMain] = useState(false);


    useEffect(() => {
        setShowUninstall(false);
        setUpdate(false);
        setShowOptions(false);
        setInstalledVersion(null);
        const lastInstalledVersion = JSON.parse(localStorage.getItem(`lastInstalledVersion${mp && mp.id}`));

    
        if (lastInstalledVersion && mp && mp.mainVersion.id === lastInstalledVersion.id) {
          setInstalledVersion(lastInstalledVersion);
        } else {
          if (lastInstalledVersion != null) {
            if (mp.mainVersion.id === "null") {
              setUpdate(false);
            } else {
              setUpdate(true);
            }
          }
        }
    
        //setIsMainRendered(true);
        if (mp && mp.id === selectedModpackId) {
            setShowMain(true);
        } else {
            setShowMain(false);
        }
        console.log("Selected Modpack: ", mp);
      }, [mp]);

    const comingSoonStyle = {
        background: "#818181"
    }

    const updateStyle = {
        background: "#1383df"
    }

    const runningStyle = {
        background: "#45627a",
    }

    const defaultStyle = {
        background: `${`linear-gradient(90deg, #49a749 ${progress}%, #686868 ${progress}%)`}`
    }

    const handleProg = (prog, progText) => {
        if (prog != null) {
        setButtonText(prog);
        setProgress(prog);
        setInstallText(progText);
        }
    };

    const toggleUninstall = () => {
        setShowUninstall(!showUninstall);
    };

    const handleInstallModpack = (modpack) => {
        setUpdate(false);
        setIsInstalling(true);
        setVerInstalling(modpack.mainVersion);
        ipcRenderer.send('download-modpack', JSON.stringify(modpack));
    };

    const handleLaunch = () => {
        if (installedVersion) {
        ipcRenderer.send("launch-game", mp.id);
        setIsInstalling(true);
        }
    };

    const handleStopGame = () => {
        ipcRenderer.send("exit-game", mp.id);
        setShowStopGame(false);
    };

    useEffect(() => {
            ipcRenderer.on('install-complete', (event, modpackId) => {
              modpackId = modpackId.toString().trim();
              const currentModpackId = mp.id.toString().trim(); 
              console.log(`Received modpackId: [${modpackId}]`);
              console.log(`Current modpack.id: [${currentModpackId}]`);
              fetchData();
          
              if (modpackId === currentModpackId) {
                  localStorage.setItem(`lastInstalledVersion${mp && mp.id}`, JSON.stringify(mp.mainVersion));
                  setInstalledVersion(mp.mainVersion);
                  setIsInstalling(false);
                  setVerInstalling(null);
                  setProgress(100);
              }
          });
      
      
          ipcRenderer.on('game-launched', (event, modpackId) => {
            console.log("Game Launched" + modpackId + " " + mp.id);
            modpackId = modpackId.toString().trim();
            if (modpackId === mp.id) {
              setIsInstalling(false);
              setGameRunning(true);
              setProgress(100);
            }
          });
    
          ipcRenderer.on('error-launching', (event, modpackId) => {
            modpackId = modpackId.toString().trim();
            if (modpackId === mp.id) {
              setIsInstalling(false);
              setGameRunning(false);
              setButtonText("PLAY");
              setProgress(100);
    
            }
          });
      
          ipcRenderer.on('game-closed', (event, modpackId) => {
            if (modpackId === mp.id) {
              setGameRunning(false);
              setProgress(100);
            }
          });
      
          ipcRenderer.on('uninstall-complete', (event, modpackId) => {
            if (modpackId === mp.id) {
              setInstalledVersion(null);
              setVerInstalling(null);
              setShowUninstall(false);
              setUpdate(false);
              fetchData();
              localStorage.removeItem(`lastInstalledVersion${mp && mp.id}`);
            }
          });
      
          ipcRenderer.on('update-progress', (event, prog, id, progText) => {
            if (id === mp.id) {
              handleProg(prog, progText);
            }
          });

      
          return () => {
            ipcRenderer.removeAllListeners('install-complete');
            ipcRenderer.removeAllListeners('game-launched');
            ipcRenderer.removeAllListeners('update-progress');
            ipcRenderer.removeAllListeners('uninstall-complete');
            ipcRenderer.removeAllListeners('game-closed');
            ipcRenderer.removeAllListeners('error-launching');
          };
    
      }, [mp]);

  return (
    
    <div className='main' style={style}>

        {mp && (
            <div className='main__modpack'>
                {mp && mp.background && (
                    <div className='main__modpack__background'>
                        <img
                            className='main__modpack__background__image'
                            src={`https://minecraftmigos.me/uploads/backgrounds/${mp.background}`}
                        />
                    </div>
                )}
                <div className='main__modpack__left'>
                    <div className='main__modpack__name-wrapper'>
                        <span className='main__modpack__name'>{mp.name}</span>
                    </div>
                    <div className='main__modpack__button-wrapper' style={{height: showOptions ? "20vh" : "15vh"}}>
                        <div
                            className={`main__modpack__button ${showStopGame ? "stop" : gameRunning ? "running" : ""}`}
                            style={(mp.mainVersion && mp.mainVersion.zip === "null") || (mp.versions && mp.versions.length === 0) ? comingSoonStyle : update && installedVersion ? updateStyle : gameRunning ? runningStyle : showUninstall ? comingSoonStyle : defaultStyle}
                            onClick={
                                gameRunning ?  () => setShowStopGame(true)
                                : isInstalling ? console.log("please wait for installation to finish")
                                : (mp.mainVersion && mp.mainVersion.zip === "null") || (mp.versions && mp.versions.length === 0) ? console.log("coming soon!")
                                : update ? () => handleInstallModpack(mp)
                                : installedVersion ? () => handleLaunch()
                                : () => handleInstallModpack(mp)}
                            >
                            <span className='main__modpack__button-text'>{isInstalling ? `${buttonText}%` : (mp.mainVersion && mp.mainVersion.zip === "null") || (mp.versions && mp.versions.length === 0) ? "COMING SOON" : update && installedVersion ? "UPDATE" : gameRunning ? "RUNNING" : showUninstall ? "WAITING..." : installedVersion ? "PLAY" : "INSTALL"}</span >
                            {isInstalling && (<span className='main__modpack__button-text-install'>{installText}</span> )}
                        </div>
                        <div className={`main__modpack__button-options ${showOptions ? "show" : ""}`}>
                            <span className='main__modpack__button-options-icon folder'><img src={folderIcon} className='main__modpack__button-options-img' onClick={() => {ipcRenderer.send('open-folder', mp.id);}} /></span>
                            <span className='main__modpack__button-options-icon trash'><img src={trashIcon} className='main__modpack__button-options-img' onClick={toggleUninstall} /></span>
                        </div>
                        {installedVersion && (<span className='main__modpack__button-dots-wrapper' onClick={() => setShowOptions(prev => !prev)}><img className='main__modpack__button-dots' src={dots} /></span>)}
                    </div>
                </div>
                <div className='main__modpack__right'>
                  {showStopGame ? (
                      <div className='main__stop'>
                        <div className='main__stop__overlay' onClick={() => setShowStopGame(false)} />
                          <p className='main__stop__text'>ARE YOU SURE YOU WANT TO CLOSE THIS INSTANCE?</p>
                          <div className='main__stop__buttons'>
                            <button className='main__stop__buttons-button yes' onClick={() => handleStopGame()}>YES</button>
                            <button className='main__stop__buttons-button no' onClick={() => setShowStopGame(false)}>NO</button>
                        </div>
                      </div>
                  ) : (
                  showUninstall ? (
                    <div className='main__uninstall'>
                    <div className='main__uninstall__overlay' onClick={toggleUninstall} />
                      <p className='main__uninstall__text'>ARE YOU SURE YOU WANT TO UNINSTALL THIS MODPACK?</p>
                      <div className='main__uninstall__buttons'>
                        <button className='main__uninstall__buttons-button yes' onClick={() => {ipcRenderer.send('delete-modpack', mp.id); setShowUninstall(false); localStorage.removeItem(`lastInstalledVersion${mp && mp.id}`);}}>YES</button>
                        <button className='main__uninstall__buttons-button no' onClick={toggleUninstall}>NO</button>
                      </div>
                    </div>
                  ) : (
                    <Changelog versions={mp && mp.versions} />
                  )
                  )}
                </div>
            </div>
        )}






    </div>
  )
}

export default Main