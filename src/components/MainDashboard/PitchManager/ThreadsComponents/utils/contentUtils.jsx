import React from 'react';
import { 
  FaRegFilePdf, 
  FaRegFileExcel, 
  FaRegFileWord 
} from 'react-icons/fa';
import { IoImagesOutline } from 'react-icons/io5';
import { BsFileEarmarkText, BsFiletypePptx } from 'react-icons/bs';
import { GrDocumentPpt } from 'react-icons/gr';
import { LuFileSpreadsheet } from 'react-icons/lu';
import { TbFileTypeDocx } from 'react-icons/tb';
import { FiLink } from 'react-icons/fi';
import { CiFileOn } from 'react-icons/ci';
import { MdOutlineSlowMotionVideo } from 'react-icons/md';
import { TfiLayoutMediaOverlay } from 'react-icons/tfi';
import { FcFolder } from 'react-icons/fc';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast';

/**
 * Get the appropriate icon for a content type
 * @param {Object} item - The content item
 * @param {string} className - Additional class name for styling
 * @returns {JSX.Element} The icon component
 */
export const getIcon = (item, className) => {
  const mimeType = item.mimetype || item.content_mimetype;
  
  switch (mimeType) {
    case 'application/pdf':
      return (
        <FaRegFilePdf
          className={twMerge('text-gray-500 w-8 h-8 flex-shrink-0', className)}
          style={{ width: '20px', height: '20px' }}
        />
      );
    case 'image/jpeg':
    case 'image/png':
    case 'image/jpg':
    case 'image/gif':
    case 'image/webp':
      return (
        <IoImagesOutline
          className={twMerge('text-gray-500 w-5 h-5 flex-shrink-0', className)}
          style={{ width: '20px' }}
        />
      );
    case 'application/vnd.ms-excel':
      return (
        <FaRegFileExcel
          className={twMerge('text-gray-500 w-5 h-5 flex-shrink-0', className)}
          style={{ width: '20px' }}
        />
      );
    case 'application/msword':
      return (
        <FaRegFileWord
          className={twMerge('text-gray-500 w-5 h-5 flex-shrink-0', className)}
          style={{ width: '20px' }}
        />
      );
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return (
        <BsFiletypePptx
          className={twMerge('text-gray-500 w-5 h-5 flex-shrink-0', className)}
          style={{ width: '20px' }}
        />
      );
    case 'application/vnd.ms-powerpoint':
      return (
        <GrDocumentPpt
          className={twMerge('text-gray-500 w-5 h-5 flex-shrink-0', className)}
          style={{ width: '20px' }}
        />
      );
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return (
        <LuFileSpreadsheet
          className={twMerge('text-gray-500 w-5 h-5 flex-shrink-0', className)}
          style={{ width: '20px' }}
        />
      );
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return (
        <TbFileTypeDocx
          className={twMerge('text-gray-500 w-5 h-5 flex-shrink-0', className)}
          style={{ width: '20px' }}
        />
      );
    case 'application/url':
      return (
        <FiLink 
          className={twMerge('text-gray-500 w-5 h-5 flex-shrink-0', className)} 
          style={{ width: '20px' }} 
        />
      );
    case 'application/octet-stream':
      return (
        <CiFileOn 
          className={twMerge('text-gray-500 w-5 h-5 flex-shrink-0', className)} 
          style={{ width: '20px' }} 
        />
      );
    case 'video/mp4':
      return (
        <MdOutlineSlowMotionVideo
          className={twMerge('text-gray-500 w-5 h-5 flex-shrink-0', className)}
          style={{ width: '20px' }}
        />
      );
    case 'application/x-javascript':
      return (
        <TfiLayoutMediaOverlay
          className={twMerge('text-gray-500 w-5 h-5 flex-shrink-0', className)}
          style={{ width: '20px' }}
        />
      );
    case 'application/vnd.ms-visio.drawing':
      return (
        <BsFileEarmarkText
          className={twMerge('text-gray-500 w-5 h-5 flex-shrink-0', className)}
          style={{ width: '20px' }}
        />
      );
    default:
      return <FcFolder className="text-yellow-300 w-5 h-5 flex-shrink-0" style={{ width: '20px' }} />;
  }
};

/**
 * Handle content click and open the appropriate viewer
 * @param {Object} contentId - The content ID
 * @param {Function} fetchBlobData - Function to fetch blob data
 * @param {Object} pitchData - The pitch data object
 * @param {Function} setFullscreenBlobUrl - Function to set the fullscreen blob URL
 * @param {Function} setBlobUrl - Function to set the blob URL
 * @param {Function} setCurrentMimeType - Function to set the current MIME type
 * @param {Function} handleOnClickContent - Function to handle content click
 * @returns {Promise<void>}
 */
export const handleContentClick = async (
  contentId,
  fetchBlobData,
  pitchData,
  setFullscreenBlobUrl,
  setBlobUrl,
  setCurrentMimeType,
  handleOnClickContent
) => {
  // Show a toast notification
  const loadingToastId = toast.loading('Opening Content');
  try {
    // Find the content based on pitch_content ID
    const foundContent = pitchData.pitchSections
      .flatMap((section) => section.contents)
      .find((content) => content.content_id === contentId);

    if (!foundContent) {
      throw new Error('Content not found');
    }

    setCurrentMimeType(foundContent.content_mimetype);

    if (
      foundContent.content_source?.toLowerCase() === 'youtube' ||
      foundContent.content_source?.toLowerCase() === 'vimeo' ||
      foundContent.content_source?.toLowerCase() === 'public url'
    ) {
      // Directly use the content_link for video URLs
      handleOnClickContent(
        foundContent,
        foundContent.content_link,
        'application/url',
        foundContent.tagline
      );
    } else {
      // Fetch the blob URL for other content types
      const blobUrl = await fetchBlobData(
        contentId,
        foundContent.content_mimetype
      );
      // Check if blobUrl is available
      if (blobUrl) {
        // Call handleOnClickContent with the correct parameters
        setFullscreenBlobUrl(blobUrl);
        setBlobUrl(blobUrl);
        handleOnClickContent(
          foundContent,
          blobUrl,
          foundContent.content_mimetype,
          foundContent.tagline
        );
      } else {
        console.error('Blob URL not available');
        toast.error('Failed to fetch content, Please try again!');
      }
    }
  } catch (error) {
    console.error(error);
    toast.error('An error occurred while opening content.');
  } finally {
    // Dismiss the loading toast
    toast.dismiss(loadingToastId);
    setBlobUrl('');
    setCurrentMimeType('');
  }
};
