"use client";

import React, { useEffect, useState, useRef } from "react";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import WaveSurfer from "wavesurfer.js";

import { Song } from "@/types";

import usePlayer from "@/hooks/usePlayer";
import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";
import Slider from "./Slider";
import AudioVisualizer from "./AudioVisualizer";
import { toast } from "react-hot-toast";
import useSubscribeModal from "@/hooks/useSubscribeModal";
import { useUser } from "@/hooks/useUser";

interface PlayerContentProps {
  song: Song;
  songUrl: string;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ song, songUrl }) => {
  const player = usePlayer();
  const subscribeModal = useSubscribeModal();
  const { user, subscription } = useUser();
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLMediaElement | null>(null);
  
  // Whisper Lyrics State
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeProgress, setTranscribeProgress] = useState(0);
  const workerRef = useRef<Worker | null>(null);

  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  const onPlayNext = () => {
    if (player.ids.length === 0) return;

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const nextSong = player.ids[currentIndex + 1];

    if (!nextSong) return player.setId(player.ids[0]);

    player.setId(nextSong);
  };

  const onPlayPrevious = () => {
    if (player.ids.length === 0) return;

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const previoustSong = player.ids[currentIndex - 1];

    if (!previoustSong) return player.setId(player.ids[player.ids.length - 1]);

    player.setId(previoustSong);
  };

  useEffect(() => {
    if (!waveformRef.current) return;

    // Load initial volume from localStorage
    const savedVolume = parseFloat(localStorage.getItem("vibetribe-volume") || "0.5");
    setVolume(savedVolume);

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "transparent",
      progressColor: "rgba(255, 255, 255, 0.5)",
      cursorColor: "white",
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      height: 30,
      url: songUrl,
    });

    wavesurfer.current.on("ready", () => {
      setAudioElement(wavesurfer.current?.getMediaElement() || null);
      wavesurfer.current?.setVolume(savedVolume);
      wavesurfer.current?.play();
    });

    wavesurfer.current.on("play", () => setIsPlaying(true));
    wavesurfer.current.on("pause", () => setIsPlaying(false));
    wavesurfer.current.on("finish", () => {
      setIsPlaying(false);
      onPlayNext();
    });

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [songUrl]);

  const handlePlay = () => {
    if (wavesurfer.current?.isPlaying()) {
      wavesurfer.current.pause();
    } else {
      wavesurfer.current?.play();
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    wavesurfer.current?.setVolume(value);
    localStorage.setItem("vibetribe-volume", value.toString());
  };

  const toggleMute = () => {
    if (volume === 0) {
      const lastVol = parseFloat(localStorage.getItem("vibetribe-volume") || "0.5");
      const restoreVol = lastVol > 0 ? lastVol : 0.5;
      handleVolumeChange(restoreVol);
    } else {
      wavesurfer.current?.setVolume(0);
      setVolume(0);
    }
  };

  const generateLyrics = async () => {
    if (!user) {
      return toast.error("You must be logged in to use AI Lyrics.");
    }
    
    // AI Lyrics Paywall Check
    const hasUltra = subscription?.prices?.products?.name === "VibeTribe Ultra";
    if (user.email !== "mohdfahamb@gmail.com" && !hasUltra) {
      toast.error("AI Lyrics requires the VibeTribe Ultra plan.");
      subscribeModal.onOpen();
      return;
    }

    if (lyrics) {
      setLyrics(null); // toggle off
      return;
    }
    
    setIsTranscribing(true);
    setTranscribeProgress(0);
    setLyrics("");

    try {
      toast.loading("Preparing AI Model (This may take a minute on first run)...", { id: "whisper" });
      
      // Init Worker
      if (!workerRef.current) {
        workerRef.current = new Worker(new URL('../workers/whisper.worker.ts', import.meta.url), { type: 'module' });
      }
      
      const worker = workerRef.current;
      
      worker.onmessage = (e) => {
        const { status, output, progress } = e.data;
        if (status === "progress") {
          setTranscribeProgress(Math.round(progress));
        } else if (status === "ready") {
          toast.loading("Model Ready. Analyzing audio...", { id: "whisper" });
        } else if (status === "complete") {
          toast.success("Transcription Complete!", { id: "whisper" });
          const text = output.text || output.map((o: any) => o.text).join("\\n");
          setLyrics(text);
          setIsTranscribing(false);
        }
      };

      // Fetch and resample audio to 16kHz for Whisper
      const audioCtx = new window.AudioContext({ sampleRate: 16000 });
      const response = await fetch(songUrl);
      const arrayBuffer = await response.arrayBuffer();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);
      const audioData = decoded.getChannelData(0); // Float32Array

      worker.postMessage({ type: "transcribe", audio: audioData });
    } catch (err) {
      console.error(err);
      toast.error("Transcription Failed", { id: "whisper" });
      setIsTranscribing(false);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 h-full">
      <div className="flex w-full justify-start">
        <div className="flex items-center gap-x-4">
          <MediaItem data={song} />
          <LikeButton songId={song.id} />
        </div>
      </div>

      <div className="flex md:hidden col-auto w-full justify-end items-center">
        <div
          onClick={handlePlay}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-white p-1 cursor-pointer"
        >
          <Icon size={30} className="text-black" />
        </div>
      </div>

      <div className="hidden h-full md:flex justify-center items-center w-full max-w-[722px] px-4 relative">
        {/* Waveform Background */}
        <div className="absolute inset-0 w-full h-[80px] z-0">
          <div ref={waveformRef} className="absolute inset-0 w-full h-full cursor-pointer z-10" />
          <AudioVisualizer audioElement={audioElement} isPlaying={isPlaying} />
        </div>
        
        {/* Playback Controls (Overlay) */}
        <div className="relative flex justify-center items-center gap-x-6 z-20 pointer-events-auto">
          <AiFillStepBackward
            size={24}
            onClick={onPlayPrevious}
            className="text-neutral-400 cursor-pointer hover:text-white transition"
          />
          <div
            onClick={handlePlay}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-white p-1 cursor-pointer hover:scale-105 transition shadow-lg"
          >
            <Icon size={20} className="text-black" />
          </div>
          <AiFillStepForward
            size={24}
            onClick={onPlayNext}
            className="text-neutral-400 cursor-pointer hover:text-white transition"
          />
        </div>
      </div>

      <div className="hidden md:flex w-full justify-end pr-2 items-center">
        <div className="flex items-center gap-x-2 w-[120px] mr-4">
          <VolumeIcon
            onClick={toggleMute}
            className="cursor-pointer text-neutral-400 hover:text-white transition"
            size={24}
          />
          <Slider value={volume} onChange={handleVolumeChange} />
        </div>
        
        <button 
          onClick={generateLyrics} 
          disabled={isTranscribing}
          className="text-sm bg-neutral-800 text-orange-500 hover:bg-neutral-700 px-3 py-1 rounded-full font-medium transition disabled:opacity-50"
        >
          {isTranscribing ? `Loading AI (${transcribeProgress}%)` : lyrics ? "Hide Lyrics" : "✨ AI Lyrics"}
        </button>
      </div>

      {/* AI Lyrics Panel Overlay */}
      {lyrics !== null && (
        <div className="absolute bottom-[100%] left-0 w-full p-4 mb-2 z-50 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md border border-neutral-800 rounded-xl p-6 shadow-2xl max-h-[60vh] overflow-y-auto pointer-events-auto w-full max-w-3xl mx-auto">
            <h3 className="text-orange-500 font-bold text-lg mb-4 sticky top-0 bg-black/80 pb-2">AI Transcription</h3>
            {isTranscribing && !lyrics ? (
              <div className="flex justify-center items-center h-20 text-neutral-400 animate-pulse">
                Analyzing vocals...
              </div>
            ) : (
              <p className="text-white text-lg font-medium leading-relaxed whitespace-pre-wrap">
                {lyrics}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerContent;
