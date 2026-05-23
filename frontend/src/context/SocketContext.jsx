import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAnalysisSocket } from '../hooks/useAnalysisSocket';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  // Map of videoId → latest progress event
  const [progressMap, setProgressMap] = useState({});

  const handleProgress = useCallback((data) => {
    setProgressMap(prev => ({
      ...prev,
      [data.videoId]: data  // store latest event per video
    }));

    // Auto-clear completed events after 10 seconds
    if (data.done) {
      setTimeout(() => {
        setProgressMap(prev => {
          const next = { ...prev };
          delete next[data.videoId];
          return next;
        });
      }, 10000);
    }
  }, []);

  useAnalysisSocket(handleProgress);

  return (
    <SocketContext.Provider value={{ progressMap }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook — any component can call this to get progress for a specific video
export const useVideoProgress = (videoId) => {
  const { progressMap } = useContext(SocketContext);
  return progressMap[videoId] || null;
};