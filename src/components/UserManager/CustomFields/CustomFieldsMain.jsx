import React, { useState, useEffect, useContext } from 'react';
import { FaDesktop } from "react-icons/fa";
import PitchCustomFields from './PitchCustomFields';
import useAxiosInstance from '../../../Services/useAxiosInstance';
import { GlobalContext } from '../../../context/GlobalState';
import { useCookies } from 'react-cookie';

// Shimmer effect component
const ShimmerEffect = () => {
  return (
    <div className="animate-pulse mt-[50px]">
      <div className="mb-4  dark:border-gray-700">
        <div className="flex flex-wrap -mb-px">
          {[1, 2, 3,4,5,6,7,8].map((item) => (
            <div key={item} className="me-2">
              <div className="h-10 w-24 bg-gray-200 rounded-t-lg"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg h-[500px]">
        <div className="p-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4,5,6].map((item) => (
              <div key={item} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomFieldsMain = () => {
  const { viewer_id } = useContext(GlobalContext);
  const cookies = useCookies("userData");
  const organisation_id = cookies.userData?.organisation?.id;
  const [tables, setTables] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const axiosInstance = useAxiosInstance();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axiosInstance.post('/custom-field/get-custom-field-tables', {
        viewer_id,
        organisation_id,
      });
      setTables(response.data.tables);
      if (response.data.tables.length > 0) {
        setActiveTab(response.data.tables[0].tablename);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTabName = (name) => {
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getTabIcon = (tabName) => {
    switch (tabName.toLowerCase()) {
      case 'pitch':
        return <FaDesktop className="w-4 h-4" />;
      default:
        return <FaDesktop className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    // return (
    //   <div className="flex items-center justify-center h-screen">
    //     <LuLoaderCircle className="w-8 h-8 animate-spin text-gray-400" />
    //   </div>
    // );
    return <ShimmerEffect />;
  }

  return (
    <div className="p-4 bg-white rounded-xl">
      <div className="mb-4  dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
          {tables.map((table) => (
            <li key={table.id} className="me-2" role="presentation">
              <button
                className={`flex items-center gap-1 p-4 border-b-2 rounded-t-lg ${
                  activeTab === table.tablename
                    ? 'border-sky-800 text-sky-800'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(table.tablename)}
                role="tab"
                aria-selected={activeTab === table.tablename}
              >
                {getTabIcon(table.tablename)}
                {formatTabName(table.tablename)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {activeTab === 'pitch' && <PitchCustomFields />}
      {/* Add more tab components here as needed */}
    </div>
  );
};

export default CustomFieldsMain;
