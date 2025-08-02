import React, { useState } from "react";



function RenameLayoutDialog( { isOpen, onClose, onSave }) {
  const [newName, setNewName] = useState("");

  const handleSave = () => {
    onSave(newName);
    setNewName("");
  };
  return (
    <>
      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={onClose}>&times;</span>
            <h2>Rename Layout</h2>
            <input 
              type="text" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              placeholder="Enter new name" 
            />
            <div className="modal-buttons">
              <button onClick={handleSave}>Save</button>
              <button onClick={onClose}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default RenameLayoutDialog;
