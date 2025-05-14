import React, { useEffect, useState } from 'react';
import '../styles/containerStyles/MainPanel.scss';
import Button from '../components/Button';
import ConfirmDelete from '../components/ConfirmDelete';
import Changelog from '../components/Changelog';
import { arrows,folderIcon, house, trashIcon } from '../assets/exports';
import Choose from '../components/Choose';

const MainPanelNew = ({ modpack, profile, fetchData, noChange, toggleShowHome, handleSetNoChange, animationClass, handleAnimationEnd, handleInAnimationEnd, showScroll, style, selectedModpackId, setIsMainRendered }) => {

  const { ipcRenderer } = window.require('electron');

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
  const [showVersionSelection, setShowVersionSelection] = useState(false);

  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [index, setIndex] = useState(null);

  const [itemClass, setItemClass] = useState(null);
  const [trans, setTrans] = useState(null);

  const [renderContent, setRenderContent] = useState(true);
  const [gameRunning, setGameRunning] = useState(false);

  const [showScaleUp, setShowScaleUp] = useState(false);  
  const [showStopGame, setShowStopGame] = useState(false);


  console.log(`Selected modpack id: ${selectedModpackId}`);
  console.log(`Modpack id: ${modpack && modpack.id}`);
  const selected = selectedModpackId === modpack && modpack.id;

  const handleHome = () => {
    setShowScaleUp(false);
  }

  const openViewer = (name, index) => {
    const screenshotIndex = modpack.screenshots.findIndex((screenshot) => screenshot === name);
    if (screenshotIndex === -1) return;
    setIndex(screenshotIndex);
  };

  const closeViewer = () => {
    setIndex(null);
  };

  const nextScreenshot = (e) => {
    e.stopPropagation();

    setIndex((prevIndex) => {
        let nextIndex = (prevIndex + 1) % modpack.screenshots.length;

        while (modpack.screenshots[nextIndex] === null) {
            nextIndex = (nextIndex + 1) % modpack.screenshots.length; 
        }

        return nextIndex;
    });
};

  const prevScreenshot = (e) => {
    e.stopPropagation();

    setIndex((prevIndex) => {
        let nextIndex = (prevIndex - 1 + modpack.screenshots.length) % modpack.screenshots.length;

        while (modpack.screenshots[nextIndex] === null) {
            nextIndex = (nextIndex - 1 + modpack.screenshots.length) % modpack.screenshots.length;
        }

        return nextIndex;
    });
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
    if (selectedItem) {
      console.log(`Selected item: ${nextItem}`);
      setItemClass(nextItem === "changelogs" ? 'item-in-right' : 'item-in-left');
      setSelectedItem(nextItem);
    }
  };

  const handleInItemAnimationEnd = () => {
    const mainPanel = document.querySelector('.main-panel-rendered-item');
    if (mainPanel) {
      mainPanel.classList.remove('item-in-right', 'item-in-left');
      setItemClass('test');
    }
  };

  const handleChangeItem = (item) => {
    if (selectedItem === item) return;
    if (item === "changelogs") {
      setItemClass('item-out-left');
    } else if (item === "screenshots") {
      setItemClass('item-out-right');
    }
    setNextItem(item);
    setTrans("font-size 0.4s ease");
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

    console.log(`Switch active is: ${switchActive}`);
    console.log(`Lite is: ${lite}`);

    if (lite === true || switchActive === true) {
        console.log('Sending download-lite-modpack event');
        ipcRenderer.send('download-lite-modpack', JSON.stringify(modpack));
        localStorage.setItem(`isActivated-${modpack.id}`, lite);
    } else {
        console.log('Sending download-modpack event');
        ipcRenderer.send('download-modpack', JSON.stringify(modpack));
        localStorage.setItem(`isActivated-${modpack.id}`, lite);
        
      }
    handleChangeItem("changelogs");
};

  const handleDeleteModpack = (e) => {
    e.stopPropagation();
    setShowDel(true);
  };

  const toggleUninstall = () => {
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
    setShowStopGame(false);
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
          setOldInstall(true);
        } else {
          setUpdate(true);
          if (lastInstalledVersion != null) {
            setOldInstall(true);
          }
        }
      }
    }
    //setSelectedItem("screenshots");
    //setNextItem("screenshots");
    if (modpack && modpack.mainVersion && modpack.mainVersion.id == "null") {
      setSelectedItem("");
      setNextItem("");
    };

    setIsMainRendered(true);

  }, [modpack]);

  useEffect(() => {
    setShowScaleUp(false);
    setItemClass("");
    setShowUninstall(false);
    setSelectedItem("screenshots");
    setNextItem("screenshots");
    if (modpack && modpack.mainVersion && modpack.mainVersion.id == "null") {
      setSelectedItem("");
      setNextItem("");
    };

    if (selectedModpackId === modpack.id) {
      setShowScaleUp(true);
    }

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
          fetchData();
      
          if (modpackId === currentModpackId) {
              localStorage.setItem(`lastInstalledVersion${modpack && modpack.id}`, JSON.stringify(modpack.mainVersion));
              setInstalledVersion(modpack.mainVersion);
              setIsInstalling(false);
              setVerInstalling(null);
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
          setOldInstall(false);
          setUpdate(false);
          fetchData();
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
            <p className='main-panel-rendered-item-title'>SCREENSHOTS</p>
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
    height: "9.5vh",
    marginLeft: "0vh", // Scaled down by 5%,
    borderRadius: "10px",
    //border: `2px solid ${update ? "#1383df" : "#49a749"}`,
    background: `${update ? "#1383df" : `linear-gradient(90deg, #49a749 ${progress}%, #1e1e1e ${progress}%)`}`,
    willChange: "background",
  };
  
  const installedBtnStyle = {
    width: "14.25vw",
    height: "9.5vh",
    marginLeft: "0vh", // Scaled down by 5%,
    borderRadius: update ? "10px" : "10px 0px 0px 10px",
    //border: `2px solid ${update ? "#1383df" : "#49a749"}`,
    background: `${update ? "#1383df" : `linear-gradient(90deg, #49a749 ${progress}%, #1e1e1e ${progress}%)`}`,
    willChange: "background",
  };
  
  const uninstallBtnStyle = {
    width: "14.25vw",
    height: "9.5vh",
    marginLeft: "0vh", // Scaled down by 5%,
    borderRadius: "10px 0px 0px 10px",
    //border: "2px solid #c40808",
    background: "#c40808",
  };
  
  const stopBtnStyle = {
    width: "14.25vw",
    height: "9.5vh",
    marginLeft: "0vh", // Scaled down by 5%,
    borderRadius: "10px",
    //border: "2px solid #1383df",
    background: isHovered ? "#ce4949" : "#45627a",
    transition: "background 0.05s",

  };
  
  const comingSoonBtnStyle = {
    width: "14.25vw",
    height: "9.5vh",
    marginLeft: "0vh", // Scaled down by 5%,
    borderRadius: "10px",
    //border: "2px solid #898989",
    background: "#898989",
  };


  const greenBtnStyle = {
    width: "14.25vw",
    height: "9.5vh",
    marginLeft: "0vh", // Scaled down by 5%,
    borderRadius: "10px",
    //border: `2px solid "#49a749"`,
    background: `linear-gradient(90deg, #49a749 ${progress}%, transparent ${progress}%)`,
    willChange: "background",
  }

  const blueBtnStyle = {
    width: "14.25vw",
    height: "9.5vh",
    marginLeft: "0vh", // Scaled down by 5%,
    borderRadius: "10px",
    //border: `2px solid #1383df`,
    background: `#1383df`,
    willChange: "background",
  }
  

  return (
    <div className={`main-panel ${showScaleUp ? "fadeIn" : "fadeOut"}`} style={style} onTransitionEnd={!showScaleUp ? toggleShowHome : console.log("")} >

    {showUninstall && <ConfirmDelete onConfirm={handleConfirmed} onCancel={toggleUninstall} />}
    {showVersionSelection && 
      <Choose  handleInstallModpack={handleInstallModpack} setShowVersionSelection={setShowVersionSelection}
               mp={modpack} switchActive={switchActive} installedVersion={installedVersion} setSwitchActive={setSwitchActive}
               oldInstall={oldInstall}  />}
    {showStopGame && (
      <div className='main-panel-stop-game-container'> 
        <div className='main-panel-stop-game'>
          <p className='main-panel-stop-game-text'>Are you sure you want to end this process?</p>
          <div className='main-panel-stop-game-buttons'>
            <span className='main-panel-stop-game-buttons-item yes' onClick={() => handleStopGame()}> YES </span>
            <span className='main-panel-stop-game-buttons-item no' onClick={() => setShowStopGame(false)}> NO </span>
          </div>
        </div>
      </div>
    )}

      <div className='main-panel-side'>
        <div className='main-panel-side-header'>
          <img src={house} className='main-panel-side-header-home' draggable={false} onClick={() => handleHome()} />
          <p className='main-panel-side-header-account'>{profile && profile.GamerTag}</p>
        </div>
        <div className='main-panel-side-banner' style={{background: modpack && modpack.banner}}>
          <img src={`https://minecraftmigos.me/uploads/thumbnails/${modpack && modpack.thumbnail}`} draggable={false} className='main-panel-side-banner-thumbnail' />
          <p className='main-panel-side-banner-name'>{modpack && modpack.name}</p>
        </div>

        <div className='main-panel-side-main-button' onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          {showVersionSelection ? (
            <Button
              text="WAITING..."
              style={comingSoonBtnStyle}
              textStyle={{ fontSize: "3.6vh", color: "white" }}
              onClick={() => setShowVersionSelection(!showVersionSelection)}
            />
          ) : (
            <Button
                text={isInstalling ? `${buttonText}%` : modpack && (modpack.mainVersion && modpack.mainVersion.zip === "null") || (modpack && modpack.versions && modpack.versions.length === 0) ? "COMING SOON!" : update && oldInstall ? "UPDATE" : showLiteUpdate && installedVersion ? "UPDATE" : installedVersion && gameRunning ? "RUNNING"
                : installedVersion ? "PLAY" : "INSTALL"}
                style={modpack && (modpack.mainVersion && modpack.mainVersion.zip === "null") || (modpack && modpack.versions && modpack.versions.length === 0) ? comingSoonBtnStyle : showLiteUpdate && installedVersion ? blueBtnStyle : gameRunning ? stopBtnStyle : installBtnStyle}
                textStyle={{ fontSize: "3.6vh", color: "white" }}
                onClick={gameRunning ?  () => setShowStopGame(true) : isInstalling ? console.log("please wait for installation to finish") : (modpack.mainVersion && modpack.mainVersion.zip === "null") || (modpack && modpack.versions && modpack.versions.length === 0) ? console.log("coming soon!") : update && !switchActive && oldInstall ? () => handleInstallModpack(modpack) : update && switchActive && oldInstall ? () => handleInstallModpack(modpack, true)
                : installedVersion ? () => handleLaunch() 
                : modpack && modpack.mainVersion && modpack.mainVersion.liteZip ? () => setShowVersionSelection(true) : () => handleInstallModpack(modpack)}
            />
          )}
        
          <p className='main-panel-side-main-button-install'>{isInstalling && installText && installText}</p>

          {/* 
            {(oldInstall || installedVersion) && !isInstalling && !gameRunning && !showVersionSelection && (
              <DropDown toggleUninstall={toggleUninstall} update={showUninstall} handleOpenFolder={handleOpenFolder}
                        setShowVersionSelection={setShowVersionSelection} switchActive={switchActive} showLiteUpdate={showLiteUpdate} 
                        oldInstall={oldInstall} modpack={modpack} />       
            )}
            */}
        </div>

        {(oldInstall || installedVersion) && !isInstalling && !showVersionSelection && !update && (

        <div className='main-panel-side-icons'>
            <span className={`main-panel-side-icons-icon  ${gameRunning || modpack && modpack.mainVersion && modpack.mainVersion.liteZip == "" || modpack && modpack.mainVersion && modpack.mainVersion.liteZip == "null" ? "running" : ""}`} onClick={setShowVersionSelection}>
              <img src={arrows} className={`main-panel-side-icons-icon-img`} draggable={false}  />
            </span>
            <span className='main-panel-side-icons-icon' onClick={handleOpenFolder}>
              <img src={folderIcon} className='main-panel-side-icons-icon-img' draggable={false}  />
            </span>
            <span className={`main-panel-side-icons-icon  ${gameRunning ? "running" : ""}`} onClick={toggleUninstall}>
              <img src={trashIcon} className='main-panel-side-icons-icon-img' draggable={false}  />
            </span>
        </div>
        )}

        <div className='main-panel-side-buttons'>
          <p className={`main-panel-side-buttons-item-text ${modpack && (modpack.mainVersion && modpack.mainVersion.zip === "null") || (modpack && modpack.versions && modpack.versions.length === 0) ? "coming-soon" : nextItem === "screenshots" ? "active" : ""}`} style={{transition: trans}} onTransitionEnd={() => setTrans("font-size 0s ease")} 
             onClick={modpack && modpack.mainVersion && modpack.mainVersion.id == "null" ? console.log("coming soon!") : () => handleChangeItem("screenshots")}>SCREENSHOTS</p>
          <div style={{width: "4.3vh", height: "0.46vh", background: "#818181"}} />
          <p className={`main-panel-side-buttons-item-text ${modpack && (modpack.mainVersion && modpack.mainVersion.zip === "null") || (modpack && modpack.versions && modpack.versions.length === 0) ? "coming-soon" : nextItem === "changelogs" ? "active" : ""}`} style={{transition: trans}} onTransitionEnd={() => setTrans("font-size 0s ease")}
             onClick={modpack && modpack.mainVersion && modpack.mainVersion.id == "null" ? console.log("coming soon!") : () => handleChangeItem("changelogs")}>CHANGELOGS</p>
        {/* 
            <span className='main-panel-side-buttons-item' onClick={modpack && modpack.mainVersion && modpack.mainVersion.id == "null" ? console.log("coming soon!") : () => handleChangeItem("screenshots")}>
              <img src={dot} className={`main-panel-side-buttons-item-dot ${nextItem === "screenshots" ? "active" : ""}`}/>
              <p className={`main-panel-side-buttons-item-text ${nextItem === "screenshots" ? "active" : ""}`}>SCREENSHOTS</p>
            </span>
            <span className='main-panel-side-buttons-item' onClick={modpack && modpack.mainVersion && modpack.mainVersion.id == "null" ? console.log("coming soon!") : () => handleChangeItem("changelogs")}>
              <img src={dot} className={`main-panel-side-buttons-item-dot ${nextItem === "changelogs" ? "active" : ""}`}/>
              <p className={`main-panel-side-buttons-item-text ${nextItem === "changelogs" ? "active" : ""}`}>CHANGELOGS</p>
            </span>
        */}
        </div>
      </div>

      <div className='main-panel-right' >
        <img className='main-panel-right-background' src={`https://minecraftmigos.me/uploads/backgrounds/${modpack && modpack.background}`} draggable={false} />

        {modpack && modpack.mainVersion && modpack.mainVersion.id !== "null" && (
          selectedItem === "changelogs" ? (
            <div
              className={`main-panel-right-container changelogs ${itemClass}`}
              id='changelogs'
              onAnimationEnd={itemClass && itemClass.startsWith('item-out') ? () => handleItemAnimationEnd() : () => handleInItemAnimationEnd()}
            >
              <div className='main-panel-right-changelog'>
                <Changelog versions={modpack.versions} />
              </div>
            </div>
          ) : (
            <div
              className={`main-panel-right-container screenshots ${itemClass}`}
              id='screenshots'
              onAnimationEnd={itemClass && itemClass.startsWith('item-out') ? () => handleItemAnimationEnd() : () => handleInItemAnimationEnd()}
            >
              <Screenshots screenshots={modpack.screenshots} onClick={openViewer} visible={false} />       
            </div>
          )
        )}

  

      </div>

      <div className='main-panel-overlay' />

    </div>
  );
};

export default MainPanelNew;
