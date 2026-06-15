"use client";

import React, { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  audioElement: HTMLMediaElement | null;
  isPlaying: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioElement, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return;

    // Initialize AudioContext only once
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      try {
        // Fix CORS for Web Audio API
        audioElement.crossOrigin = "anonymous";
        
        const source = ctx.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        sourceRef.current = source;
      } catch (err) {
        console.error("Web Audio API Error. This usually happens if the source was already connected.", err);
      }
    }

    const draw = () => {
      if (!canvasRef.current || !analyserRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      const time = Date.now() / 20;
      const hue1 = time % 360;
      const hue2 = (time + 40) % 360; // offset for a smooth gradient

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2; // scale down a bit

        // Create a beautiful animated gradient
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, `hsl(${hue1}, 100%, 60%)`); 
        gradient.addColorStop(1, `hsl(${hue2}, 100%, 50%)`); 

        ctx.fillStyle = gradient;
        
        // Draw bars bouncing from the bottom
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 2;
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    if (isPlaying) {
      // Resume context if suspended (browser autoplay policy)
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume();
      }
      draw();
    } else {
      cancelAnimationFrame(animationRef.current);
      // Draw one last frame to show the static peaks
      draw();
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [audioElement, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      width={722}
      height={80}
    />
  );
};

export default AudioVisualizer;
