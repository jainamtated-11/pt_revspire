import React, { useEffect, useState } from 'react'
import { GlobalContext } from '../../../context/GlobalState'
import { useContext } from 'react';
import useAxiosInstance from '../../../Services/useAxiosInstance'
import ResizableTable from '../../../utility/CustomComponents/ResizableTable';



function Storage() {
  const [data, setData] = useState([]);
  const [storage, setStorage] = useState([]);
  const [pitchContent, setPitchContent] = useState([]);
  const [mineType, setMineType] = useState([]);
  const [source, setSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const axiosInstance = useAxiosInstance();
  const [sortConfig , setSortConfig] = useState({key:"Updated At",direction:"desc"});
  const { viewer_id, baseURL, selectedOrganisationId,organisationDetails } =
    useContext(GlobalContext);

    const organisation_id = organisationDetails.organisation.id;

  useEffect(() => {
    const fetchStorage = async() => {
      try {
        const response = await axiosInstance.post(`storage/get-content-summary`,{
          viewer_id: viewer_id,
          organisation_id: organisation_id,
        })
        
        if(response.data.success){
          console.log(response.data)
          setData(response.data)
          setStorage(response.data.size_by_created_by);
          setPitchContent(response.data.size_by_direct_pitch_content);
          setMineType(response.data.size_by_mimetype);
          setSource(response.data.size_by_source
          )
          setLoading(false);

        }
          
        
      } catch (error) {
        console.error("Error while fetching storage")
        
      }
    }
    fetchStorage();
  },[viewer_id])

  const columnsHeading = [
    "Consumed By",
    "Size (MB)",
   
  ];

  const rows = [
    "key",
    "size_mb",
   
  ];

  const pitchHeading = [
    "Direct Pitch Content",
    "Size (MB)",
   
  ];
  const mineTypeHeading = [
    "File Type",
    "Size (MB)",
   
  ];
  const souceTypeHeading = [
    "Source",
    "Size (MB)",
   
  ];

console.log(storage);
console.log(pitchContent);
console.log(mineType);
console.log(source);

return (
  <div className="w-full flex gap-2 flex-col px-8 py-2">
    <div className="h-[520px]  overflow-y-auto  p-4"> {/* Scrollable Container */}
      <div className="shadow-md border-[1px] flex flex-col justify-center max-w-[250px] p-4 rounded-md mb-2">
        <h1 className="font-bold text-xl">Storage Details</h1>
        <p>
          Purchased Storage: <span>{data.purchased_storage_gb} GB</span>
        </p>
        <p>
          Total Consumed: <span>{data.total_size_gb} GB</span>
        </p>
      </div>
      
     <div className='mb-2'>
       <ResizableTable
        data={storage}
        columnsHeading={columnsHeading}
        rowKeys={rows}
        loading={loading}
        noCheckbox={true}
        heightNotFixed = {true}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
      />
     </div>
      
     <div className='mb-2'>
     <ResizableTable
        data={pitchContent}
        columnsHeading={pitchHeading}
        rowKeys={rows}
        loading={loading}
        noCheckbox={true}
        heightNotFixed = {true}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
      />
     </div>
      
     <div className='mb-2'>
     <ResizableTable
        data={mineType}
        columnsHeading={mineTypeHeading}
        rowKeys={rows}
        loading={loading}
        noCheckbox={true}
        heightNotFixed = {true}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
      />
    </div>
      
      <ResizableTable
        data={source}
        columnsHeading={souceTypeHeading}
        rowKeys={rows}
        loading={loading}
        noCheckbox={true}
        heightNotFixed = {true}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
      />
    </div>
  </div>
);

}

export default Storage