import React, { useEffect, useState } from 'react';
import '../styles/componentStyles/LoadingScreen.scss'; // Import CSS file for styling

// Loading screen fade out animation

const LoadingScreen = ({ isLoading, setShowBars, isMainRendered }) => {

  const [animationOver, setAnimationOver] = useState(false);
  const [loading, setLoading] = useState(isLoading);
  const [text, setText] = useState("Building Launcher");

  const handleAnimationEnd = () => {
    if (isMainRendered === true) {
      console.log("Main rendered");
      setAnimationOver(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMainRendered === true && isLoading === false) {
      setText("Done!");
      setTimeout(() => {
        console.log("Main rendered");
        setLoading(false);
        //setShowBars(true);      
      }, 1000);

    }
  }, [isMainRendered, isLoading]);

  return (
    <div className={`loading-screen ${animationOver ? "inactive" : !loading ? "exit" : " " }`} onTransitionEnd={() => handleAnimationEnd()}>
      <p className={`loading-screen-text ${!loading ? "active" : " "}`}>{text}</p>
      {isLoading && (
        <div className={`loading-bar`}>
          <div className='loading-bar-sway'></div>
        </div>     
      )}
    </div>
  );
};

export default LoadingScreen;