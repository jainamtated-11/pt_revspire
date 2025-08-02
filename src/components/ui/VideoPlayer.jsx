import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
} from "lucide-react";

export default function VideoPlayer({ url }) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setPlayed(video.currentTime / video.duration);
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("durationchange", () => setDuration(video.duration));

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("durationchange", () =>
        setDuration(video.duration)
      );
    };
  }, []);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.pause();
    } else {
      video.play();
    }
    setPlaying(!playing);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleToggleMute = () => {
    setMuted(!muted);
    if (videoRef.current) {
      videoRef.current.muted = !muted;
    }
  };

  const handleSeekChange = (e) => {
    const newTime = parseFloat(e.target.value) * duration;
    setPlayed(parseFloat(e.target.value));
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleRewind = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 10;
    }
  };

  const handleFastForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    const pad = (string) => ("0" + string).slice(-2);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return hours
      ? `${hours}:${pad(minutes)}:${pad(secs)}`
      : `${minutes}:${pad(secs)}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
    >
      <video ref={videoRef} src={url} className="w-full h-full" muted={muted} />

      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress bar */}
        <input
          type="range"
          min={0}
          max={0.999999}
          step="any"
          value={played}
          onChange={handleSeekChange}
          className="w-full h-1 mb-4 bg-gray-600 rounded-full appearance-none cursor-pointer"
        />

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className="hover:text-blue-500 transition-colors"
            >
              {playing ? <Pause size={24} /> : <Play size={24} />}
            </button>

            {/* Skip buttons */}
            <button
              onClick={handleRewind}
              className="hover:text-blue-500 transition-colors"
            >
              <SkipBack size={24} />
            </button>

            <button
              onClick={handleFastForward}
              className="hover:text-blue-500 transition-colors"
            >
              <SkipForward size={24} />
            </button>

            {/* Volume controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMute}
                className="hover:text-blue-500 transition-colors"
              >
                {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Time display */}
            <span className="text-sm">
              {formatTime(duration * played)} / {formatTime(duration)}
            </span>
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="hover:text-blue-500 transition-colors"
          >
            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
}
