import { configureStore } from "@reduxjs/toolkit";
import pitchReducer from "../features/pitch/pitchSlice";
import tagReducer from "../features/tag/tagSlice";
import filterReducer from "../features/filter/fliterSlice";
import contentReducer from "../features/content/contentSlice";
import breadcrumbReducer from "../features/breadcrumbs/breadcrumbSlice";
import layoutReducer from "../features/layout/layoutSlice";
import groupReducer from "../features/group/groupSlice";
import apiTokenReducer from "../features/ApiToken/apiTokenSlice";
import connectionsReducer from "../features/connections/connectionsSlice";
import searchReducer from "../features/search/searchSlice";
import threadReducer from "../features/thread/threadSlice";
import pitchStreamsReducer from "../features/pitchStreams/pitchStreamsSlice";
import addPitchSliceReducer from "../features/pitch/addPitchSlice";
import editPitchSliceReducer from "../features/pitch/editPitchSlice";
import roleReducer from "../features/role/roleSlice";
import dsrReducer from "../features/dsr/dsrSlice";
import addPitchStreamReducer from "../features/pitchStreams/addPitchStreamSlice";
import editPitchStreamReducer from "../features/pitchStreams/editPitchStreamSlice";
import dataEnrichmentReducer from "../features/dataEnrichment/dataEnrichmentSlice";
import pitchFeaturesSlice from "../features/pitch/pitchFeaturesSlice";

export const store = configureStore({
  reducer: {
    pitches: pitchReducer,
    pitchStreams: pitchStreamsReducer,
    layouts: layoutReducer,
    groups: groupReducer,
    filter: filterReducer,
    tags: tagReducer,
    contents: contentReducer,
    breadcrumbs: breadcrumbReducer,
    apiTokens: apiTokenReducer,
    connections: connectionsReducer,
    search: searchReducer,
    threads: threadReducer,
    roles: roleReducer,
    dsr: dsrReducer,

    addPitchSlice: addPitchSliceReducer,
    editPitchSlice: editPitchSliceReducer,
    pitchFeaturesSlice: pitchFeaturesSlice,
    addpitchStreamSlice: addPitchStreamReducer,
    editPitchStreamSlice: editPitchStreamReducer,
    dataEnrichment: dataEnrichmentReducer,
  },
});
