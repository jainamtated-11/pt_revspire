import { useContext, useEffect, useRef, useState } from "react";
import { X, Newspaper, ExternalLink } from "lucide-react";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import { GlobalContext } from "../../../context/GlobalState";
import { LuLoaderCircle } from "react-icons/lu";
import { format } from 'date-fns';

const NewsDropdown = ({
  isOpen,
  onClose,
  pitchData,
}) => {
  const axiosInstance = useAxiosInstance();
  const { viewer_id } = useContext(GlobalContext);
  const sidebarRef = useRef();

  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingPhrase, setLoadingPhrase] = useState("Collecting data from sources...");

  const fetchNews = async () => {
    if (!pitchData) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await axiosInstance.post("/analyze-company-news", {
        pitch_id: pitchData?.pitch?.id,
        viewer_id,
      });
      setNewsData(data);
    } catch (err) {
      setError("Failed to fetch news data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchNews();
  }, [isOpen]);

  useEffect(() => {
    if (!loading) return;
    
    const phrases = [
        "Collecting data from sources...",
        "Searching news archives...",
        "Analyzing RSS feeds...",
        "Processing latest articles...",
        "Generating AI summary...",
        "Almost there..."
    ];
    
    let index = 0;
    const interval = setInterval(() => {
        index = (index + 1) % phrases.length;
        setLoadingPhrase(phrases[index]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [loading]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black transition-opacity duration-300 z-40 opacity-50"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 h-full z-50 bg-white shadow-xl transition-transform duration-300 ease-in-out w-full md:w-[500px]"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <Newspaper size={20} className="text-secondary" />
            <h2 className="text-xl text-secondary font-semibold">Company News</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-secondary"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-64px)] overflow-y-auto py-4 px-4 space-y-6">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <LuLoaderCircle className="animate-spin h-8 w-8 text-secondary" />
                <div className="text-center space-y-1">
                <p className="text-sm font-medium text-gray-700">
                    {loadingPhrase}
                </p>
                <p className="text-xs text-gray-500">This may take a moment</p>
                </div>
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : newsData ? (
            <>
              {/* Company Name */}
              <h3 className="text-lg font-semibold text-primary">
                 {newsData?.companyName ? `${newsData.companyName} (Inferred)` : "Unknown Company"}
              </h3>


              {/* Wikipedia Summary */}
              {newsData.wikipedia && (
                <div className="text-sm text-gray-600 leading-relaxed mb-6">
                  {newsData.wikipedia}
                </div>
              )}

              {/* Enhanced AI Summary Section */}
              {newsData.structuredTopics && (
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-secondary text-base">AI Summary</h4>
                    {newsData.source && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Source: {newsData.source}
                        </span>
                    )}
                    </div>
                    <div className="max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <ul className="space-y-3">
                        {newsData.structuredTopics.split('\n\n').map((item, index) => {
                        const [heading, ...content] = item.split(':');
                        return (
                            <li key={index} className="text-sm text-gray-700 leading-relaxed">
                            <span className="font-bold">{heading.trim()}: </span>
                            {content.join(':').trim()}
                            </li>
                        );
                        })}
                    </ul>
                    </div>
                </div>
              )}

              {/* Latest Articles with source and date */}
              <div>
                <h4 className="font-bold text-secondary mb-3 text-base">Latest Articles</h4>
                {newsData.news?.length > 0 ? (
                  <>
                    {/* Featured latest article */}
                    {newsData.news[0] && (
                      <div className="mb-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 hover:border-blue-300 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-medium text-blue-800 bg-blue-100 px-2 py-1 rounded">
                              Latest
                            </span>
                            <div className="flex items-center space-x-2">
                              {newsData.news[0].source && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {newsData.news[0].source}
                                </span>
                              )}
                              {newsData.news[0].pubDate && (
                                <span className="text-xs text-gray-500">
                                  {format(new Date(newsData.news[0].pubDate), 'MMM d, yyyy')}
                                </span>
                              )}
                            </div>
                          </div>
                          <h5 className="font-medium text-gray-900 mb-2">
                            {newsData.news[0].title}
                          </h5>
                          <a
                            href={newsData.news[0].link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Read full article <ExternalLink className="ml-1" size={14} />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Other articles list */}
                    {newsData.news.length > 1 && (
                      <div className="max-h-72 overflow-y-auto border rounded-lg">
                        <ul className="divide-y">
                          {newsData.news.slice(1).map((item, idx) => (
                            <li key={idx} className="hover:bg-gray-50 transition-colors">
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-3"
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <h5 className="text-sm font-medium text-gray-900">
                                    {item.title}
                                  </h5>
                                  <ExternalLink className="text-gray-400" size={14} />
                                </div>
                                <div className="flex items-center space-x-2">
                                  {item.source && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                      {item.source}
                                    </span>
                                  )}
                                  {item.pubDate && (
                                    <span className="text-xs text-gray-500">
                                      {format(new Date(item.pubDate), 'MMM d, yyyy')}
                                    </span>
                                  )}
                                </div>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg bg-gray-50">
                    <div className="mb-3 p-3 bg-gray-100 rounded-full">
                      <Newspaper size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-md font-medium text-gray-700 mb-1">No Recent Articles Found</h3>
                    <p className="text-gray-500 text-sm max-w-xs">
                      We couldn't find recent news articles, but check out the AI summary above for key insights.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 p-4 bg-gray-100 rounded-full">
                <Newspaper size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Data Available</h3>
              <p className="text-gray-500 max-w-md">
                We couldn't find any information for this company.
              </p>
              <button 
                onClick={fetchNews}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-sm"
              >
                Retry Search
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NewsDropdown;