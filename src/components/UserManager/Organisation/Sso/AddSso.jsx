import React from "react";
import Button from "../../../ui/Button";
import GlobalAddButton from "../../../../utility/CustomComponents/GlobalAddButton";

function AddSSO({ onClick }) {
  return (
    <>
            <div className="">
                <GlobalAddButton onClick={onClick} />
            </div>
    </>
  );
}

export default AddSSO;
