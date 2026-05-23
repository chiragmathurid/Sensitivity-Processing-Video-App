import { useEffect } from 'react';
import { io } from 'socket.io-client';

// Create ONE socket connection for the whole app
const socket = io('http://localhost:8000');

export const useAnalysisSocket = (onProgress) => {
    useEffect(() => {
        // Listen for progress events from the backend
        socket.on('analysis:progress', (data) => {
            onProgress(data);
            // data = { videoId, percent, message, status?, done? }
        });

        return () => {
            socket.off('analysis:progress'); // clean up when component unmounts
        };
    }, [onProgress]);
};

export default socket;