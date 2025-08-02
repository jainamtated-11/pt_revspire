import React, { useState, useEffect } from "react";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";

const VideoCarousel = ({ videos = [], viewer_id, baseURL }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const axiosInstance = useAxiosInstance();

  const fetchVideoData = async (videoId) => {
    try {
      const response = await axiosInstance.post(
        `/open-content`,
        {
          contentId: videoId,
          viewerId: viewer_id,
        },
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      const videoBlob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const videoUrl = URL.createObjectURL(videoBlob);

      return videoUrl;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };

  const [videoUrls, setVideoUrls] = useState([]);

  const fetchAllVideos = async () => {
    // console.log("fewtchAllVIdeos", videos);

    const videoIds = videos.map((video) => video.id);
    // console.log("Videos ids", videoIds);
    const videoPromises = videoIds.map((id) => fetchVideoData(id));
    // console.log("Vides promises ", videoPromises);
    const videoUrls = await Promise.all(videoPromises);
    // Update state with all video URLs
    setVideoUrls(videoUrls);
  };

  useEffect(() => {
    if (videos) {
      fetchAllVideos();
    }
  }, [videos]);

  const nextVideo = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + videos.length) % videos.length
    );
  };

  return (
    <div className="relative w-full max-w-lg rounded-lg">
      <div className="video-wrapper rounded-full ">
        <video
          key={videos[currentIndex]?.id}
          src={videoUrls[currentIndex]}
          controls
          className="h-36 w-80"
        />
      </div>
      <button
        onClick={prevVideo}
        className="absolute  top-1/2 transform -translate-y-1/2  text-white px-4 py-2 rounded-full"
      >
        <FontAwesomeIcon
          icon={faAngleLeft}
          style={{ color: "white", fontSize: "1.2rem" }}
          className="ml-2 mr-3 mt-1"
        />
      </button>
      <button
        onClick={nextVideo}
        className="absolute right-0 top-1/2 transform -translate-y-1/2  text-white px-4 py-2 rounded-full"
      >
        <FontAwesomeIcon
          icon={faAngleRight}
          style={{ color: "white", fontSize: "1.2rem" }}
          className="ml-2 mr-3 mt-1"
        />
      </button>
    </div>
  );
};

export default VideoCarousel;
