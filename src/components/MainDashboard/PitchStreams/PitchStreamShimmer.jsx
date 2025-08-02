

const PitchStreamShimmer = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50 transition-opacity duration-300">
      <div className="relative bg-white rounded-lg shadow w-[90%] md:w-[70%] lg:w-[45%] max-h-[90vh] flex flex-col transition-transform duration-300 ease-in-out">
        <div className="sticky top-0 bg-white border-b px-3 md:px-6 py-4 shadow-md">
          <div className="h-8 bg-gray-200 rounded-md animate-pulse w-48"></div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center mb-4">
            <div className="w-24 h-5 bg-gray-200 rounded-md animate-pulse mb-2 md:mb-0"></div>
            <div className="flex-1 h-9 bg-gray-200 rounded-md animate-pulse md:ml-2"></div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center mb-4">
            <div className="w-24 h-5 bg-gray-200 rounded-md animate-pulse mb-2 md:mb-0"></div>
            <div className="flex-1 h-9 bg-gray-200 rounded-md animate-pulse md:ml-2"></div>
          </div>

          <div className="mb-4">
            <div className="w-32 h-9 bg-gray-200 rounded-md animate-pulse"></div>
          </div>

          <div className="border-2 rounded-lg p-3 h-[calc(100vh-400px)]">
            {[1, 2, 3].map((item) => (
              <div key={item} className="mb-4">
                <div className="flex items-center mb-2">
                  <div className="w-32 h-5 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="flex-1 h-9 bg-gray-200 rounded-md animate-pulse mx-2"></div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
                <div className="ml-8 space-y-2">
                  {[1, 2].map((content) => (
                    <div key={content} className="flex items-center">
                      <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="flex-1 h-8 bg-gray-200 rounded-md animate-pulse mx-2"></div>
                      <div className="flex gap-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-md animate-pulse"></div>
                        <div className="w-6 h-6 bg-gray-200 rounded-md animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t px-6 py-4 bg-white">
          <div className="flex justify-end space-x-4">
            <div className="w-20 h-9 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="w-20 h-9 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PitchStreamShimmer;
