import { BsFileEarmarkPdf, BsFiletypeGif, BsFiletypePpt } from "react-icons/bs";
import { FiImage, FiVideo } from "react-icons/fi";

export const ALLOWED_TYPES = [
    {
      value: "pdf",
      label: "PDF",
      icon: BsFileEarmarkPdf,
      description: "Best for printing",
    },
    {
      value: "jpg",
      label: "JPG",
      icon: FiImage,
      description: "Best for sharing",
    },
    {
      value: "png",
      label: "PNG",
      icon: FiImage,
      description: "Best for complex images, illustrations",
    },
    {
      value: "pptx",
      label: "PPTX",
      icon: BsFiletypePpt,
      description: "Microsoft PowerPoint document",
    },
    {
      value: "gif",
      label: "GIF",
      icon: BsFiletypeGif,
      description: "Short clip, no sound",
    },
    {
      value: "mp4",
      label: "MP4 Video",
      icon: FiVideo,
      description: "High quality video",
    },
  ];
  
  export const ALLOWED_SIZED = [
    { value: "a4", label: "A4" },
    { value: "a3", label: "A3" },
    { value: "letter", label: "Letter" },
    { value: "legal", label: "Legal" },
  ];
  
  export const ALLOWED_QUALITIES = [
    { value: "horizontal_480p", label: "Horizontal 480" },
    { value: "horizontal_720p", label: "Horizontal 720" },
    { value: "horizontal_1080p", label: "Horizontal 1080" },
    { value: "horizontal_4k", label: "Horizontal 4K" },
    { value: "vertical_480p", label: "Vertical 480" },
    { value: "vertical_720p", label: "Vertical 720" },
    { value: "vertical_1080p", label: "Vertical 1080" },
    { value: "vertical_4k", label: "Vertical 4K" },
  ];
  