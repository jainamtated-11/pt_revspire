import { Grid } from "react-loader-spinner";

const LoadingSpinner = () => {
  return (
    // <div
    //   role="status"
    //   className="p-4 space-y-4 border border-gray-200 divide-y divide-gray-200 rounded shadow animate-pulse md:p-6"
    // >
    //   <div className="flex items-center justify-between">
    //     <div>
    //       <div className="h-2.5 bg-sky-800 rounded-full w-24 mb-2.5"></div>
    //       <div className="w-32 h-2 bg-gray-200 rounded-full"></div>
    //     </div>
    //     <div className="h-2.5 bg-sky-800 rounded-full w-12"></div>
    //   </div>
    //   <div className="flex items-center justify-between pt-4">
    //     <div>
    //       <div className="h-2.5 bg-sky-800 rounded-full w-24 mb-2.5"></div>
    //       <div className="w-32 h-2 bg-gray-200 rounded-full"></div>
    //     </div>
    //     <div className="h-2.5 bg-sky-800 rounded-full w-12"></div>
    //   </div>
    //   <div className="flex items-center justify-between pt-4">
    //     <div>
    //       <div className="h-2.5 bg-sky-800 rounded-full w-24 mb-2.5"></div>
    //       <div className="w-32 h-2 bg-gray-200 rounded-full"></div>
    //     </div>
    //     <div className="h-2.5 bg-sky-800 rounded-full w-12"></div>
    //   </div>
    //   <div className="flex items-center justify-between pt-4">
    //     <div>
    //       <div className="h-2.5 bg-sky-800 rounded-full w-24 mb-2.5"></div>
    //       <div className="w-32 h-2 bg-gray-200 rounded-full"></div>
    //     </div>
    //     <div className="h-2.5 bg-sky-800 rounded-full w-12"></div>
    //   </div>
    //   <div className="flex items-center justify-between pt-4">
    //     <div>
    //       <div className="h-2.5 bg-sky-800 rounded-full w-24 mb-2.5"></div>
    //       <div className="w-32 h-2 bg-gray-200 rounded-full"></div>
    //     </div>
    //     <div className="h-2.5 bg-sky-800 rounded-full w-12"></div>
    //   </div>
    // </div>
  //   <div className="flex justify-center items-center h-screen w-screen  ">
  //   <div className="flex justify-center items-center mr-20 mb-48">
  //     <Grid
  //       visible={true}
  //       height={40}
  //       width={40}
  //       color="#075985"
  //       ariaLabel="grid-loading"
  //       radius={12.5}
  //     />
  //   </div>
  // </div>
  <div className="fixed inset-0 flex items-center justify-center z-50">
  <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
  <div className="bg-transparent p-6 rounded-md z-50 w-auto">
    <Grid
      visible={true}
      height="40"
      width="40"
      color="#075985"
      ariaLabel="grid-loading"
      radius="12.5"
      wrapperStyle={{}}
      wrapperClass="grid-wrapper"
    />
  </div>
</div>

  );
};

export default LoadingSpinner;
