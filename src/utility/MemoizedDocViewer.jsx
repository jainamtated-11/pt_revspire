import React, { useState } from "react";
import styled, { keyframes } from "styled-components";


const MemoizedDocViewer = React.memo(({ blobUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!blobUrl) return <EmptyState>No document selected.</EmptyState>;

  return (
    <ViewerContainer >
      {loading && (
        <LoadingOverlay>
          <Spinner />
        </LoadingOverlay>
      )}
      <OfficeIframe
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(blobUrl)}`}
        title="Office Document Preview"
        sandbox="allow-scripts allow-same-origin allow-top-navigation-by-user-activation allow-forms"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError("Failed to load document.");
        }}
      />
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </ViewerContainer>
  );
}, (prevProps, nextProps) => prevProps.blobUrl === nextProps.blobUrl);

MemoizedDocViewer.displayName = "MemoizedDocViewer";
export default MemoizedDocViewer;

// Styled Components
const ViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #f8fafc;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`;

const OfficeIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
`;


const ErrorMsg = styled.div`
  color: #e74c3c;
  margin-top: 16px;
  font-weight: 500;
`;

const EmptyState = styled.div`
  width: 100%;
  height: 100%;
  color: #aaa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 4px solid #c3dafc;
  border-top: 4px solid #5296d8;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 12px;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 60px;
  left: 0;
  width: 100%;
  height: 70vh;
  background: rgba(255,255,255,0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;