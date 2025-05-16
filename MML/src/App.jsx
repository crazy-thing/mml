import { useEffect, useState, useRef } from 'react';
import './App.scss';
import LoadingScreen from './components/LoadingScreen';
import { getAllModpacks } from './util/api';
import Confetti from './components/Confetti';
import TopBar from './components/TopBar';
import NewSettings from './containers/NewSettings';
import LauncherChangelog from './components/LauncherChangelog';
import NewHome from './containers/NewHome';
import Main from './containers/Main';

function App() {
  const { ipcRenderer } = window.require('electron');

  const [isLoading, setIsLoading] = useState(true);
  const [bars, setBars] = useState([]);
  const [showBars, setShowBars] = useState(false);

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
  const [showChangelog, setShowChangelog] = useState(false);

  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiInstances, setConfettiInstances] = useState([]);
  const [confettiNum, setConfettiNum] = useState(200);

  const [isMainRendered, setIsMainRendered] = useState(true);

  const [showSettings, setShowSettings] = useState(false);
  const [showHome, setShowHome] = useState(true);

  const [transformOrigin, setTransformOrigin] = useState(null);

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

  const handleSelectModpack = (modpack) => {
    setSelectedModpack(modpack);
    setSelectedModpackId(modpack.id);
    localStorage.setItem('lastSelectedModpack', JSON.stringify(modpack.id));

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
            setSelectedModpackId(null);
            setSelectedModpack(null);

          }
        } else {
          setSelectedModpackId(null);
          setSelectedModpack(null);

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

  const changeSettingPos = (pos) => {
    setSettingPos(`${pos}%`);
  };

  const handleSetNoChange = (b) => {
    setNoChange(b);
  };

  useEffect(() => {
    fetchData();
    const barCount = 5; 
    const newBars = Array(barCount).fill(0);
    setBars(newBars);

    ipcRenderer.on('installed-versions', (event, versions) => {
      handleSetNoChange(false);
      setAllInstalledVersions(versions);
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
    const maxConfetti = 40; // Set your maximum limit here
  
    const handleKeyPress = (e) => {
      if (e.key === "m") {
        setConfettiInstances((prevInstances) => {
          if (prevInstances.length < maxConfetti) {
            return [...prevInstances, Date.now()];
          }
          else {
            setShowConfetti(false);
            setConfettiInstances([]);
            return [];
          }
        });
        setShowConfetti(true);
      } else if (e.key === "Escape") {
        setShowConfetti(false);
        setConfettiInstances([]); // Clear instances
      }
    };
  
    window.addEventListener('keydown', handleKeyPress);
  
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setShowConfetti, setConfettiInstances]);
  
  useEffect(() => {

    getDefaultAccount();

    ipcRenderer.on('sign-in-reply', (event, result) => {
      console.log(result);
      if (result.ProfilePicture != null) {
        console.log("profile pic", result.ProfilePicture);
        setIsLoading(false);
        setProfile(result);
      }
    });
  
    ipcRenderer.on('default-account-reply', (event, result) => {
      console.log(result);
      setProfile(result);
    });


    ipcRenderer.send('get-version');
    ipcRenderer.on('version', async (event, version) => {
    const lastVersion = localStorage.getItem('lastVersion');

      console.log(`Prev ${lastVersion} vs  new ${version}`);
      if (lastVersion !== version) {
        setShowChangelog(true);
        console.log("New version available");
        localStorage.setItem('lastVersion', version);
      }        
    });

    return () => {
      ipcRenderer.removeAllListeners('sign-in-reply');
      ipcRenderer.removeAllListeners('default-account-reply');
    };


  }, []);


  const animationStyle = {
    animation: animation,
    willChange: "opacity, animation"
  }

  const toggleShowSettings = (e) => {
    e.stopPropagation();
    setShowSettings(true);
  };

  const toggleShowHome = () => {
    setShowSettings(false);
  };

  const selectModpack = (modpack) => {
    setSelectedModpack(modpack);
    setSelectedModpackId(modpack.id);
    console.log("Selected Modpack: ", modpack, selectedModpackId);
  };

  return (

    <>
      <LoadingScreen isLoading={isLoading} setShowBars={setShowBars} isMainRendered={isMainRendered} />
      <TopBar />

      <div className="transition-container">
        <div className={`panel ${showHome ? "slide-in-right" : "slide-out-right"}`}>
          <NewHome selectModpack={selectModpack} toggleShowSettings={toggleShowSettings} /> 
          {selectedModpackId == null ? (
            <div className='app__no-modpack'>
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
            </div>
          ) : (
            allModpacks.map(mp => (
              <Main
                key={mp.id}
                mp={mp}
                fetchData={fetchData}
                selectedModpackId={selectedModpackId}
                style={{ display: mp.id === selectedModpackId ? 'flex' : 'none' }}
              />
            ))
          )}

        </div>
        <div className={`panel ${showSettings ? "slide-in-left" : "slide-out-left"}`}>
          <NewSettings 
            toggleShowHome={toggleShowHome} 
            profile={profile} 
            handleSignOut={handleSignOut} 
            handleSignIn={handleSignIn} 
          />
        </div>
    </div>


      {/* 
      {allModpacks.map(mp => (
        <MainPanelNew 
          key={mp.id}
          fetchData={fetchData}
          modpack={mp}
          selectedModpackId={selectedModpackId}
          setIsMainRendered={setIsMainRendered}
          style={{display: mp.id === selectedModpackId ? 'flex' : 'none', transformOrigin: transformOrigin}}
          toggleShowHome={toggleShowHome}
          profile={profile}
          />
      ))}

      */}

      {showChangelog && (
        <div className='app-launcher-changelog' onClick={() => setShowChangelog(false)}>
          <LauncherChangelog  ver={localStorage.getItem("lastVersion")} />
        </div>
        )}

      {showConfetti && (
        confettiInstances.map((instance) => (
          <Confetti key={instance.id} NUM_CONFETTI={confettiNum} setShowConfetti={setShowConfetti} />
        ))
      )}
  
    </>

  )
  
}

export default App;
