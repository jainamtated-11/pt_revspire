import { useCallback, useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlay, faStop, faUndo, faVideo, faPause } from "@fortawesome/free-solid-svg-icons"
import { X, ChevronDown, Settings, Sparkles, Settings2 } from "lucide-react"

export default function VideoRecorder({ onCancel, highlightVideoFiles, videoTaglines }) {
  const webcamRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const videoRef = useRef(null)

  const [capturing, setCapturing] = useState(false)
  const [recordedChunks, setRecordedChunks] = useState([])
  const [videoUrl, setVideoUrl] = useState(null)
  const [audioDevices, setAudioDevices] = useState([])
  const [videoDevices, setVideoDevices] = useState([])
  const [selectedAudioDevice, setSelectedAudioDevice] = useState("")
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("")
  const [videoTagline, setVideoTagline] = useState("")
  const [recordingStatus, setRecordingStatus] = useState("idle")
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isRecordingComplete, setIsRecordingComplete] = useState(false)
  const [uploadedVideo, setUploadedVideo] = useState(null)
  const [showDeviceSettings, setShowDeviceSettings] = useState(false)
  const [showEffects, setShowEffects] = useState(false)

  // Video effects state
  const [effects, setEffects] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
  })

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audioDevices = devices.filter((device) => device.kind === "audioinput")
      const videoDevices = devices.filter((device) => device.kind === "videoinput")
      setAudioDevices(audioDevices)
      setVideoDevices(videoDevices)
      setSelectedAudioDevice(audioDevices[0]?.deviceId || "")
      setSelectedVideoDevice(videoDevices[0]?.deviceId || "")
    })
  }, [])

  const handleDataAvailable = useCallback(({ data }) => {
    if (data.size > 0) {
      setRecordedChunks((prev) => {
        const newChunks = [...prev, data]
        const blob = new Blob(newChunks, { type: "video/webm" })
        setVideoUrl(window.URL.createObjectURL(blob))
        setIsRecordingComplete(true)
        return newChunks
      })
    }
  }, [])

  const stopWebcam = useCallback(() => {
    if (webcamRef.current && webcamRef.current.srcObject) {
      const tracks = webcamRef.current.srcObject.getTracks()
      tracks.forEach((track) => {
        track.stop()
      })
      webcamRef.current.srcObject = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
      const tracks = mediaRecorderRef.current.stream.getTracks()
      tracks.forEach((track) => {
        track.stop()
      })
    }
  }, [])

  const handleStartCaptureClick = useCallback(async () => {
    const audioConstraints = selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true
    const videoConstraints = selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: audioConstraints,
      })

      if (webcamRef.current) {
        webcamRef.current.srcObject = stream
      }

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "video/webm",
      })
      mediaRecorderRef.current.addEventListener("dataavailable", handleDataAvailable)
      mediaRecorderRef.current.start()

      setCapturing(true)
      setRecordingStatus("recording")
      setRecordingDuration(0)

      const intervalId = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
      mediaRecorderRef.current.intervalId = intervalId
    } catch (error) {
      console.error("Error accessing media devices.", error)
    }
  }, [handleDataAvailable, selectedAudioDevice, selectedVideoDevice])

  const handleStopCaptureClick = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      clearInterval(mediaRecorderRef.current.intervalId)
    }
    setCapturing(false)
    setRecordingStatus("idle")
  }, [])

  const handlePauseCaptureClick = useCallback(() => {
    if (mediaRecorderRef.current && recordingStatus === "recording") {
      mediaRecorderRef.current.pause()
      clearInterval(mediaRecorderRef.current.intervalId)
      setRecordingStatus("paused")
    } else if (mediaRecorderRef.current && recordingStatus === "paused") {
      mediaRecorderRef.current.resume()
      const intervalId = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
      mediaRecorderRef.current.intervalId = intervalId
      setRecordingStatus("recording")
    }
  }, [recordingStatus])

  const handletaglineSave = useCallback(() => {
    if (videoTaglines) {
      videoTaglines(videoTagline)
    }
  }, [videoTagline, videoTaglines])

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    const supportedFormats = ["video/webm", "video/mp4", "video/quicktime", "video/x-msvideo"]

    if (file && supportedFormats.includes(file.type)) {
      const url = URL.createObjectURL(file)
      setVideoUrl(url)
      setUploadedVideo(file)
      setIsRecordingComplete(true)
    } else {
      alert("Please upload a valid video file (supported formats: WebM, MP4, MOV, AVI)")
    }
  }

  const handleUpload = useCallback(() => {
    if (!videoTagline) {
      alert("Please add a video tagline")
      return
    }

    if (uploadedVideo) {
      highlightVideoFiles(uploadedVideo, videoTagline)
    } else if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, { type: "video/webm" })
      const file = new File([blob], "video.webm", { type: "video/webm" })
      highlightVideoFiles(file, videoTagline)
    }

    stopWebcam()
    onCancel()
  }, [uploadedVideo, recordedChunks, onCancel, highlightVideoFiles, videoTagline, stopWebcam])

  const handleCancel = useCallback(() => {
    stopWebcam()
    onCancel()
    setVideoUrl(null)
    setRecordedChunks([])
  }, [onCancel, stopWebcam])

  const handleRevert = useCallback(() => {
    setRecordedChunks([])
    setVideoUrl(null)
    setIsRecordingComplete(false)
  }, [])

  const handleTaglineChange = (e) => {
    const newTagline = e.target.value
    if (newTagline.length <= 70) {
      setVideoTagline(newTagline)
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleEffectChange = (effectName, value) => {
    setEffects((prev) => ({
      ...prev,
      [effectName]: value,
    }))
  }

  const resetEffects = () => {
    setEffects({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0,
    })
  }

  const getFilterStyle = () => {
    return {
      filter: `brightness(${effects.brightness}%) contrast(${effects.contrast}%) saturate(${effects.saturation}%) blur(${effects.blur}px) grayscale(${effects.grayscale}%) sepia(${effects.sepia}%)`,
      transition: "filter 0.2s ease-in-out",
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm flex items-center justify-center p-2">
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 ease-out scale-100"
        style={{ animation: "slideIn 0.3s ease-out" }}
      >
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faVideo} className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Video Recorder</h1>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-all duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="flex">
            {/* Left Panel - Video and Controls */}
            <div className="flex-1 p-4">
              {/* Video Preview */}
              <div
                className="relative w-full bg-gray-800 rounded-lg overflow-hidden mb-3"
                style={{ aspectRatio: "16/10" }}
              >
                {!isRecordingComplete ? (
                  <Webcam
                    audio={false}
                    mirrored={true}
                    ref={webcamRef}
                    videoConstraints={{
                      deviceId: selectedVideoDevice,
                      aspectRatio: 16 / 10,
                    }}
                    className="w-full h-full object-cover transition-all duration-300"
                    style={getFilterStyle()}
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full h-full object-cover transition-all duration-300"
                    style={getFilterStyle()}
                  />
                )}

                {recordingStatus !== "idle" && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-ping"></div>
                    {formatDuration(recordingDuration)}
                  </div>
                )}

                {/* Recording Controls Overlay */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {recordingStatus === "idle" ? (
                    <button
                      title="Start Recording"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 transform"
                      onClick={handleStartCaptureClick}
                    >
                      <FontAwesomeIcon icon={faVideo} className="h-5 w-5" />
                    </button>
                  ) : (
                    <>
                      <button
                        title="Stop Recording"
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 transform"
                        onClick={handleStopCaptureClick}
                      >
                        <FontAwesomeIcon icon={faStop} className="h-5 w-5" />
                      </button>
                      <button
                        title={recordingStatus === "recording" ? "Pause Recording" : "Resume Recording"}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 transform"
                        onClick={handlePauseCaptureClick}
                      >
                        <FontAwesomeIcon
                          icon={recordingStatus === "recording" ? faPause : faPlay}
                          className="h-5 w-5"
                        />
                      </button>
                    </>
                  )}
                  {isRecordingComplete && (
                    <button
                      title="Record Again"
                      className="bg-gray-500 hover:bg-gray-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 transform"
                      onClick={handleRevert}
                    >
                      <FontAwesomeIcon icon={faUndo} className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tagline Input */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Video Tagline
                </label>
                <div className="relative">
                  <input
                    value={videoTagline}
                    onChange={handleTaglineChange}
                    type="text"
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2.5 pr-16 transition-all duration-200"
                    placeholder="Describe your video (max 70 characters)..."
                    maxLength={70}
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-500 dark:text-gray-400">
                    {videoTagline.length}/70
                  </span>
                </div>
              </div>

              {/* Upload Option */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Or upload existing video:
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    accept="video/webm,video/mp4,video/quicktime,video/x-msvideo"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 hover:scale-105 transform"
                  >
                    Choose File
                  </label>
                  <span className="text-xs text-gray-500 dark:text-gray-400">WebM, MP4, MOV, AVI</span>
                </div>
              </div>
            </div>

            {/* Right Panel - Settings and Effects */}
            <div className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 space-y-4">
              {/* Device Settings */}
              <div>
                <button
                  onClick={() => setShowDeviceSettings(!showDeviceSettings)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm"
                >
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Device Settings</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${showDeviceSettings ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  className={`mt-2 space-y-3 overflow-hidden transition-all duration-300 ease-in-out ${showDeviceSettings ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Camera</label>
                    <select
                      value={selectedVideoDevice}
                      onChange={(e) => setSelectedVideoDevice(e.target.value)}
                      className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      {videoDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Microphone
                    </label>
                    <select
                      value={selectedAudioDevice}
                      onChange={(e) => setSelectedAudioDevice(e.target.value)}
                      className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      {audioDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Video Effects */}
              <div>
                <button
                  onClick={() => setShowEffects(!showEffects)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm"
                >
                  <div className="flex items-center">
                    <Settings2 className="h-4 w-4 mr-2" />
                    <span>Video Settings</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${showEffects ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  className={`mt-2 space-y-3 overflow-hidden transition-all duration-300 ease-in-out ${showEffects ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="space-y-3">
                    {/* Brightness */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Brightness: {effects.brightness}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={effects.brightness}
                        onChange={(e) => handleEffectChange("brightness", e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    {/* Contrast */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Contrast: {effects.contrast}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={effects.contrast}
                        onChange={(e) => handleEffectChange("contrast", e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    {/* Saturation */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Saturation: {effects.saturation}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={effects.saturation}
                        onChange={(e) => handleEffectChange("saturation", e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    {/* Blur */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Blur: {effects.blur}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={effects.blur}
                        onChange={(e) => handleEffectChange("blur", e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    {/* Grayscale */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Grayscale: {effects.grayscale}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={effects.grayscale}
                        onChange={(e) => handleEffectChange("grayscale", e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    {/* Sepia */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Sepia: {effects.sepia}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={effects.sepia}
                        onChange={(e) => handleEffectChange("sepia", e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    <button
                      onClick={resetEffects}
                      className="w-full px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-200"
                    >
                      Reset Effects
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {recordingStatus === "recording" && "Recording in progress..."}
              {recordingStatus === "paused" && "Recording paused"}
              {recordingStatus === "idle" && isRecordingComplete && "Recording complete"}
              {recordingStatus === "idle" && !isRecordingComplete && "Ready to record"}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 transform"
              >
                Cancel
              </button>
              <button
                title={
                  capturing
                    ? "Stop recording first"
                    : !videoTagline
                      ? "Please add a video tagline"
                      : !recordedChunks.length && !uploadedVideo
                        ? "Record or upload video first"
                        : "Save Recording"
                }
                className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 transform ${
                  capturing || (!recordedChunks.length && !uploadedVideo) || !videoTagline
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                }`}
                onClick={() => {
                  handleUpload()
                  handletaglineSave()
                }}
                disabled={capturing || (!recordedChunks.length && !uploadedVideo) || !videoTagline}
              >
                Save
              </button>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease-in-out;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          background: #2563eb;
        }

        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease-in-out;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          background: #2563eb;
        }

        .slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
        }
      `}</style>
    </div>
  )
}
