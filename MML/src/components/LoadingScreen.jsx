import React, { useEffect, useState } from 'react';
import '../styles/componentStyles/LoadingScreen.scss'; // Import CSS file for styling

// Loading screen fade out animation

const LoadingScreen = ({ isLoading, setShowBars, isMainRendered, loadingProgress, profile }) => {

  const [animationOver, setAnimationOver] = useState(false);
  const [loading, setLoading] = useState(isLoading);
  const [text, setText] = useState("Building Launcher");

  const [exit, setExit] = useState(false);

  const handleLoadingFinish = () => {
    setLoading(false);
    setExit(true);
  }


  const handleAnimationEnd = () => {
      setAnimationOver(true);
      setLoading(false);
      console.log("Animation ended");
  };

  useEffect(() => {
    if (loadingProgress === 100) {
      setLoading(false);
    } else {
      setLoading(true);
    }
    
  }, [loadingProgress]);


  return (
    <div className={`loading-screen ${animationOver ? "inactive" : !loading && exit ? "exit" : " " }`} onTransitionEnd={(e) => { if (e.propertyName === 'opacity') { handleAnimationEnd();}}}>
      <p className={`loading-screen-text ${!loading && exit ? "active" : ""}`}>
        {!profile ? "Logging in..." 
          : loadingProgress === 50
          ? "Loading Settings..."
          : loadingProgress === 100
          ? "Loading Modpacks..."
          : "Building Launcher..."}
      </p>
      {isLoading && (
        <div className={`loading-bar`}>
          <div className='loading-bar-sway' onTransitionEnd={(e) => { if (e.propertyName === 'width') { handleLoadingFinish(); }}} style={{width: `${profile && loadingProgress}%`}}></div>
        </div>     
      )}
    </div>
  );
};

export default LoadingScreen;