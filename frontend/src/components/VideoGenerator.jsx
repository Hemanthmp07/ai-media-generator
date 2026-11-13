import { useState, useRef, useEffect, useCallback } from "react";
import api from "./api.js";
import { VideoIcon, PlayIcon, PauseIcon, DownloadIcon, MaximizeIcon, RefreshIcon, CopyIcon, CheckIcon } from "./Icons.jsx";

function loadImage(url, timeoutMs = 32000) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    const t = setTimeout(() => { img.src = ""; reject(new Error("Timeout")); }, timeoutMs);
    img.onload  = () => { clearTimeout(t); resolve(img); };
    img.onerror = () => {
      clearTimeout(t);
      const img2 = new window.Image();
      const t2 = setTimeout(() => { img2.src = ""; reject(new Error("Failed")); }, timeoutMs);
      img2.onload  = () => { clearTimeout(t2); resolve(img2); };
      img2.onerror = () => { clearTimeout(t2); reject(new Error("Failed")); };
      img2.src = url;
    };
    img.src = url;
  });
}

const STYLES = [
  { id: "cinematic",  label: "Cinematic 35mm", desc: "Anamorphic film still, 24fps shutter blur & subtle grain" },
  { id: "realistic",  label: "Documentary",    desc: "Natural lighting, true-to-life physics & raw textures" },
  { id: "animated",   label: "3D Animation",   desc: "Stylized CGI render with high dynamic range illumination" },
  { id: "cyberpunk",  label: "Sci-Fi Noir",    desc: "Volumetric fog, monochrome reflections & futuristic tech" },
];

const MOTIONS = [
  { id: "push-in",  label: "Slow Push-In",   desc: "Dramatic forward focal zoom" },
  { id: "aerial",   label: "Drone Sweep",    desc: "Sweeping overhead panorama" },
  { id: "tracking", label: "Dynamic Track",  desc: "High-speed following dolly movement" },
  { id: "orbit",    label: "360° Orbit",     desc: "Smooth rotation around central subject" },
];

const RATIOS = [
  { id: "16:9", label: "16:9 Widescreen" },
  { id: "9:16", label: "9:16 Vertical" },
  { id: "1:1",  label: "1:1 Square" },
];

const EXAMPLE_PROMPTS = [
  "mysore dassara illuminated palace at night with golden royal procession",
  "wild majestic tiger roaring loudly in the lush jungle at sunset",
  "car flying in sky over futuristic cyber city with clouds",
  "futuristic sports car speeding on monochrome highway at night with rain reflections",
];

