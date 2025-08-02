function StandardLayout({
  backgroundImageData,
  toggleFullscreen,
  pitchSections,
  blobs,
  pitch,
  handler,
  currentSection,
}) {


  const renderContent = (content, blobUrl) => {
    switch (content.content_mimetype) {
      case "video/mp4":
        return (
          <video
            id="video"
            src={blobUrl}
            controls
            className="h-80 w-72 rounded-t-xl cursor-pointer"
          />
        );
      case "application/pdf":
        return (
          <div className="h-80 w-72 rounded-t-xl cursor-pointer">
            <PdfViewer pdfUrl={blobUrl} />
          </div>
        );
      case "image/jpeg":
      case "image/jpg":
      case "image/png":
        return (
          <div className="h-80 w-72 rounded-t-xl cursor-pointer">
            <img
              src={blobUrl}
              alt={content.tagline}
              className="h-full w-full object-cover rounded-t-xl"
            />
          </div>
        );
      case "application/vnd":
      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return (
          <div
            onClick={() => toggleFullscreen(blobUrl)}
            className="h-80 w-72 rounded-t-xl cursor-pointer flex items-center justify-center"
          >
            {<MemoizedDocViewer blobUrl={blobUrl} />}
          </div>
        );
      default:
        return (
          <div className="h-80 w-72 rounded-t-xl bg-gray-300 flex items-center justify-center">
            <p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#000000"
                className="h-64 w-72"
              >
                <g>
                  <g id="_x38_7_36_">
                    <g>
                      <path d="M60.859,112.533c-6.853,0-6.853,10.646,0,10.646c27.294,0,54.583,0,81.875,0c6.865,0,6.865-10.646,0-10.646     C115.442,112.533,88.153,112.533,60.859,112.533z" />
                      <path d="M142.734,137.704c-27.292,0-54.581,0-81.875,0c-6.853,0-6.853,10.634,0,10.634c27.294,0,54.583,0,81.875,0     C149.6,148.338,149.6,137.704,142.734,137.704z" />
                      <path d="M142.734,161.018c-27.292,0-54.581,0-81.875,0c-6.853,0-6.853,10.633,0,10.633c27.294,0,54.583,0,81.875,0     C149.6,171.65,149.6,161.018,142.734,161.018z" />
                      <path d="M142.734,186.184c-27.292,0-54.581,0-81.875,0c-6.853,0-6.853,10.629,0,10.629c27.294,0,54.583,0,81.875,0     C149.6,196.812,149.6,186.184,142.734,186.184z" />
                      <path d="M141.17,209.934c-27.302,0-54.601,0-81.89,0c-6.848,0-6.848,10.633,0,10.633c27.289,0,54.588,0,81.89,0     C148.015,220.566,148.015,209.934,141.17,209.934z" />
                      <path d="M25.362,58.087V256.61h152.877V85.63l-28.406-27.543H25.362z M165.026,243.393H38.585V71.305h104.443v20.97h21.988     v151.118H165.026z" />
                      <polygon points="51.204,27.667 51.204,50.645 64.427,50.645 64.427,40.88 168.875,40.88 168.875,61.85 190.868,61.85      190.868,212.971 185.059,212.971 185.059,226.188 204.086,226.188 204.086,55.205 175.68,27.667    " />
                      <polygon points="202.837,0 78.363,0 78.363,22.983 91.581,22.983 91.581,13.218 196.032,13.218 196.032,34.188 218.025,34.188      218.025,185.306 212.221,185.306 212.221,198.523 231.248,198.523 231.248,27.543    " />
                    </g>
                  </g>
                </g>
              </svg>
            </p>
          </div>
        );
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center bg-gray-100 overflow-x-hidden">
        <div
          className="bg-cover bg-center w-full h-72  relative flex  items-center"
          style={{
            backgroundImage: `url(${
              backgroundImageData && backgroundImageData
            })`,
          }}
        >
          <div className="absolute flex w-full ml-80">
            <div className="flex justify-center items-center">
              <div className="bg-black bg-opacity-50 p-4 rounded-2xl">
                <h1 className="text-4xl font-bold text-white px-4 lg:px-6 py-2.5 mx-auto">
                  {pitch?.title}
                </h1>
                <p className="text-xl text-white px-4 lg:px-6 py-2.5 mx-auto">
                  {pitch?.headline}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside
        class="fixed top-14 pt-1 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
      >
        <div class="h-full px-3 py-4 overflow-y-auto  bg-gray-50 dark:bg-gray-800">
          <ul class="space-y-2 font-bold">
            {
              pitchSections.map((section, index)=>(
                <li
                onClick={() => {
                  handler(index);
                }}
                >
              <div
                class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
             
                <span class="ms-3">{section.name}</span>
              </div>
            </li>
              ))
            }
         
          </ul>
        </div>
      </aside>

      {pitchSections?.map((section, index) => (
        <>
          {currentSection == index + 1 && (
            <div key={section.id} className="mx-16">
              <div className="w-fit mx-auto grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 justify-items-center justify-center gap-y-20 gap-x-14 mt-10 mb-5">
                {section.contents.map((content) => {
                  if (!blobs || !blobs.length) return null;

                  const blobInfo = blobs.find(
                    (blob) => blob.content_id === content.content_id
                  );
                  if (!blobInfo) return null;

                  const blobUrl = blobInfo.blobUrl;
                  return (
                    <div
                      key={content.id}
                      onClick={() => {
                        toggleFullscreen(blobUrl);
                      }}
                      className="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl relative"
                    >
                      {renderContent(content, blobUrl)}
                      <div className="px-4 py-3 relative">
                        <h3 className="text-lg font-bold text-black truncate block capitalize">
                          {content.tagline}
                        </h3>
                        <button
                          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                          onClick={() => console.log("start", blobUrl)}
                        >
                          <FontAwesomeIcon icon={faExpand} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ))}
    </div>
  );
}

