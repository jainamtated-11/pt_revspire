import { useEffect } from "react";

export const usePageSeo = ({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
}) => {
  useEffect(() => {
    document.title = title;
    setMetaTag("name", "description", description);
    setMetaTag("name", "og:title", ogTitle || title || "");
    setMetaTag("name", "og:description", ogDescription || description || "");
    setMetaTag("name", "og:image", ogImage || "");
    setMetaTag("name", "og:url", ogUrl || window.location.href);

    return () => {
      document.title = "";
      document.querySelectorAll("meta").forEach((meta) => {
        meta.remove();
      });
    };
  }, [title, description, ogTitle, ogDescription, ogImage, ogUrl]);

  const setMetaTag = (attribute, key, content) => {
    if (content) {
      let element = document.querySelector(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    }
  };
};

export default usePageSeo;
