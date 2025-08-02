import { useEffect, useRef } from "react";

export default function VideoComponent({
  fullscreenBlobUrl,
  viewedPercentageRef,
  videoRef,
  videoId,
  videoVewTimeRef,
  setIsActive,
  lastActivity,
  activeTime,
}) {
  const currentTimeRef = useRef(0);


  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return; // Early exit if no video element

    // Function to calculate and update percentage viewed
    const handleTimeUpdate = () => {
      const currentTime = videoElement.currentTime;
      const duration = videoElement.duration;

      // Safely update refs
      if (videoVewTimeRef?.current !== undefined) {
        videoVewTimeRef.current = currentTime;
      }

      if (duration > 0 && viewedPercentageRef?.current !== undefined) {
        viewedPercentageRef.current = (currentTime / duration) * 100;
      }

      // Update activity state
      setIsActive(true);
      if (lastActivity.current !== undefined) {
        lastActivity.current = Date.now();
      }

      currentTimeRef.current = currentTime;
    };

    const handlePlayPause = () => {
      setIsActive(!videoElement.paused);
    };

    // Add event listeners
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("play", handlePlayPause);
    videoElement.addEventListener("pause", handlePlayPause);

    return () => {
      // Cleanup: remove event listeners
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("play", handlePlayPause);
      videoElement.removeEventListener("pause", handlePlayPause);

      // Safely update active time
      if (activeTime.current !== undefined) {
        activeTime.current += currentTimeRef.current;
      }
    };
  }, []);

  return (
    <div className="relative pb-2/3 overflow-hidden w-full h-full object-cover">
      <video
        id={videoId}
        ref={videoRef}
        src={fullscreenBlobUrl}
        controls
        className="w-full h-full object-cover"
      />
    </div>
  );
}
