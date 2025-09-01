import { useEffect, useRef } from 'react';

const useAutosave = ({
  callback,
  delay,
  shouldSave,
}: {
  callback: () => void | Promise<void>;
  delay: number;
  shouldSave: boolean;
}) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!shouldSave) return;

    const timer = setInterval(async () => {
      try {
        await savedCallback.current();
      } catch (error) {
        console.error('Autosave error:', error);
      }
    }, delay);

    return () => clearInterval(timer);
  }, [delay, shouldSave]);
};

export default useAutosave;
