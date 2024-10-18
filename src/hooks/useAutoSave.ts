import { useEffect, useRef } from 'react';

const useAutosave = ({
  callback,
  delay,
  shouldSave,
}: {
  callback: () => void;
  delay: number;
  shouldSave: boolean;
}) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!shouldSave) return;

    const timer = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => clearInterval(timer);
  }, [delay, shouldSave]);
};

export default useAutosave;
