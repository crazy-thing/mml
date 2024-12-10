import React, { useEffect, useState } from 'react';
import '../styles/containerStyles/MainPanel.scss';
import Button from '../components/Button';
import ConfirmDelete from '../components/ConfirmDelete';
import Changelog from '../components/Changelog';
import Screenshots from '../components/Screenshots';
import { close, dots, folderIcon, house } from '../assets/exports';
import PreloadImages from '../components/PreloadImages';
import ScreenshotViewer from '../components/ScreenshotViewer';
import Switch from '../components/Switch';

const MainPanel = ({ modpack, profile, handleSetNoChange, animationClass, handleAnimationEnd, handleInAnimationEnd, showScroll, style, selectedModpackId, setIsMainRendered }) => {

  const { ipcRenderer } = window.require('electron');
  const API = "https://minecraftmigos.me/uploads/thumbnails/";


  const [isInstalling, setIsInstalling] = useState(false);
  const [buttonText, setButtonText] = useState('PLAY');
  const [installText, setInstallText] = useState('');
  const [progress, setProgress] = useState(100);

  const [verInstalling, setVerInstalling] = useState(null);
  const [installedVersion, setInstalledVersion] = useState(null);
  const [oldInstall, setOldInstall] = useState(false);

  const [update, setUpdate] = useState(false);
  const [switchActive, setSwitchActive] = useState(false);
  const [showLiteUpdate, setShowLiteUpdate] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [nextItem, setNextItem] = useState("screenshots");

  const [showDel, setShowDel] = useState(false);
  const [showUninstall, setShowUninstall] = useState(false);
  const [showScrollView, setShowScrollView] = useState(false);
  const [showScrollViewAni, setShowScrollViewAni] = useState(false);

  const [isOverflowing, setIsOverflowing] = useState(false);

  const [index, setIndex] = useState(null);

  const [itemClass, setItemClass] = useState(null);

  const [renderContent, setRenderContent] = useState(true);
  const [gameRunning, setGameRunning] = useState(false);

  const selected = selectedModpackId === modpack.id;

  const openViewer = (index) => {
    setIndex(index);
  };

  const closeViewer = () => {
    setIndex(null);
  };

  const nextScreenshot = (e) => {
    e.stopPropagation();
    setIndex((prevIndex) => (prevIndex + 1) % modpack.screenshots.length);
  };

  const prevScreenshot = (e) => {
    e.stopPropagation();
    setIndex((prevIndex) => (prevIndex - 1 + modpack.screenshots.length) % modpack.screenshots.length);
  };

  const noVersionError = () => {
    ipcRenderer.send('show-error', "Please select a version before launching!");
  };

  const handleOpenFolder = () => {
    ipcRenderer.send('open-folder', modpack.id);
  };

  const handleProg = (prog, progText) => {
    if (prog != null) {
      setButtonText(prog);
      setProgress(prog);
      setInstallText(progText);
    }
  };

  const handleItemAnimationEnd = () => {
    const mainPanel = document.querySelector('.main-panel-rendered-item');
    if (mainPanel && selectedItem) {
      setItemClass(nextItem === "changelog" ? 'item-in-right' : 'item-in-left');
      setSelectedItem(nextItem);
    }
  };

  const handleInItemAnimationEnd = () => {
    const mainPanel = document.querySelector('.main-panel-rendered-item');
    if (mainPanel) {
      mainPanel.classList.remove('item-in-right', 'item-in-left');
      setItemClass('');
    }
  };

  const handleChangeItem = (item) => {
    if (selectedItem === item) return;

    if (item === "changelog") {
      setItemClass('item-out-left');
    } else if (item === "screenshots") {
      setItemClass('item-out-right');
    }
    setNextItem(item);
  };

  const handleOverflowCheck = () => {
    const checkElements = () => {
      const nameElement = document.querySelector('.main-panel-content-top-right-name');
      const parentElement = nameElement?.parentElement;
      if (nameElement && parentElement) {
        const nameRect = nameElement.getBoundingClientRect();
        const parentRect = parentElement.getBoundingClientRect();
        if (nameRect.width === parentRect.width) {
          setIsOverflowing(true);
        } else {
          setIsOverflowing(false);
        }
      } else {
        setTimeout(checkElements, 1);
      }
    };
    checkElements();
  };

  const handleInstallModpack = (modpack, lite = false) => {
    setUpdate(false);
    setOldInstall(false);
    setShowLiteUpdate(false);
    setIsInstalling(true);
    setVerInstalling(modpack.mainVersion);
    handleSetNoChange(true);

    console.log(`Switch active is: ${switchActive}`);
    console.log(`Lite is: ${lite}`);

    if (lite === true || switchActive === true) {
        console.log('Sending download-lite-modpack event');
        ipcRenderer.send('download-lite-modpack', JSON.stringify(modpack));
        if (showLiteUpdate) {
          localStorage.setItem(`isActivated-${modpack.id}`, switchActive);
        }
    } else {
        console.log('Sending download-modpack event');
        ipcRenderer.send('download-modpack', JSON.stringify(modpack));
        if (showLiteUpdate) {
          localStorage.setItem(`isActivated-${modpack.id}`, switchActive);
        } 
      }
    handleChangeItem("changelog");
};

  const handleDeleteModpack = (e) => {
    e.stopPropagation();
    setShowDel(true);
  };

  const toggleUninstall = (e) => {
    e.stopPropagation();
    setShowUninstall(!showUninstall);
  };

  const handleConfirmed = (confirmed) => {
    if (confirmed) {
      ipcRenderer.send('delete-modpack', modpack.id);
      localStorage.removeItem(`lastInstalledVersion${modpack && modpack.id}`);
    }
    setShowDel(false);
  };

  const handleLaunch = () => {
    if (installedVersion) {
      ipcRenderer.send("launch-game", modpack.id);
      setIsInstalling(true);
    }
  };

  const handleStopGame = () => {
    ipcRenderer.send("exit-game", modpack.id);
  };

  const cancelLaunch = () => {
    ipcRenderer.send("cancel-game", modpack.id);
  };

  useEffect(() => {
    setIsOverflowing(false);
    setShowUninstall(false);
    handleOverflowCheck();
    setUpdate(false);
    setInstalledVersion(null);
    const lastInstalledVersion = JSON.parse(localStorage.getItem(`lastInstalledVersion${modpack && modpack.id}`));
    const switchState = localStorage.getItem(`isActivated-${modpack.id}`);
    if (switchState === "true") {
      setSwitchActive(true);
    } else {
      setSwitchActive(false);
    }

    if (lastInstalledVersion && modpack && modpack.mainVersion.id === lastInstalledVersion.id) {
      setInstalledVersion(lastInstalledVersion);
    } else {
      if (lastInstalledVersion != null) {
        if (modpack.mainVersion.id === "null") {
          setUpdate(false);
        } else {
          setUpdate(true);
          if (lastInstalledVersion != null) {
            setOldInstall(true);
          }
        }
      }
    }
    setSelectedItem("screenshots")
    if (modpack.mainVersion.id == "null") {
      setSelectedItem("");
    };

    setIsMainRendered(true);
  }, [modpack]);

  useEffect(() => {
    setShowUninstall(false);
    setSelectedItem("screenshots")
    if (modpack.mainVersion.id == "null") {
      setSelectedItem("");
    };

  }, [selectedModpackId]);

  const handleScroll = (e) => {
    const vh = window.visualViewport.height;
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop > 0.5 * vh) {
      setShowScrollView(true);
      setShowScrollViewAni(true);
      console.log("scroll view true");
    } else {
      setShowScrollViewAni(false);
      if (showScrollView) {
        setTimeout(() => {
          setShowScrollView(false);
        }, 350);
      } else {
        setShowScrollView(false);
      }
    }
  };
  

  useEffect(() => {
        ipcRenderer.on('install-complete', (event, modpackId) => {
          modpackId = modpackId.toString().trim();
          const currentModpackId = modpack.id.toString().trim(); 
          console.log(`Received modpackId: [${modpackId}]`);
          console.log(`Current modpack.id: [${currentModpackId}]`);
      
          if (modpackId === currentModpackId) {
              localStorage.setItem(`lastInstalledVersion${modpack && modpack.id}`, JSON.stringify(modpack.mainVersion));
              setInstalledVersion(modpack.mainVersion);
              setIsInstalling(false);
              setVerInstalling(null);
              handleSetNoChange(false);
              setProgress(100);
              //fetchData();
          }
      });
  
  
      ipcRenderer.on('game-launched', (event, modpackId) => {
        console.log("Game Launched" + modpackId + " " + modpack.id);
        modpackId = modpackId.toString().trim();
        if (modpackId === modpack.id) {
          setIsInstalling(false);
          setGameRunning(true);
          setProgress(100);
        }
      });

      ipcRenderer.on('error-launching', (event, modpackId) => {
        modpackId = modpackId.toString().trim();
        if (modpackId === modpack.id) {
          setIsInstalling(false);
          setGameRunning(false);
          setButtonText("PLAY");
          setProgress(100);

        }
      });
  
      ipcRenderer.on('game-closed', (event, modpackId) => {
        if (modpackId === modpack.id) {
          setGameRunning(false);
          handleSetNoChange(false);
          setProgress(100);
        }
      });
  
      ipcRenderer.on('uninstall-complete', (event, modpackId) => {
        if (modpackId === modpack.id) {
          //fetchData();
          setInstalledVersion(null);
          setVerInstalling(null);
          setShowUninstall(false);
          setSwitchActive(false);
          console.log(`Switch active is: ${switchActive}`);
          localStorage.setItem(`isActivated-${modpack.id}`, false);
        }
      });
  
      ipcRenderer.on('update-progress', (event, prog, id, progText) => {
        if (id === modpack.id) {
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
    

  }, [modpack]);
  

  const renderInfo = () => {
    switch (selectedItem) {
      case "screenshots":
        return (
          <div className={`main-panel-rendered-item ${itemClass}`}
               onAnimationEnd={itemClass && itemClass.startsWith('item-out') ? () => handleItemAnimationEnd() : () => handleInItemAnimationEnd()}
          >
            <Screenshots screenshots={modpack.screenshots} onClick={openViewer} visible={renderContent} />
          </div>
        );
      case "changelog":
        return (
          <div className={`main-panel-rendered-item ${itemClass}`}
               onAnimationEnd={itemClass && itemClass.startsWith('item-out') ? () => handleItemAnimationEnd() : () => handleInItemAnimationEnd()}
          >
            <Changelog versions={modpack.versions} />
          </div>
        );
      default:
        return null;
    }
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


  const installScrollBtnStyle = {
    width: "16vh",
    height: "6.5vh",
    marginLeft: "0vh", // Scaled down by 5%,
    borderRadius: "5px",
    border: `2px solid ${update ? "#1383df" : "#49a749"}`,
    background: `${update ? "#1383df" : `linear-gradient(90deg, #49a749 ${progress}%, transparent ${progress}%)`}`,
    willChange: "background"
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
  }
  

  const greenBtnScrollStyle = {
    width: "16vh",
    height: "6.5vh",
    marginLeft: "0vh", // Scaled down by 5%,
    borderRadius: "5px",
    border: `2px solid "#49a749"`,
    background: `linear-gradient(90deg, #49a749 ${progress}%, transparent ${progress}%)`,
    willChange: "background"
  }

  const blueBtnScrollStyle = {
    width: "16vh",
    height: "6.5vh",
    marginLeft: "0vh", // Scaled down by 5%,
    borderRadius: "5px",
    border: `2px solid #1383df`,
    background: `#1383df`,
    willChange: "background"
  }

  const installedScrollBtnStyle = {
    width: "16vh",
    height: "6.5vh",
    marginLeft: "0vh", // Scaled down by 5%,
    borderRadius: update ? "5px" : "5px 0px 0px 5px",
    border: `2px solid ${update ? "#1383df" : "#49a749"}`,
    background: `${update ? "#1383df" : `linear-gradient(90deg, #49a749 ${progress}%, transparent ${progress}%)`}`,
    willChange: "background"
  };
  
  const uninstallScrollBtnStyle = {
    width: "16vh",
    height: "6.5vh",
    marginLeft: "0vh", // Scaled down by 5%,
    borderRadius: "5px 0px 0px 5px",
    border: "2px solid #c40808",
    background: "#c40808",
  };
  
  const stopScrollBtnStyle = {
    width: "16vh",
    height: "6.5vh",
    marginLeft: "0vh", // Scaled down by 5%,
    borderRadius: "5px",
    border: "2px solid #1383df",
    background: "#1383df",
  };
  

  return (
    <div className='main-panel'  onClick={() => setShowUninstall(false)}>

      <div className='main-panel-side'>
        <div className='main-panel-side-header'>
          <img className='main-panel-side-header-home' src={house} alt='Home' draggable={false} />
          <p className='main-panel-side-header-account'>{profile && profile.name} crazyjosh111 </p>
        </div>
        <div className='main-panel-side-banner'>
            <img className='main-panel-side-banner-thumbnail' src={`${API}/${modpack && modpack.thumbnail}`} alt='Modpack Thumbnail' draggable={false} />
            <p className='main-panel-side-banner-name'>{modpack && modpack.name}</p>
        </div>

        <div className='main-panel-side-buttons'>
          <p className={`main-panel-side-buttons-button ${selectedItem === "screenshots" ? "ss" : ""}`} onClick={() => setSelectedItem("screenshots")}>SCREENSHOTS</p>
          <p className={`main-panel-side-buttons-button ${selectedItem === "changelog" ? "cl" : ""}`} onClick={() => setSelectedItem("changelog")}>CHANGELOGS</p>
        </div>
      </div>

      <div className='main-panel-right'>
      <div className='main-panel-overlay' />
      <img className='main-panel-right-background' src={`https://minecraftmigos.me/uploads/backgrounds/${modpack && modpack.background}`} />
      </div>

    </div>
  );
};

export default MainPanel;
