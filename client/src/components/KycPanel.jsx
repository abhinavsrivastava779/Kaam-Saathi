import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Clock3, Upload, Camera, X } from 'lucide-react';
import { submitWorkerKyc } from '../api/worker';
import { useAuth } from '../context/AuthContext';

const resizeImage = (file, maxSize = 1400, quality = 0.72) =>
  new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('कृपया केवल image file चुनें।'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('फोटो पढ़ी नहीं जा सकी।'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('फोटो process नहीं हो सकी।'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('फोटो compress नहीं हो सकी।'));
          if (blob.size > 1.5 * 1024 * 1024) {
            return reject(new Error('फोटो 1.5 MB से छोटी होनी चाहिए।'));
          }
          const fr = new FileReader();
          fr.onload = () => resolve(fr.result);
          fr.onerror = () => reject(new Error('फोटो convert नहीं हो सकी।'));
          fr.readAsDataURL(blob);
        }, 'image/jpeg', quality);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

export default function KycPanel() {
  const { worker, updateWorkerState } = useAuth();
  const [aadhaar, setAadhaar] = useState(worker?.kyc?.aadhaarNumber || '');
  const [ap, setAp] = useState('');
  const [pp, setPp] = useState('');
  const [err, setErr] = useState('');
  const [save, setSave] = useState(false);
  const [pop, setPop] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  const ar = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  if (!worker) return null;

  const status = worker.kyc?.status || 'pending';

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOpen(false);
    setCameraLoading(false);
  }

  const openCamera = async () => {
    setErr('');
    if (!navigator.mediaDevices?.getUserMedia) {
      return setErr('इस device/browser में camera access उपलब्ध नहीं है। HTTPS या localhost पर खोलें।');
    }

    try {
      setCameraLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 0);
    } catch (e) {
      setErr('Camera permission allow करें। Current Photo के लिए केवल live camera photo लिया जा सकता है।');
    } finally {
      setCameraLoading(false);
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      return setErr('Camera अभी तैयार नहीं है। एक सेकंड बाद फिर क्लिक करें।');
    }

    const canvas = document.createElement('canvas');
    const max = 1400;
    const scale = Math.min(1, max / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return setErr('Photo capture नहीं हो सकी।');
      const file = new File([blob], `current-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

      try {
        setErr('');
        const compressed = await resizeImage(file);
        setPp(compressed);
        stopCamera();
      } catch (e) {
        setErr(e.message || 'Photo process नहीं हो सकी।');
      }
    }, 'image/jpeg', 0.82);
  };

  const pickAadhaar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr('');
    try {
      setAp(await resizeImage(file));
    } catch (error) {
      setAp('');
      setErr(error.message || 'Aadhaar photo upload नहीं हो सकी।');
    }
    e.target.value = '';
  };

  const submit = async () => {
    setErr('');
    const cleanAadhaar = aadhaar.replace(/\D/g, '');

    if (!/^\d{12}$/.test(cleanAadhaar)) {
      return setErr('Aadhaar number 12 अंकों का होना चाहिए।');
    }
    if (!ap || !pp) {
      return setErr('Aadhaar photo और current camera photo दोनों जरूरी हैं।');
    }

    setSave(true);
    try {
      const r = await submitWorkerKyc(worker._id, {
        aadhaarNumber: cleanAadhaar,
        aadhaarPhoto: ap,
        personalPhoto: pp
      });
      updateWorkerState(r.worker);
      setPop(true);
    } catch (e) {
      setErr(
        e.response?.data?.message ||
        'KYC submit नहीं हुई। कृपया दोबारा कोशिश करें।'
      );
    } finally {
      setSave(false);
    }
  };

  return (
    <>
      <div className="glass-card rounded-2xl p-5 border border-slate-700 space-y-4">
        <div className="flex justify-between gap-3">
          <div>
            <h3 className="font-black text-white flex gap-2 items-center">
              <ShieldCheck className="text-amber-400" /> KYC Verification
            </h3>
            <p className="text-xs text-slate-400">
              Employer trust के लिए verification जरूरी है।
            </p>
          </div>
          <span className={`px-3 py-2 rounded-full text-[10px] font-black ${
            status === 'verified'
              ? 'bg-emerald-950 text-emerald-300'
              : status === 'rejected'
                ? 'bg-rose-950 text-rose-300'
                : 'bg-amber-950 text-amber-300'
          }`}>
            {status === 'verified' ? '✓ VERIFIED' : status === 'rejected' ? 'REJECTED' : 'NOT VERIFIED'}
          </span>
        </div>

        {status === 'verified' ? (
          <p className="text-sm text-emerald-300 font-bold">
            ✓ Admin ने आपकी KYC verify कर दी है।
          </p>
        ) : (
          <>
            {status === 'rejected' && worker.kyc?.rejectionReason && (
              <div className="bg-rose-950/60 border border-rose-800 rounded-xl p-3 text-xs text-rose-200">
                <b>KYC reject reason:</b> {worker.kyc.rejectionReason}
              </div>
            )}

            <input
              value={aadhaar}
              maxLength={12}
              onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
              placeholder="12 digit Aadhaar number"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => ar.current?.click()}
                className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-left text-xs font-bold text-white"
              >
                <Upload className="w-4 h-4 text-amber-400 mb-1" />
                Aadhaar Photo
                <span className="block text-slate-400 mt-1">
                  {ap ? '✓ compressed & selected' : 'Upload Aadhaar photo'}
                </span>
              </button>

              <button
                type="button"
                onClick={openCamera}
                disabled={cameraLoading}
                className="bg-slate-800 border border-emerald-700 rounded-xl p-3 text-left text-xs font-bold text-white active:scale-[0.98] disabled:opacity-60"
              >
                <Camera className="w-5 h-5 text-emerald-400 mb-1" />
                Current Photo
                <span className="block text-emerald-300 mt-1">
                  {pp ? '✓ Live photo captured' : '📸 Camera से अभी photo लें'}
                </span>
              </button>
            </div>

            <input
              ref={ar}
              hidden
              type="file"
              accept="image/*"
              onChange={pickAadhaar}
            />

            <p className="text-[11px] text-slate-400">
              Current Photo में gallery/पुरानी photo upload नहीं की जा सकती। केवल इसी समय camera से नई photo capture होगी।
            </p>

            {err && (
              <p className="text-xs text-rose-300 font-bold bg-rose-950/40 border border-rose-900 rounded-xl p-3">
                {err}
              </p>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={save}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black rounded-xl py-3"
            >
              {save ? 'Submit हो रहा है...' : 'KYC Submit करें'}
            </button>
          </>
        )}
      </div>

      {cameraOpen && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col">
          <div className="flex items-center justify-between p-4 bg-slate-950 text-white">
            <div>
              <h3 className="font-black">Current Photo</h3>
              <p className="text-xs text-slate-400">Camera से अभी अपनी photo लें</p>
            </div>
            <button type="button" onClick={stopCamera} className="p-2" aria-label="Close camera">
              <X />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center bg-black p-3">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-w-md max-h-[70vh] object-cover rounded-2xl"
            />
          </div>

          <div className="p-6 bg-slate-950">
            <button
              type="button"
              onClick={capturePhoto}
              className="mx-auto flex items-center justify-center w-20 h-20 rounded-full border-4 border-white bg-emerald-500"
              aria-label="Take photo"
            >
              <Camera className="w-8 h-8 text-white" />
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">Photo click करें</p>
          </div>
        </div>
      )}

      {pop && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-5">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-sm text-center">
            <Clock3 className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-xl font-black text-white mt-3">KYC Pending</h3>
            <p className="text-sm text-slate-300 mt-2">
              Documents successfully submit हो गए हैं। Admin check करेगा।
              कृपया <b className="text-amber-400">24 घंटे</b> तक wait करें।
            </p>
            <button
              onClick={() => setPop(false)}
              className="w-full mt-4 bg-emerald-600 text-white font-black rounded-xl py-3"
            >
              ठीक है
            </button>
          </div>
        </div>
      )}
    </>
  );
}
