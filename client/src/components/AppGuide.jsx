import React, { useState } from 'react';
import { BookOpen, X, Play, Pause, Volume2, VolumeX, RotateCcw, Maximize } from 'lucide-react';

export default function AppGuide() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoRef = React.useRef(null);

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = async () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      await videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;

    if (!video) return;

    setCurrentTime(video.currentTime);

    if (video.duration) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const seekVideo = (e) => {
    const video = videoRef.current;

    if (!video || !video.duration) return;

    const value = Number(e.target.value);

    video.currentTime = (value / 100) * video.duration;
    setProgress(value);
  };

  const restartVideo = () => {
    if (!videoRef.current) return;

    videoRef.current.currentTime = 0;
    videoRef.current.play();

    setPlaying(true);
    setProgress(0);
    setCurrentTime(0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;

    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  };

  const fullscreen = () => {
    if (!videoRef.current) return;

    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <>
      {/* Top Guide Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full mb-3 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 shadow-lg border border-emerald-400/30"
      >
        <BookOpen className="w-5 h-5" />
        📖 App Guide
      </button>

      {/* Guide Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-3">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-black text-white">
                  📖 Kaam Manch App Guide
                </h2>
                <p className="text-xs text-slate-400">
                  App ka use kaise karein
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);

                  if (videoRef.current) {
                    videoRef.current.pause();
                  }

                  setPlaying(false);
                }}
                className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video */}
            <div className="bg-black">
              <video
                ref={videoRef}
                src="/app-guide.mp4"
                className="w-full max-h-[65vh] object-contain"
                preload="metadata"
                playsInline
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setPlaying(false)}
              />
            </div>

            {/* Controls */}
            <div className="p-4 space-y-3">

              {/* Progress */}
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress}
                onChange={seekVideo}
                className="w-full accent-emerald-500 cursor-pointer"
              />

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-center gap-2">

                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center"
                >
                  {playing ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={restartVideo}
                  className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center"
                  title="Restart"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center"
                >
                  {muted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={fullscreen}
                  className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center"
                >
                  <Maximize className="w-5 h-5" />
                </button>

              </div>

              <p className="text-center text-[10px] text-slate-500">
                Play/Pause • Seek • Volume • Fullscreen
              </p>

            </div>
          </div>
        </div>
      )}
    </>
  );
}