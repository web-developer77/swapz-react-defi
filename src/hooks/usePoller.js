import { useEffect, useRef } from "react";

export const usePoller = (fn, delay) => {
  const savedCallback = useRef();

  // Remember the latest fn.
  useEffect(() => {
    savedCallback.current = fn;
  }, [fn]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (savedCallback.current) savedCallback.current();
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);

      return () => clearInterval(id);
    }
  }, [delay]);

  // run at start too
  useEffect(() => {
    fn();
  }, []);
};
