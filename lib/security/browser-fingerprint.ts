'use client';

export interface BrowserFingerprint {
  canvasHash: string;
  webglHash: string;
  timezone: string;
  timezoneOffset: number;
  screenResolution: string;
  colorDepth: number;
  deviceMemory: number | null;
  hardwareConcurrency: number | null;
  language: string;
  languages: string[];
  platform: string;
  touchSupport: boolean;
  cookieEnabled: boolean;
  doNotTrack: string | null;
  combinedHash: string;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    canvas.width = 200;
    canvas.height = 50;

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);

    ctx.fillStyle = '#069';
    ctx.fillText('Saldopedia FP', 2, 15);

    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Security Check', 4, 17);

    ctx.strokeStyle = '#00f';
    ctx.beginPath();
    ctx.arc(50, 25, 15, 0, Math.PI * 2);
    ctx.stroke();

    const dataUrl = canvas.toDataURL();
    return hashString(dataUrl);
  } catch (e) {
    return 'canvas-error';
  }
}

function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'no-webgl';

    const webgl = gl as WebGLRenderingContext;
    const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info');
    
    let vendor = 'unknown';
    let renderer = 'unknown';
    
    if (debugInfo) {
      vendor = webgl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown';
      renderer = webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
    }

    const params = [
      webgl.getParameter(webgl.VERSION),
      webgl.getParameter(webgl.SHADING_LANGUAGE_VERSION),
      vendor,
      renderer,
      webgl.getParameter(webgl.MAX_TEXTURE_SIZE),
      webgl.getParameter(webgl.MAX_VERTEX_ATTRIBS),
      webgl.getParameter(webgl.MAX_VERTEX_UNIFORM_VECTORS),
    ].join('|');

    return hashString(params);
  } catch (e) {
    return 'webgl-error';
  }
}

function getTimezoneInfo(): { timezone: string; offset: number } {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';
    const offset = new Date().getTimezoneOffset();
    return { timezone, offset };
  } catch (e) {
    return { timezone: 'unknown', offset: 0 };
  }
}

function getScreenInfo(): { resolution: string; colorDepth: number } {
  try {
    const width = window.screen.width || 0;
    const height = window.screen.height || 0;
    const availWidth = window.screen.availWidth || 0;
    const availHeight = window.screen.availHeight || 0;
    const colorDepth = window.screen.colorDepth || 24;
    const pixelRatio = window.devicePixelRatio || 1;

    return {
      resolution: `${width}x${height}|${availWidth}x${availHeight}|${pixelRatio}`,
      colorDepth,
    };
  } catch (e) {
    return { resolution: 'unknown', colorDepth: 24 };
  }
}

function getHardwareInfo(): { memory: number | null; cores: number | null } {
  try {
    const nav = navigator as any;
    return {
      memory: nav.deviceMemory || null,
      cores: nav.hardwareConcurrency || null,
    };
  } catch (e) {
    return { memory: null, cores: null };
  }
}

function getTouchSupport(): boolean {
  try {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  } catch (e) {
    return false;
  }
}

export function collectBrowserFingerprint(): BrowserFingerprint {
  const canvasHash = getCanvasFingerprint();
  const webglHash = getWebGLFingerprint();
  const { timezone, offset } = getTimezoneInfo();
  const { resolution, colorDepth } = getScreenInfo();
  const { memory, cores } = getHardwareInfo();
  const touchSupport = getTouchSupport();

  const language = navigator.language || 'unknown';
  const languages = Array.from(navigator.languages || [language]);
  const platform = navigator.platform || 'unknown';
  const cookieEnabled = navigator.cookieEnabled;
  const doNotTrack = navigator.doNotTrack || null;

  const combinedData = [
    canvasHash,
    webglHash,
    timezone,
    offset,
    resolution,
    colorDepth,
    memory,
    cores,
    language,
    platform,
  ].join('|');

  const combinedHash = hashString(combinedData);

  return {
    canvasHash,
    webglHash,
    timezone,
    timezoneOffset: offset,
    screenResolution: resolution,
    colorDepth,
    deviceMemory: memory,
    hardwareConcurrency: cores,
    language,
    languages,
    platform,
    touchSupport,
    cookieEnabled,
    doNotTrack,
    combinedHash,
  };
}

export function getFingerprintSummary(): string {
  const fp = collectBrowserFingerprint();
  return `${fp.combinedHash}|${fp.canvasHash}|${fp.webglHash}`;
}
