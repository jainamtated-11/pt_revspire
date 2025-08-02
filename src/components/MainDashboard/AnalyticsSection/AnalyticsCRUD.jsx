import React from "react";
import SearchBar from "../../../utility/SearchBar.jsx"

export default function AnalyticsCrud() {
    return (
        <div className="container w-full flex gap-4 items-center justify-end mx-auto pt-3">
           
            <div className="flex flex-row flex-nowrap py-2 px-4">
                <SearchBar applySearch="analytics" />
            </div>
        </div>
    );
}