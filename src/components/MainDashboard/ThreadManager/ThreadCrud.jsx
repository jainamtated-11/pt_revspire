import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import FilterModal from "../../../utility/FilterModal.jsx";
import { useSelector, useDispatch } from "react-redux";
import useCheckUserLicense from "../../../Services/checkUserLicense.jsx";
import useCheckFrontendPermission from "../../../Services/checkFrontendPermission.jsx";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  SetFilterLoading,
  SetFilterApplied,
  SetFilterAppliedOn,
} from "../../../features/filter/fliterSlice.js";
import SearchBar from "../../../utility/SearchBar.jsx";

export default function PitchStreamCRUD() {
 
  return (
    <div className="container w-full flex gap-4 items-center justify-end mx-auto pt-3">
    
      <div className="flex flex-row flex-nowrap  py-2 px-4">
        <SearchBar applySearch="thread" />
      </div>
    </div>
  );
}
