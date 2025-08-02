import React from "react";
import { FolderOpen } from 'lucide-react';

const EmptyFolderComponent = () => {
  return (
    <tr>
      <td colSpan="100%" className="h-[28rem] pb-4">
        <div className="flex flex-col justify-center items-center text-gray-400 h-full">
          <FolderOpen size={64} className="mb-4" />
          <h3 className="text-xl font-semibold mb-2">This table is empty</h3>
          <p className="text-sm">There are no items to display.</p>
        </div>
      </td>
    </tr>
  );
};

export default EmptyFolderComponent;
