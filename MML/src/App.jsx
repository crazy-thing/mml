import { useEffect, useState, useRef } from 'react';
import './App.scss';
import LoadingScreen from './components/LoadingScreen';
import SidePanel from './containers/SidePanel';
import { getAllModpacks } from './util/api';
import Settings from './containers/Settings';
import MainPanel from './containers/MainPanel';
import { left } from './assets/exports';
import Confetti from './components/Confetti';

function App() {
  const { ipcRenderer } = window.require('electron');

  const [isLoading, setIsLoading] = useState(true);

  const [allInstalledVersions, setAllInstalledVersions] = useState([]);
  const [allModpacks, setAllModpacks] = useState([]);
  const [selectedModpackId, setSelectedModpackId] = useState(null);
  const [selectedModpack, setSelectedModpack] = useState(null);

  const [nextModpack, setNextModpack] = useState(null);

  const [noChange, setNoChange] = useState(false);
  const [settingPos, setSettingPos] = useState("-21%");
  const [sidePanelPos, setSidePanelPos] = useState("0%");

  const [animation, setAnimation] = useState(null);
  const [animationClass, setAnimationClass] = useState('');

  const [showScroll, setShowScroll] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiNum, setConfettiNum] = useState(200);

  const handleSelectModpack = (modpack) => {

    if (selectedModpack && selectedModpack.id === modpack.id) {
      console.log("Modpack already selected");
      return;
    }

    setNextModpack(modpack);
    setShowScroll(false);

    const mainPanel = document.querySelector('.main-panel-content');
    if (mainPanel) {
      const isNext = modpack.index > selectedModpack.index;
      setAnimation("fade .5s ease-in-out alternate");
      setAnimationClass(isNext ? 'out-left' : 'out-right');
    }
  };

  const fetchData = async () => {
    try {
      const modpacks = await getAllModpacks();
      const sortedModpacks = modpacks.sort((a, b) => {
        const indexA = a.index ? Number(a.index) : Infinity;
        const indexB = b.index ? Number(b.index) : Infinity;
        return indexA - indexB;
      });
      setAllModpacks(sortedModpacks);
    
      if (selectedModpackId == null) {
        const lastSelectedModpackId = JSON.parse(localStorage.getItem("lastSelectedModpack"));
        if (lastSelectedModpackId != null) {
          const modpackToSelect = modpacks.find(modpack => modpack.id === lastSelectedModpackId);
          if (modpackToSelect != null) {
            setSelectedModpackId(lastSelectedModpackId);
            setSelectedModpack(modpackToSelect);

          } else {
            setSelectedModpackId(modpacks[0].id);
            setSelectedModpack(modpacks[0]);

          }
        } else {
          setSelectedModpackId(modpacks[0].id);
          setSelectedModpack(modpacks[0]);

        }
      }
  
      ipcRenderer.send('get-installed-versions');
    } catch (error) {
      console.error(`An error occurred fetching data ${error}`);
    }
  };

  const handleAnimationEnd = () => {
    const mainPanel = document.querySelector('.main-panel-content');
    if (mainPanel && nextModpack) {
      const isNext = nextModpack.index > selectedModpack.index;

      setSelectedModpackId(nextModpack.id);
      setSelectedModpack(nextModpack);
      setAnimationClass(isNext ? 'in-right' : 'in-left');
      localStorage.setItem('lastSelectedModpack', JSON.stringify(nextModpack.id));
      console.log("Selected Modpack: ", nextModpack);

    }
  };

  const handleInAnimationEnd = () => {
    const mainPanel = document.querySelector('.main-panel-content');
    if (mainPanel) {
      mainPanel.classList.remove('in-right', 'in-left');
      setAnimationClass('');
      setAnimation(null);
      setShowScroll(true);
    }
  };
  
  const toggleShowConfetti = () => {
    setShowConfetti(!showConfetti);
  };
  

  const changeSettingPos = (pos) => {
    setSettingPos(`${pos}%`);
  };

  const handleSetNoChange = (b) => {
    setNoChange(b);
  };

  useEffect(() => {
    fetchData();
    ipcRenderer.on('installed-versions', (event, versions) => {
      handleSetNoChange(false);
      setAllInstalledVersions(versions);
      setIsLoading(false);
    });

    return () => {
      ipcRenderer.removeAllListeners('installed-versions');
    };
  }, []);

  useEffect(() => {
    let timer;
    if (settingPos === "0%") {
      timer = setTimeout(() => setSidePanelPos("-21%"), 300);
    } else {
      setSidePanelPos("0%");
    }

    return () => clearTimeout(timer);
  }, [settingPos]);


  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "m") {
        setShowConfetti(true);
      } else if (e.key === "Escape") {
        setShowConfetti(false);
        setConfettiNum(200);
      }
    }

    window.addEventListener('keydown', handleKeyPress);

    return () => window.removeEventListener('keydown', handleKeyPress);

  }, [setShowConfetti, setConfettiNum, confettiNum]);

  
  const animationStyle = {
    animation: animation,
    willChange: "opacity, animation"
  }

  return (
    <div className='mml'>
      {selectedModpackId && (
        <div className='app-background-container'>
          <img className={`app-background-next`} src={`https://minecraftmigos.me/uploads/backgrounds/${nextModpack && nextModpack.background}`} />
          <img className={`app-background`} style={animationStyle} src={`https://minecraftmigos.me/uploads/backgrounds/${selectedModpack && selectedModpack.background}`} />
        </div>
      )}
      {showConfetti && (
        <Confetti NUM_CONFETTI={confettiNum} setShowConfetti={setShowConfetti} />
      )}
      {isLoading && <LoadingScreen />}
      {allModpacks.map(modpack => (
        <MainPanel 
          key={modpack.id} 
          modpack={modpack} 
          fetchData={fetchData} 
          handleSetNoChange={handleSetNoChange} 
          noChange={noChange}
          animationClass={animationClass} 
          handleAnimationEnd={handleAnimationEnd} 
          handleInAnimationEnd={handleInAnimationEnd} 
          showScroll={showScroll} 
          style={{ display: modpack.id === selectedModpackId ? 'flex' : 'none' }}
          selectedModpackId={selectedModpackId}
        />
      ))}
      <SidePanel 
        pos={sidePanelPos} 
        changeSettingPos={changeSettingPos} 
        handleSelectModpack={handleSelectModpack} 
        modpacks={allModpacks} 
      />
      <Settings 
        pos={settingPos} 
        changeSettingPos={changeSettingPos} 
      />
    </div>
  )
  
}

export default App;
