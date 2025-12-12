"use client";

import { useEffect, useState } from "react";

export function useIsIOS() {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    
    const isPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    
    setIsIOS(isIOSDevice || isPadOS);
  }, []);

  return isIOS;
}
