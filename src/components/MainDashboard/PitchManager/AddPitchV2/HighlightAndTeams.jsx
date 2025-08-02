import React, { useState } from "react";
import VideoRecorder from "../VideoRecorder";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  addHighlightVideo,
  addSelectedGroups,
  addSelectedUsers,
  removeHighlightVideo,
  updateHighlightVideoTagline,
} from "../../../../features/pitch/addPitchSlice";
import EmptySection from "../EmptySection";
import AddPitchTeams from "../AddPitchTeams";
import { TbEdit } from "react-icons/tb";
import { MdSlowMotionVideo, MdRemoveCircleOutline } from "react-icons/md";
import HighlightPreview from "../HighlightPreview";
import { faUsersSlash } from "@fortawesome/free-solid-svg-icons";

function HighlightAndTeams() {
  const dispatch = useDispatch();
  const pitchState = useSelector((state) => state.addPitchSlice);
  const [isHighlightVideoModalOpen, setIsHighlightModalOpen] = useState(false);
  const [isAddTeamsModalOpen, setIsAddTeamsModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const handleHighlightVideoFiles = (file, videoTagline) => {
    const videoUrl = URL.createObjectURL(file);
    dispatch(
      addHighlightVideo({
        file: file,
        tagline: videoTagline,
        url: videoUrl,
      })
    );
  };

  const handleTaglineChange = (index, newTagline) => {
    dispatch(
      updateHighlightVideoTagline({
        index,
        tagline: newTagline,
      })
    );
  };

  const handleVideoDelete = (index) => {
    dispatch(removeHighlightVideo(index));
  };

  return (
    <div className="h-[98%] overflow-y-auto  p-2">
      {isHighlightVideoModalOpen && (
        <VideoRecorder
          onCancel={() => setIsHighlightModalOpen(false)}
          highlightVideoFiles={handleHighlightVideoFiles}
        />
      )}

      {isAddTeamsModalOpen && (
        <AddPitchTeams
          onCancel={() => setIsAddTeamsModalOpen(false)}
          selectedUsers={pitchState.selectedUsers}
          selectedGroups={pitchState.selectedGroups}
          setSelectedUsers={(users) => dispatch(addSelectedUsers(users))}
          setSelectedGroups={(groups) => dispatch(addSelectedGroups(groups))}
        />
      )}

      <div className="flex flex-row mb-2">
        <button
          className="border-2 rounded-md px-4 py-1 btn-secondary"
          onClick={() => setIsHighlightModalOpen(true)}
        >
          Add Highlight
        </button>
        <button
          className="border-2 rounded-md px-4 py-1 btn-secondary mx-2"
          onClick={() => setIsAddTeamsModalOpen(true)}
        >
          Add Teams
        </button>
      </div>

      {pitchState.highlightVideos.length === 0 &&
        pitchState.selectedUsers.length === 0 &&
        pitchState.selectedGroups.length === 0 && (
          <EmptySection 
                title="No Highlight or Teams Added yet"
                description="Get started by adding your team mmeebrs and star videos"
                icon={<FontAwesomeIcon icon={faUsersSlash} className="text-2xl text-secondary" />}
          />
        )}
      <div className="">
        {(pitchState.highlightVideos.length > 0 ||
          pitchState.selectedUsers.length > 0 ||
          pitchState.selectedGroups.length > 0) && (
          <div className="space-y-1">
            {/* Render Pitch Teams row */}
            {(pitchState.selectedUsers.length > 0 ||
              pitchState.selectedGroups.length > 0) && (
              <div className="flex border bg-neutral-100 border-neutral-300 items-center rounded-md gap-3 px-4 py-0.5 justify-between w-full">
                <div className="flex items-center">
                  <span className="border-neutral-400 flex border size-[20px] justify-center items-center text-xs rounded-full bg-primary text-neutral-700 font-bold"></span>
                  <label className="w-30 ml-6 truncate text-sm font-medium mx-4 text-gray-900 dark:text-white">
                    Pitch Teams :
                  </label>
                  <span>
                    {pitchState.selectedGroups.length > 0 &&
                      pitchState.selectedUsers.length > 0 && (
                        <>
                          {pitchState.selectedGroups.length}{" "}
                          {pitchState.selectedGroups.length > 1
                            ? "Groups"
                            : "Group"}{" "}
                          + {pitchState.selectedUsers.length}{" "}
                          {pitchState.selectedUsers.length > 1
                            ? "Users"
                            : "User"}
                        </>
                      )}
                    {pitchState.selectedGroups.length > 0 &&
                      pitchState.selectedUsers.length === 0 && (
                        <>
                          {pitchState.selectedGroups.length}{" "}
                          {pitchState.selectedGroups.length > 1
                            ? "Groups"
                            : "Group"}
                        </>
                      )}
                    {pitchState.selectedGroups.length === 0 &&
                      pitchState.selectedUsers.length > 0 && (
                        <>
                          {pitchState.selectedUsers.length}{" "}
                          {pitchState.selectedUsers.length > 1
                            ? "Users"
                            : "User"}
                        </>
                      )}
                  </span>
                </div>
                <span className="relative">
                  <button
                    className="px-2 text-cyan-600 hover:text-cyan-700"
                    onClick={() => setIsAddTeamsModalOpen(true)}
                  >
                    <TbEdit />
                  </button>
                </span>
              </div>
            )}

            {/* Render Highlight Videos row */}
            {pitchState.highlightVideos.map((item, index) => (
              <div key={index}>
                <div className="flex border bg-neutral-100 border-neutral-300 items-center rounded-md gap-3 px-4 py-0.5 justify-between w-full">
                  <div className="flex items-center">
                    <span className="border-neutral-400 flex border size-[20px] justify-center items-center text-xs rounded-full bg-neutral-50 text-neutral-700 font-bold">
                      {index + 1}
                    </span>
                    <label className="w-30 ml-6 truncate text-sm font-medium mx-4 text-gray-900  dark:text-white">
                      Highlight Video :
                    </label>
                    <span className="w-25 truncate">{item.tagline}</span>
                  </div>
                  <span className="relative">
                    <button
                      className="px-2 text-cyan-600 hover:text-cyan-700"
                      onClick={() => {
                        setPreviewIndex(index);
                        setShowPreview(true);
                      }}
                    >
                      <MdSlowMotionVideo />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleVideoDelete(index)}
                    >
                      <MdRemoveCircleOutline />
                    </button>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {showPreview && pitchState.highlightVideos[previewIndex]?.file && (
          <HighlightPreview
            highlightVideos={pitchState.highlightVideos}
            previewIndex={previewIndex}
            setShowPreview={setShowPreview}
            onTaglineUpdate={(previewIndex, editedTagline) => {
              handleTaglineChange(previewIndex, editedTagline);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default HighlightAndTeams;
