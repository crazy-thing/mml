import NewHome from './NewHome'
import '../styles/containerStyles/Main.scss'
import { useEffect, useState } from 'react';
import { dots, folderIcon, trashIcon } from '../assets/exports';

const Main = ({selectedModpack, fetchData }) => {

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


    useEffect(() => {
        setShowUninstall(false);
        setUpdate(false);
        setShowOptions(false);
        setInstalledVersion(null);
        const lastInstalledVersion = JSON.parse(localStorage.getItem(`lastInstalledVersion${selectedModpack && selectedModpack.id}`));

    
        if (lastInstalledVersion && selectedModpack && selectedModpack.mainVersion.id === lastInstalledVersion.id) {
          setInstalledVersion(lastInstalledVersion);
        } else {
          if (lastInstalledVersion != null) {
            if (selectedModpack.mainVersion.id === "null") {
              setUpdate(false);
            } else {
              setUpdate(true);
            }
          }
        }
    
        //setIsMainRendered(true);
    
      }, [selectedModpack]);

    const comingSoonStyle = {
        background: "#818181"
    }

    const updateStyle = {
        background: "#1383df"
    }

    const runningStyle = {
        background: "#45627a"
    }

    const defaultStyle = {
        background: `${`linear-gradient(90deg, #49a749 ${progress}%, #1e1e1e ${progress}%)`}`
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
        ipcRenderer.send("launch-game", selectedModpack.id);
        setIsInstalling(true);
        }
    };

    const handleStopGame = () => {
        ipcRenderer.send("exit-game", selectedModpack.id);
    };

    useEffect(() => {
            ipcRenderer.on('install-complete', (event, modpackId) => {
              modpackId = modpackId.toString().trim();
              const currentModpackId = selectedModpack.id.toString().trim(); 
              console.log(`Received modpackId: [${modpackId}]`);
              console.log(`Current modpack.id: [${currentModpackId}]`);
              fetchData();
          
              if (modpackId === currentModpackId) {
                  localStorage.setItem(`lastInstalledVersion${selectedModpack && selectedModpack.id}`, JSON.stringify(selectedModpack.mainVersion));
                  setInstalledVersion(selectedModpack.mainVersion);
                  setIsInstalling(false);
                  setVerInstalling(null);
                  setProgress(100);
              }
          });
      
      
          ipcRenderer.on('game-launched', (event, modpackId) => {
            console.log("Game Launched" + modpackId + " " + selectedModpack.id);
            modpackId = modpackId.toString().trim();
            if (modpackId === selectedModpack.id) {
              setIsInstalling(false);
              setGameRunning(true);
              setProgress(100);
            }
          });
    
          ipcRenderer.on('error-launching', (event, modpackId) => {
            modpackId = modpackId.toString().trim();
            if (modpackId === selectedModpack.id) {
              setIsInstalling(false);
              setGameRunning(false);
              setButtonText("PLAY");
              setProgress(100);
    
            }
          });
      
          ipcRenderer.on('game-closed', (event, modpackId) => {
            if (modpackId === selectedModpack.id) {
              setGameRunning(false);
              setProgress(100);
            }
          });
      
          ipcRenderer.on('uninstall-complete', (event, modpackId) => {
            if (modpackId === selectedModpack.id) {
              setInstalledVersion(null);
              setVerInstalling(null);
              setShowUninstall(false);
              setUpdate(false);
              fetchData();
            }
          });
      
          ipcRenderer.on('update-progress', (event, prog, id, progText) => {
            if (id === selectedModpack.id) {
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
        
    
      }, [selectedModpack]);

  return (
    <div className='main'>

        {selectedModpack ? (
            <div className='main__modpack'>
                {selectedModpack && selectedModpack.background && (
                    <div className='main__modpack__background'>
                        <img
                            className='main__modpack__background__image'
                            src={`https://minecraftmigos.me/uploads/backgrounds/${selectedModpack.background}`}
                        />
                    </div>
                )}
                <div className='main__modpack__left'>
                    <div className='main__modpack__name-wrapper'>
                        <span className='main__modpack__name'>{selectedModpack.name}</span>
                    </div>
                    <div className='main__modpack__button-wrapper' style={{height: showOptions ? "20vh" : "15vh"}}>
                        <div
                            className={`main__modpack__button`}
                            style={(selectedModpack.mainVersion && selectedModpack.mainVersion.zip === "null") || (selectedModpack.versions && selectedModpack.versions.length === 0) ? comingSoonStyle : update && installedVersion ? updateStyle : gameRunning ? runningStyle : defaultStyle}
                            onClick={
                                gameRunning ?  () => setShowStopGame(true)
                                : isInstalling ? console.log("please wait for installation to finish")
                                : (selectedModpack.mainVersion && selectedModpack.mainVersion.zip === "null") || (selectedModpack.versions && selectedModpack.versions.length === 0) ? console.log("coming soon!")
                                : update ? () => handleInstallModpack(selectedModpack)
                                : installedVersion ? () => handleLaunch()
                                : () => handleInstallModpack(selectedModpack)}
                            >
                            <span className='main__modpack__button-text'>{isInstalling ? `${buttonText}%` : (selectedModpack.mainVersion && selectedModpack.mainVersion.zip === "null") || (selectedModpack.versions && selectedModpack.versions.length === 0) ? "COMING SOON" : update && installedVersion ? "UPDATE" : gameRunning ? "RUNNING" : installedVersion ? "PLAY" : "INSTALL"}</span >
                            {isInstalling && (<span className='main__modpack__button-text-install'>{installText}</span> )}
                        </div>
                        <div className={`main__modpack__button-options ${showOptions ? "show" : ""}`}>
                            <span className='main__modpack__button-options-icon folder'><img src={folderIcon} className='main__modpack__button-options-img' onClick={() => {ipcRenderer.send('open-folder', selectedModpack.id);}} /></span>
                            <span className='main__modpack__button-options-icon trash'><img src={trashIcon} className='main__modpack__button-options-img' onClick={toggleUninstall} /></span>
                        </div>
                        {installedVersion && (<span className='main__modpack__button-dots-wrapper' onClick={() => setShowOptions(prev => !prev)}><img className='main__modpack__button-dots' src={dots} /></span>)}
                    </div>
                </div>


            </div>
        ) : (
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
                SELECT A MODPACK
            </text>
        </svg>

        )}




    </div>
  )
}

export default Main