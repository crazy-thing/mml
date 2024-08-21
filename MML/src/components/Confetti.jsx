import React, { useRef, useEffect } from 'react';
import '../styles/componentStyles/Confetti.scss';

const COLORS = ['#0000e7', '#dbdb00', '#ed1c24', '#00ebeb'];

const Confetti = ({ NUM_CONFETTI, setShowConfetti }) => {
  const canvasRef = useRef(null);
  const confetti = useRef([]);
  const animationRef = useRef(null);
  const timeoutRef = useRef(null); // Ref to hold the timeout ID

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const range = (a, b) => (b - a) * Math.random() + a;

    const drawCircle = (x, y, width, height, style, deg) => {
      const rotDeg = deg * Math.PI / 180;
      context.beginPath();
      context.save();
      context.translate(x + width, y + height);
      context.rotate(rotDeg);
      context.fillStyle = style;
      context.fillRect(-width, -height, width, height);
      context.restore();
    };

    class ConfettiPiece {
      constructor() {
        this.replace();
      }

      replace() {
        this.style = COLORS[~~range(0, 4)];
        this.deg = range(10, 120);
        this.r = ~~range(6, 12);
        this.width = 2 * this.r;
        this.height = this.r / 2;
        this.x = w / 2;
        this.y = h / 2;
        this.vx = range(-10, 10);
        this.vy = range(-10, 10);
        this.gravity = 0.05;
        this.friction = 0.99;
      }

      draw() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        drawCircle(~~this.x, ~~this.y, this.width, this.height, this.style, this.deg);
      }
    }

    confetti.current = Array.from({ length: NUM_CONFETTI }, () => new ConfettiPiece());

    const step = () => {
      context.clearRect(0, 0, w, h);
      confetti.current.forEach((c) => c.draw());
      animationRef.current = requestAnimationFrame(step);
    };

    step();

    // Clear previous timeout if NUM_CONFETTI changes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout for stopping the animation and clearing the canvas
    timeoutRef.current = setTimeout(() => {
      cancelAnimationFrame(animationRef.current);
      context.clearRect(0, 0, w, h);
      setShowConfetti(false);
    }, 3000);

    return () => {
      cancelAnimationFrame(animationRef.current);
      clearTimeout(timeoutRef.current); // Clear timeout on unmount
    };
  }, [NUM_CONFETTI, setShowConfetti]);

  return <canvas ref={canvasRef} className="confetti-overlay"></canvas>;
};

export default Confetti;