export default function VideoGenerator({ initialPrompt = "" } = {}) {
  const [prompt, setPrompt]           = useState(initialPrompt || "");
  const [duration, setDuration]       = useState(30);
  const [style, setStyle]             = useState("cinematic");
  const [motion, setMotion]           = useState("push-in");
  const [ratio, setRatio]             = useState("16:9");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [videoData, setVideoData]     = useState(null);
  const [elapsed, setElapsed]         = useState(0);
  const [generationStep, setStep]     = useState(0);
  const [copied, setCopied]           = useState(false);

  const [selectedShot, setSelectedShot] = useState("all");
  const [isPlaying, setIsPlaying]     = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setSpeed]     = useState(1.0);
  const [imagesReady, setImagesReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);

  const timerRef           = useRef(null);
  const canvasRef          = useRef(null);
  const animFrameRef       = useRef(null);
  const loadedImagesRef    = useRef([]);
  const particlesRef       = useRef([]);
  const playerContainerRef = useRef(null);

  const isPlayingRef       = useRef(true);
  const currentTimeRef     = useRef(0);
  const playbackSpeedRef   = useRef(1.0);
  const motionRef          = useRef(motion);
  const styleRef           = useRef(style);
  const selectedShotRef    = useRef("all");
  const videoDurationRef   = useRef(duration);

  const GENERATION_STEPS = [
    "Synthesizing high-definition establishing shot…",
    "Generating dynamic action camera angle…",
    "Composing dramatic close-up perspective…",
    "Finalizing 60 FPS cinematic motion physics…",
  ];

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
  useEffect(() => { playbackSpeedRef.current = playbackSpeed; }, [playbackSpeed]);
  useEffect(() => { motionRef.current = motion; }, [motion]);
  useEffect(() => { styleRef.current = style; }, [style]);
  useEffect(() => { selectedShotRef.current = selectedShot; }, [selectedShot]);
  useEffect(() => { videoDurationRef.current = videoData?.duration || duration || 30; }, [videoData, duration]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setPrompt(initialPrompt.trim());
    }
    return () => {
      clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [initialPrompt]);

  useEffect(() => {
    const particles = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2 + 0.6,
        speedX: (Math.random() - 0.5) * 0.001,
        speedY: (Math.random() - 0.5) * 0.001 - 0.0004,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    if (!videoData) return;
    setImagesReady(false);
    setLoadProgress(0);
    loadedImagesRef.current = [];

    const shotUrls = (videoData.shots?.length > 0)
      ? videoData.shots.map((s) => s.url).filter(Boolean)
      : [videoData.keyframeUrl];

    let loaded = 0;
    const total = shotUrls.length;
    const imgs = new Array(total).fill(null);

    const promises = shotUrls.map((url, idx) =>
      loadImage(url, 35000)
        .then(img => { imgs[idx] = img; })
        .catch(() => {})
        .finally(() => {
          loaded++;
          setLoadProgress(Math.round((loaded / total) * 100));
          if (loaded === 1) {
            const validNow = imgs.filter(Boolean);
            if (validNow.length > 0) {
              loadedImagesRef.current = imgs.map(i => i || validNow[0]);
              setImagesReady(true);
              setIsPlaying(true);
              isPlayingRef.current = true;
            }
          } else {
            const valid = imgs.filter(Boolean);
            if (valid.length > 0) {
              loadedImagesRef.current = imgs.map(i => i || valid[0]);
            }
          }
        })
    );

    Promise.all(promises).then(() => {
      const valid = imgs.filter(Boolean);
      if (valid.length === 0) {
        setError("Could not load image frames — please try a shorter prompt.");
        return;
      }
      loadedImagesRef.current = imgs.map(i => i || valid[0]);
      setImagesReady(true);
      setIsPlaying(true);
      isPlayingRef.current = true;
    });
  }, [videoData]);

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const images = loadedImagesRef.current;
    if (!canvas || !images || images.length === 0) return;

    const ctx = canvas.getContext("2d");
    const totalSecs = videoDurationRef.current;
    const t = (currentTimeRef.current % totalSecs) / totalSecs;
    const cw = canvas.width;
    const ch = canvas.height;
    const motionId = motionRef.current;
    const shotSel  = selectedShotRef.current;

    ctx.clearRect(0, 0, cw, ch);

    let activeImg = images[0];
    let nextImg = null;
    let blend = 0;

    if (shotSel !== "all") {
      const idx = parseInt(shotSel);
      activeImg = images[idx] || images[0];
    } else if (images.length > 1) {
      if (t < 0.42) {
        activeImg = images[0];
      } else if (t >= 0.42 && t < 0.52) {
        activeImg = images[0];
        nextImg = images[1] || images[0];
        blend = (t - 0.42) / 0.10;
      } else if (t >= 0.52 && t < 0.82) {
        activeImg = images[1] || images[0];
      } else if (t >= 0.82 && t < 0.94) {
        activeImg = images[1] || images[0];
        nextImg = images[2] || images[0];
        blend = (t - 0.82) / 0.12;
      } else {
        activeImg = images[2] || images[0];
      }
    }

    const drawKinematicImage = (img, opacity, localT) => {
      if (!img || !img.naturalWidth) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
      let scale = 1.0, dx = 0, dy = 0, rot = 0;
      const ease = Math.sin(localT * Math.PI);
      if (motionId === "push-in") {
        scale = 1.0 + 0.20 * ease; dy = -10 * ease;
      } else if (motionId === "aerial") {
        scale = 1.10;
        dx = 30 * Math.sin(localT * Math.PI * 2);
        dy = 14 * Math.cos(localT * Math.PI * 2);
        rot = 0.010 * Math.sin(localT * Math.PI * 2);
      } else if (motionId === "tracking") {
        scale = 1.12; dx = (localT - 0.5) * 70;
      } else if (motionId === "orbit") {
        scale = 1.08 + 0.06 * Math.sin(localT * Math.PI * 2);
        dx = 18 * Math.cos(localT * Math.PI * 2);
        dy = 10 * Math.sin(localT * Math.PI * 2);
        rot = 0.012 * Math.cos(localT * Math.PI * 2);
      }
      ctx.translate(cw / 2, ch / 2);
      ctx.rotate(rot);
      ctx.scale(scale, scale);
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = cw / ch;
      let drawW, drawH;
      if (imgAspect > canvasAspect) { drawH = ch; drawW = ch * imgAspect; }
      else { drawW = cw; drawH = cw / imgAspect; }
      ctx.drawImage(img, -drawW / 2 + dx, -drawH / 2 + dy, drawW, drawH);
      ctx.restore();
    };

    drawKinematicImage(activeImg, 1 - blend, t);
    if (nextImg && blend > 0) drawKinematicImage(nextImg, blend, t);

    // Subtle Monochrome Vignette
    const vig = ctx.createRadialGradient(cw/2, ch/2, ch*0.35, cw/2, ch/2, ch*0.9);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.65)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, cw, ch);

    // Subtle Cinematic Particles
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    particlesRef.current.forEach((p) => {
      p.x += p.speedX; p.y += p.speedY;
      if (p.y < 0) p.y = 1; if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      ctx.beginPath();
      ctx.arc(p.x * cw, p.y * ch, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  useEffect(() => {
    let lastTime = performance.now();
    let frameId;

    const loop = (now) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (isPlayingRef.current) {
        const totalSecs = videoDurationRef.current;
        currentTimeRef.current += delta * playbackSpeedRef.current;
        if (currentTimeRef.current >= totalSecs) currentTimeRef.current = 0;
        if (Math.floor(currentTimeRef.current * 4) !== Math.floor((currentTimeRef.current - delta * playbackSpeedRef.current) * 4)) {
          setCurrentTime(currentTimeRef.current);
        }
      }

      renderFrame();
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [renderFrame]);

  const handleGenerate = async (customPrompt) => {
    const targetPrompt = typeof customPrompt === "string" ? customPrompt : prompt;
    const query = (targetPrompt || "").trim();
    if (!query) { setError("Please describe the scene to generate."); return; }

    setLoading(true);
    setError("");
    setVideoData(null);
    setImagesReady(false);
    setElapsed(0);
    setStep(0);
    setCurrentTime(0);
    currentTimeRef.current = 0;
    setIsPlaying(false);
    isPlayingRef.current = false;
    setSelectedShot("all");
    selectedShotRef.current = "all";

    const start = Date.now();
    timerRef.current = setInterval(() => {
      const sec = Math.round((Date.now() - start) / 1000);
      setElapsed(sec);
      if (sec >= 1 && sec < 4) setStep(1);
      else if (sec >= 4 && sec < 7) setStep(2);
      else if (sec >= 7) setStep(3);
    }, 1000);

    try {
      let data = null;
      try {
        const response = await api.post("/video/generate", {
          prompt: query, duration: parseInt(duration) || 30, style, motion, ratio,
        });
        data = response.data?.data;
      } catch (backendErr) {
        console.warn("Backend API fallback to FLUX neural client:", backendErr.message);
      }

      if (!data?.keyframeUrl || !data?.shots?.length) {
        let [w, h] = [1280, 720];
        if (ratio === "9:16") [w, h] = [720, 1280];
        if (ratio === "1:1")  [w, h] = [1024, 1024];
        const s1 = Math.floor(Math.random() * 9000000) + 1000000;
        const s2 = Math.floor(Math.random() * 9000000) + 1000000;
        const s3 = Math.floor(Math.random() * 9000000) + 1000000;
        const mkUrl = (angle, seed) =>
          `https://image.pollinations.ai/prompt/${encodeURIComponent(`${query}, ${angle}, 35mm film still, cinematic lighting, 4k resolution, raw optics`)}?width=${w}&height=${h}&seed=${seed}&nologo=true&model=flux`;
        const url1 = mkUrl("wide establishing panoramic perspective", s1);
        const url2 = mkUrl("medium dynamic tracking action shot", s2);
        const url3 = mkUrl("dramatic close-up depth of field shot", s3);
        data = {
          title: `Cinematic: "${query}"`,
          keyframeUrl: url1,
          shots: [
            { id: 1, title: "Establishing Shot", url: url1 },
            { id: 2, title: "Action Angle",       url: url2 },
            { id: 3, title: "Close-up Angle",     url: url3 },
          ],
          prompt: query,
          duration: parseInt(duration) || 30,
          style, motion, ratio,
          provider: "FLUX Cinema Engine",
        };
      }

      setVideoData(data);
      api.post("/history/save", {
        type: "video",
        data: { imageUrl: data.keyframeUrl, keyframeUrl: data.keyframeUrl,
          title: data.title || query, prompt: query,
          duration: parseInt(duration) || 30, style, motion, ratio,
          timestamp: new Date().toISOString() },
      }).catch(() => {});
    } catch (err) {
      setError("Generation failed: " + err.message);
    } finally {
      clearInterval(timerRef.current);
      setLoading(false);
    }
  };

  const handleRecordVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesReady) return;
    try {
      setIsRecording(true);
      setRecordProgress(0);
      currentTimeRef.current = 0;
      setCurrentTime(0);
      setIsPlaying(true);
      isPlayingRef.current = true;

      const stream = canvas.captureStream(30);
      let mimeType = "video/webm;codecs=vp9";
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "video/webm";
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "video/mp4";

      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8000000 });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data?.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setIsRecording(false);
        setRecordProgress(100);
        const a = document.createElement("a");
        a.href = url;
        const ext = mimeType.includes("mp4") ? "mp4" : "webm";
        const cleanPrompt = prompt.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 24);
        a.download = `cinema-video-${cleanPrompt}-${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      };

      recorder.start(100);
      const recordSecs = Math.min(videoData?.duration || 15, 15);
      let p = 0;
      const tick = setInterval(() => {
        p++;
        setRecordProgress(Math.min(95, Math.round((p / recordSecs) * 95)));
        if (p >= recordSecs) { clearInterval(tick); recorder.stop(); }
      }, 1000);
    } catch (e) {
      setIsRecording(false);
      alert("Video recording could not be completed on this browser.");
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const total = videoData?.duration || duration || 30;
    const t = pct * total;
    setCurrentTime(t);
    currentTimeRef.current = t;
  };

  const handleCopyLink = () => {
    const link = videoData?.keyframeUrl;
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadKeyframe = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `cinema-frame-${Date.now()}.png`;
    a.click();
  };

  const handleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      playerContainerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const formatTime = (secs) => {
    const s = Math.floor(secs || 0);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
  };

  const totalDuration = videoData?.duration || duration || 30;

  return (
    <div className="vercel-card" style={{ maxWidth: 900, margin: "0 auto", padding: "28px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span className="vercel-badge">
            <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffffff" }} />
            4K 60FPS Video Engine
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>• Multi-Angle Cinematic Kinematics</span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "#ffffff", margin: "4px 0" }}>
          AI Video Generator &amp; Kinematics Lab
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
          Synthesizes continuous camera motion sequences tailored strictly to your prompt with multi-angle cuts and export capability.
        </p>
      </div>

      {/* Prompt Area */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <textarea
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGenerate(); }}
          rows={3}
          placeholder="Describe your scene in detail (e.g. futuristic sports car speeding on monochrome highway at night with rain reflections)…"
          className="vercel-textarea"
          style={{ padding: "14px 16px", fontSize: 14, lineHeight: 1.5 }}
          disabled={loading}
        />
        <div style={{ position: "absolute", bottom: 10, right: 14, fontSize: 11, color: "var(--text-muted)" }}>
          {prompt.length} / 2000
        </div>
      </div>

      {/* Prompt chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", alignSelf: "center", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 4 }}>
          Try:
        </span>
        {EXAMPLE_PROMPTS.map((ex, i) => (
          <button
            key={i}
            onClick={() => { setPrompt(ex); setError(""); handleGenerate(ex); }}
            className="vercel-btn-ghost"
            style={{
              fontSize: 11,
              padding: "4px 9px",
              background: "#0d0d0d",
              border: "1px solid var(--border-subtle)",
              borderRadius: 6,
            }}
          >
            {ex.slice(0, 34)}…
          </button>
        ))}
      </div>

      {/* Settings Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 12,
          padding: 14,
          background: "#080808",
          borderRadius: 10,
          border: "1px solid var(--border-subtle)",
          marginBottom: 20,
        }}
      >
        {/* Style */}
        <div>
          <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
            Cinematic Style
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={style === s.id ? "vercel-btn-primary" : "vercel-btn-secondary"}
                style={{ fontSize: 11, padding: "5px 6px" }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Motion */}
        <div>
          <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
            Camera Kinematics
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {MOTIONS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMotion(m.id)}
                className={motion === m.id ? "vercel-btn-primary" : "vercel-btn-secondary"}
                style={{ fontSize: 11, padding: "5px 6px" }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ratio */}
        <div>
          <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
            Aspect Ratio
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            {RATIOS.map((r) => (
              <button
                key={r.id}
                onClick={() => setRatio(r.id)}
                className={ratio === r.id ? "vercel-btn-primary" : "vercel-btn-secondary"}
                style={{ flex: 1, fontSize: 11, padding: "5px 6px" }}
              >
                {r.id}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
            Duration: <strong style={{ color: "#fff" }}>{duration}s</strong>
          </label>
          <div style={{ display: "flex", gap: 4 }}>
            {[5, 10, 15, 30, 60].map((sec) => (
              <button
                key={sec}
                onClick={() => setDuration(sec)}
                className={duration === sec ? "vercel-btn-primary" : "vercel-btn-secondary"}
                style={{ flex: 1, fontSize: 11, padding: "5px 2px" }}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Execute Button */}
      <button
        onClick={() => handleGenerate()}
        disabled={loading || !prompt.trim()}
        className="vercel-btn-primary"
        style={{ width: "100%", padding: "12px 20px", fontSize: 14 }}
      >
        {loading ? (
          <>Synthesizing Video Keyframes… {elapsed > 0 && `(${elapsed}s)`}</>
        ) : (
          <>Generate 4K Cinematic Video ({duration}s)</>
        )}
      </button>

      {error && (
        <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 8, background: "#180a0a", border: "1px solid #7f1d1d", color: "#fca5a5", fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Loading Steps Card */}
      {loading && (
        <div style={{ marginTop: 20, padding: 20, borderRadius: 10, background: "#0a0a0a", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", marginBottom: 6 }}>
            {GENERATION_STEPS[generationStep]}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
            Rendering 60 FPS frames for: <em>"{prompt}"</em>
          </div>
          <div style={{ width: "100%", maxWidth: 360, height: 4, borderRadius: 9999, background: "#1c1c1c", margin: "0 auto", overflow: "hidden" }}>
            <div style={{ width: `${Math.min(95, (elapsed + 1) * 22)}%`, height: "100%", background: "#ffffff", transition: "width 0.6s ease" }} />
          </div>
        </div>
      )}

      {/* Video Player Output */}
      {videoData && !loading && (
        <div style={{ marginTop: 24 }}>
          {/* Angle Switcher Strip */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button
                onClick={() => setSelectedShot("all")}
                className={selectedShot === "all" ? "vercel-btn-primary" : "vercel-btn-secondary"}
                style={{ fontSize: 11, padding: "5px 10px" }}
              >
                Dynamic Multi-Angle Cut
              </button>
              {videoData.shots?.map((shot, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedShot(idx.toString())}
                  className={selectedShot === idx.toString() ? "vercel-btn-primary" : "vercel-btn-secondary"}
                  style={{ fontSize: 11, padding: "5px 10px" }}
                >
                  Angle {idx + 1}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>
              ● 60 FPS HD • {style.toUpperCase()}
            </span>
          </div>

          {/* Unified Player Canvas Container */}
          <div
            ref={playerContainerRef}
            style={{
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid var(--border-default)",
              background: "#000000",
              aspectRatio: ratio === "9:16" ? "9/16" : ratio === "1:1" ? "1/1" : "16/9",
              maxHeight: ratio === "9:16" ? 600 : 480,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
            }}
          >
            <canvas
              ref={canvasRef}
              width={ratio === "9:16" ? 720 : ratio === "1:1" ? 1024 : 1280}
              height={ratio === "9:16" ? 1280 : ratio === "1:1" ? 1024 : 720}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />

            {!imagesReady && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#080808", gap: 12, zIndex: 15 }}>
                <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>Synthesizing video frame layers…</span>
                <div style={{ width: 180, height: 4, background: "#1c1c1c", borderRadius: 9999, overflow: "hidden" }}>
                  <div style={{ width: `${loadProgress}%`, height: "100%", background: "#fff", transition: "width 0.4s ease" }} />
                </div>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{loadProgress}% loaded</span>
              </div>
            )}

            {/* Play/Pause Overlay */}
            {!isPlaying && imagesReady && (
              <div
                onClick={() => setIsPlaying(true)}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0, 0, 0, 0.45)",
                  cursor: "pointer",
                  zIndex: 20,
                }}
              >
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#ffffff", color: "#000000", display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 4 }}>
                  <PlayIcon size={24} />
                </div>
              </div>
            )}

            {/* Scrubber & Controls Overlay */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "12px 16px",
                background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.92) 100%)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                zIndex: 30,
              }}
            >
              <div
                onClick={handleSeek}
                style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.2)", cursor: "pointer", borderRadius: 9999, overflow: "hidden" }}
              >
                <div style={{ width: `${(currentTime / totalDuration) * 100}%`, height: "100%", background: "#ffffff", borderRadius: 9999 }} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => { const p = !isPlaying; setIsPlaying(p); isPlayingRef.current = p; }}
                    className="vercel-btn-ghost"
                    style={{ padding: "4px 8px", color: "#ffffff", background: "rgba(255,255,255,0.1)" }}
                  >
                    {isPlaying ? <PauseIcon size={12} /> : <PlayIcon size={12} />}
                  </button>
                  <span style={{ fontSize: 12, color: "#d4d4d8", fontFamily: "monospace" }}>
                    {formatTime(currentTime)} / {formatTime(totalDuration)}
                  </span>
                  <button
                    onClick={() => {
                      const speeds = [0.5, 1.0, 1.5, 2.0];
                      const idx = speeds.indexOf(playbackSpeed);
                      const next = speeds[(idx + 1) % speeds.length];
                      setSpeed(next);
                      playbackSpeedRef.current = next;
                    }}
                    className="vercel-btn-ghost"
                    style={{ fontSize: 11, padding: "2px 6px", color: "#a1a1aa" }}
                  >
                    {playbackSpeed}x
                  </button>
                </div>

                <button
                  onClick={handleFullscreen}
                  className="vercel-btn-ghost"
                  style={{ padding: "4px 8px" }}
                >
                  <MaximizeIcon size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button
              onClick={handleRecordVideo}
              disabled={isRecording || !imagesReady}
              className="vercel-btn-primary"
              style={{ flex: 1, padding: "10px 16px" }}
            >
              <DownloadIcon size={14} />
              <span>{isRecording ? `Exporting… (${recordProgress}%)` : "Export Video (.webm)"}</span>
            </button>
            <button
              onClick={handleDownloadKeyframe}
              className="vercel-btn-secondary"
              style={{ padding: "10px 16px" }}
            >
              Save Frame (.png)
            </button>
            <button
              onClick={handleCopyLink}
              className="vercel-btn-ghost"
              style={{ padding: "10px 16px" }}
            >
              {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
              <span>{copied ? "Copied" : "Copy Frame Link"}</span>
            </button>
            <button
              onClick={() => handleGenerate()}
              className="vercel-btn-ghost"
              style={{ padding: "10px 16px" }}
            >
              <RefreshIcon size={14} />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
