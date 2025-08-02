import React from "react";

const EmptySection = ({ title, description, icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full mt-4 p-8 text-center bg-white rounded-xl">
      <div className="mb-4 p-4 bg-blue-50 rounded-full">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mb-4">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default EmptySection;
