import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { CameraIcon, UploadIcon, CopyIcon } from '../icons.jsx';

const looksLikeUrl = (text) => /^https?:\/\//i.test(text.trim());

export default function ScannerPanel() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [copied, setCopied] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => stopCamera, []);

  function decodeImageData(imageData) {
    return jsQR(imageData.data, imageData.width, imageData.height);
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError(null);
    setResult(null);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = decodeImageData(imageData);
      if (code && code.data) {
        setResult(code.data);
      } else {
        setError("Couldn't find a QR code in that image.");
      }
    };
    img.onerror = () => setError('Could not read that image file.');
    img.src = URL.createObjectURL(file);
  }

  async function startCamera() {
    setError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      scanLoop();
    } catch {
      setError('Camera access was denied or is unavailable. You can upload an image instead.');
    }
  }

  function stopCamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }

  function scanLoop() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    const maxDim = 400;
    const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = decodeImageData(imageData);
    if (code && code.data) {
      setResult(code.data);
      stopCamera();
      return;
    }
    rafRef.current = requestAnimationFrame(scanLoop);
  }

  function reset() {
    setResult(null);
    setError(null);
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function copyResult() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — nothing to fall back to for plain text.
    }
  }

  return (
    <div className="scanner-wrap">
      <div className="scanner-box">
        {!result && (
          <>
            <div className={`scanner-video-wrap${cameraActive ? ' active' : ''}`}>
              <video ref={videoRef} className="scanner-video" playsInline muted hidden={!cameraActive} />
              {!cameraActive && <p className="placeholder">Upload an image or use your camera to scan a QR code.</p>}
            </div>
            <canvas ref={canvasRef} hidden />

            <div className="scanner-actions">
              {!cameraActive ? (
                <button type="button" onClick={startCamera}><CameraIcon />Use camera</button>
              ) : (
                <button type="button" onClick={stopCamera}>Stop camera</button>
              )}
              <button type="button" onClick={() => fileInputRef.current?.click()}>
                <UploadIcon />Upload image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                hidden
              />
            </div>

            {error && <p className="scanner-error">{error}</p>}
          </>
        )}

        {result && (
          <div className="scanner-result">
            <p className="scanner-result-label">Decoded content</p>
            <p className="scanner-result-text">{result}</p>
            <div className="scanner-actions">
              <button type="button" onClick={copyResult}><CopyIcon />{copied ? 'Copied!' : 'Copy'}</button>
              {looksLikeUrl(result) && (
                <a href={result} target="_blank" rel="noopener noreferrer" className="scanner-open-link">
                  Open link
                </a>
              )}
              <button type="button" onClick={reset}>Scan another</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
