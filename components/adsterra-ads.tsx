'use client';

import { useEffect, useRef } from 'react';

interface AdsterraAdProps {
  className?: string;
}

export function AdsterraBanner({ className = '' }: AdsterraAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || !containerRef.current) return;
    loadedRef.current = true;

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://pl26518765.effectivegatecpm.com/529af12d02adb9db6e94621e312ae8aa/invoke.js';
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className={className}>
      <div ref={containerRef}>
        <div id="container-529af12d02adb9db6e94621e312ae8aa"></div>
      </div>
    </div>
  );
}

export function AdsterraSocialBar() {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://pl26518839.effectivegatecpm.com/35/7c/d0/357cd0fa4cec043e603c368bf96de678.js';
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}

export function AdsterraPopunder() {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://pl26518960.effectivegatecpm.com/26/ff/72/26ff720d464c07e143ac8dc9519b72c0.js';
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}
