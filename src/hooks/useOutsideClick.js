import { useEffect, useRef } from 'react';

function useOutsideClick(actions) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref && ref?.current && !ref?.current?.contains(event?.target)) {
        actions?.forEach(action => action());
      }
    }
    document?.addEventListener('mousedown', handleClickOutside);
    return () => {
      document?.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actions]);

  return ref;
}

export default useOutsideClick;