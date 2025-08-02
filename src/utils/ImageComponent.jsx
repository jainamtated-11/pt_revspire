export default function ImageComponent({ fullscreenBlobUrl, imageRef, imageId }) {
  return (
    <div className="flex items-center justify-center h-full w-full p-0">
      <div className="relative max-h-[100%] max-w-[100%] overflow-hidden">
        <img
          id={imageId}
          ref={imageRef}
          src={fullscreenBlobUrl}
          className="object-contain w-auto h-auto"
          alt="Full screen content"
        />
      </div>
    </div>
  );
}
