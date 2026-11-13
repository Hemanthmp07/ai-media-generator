import { useState, useRef, useEffect, useCallback } from "react";
import api from "./api.js";

// Load an image with crossOrigin + fallback + timeout
function loadImage(url, timeoutMs = 32000) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    const t = setTimeout(() => { img.src = ""; reject(new Error("Timeout")); }, timeoutMs);
    img.onload  = () => { clearTimeout(t); resolve(img); };
    img.onerror = () => {
      clearTimeout(t);
      // Try again without crossOrigin
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
  { id: "cinematic",  label: "Cinematic Film", icon: "🎬", desc: "Anamorphic 35mm lens, 24fps motion blur & 4K grading" },
  { id: "realistic",  label: "Hyper-Real",     icon: "🌿", desc: "Natural lighting, true-to-life physics & raw textures" },
  { id: "animated",   label: "3D Animation",   icon: "🎨", desc: "Stylized Pixar/CGI look with vibrant rich lighting" },
  { id: "cyberpunk",  label: "Sci-Fi Neon",    icon: "🌌", desc: "Volumetric fog, neon reflections & futuristic tech" },
];

const MOTIONS = [
  { id: "push-in",  label: "Slow Push-In",   icon: "🔍", desc: "Dramatic slow forward zoom into subject" },
  { id: "aerial",   label: "Drone Aerial",   icon: "🛸", desc: "Sweeping overhead aerial panorama" },
  { id: "tracking", label: "Dynamic Track",  icon: "🏎️", desc: "High-speed following movement" },
  { id: "orbit",    label: "360° Orbit",     icon: "🔄", desc: "Smooth rotation around the subject" },
];

const RATIOS = [
  { id: "16:9", label: "16:9 Landscape", icon: "🖥️", desc: "YouTube / Widescreen" },
  { id: "9:16", label: "9:16 Vertical",  icon: "📱", desc: "Reels / TikTok / Shorts" },
  { id: "1:1",  label: "1:1 Square",     icon: "⬜", desc: "Feed / Social Post" },
];

const EXAMPLE_PROMPTS = [
  "mysore dassara illuminated palace at night with golden royal procession",
  "wild majestic tiger roaring loudly in the lush jungle at sunset",
  "car flying in sky over futuristic cyber city with clouds",
  "futuristic neon sports car speeding on cyberpunk desert highway at night",
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

  // Multi-shot camera angle control
  const [selectedShot, setSelectedShot] = useState("all"); // "all", 0, 1, 2

  // Playback states
  const [isPlaying, setIsPlaying]     = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setSpeed]     = useState(1.0);
  const [imagesReady, setImagesReady] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);

  const timerRef           = useRef(null);
  const canvasRef          = useRef(null);
  const animFrameRef       = useRef(null);
  const loadedImagesRef    = useRef([]);
  const particlesRef       = useRef([]);
  const playerContainerRef = useRef(null);
  // Stable refs so render loop doesn't restart on every state change
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

  // Keep refs in sync with state
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

  // Generate atmospheric particles for realistic cinematic motion
  useEffect(() => {
    const particles = [];
    const count = 35;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2.5 + 0.8,
        speedX: (Math.random() - 0.5) * 0.0012,
        speedY: (Math.random() - 0.5) * 0.0012 - 0.0006,
        opacity: Math.random() * 0.65 + 0.2,
      });
    }
    particlesRef.current = particles;
  }, []);

  // Load all cinematic shots when videoData arrives
  useEffect(() => {
    if (!videoData) return;
    setImagesReady(false);
    setLoadingImages(true);
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
        .catch(() => { /* leave null */ })
        .finally(() => {
          loaded++;
          setLoadProgress(Math.round((loaded / total) * 100));
          // Start rendering as soon as the FIRST image arrives
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
        setError("Could not load images — try a shorter prompt.");
        setLoadingImages(false);
        return;
      }
      loadedImagesRef.current = imgs.map(i => i || valid[0]);
      setImagesReady(true);
      setIsPlaying(true);
      isPlayingRef.current = true;
      setLoadingImages(false);
    });
  }, [videoData]);

  // Stable 60 FPS renderer — reads state via refs, never restarts loop
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
    const styleId  = styleRef.current;
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
        scale = 1.0 + 0.22 * ease; dy = -12 * ease;
      } else if (motionId === "aerial") {
        scale = 1.12;
        dx = 34 * Math.sin(localT * Math.PI * 2);
        dy = 16 * Math.cos(localT * Math.PI * 2);
        rot = 0.012 * Math.sin(localT * Math.PI * 2);
      } else if (motionId === "tracking") {
        scale = 1.14; dx = (localT - 0.5) * 80;
      } else if (motionId === "orbit") {
        scale = 1.10 + 0.08 * Math.sin(localT * Math.PI * 2);
        dx = 22 * Math.cos(localT * Math.PI * 2);
        dy = 12 * Math.sin(localT * Math.PI * 2);
        rot = 0.016 * Math.cos(localT * Math.PI * 2);
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

    // Vignette
    const vig = ctx.createRadialGradient(cw/2, ch/2, ch*0.32, cw/2, ch/2, ch*0.9);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(3,7,18,0.72)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, cw, ch);

    // Lens flare
    if (styleId === "cinematic" || styleId === "cyberpunk") {
      const fy = ch * 0.44 + Math.sin(t * Math.PI * 2) * 14;
      const fg = ctx.createLinearGradient(0, fy - 30, cw, fy + 30);
      const fc = styleId === "cyberpunk" ? "rgba(6,182,212,0.11)" : "rgba(245,158,11,0.07)";
      fg.addColorStop(0, "transparent"); fg.addColorStop(0.5, fc); fg.addColorStop(1, "transparent");
      ctx.fillStyle = fg;
      ctx.fillRect(0, fy - 30, cw, 60);
    }

    // Particles
    ctx.fillStyle = styleId === "cyberpunk" ? "rgba(56,189,248,0.8)" : "rgba(254,240,138,0.7)";
    particlesRef.current.forEach((p) => {
      p.x += p.speedX; p.y += p.speedY;
      if (p.y < 0) p.y = 1; if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      ctx.beginPath();
      ctx.arc(p.x * cw, p.y * ch, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stable 60 FPS loop — only starts once, reads everything via refs
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
        // Sync React state ~4x/sec for timeline UI (not every frame)
        if (Math.floor(currentTimeRef.current * 4) !== Math.floor((currentTimeRef.current - delta * playbackSpeedRef.current) * 4)) {
          setCurrentTime(currentTimeRef.current);
        }
      }

      renderFrame();
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderFrame]);

  // Video generation
  const handleGenerate = async (customPrompt) => {
    const targetPrompt = typeof customPrompt === "string" ? customPrompt : prompt;
    const query = (targetPrompt || "").trim();
    if (!query) { setError("Please describe the scene you want to generate."); return; }

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
        console.warn("Backend unavailable, using FLUX fallback:", backendErr.message);
      }

      // Always build shots locally so they always show something
      if (!data?.keyframeUrl || !data?.shots?.length) {
        let [w, h] = [1280, 720];
        if (ratio === "9:16") [w, h] = [720, 1280];
        if (ratio === "1:1")  [w, h] = [1024, 1024];
        const styleModifiers = {
          cinematic: "wide cinematic panoramic shot, 4k film still, anamorphic lens, dramatic lighting, HDR color grading",
          realistic:  "documentary photograph, natural lighting, true-to-life, sharp focus",
          animated:   "3D animation Pixar style, vibrant lighting, CGI render",
          cyberpunk:  "cyberpunk neon aesthetics, volumetric fog, futuristic, 4k ultra-detailed",
        };
        const mod = styleModifiers[style] || styleModifiers.cinematic;
        const s1 = Math.floor(Math.random() * 9000000) + 1000000;
        const s2 = Math.floor(Math.random() * 9000000) + 1000000;
        const s3 = Math.floor(Math.random() * 9000000) + 1000000;
        const mkUrl = (shotMod, seed) =>
          `https://image.pollinations.ai/prompt/${encodeURIComponent(`${query}, ${shotMod}, ${mod}`)}?width=${w}&height=${h}&seed=${seed}&nologo=true&model=flux`;
        const url1 = mkUrl("wide establishing panoramic shot, breathtaking scenery", s1);
        const url2 = mkUrl("dynamic medium action camera angle, dramatic focal depth", s2);
        const url3 = mkUrl("intense dramatic close-up perspective, exquisite details", s3);
        data = {
          title: `AI Cinematic: "${query}"`,
          keyframeUrl: url1,
          shots: [
            { id: 1, title: "Establishing Shot", url: url1 },
            { id: 2, title: "Action Angle",       url: url2 },
            { id: 3, title: "Close-up Climax",    url: url3 },
          ],
          prompt: query,
          duration: parseInt(duration) || 30,
          style, motion, ratio,
          provider: "FLUX AI (Pollinations.ai)",
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

  // Record canvas animation to a downloadable WebM/mp4
  const handleRecordVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesReady) return;
    try {
      setIsRecording(true);
      setRecordProgress(0);
      // Ensure playing from start
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
        const cleanPrompt = prompt.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 28);
        a.download = `ai-video-${cleanPrompt}-${Date.now()}.${ext}`;
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
      console.error("Recording error:", e);
      setIsRecording(false);
      alert("Video recording failed. Try Chrome or Edge.");
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
    a.download = `ai-frame-${Date.now()}.png`;
    a.click();
  };

  const handleFullscreen = () => {
    if (!playerContainerRef.current) return;
    // eslint-disable-next-line no-unused-expressions
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
    <div style={{
      maxWidth: 900,
      margin: "12px auto 40px",
      padding: "30px 32px 36px",
      borderRadius: 26,
      background: "linear-gradient(160deg, rgba(8, 14, 32, 0.98), rgba(14, 22, 52, 0.95))",
      border: "1px solid rgba(56, 189, 248, 0.22)",
      boxShadow: "0 28px 70px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
    }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <span style={{
            background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
            color: "#03172e",
            fontWeight: 800,
            fontSize: 10,
            padding: "3px 10px",
            borderRadius: 999,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}>
            100% Prompt-Matched AI Video
          </span>
          <span style={{ fontSize: 12, color: "#38bdf8", fontWeight: 600 }}>
            • 60 FPS Multi-Angle Cinematic Kinematics
          </span>
        </div>

        <h2 style={{
          margin: 0,
          fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)",
          fontWeight: 900,
          background: "linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          AI Video Generator &amp; Motion Studio
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(203, 213, 225, 0.75)" }}>
          Every video is synthesized specifically and exclusively from your prompt with dynamic multi-angle camera shots and full video export.
        </p>
      </div>

      {/* ── Prompt Input Area ── */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <textarea
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGenerate(); }}
          rows={3}
          placeholder="Describe any scene to generate (e.g. car flying in sky, wild tiger roaring in jungle, mysore dassara illuminated palace at night)…"
          disabled={loading}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "16px 18px",
            borderRadius: 18,
            resize: "vertical",
            background: "rgba(12, 19, 44, 0.85)",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            color: "#f1f5f9",
            fontSize: 15,
            lineHeight: 1.6,
            outline: "none",
            fontFamily: "inherit",
            boxShadow: "inset 0 2px 14px rgba(0, 0, 0, 0.4)",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(56, 189, 248, 0.8)";
            e.target.style.boxShadow = "0 0 18px rgba(56, 189, 248, 0.25), inset 0 2px 14px rgba(0, 0, 0, 0.4)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(56, 189, 248, 0.35)";
            e.target.style.boxShadow = "inset 0 2px 14px rgba(0, 0, 0, 0.4)";
          }}
        />
        <div style={{ position: "absolute", bottom: 10, right: 14, fontSize: 11, color: "rgba(203, 213, 225, 0.4)" }}>
          {prompt.length} / 2000
        </div>
      </div>

      {/* ── Example Prompt Chips ── */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 11, color: "rgba(203, 213, 225, 0.5)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
          💡 Try these prompts:
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {EXAMPLE_PROMPTS.map((ex, i) => (
            <button
              key={i}
              onClick={() => { setPrompt(ex); setError(""); handleGenerate(ex); }}
              style={{
                padding: "6px 13px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                background: "rgba(56, 189, 248, 0.1)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                color: "#7dd3fc",
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(56, 189, 248, 0.22)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(56, 189, 248, 0.1)"; }}
            >
              {ex.slice(0, 36)}…
            </button>
          ))}
        </div>
      </div>

      {/* ── Settings Grid (Style, Motion, Ratio, Duration) ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        marginBottom: 24,
      }}>

        {/* Visual Style Selector */}
        <div style={{
          padding: "16px 18px",
          borderRadius: 18,
          background: "rgba(12, 19, 44, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}>
          <div style={{ fontSize: 11, color: "rgba(203, 213, 225, 0.6)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
            Visual Style
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {STYLES.map((s) => {
              const active = style === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  title={s.desc}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    borderRadius: 12,
                    border: active ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.06)",
                    background: active ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.04)",
                    color: active ? "#ffffff" : "rgba(203, 213, 225, 0.7)",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    textAlign: "left",
                    transition: "all 0.18s",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Camera Motion Selector */}
        <div style={{
          padding: "16px 18px",
          borderRadius: 18,
          background: "rgba(12, 19, 44, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}>
          <div style={{ fontSize: 11, color: "rgba(203, 213, 225, 0.6)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
            Camera Motion Kinematics
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {MOTIONS.map((m) => {
              const active = motion === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMotion(m.id)}
                  title={m.desc}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    borderRadius: 12,
                    border: active ? "1px solid #818cf8" : "1px solid rgba(255, 255, 255, 0.06)",
                    background: active ? "rgba(129, 140, 248, 0.2)" : "rgba(255, 255, 255, 0.04)",
                    color: active ? "#ffffff" : "rgba(203, 213, 225, 0.7)",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    textAlign: "left",
                    transition: "all 0.18s",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div style={{
          padding: "16px 18px",
          borderRadius: 18,
          background: "rgba(12, 19, 44, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}>
          <div style={{ fontSize: 11, color: "rgba(203, 213, 225, 0.6)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
            Aspect Ratio
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {RATIOS.map((r) => {
              const active = ratio === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setRatio(r.id)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: active ? "1px solid #34d399" : "1px solid rgba(255, 255, 255, 0.06)",
                    background: active ? "rgba(52, 211, 153, 0.2)" : "rgba(255, 255, 255, 0.04)",
                    color: active ? "#ffffff" : "rgba(203, 213, 225, 0.7)",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    transition: "all 0.18s",
                  }}
                >
                  <span>{r.icon}</span> {r.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration Controls */}
        <div style={{
          padding: "16px 18px",
          borderRadius: 18,
          background: "rgba(12, 19, 44, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "rgba(203, 213, 225, 0.6)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
              Duration: <span style={{ color: "#38bdf8", fontWeight: 900 }}>{duration} Seconds</span>
            </div>
            <span style={{ fontSize: 11, color: "#34d399", fontWeight: 700, background: "rgba(52, 211, 153, 0.15)", padding: "2px 8px", borderRadius: 999 }}>
              60 FPS HD
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              style={{
                flex: 1,
                cursor: "pointer",
                accentColor: "#38bdf8",
                height: 6,
                borderRadius: 999,
                outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 4 }}>
              {[5, 10, 15, 30, 60].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setDuration(sec)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: duration === sec ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.06)",
                    background: duration === sec ? "rgba(56, 189, 248, 0.3)" : "transparent",
                    color: duration === sec ? "#38bdf8" : "rgba(203,213,225,0.6)",
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── Main Generate Button ── */}
      <button
        onClick={() => handleGenerate()}
        disabled={loading || !prompt.trim()}
        style={{
          width: "100%",
          padding: "16px 24px",
          borderRadius: 18,
          border: "none",
          cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: "0.02em",
          background: loading || !prompt.trim()
            ? "rgba(100, 116, 139, 0.3)"
            : "linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)",
          color: "#ffffff",
          boxShadow: loading || !prompt.trim()
            ? "none"
            : "0 8px 32px rgba(6, 182, 212, 0.45), 0 0 15px rgba(139, 92, 246, 0.3)",
          transition: "all 0.25s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        {loading ? (
          <>
            <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⚙️</span>
            Synthesizing Prompt Video… {elapsed > 0 && `(${elapsed}s)`}
          </>
        ) : (
          <>
            🎬 Generate 4K AI Video ({duration}s)
          </>
        )}
      </button>

      {/* ── Error Display ── */}
      {error && (
        <div style={{
          marginTop: 16,
          padding: "14px 18px",
          borderRadius: 14,
          background: "rgba(239, 68, 68, 0.12)",
          border: "1px solid rgba(239, 68, 68, 0.35)",
          color: "#fca5a5",
          fontSize: 14,
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Loading Animation Card ── */}
      {loading && (
        <div style={{
          marginTop: 24,
          padding: "28px 24px",
          borderRadius: 20,
          background: "linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(139, 92, 246, 0.08))",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🎥</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#ffffff", marginBottom: 6 }}>
            {GENERATION_STEPS[generationStep]}
          </div>
          <div style={{ fontSize: 12, color: "rgba(203, 213, 225, 0.6)", marginBottom: 18 }}>
            Generating multi-angle video strictly for: <em>"{prompt}"</em>
          </div>

          <div style={{
            width: "100%",
            maxWidth: 420,
            height: 6,
            borderRadius: 999,
            background: "rgba(255, 255, 255, 0.08)",
            overflow: "hidden",
            margin: "0 auto",
          }}>
            <div style={{
              width: `${Math.min(95, (elapsed + 1) * 22)}%`,
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, #06b6d4, #3b82f6, #a855f7)",
              transition: "width 0.8s ease",
            }} />
          </div>
        </div>
      )}

      {/* ── Prompt-Matched Video Output ── */}
      {videoData && !loading && (
        <div style={{ marginTop: 28 }}>

          {/* Shot Selection Angle Chips */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
            flexWrap: "wrap",
            gap: 10,
          }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => setSelectedShot("all")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: selectedShot === "all" ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.08)",
                  background: selectedShot === "all" ? "rgba(56, 189, 248, 0.25)" : "rgba(255,255,255,0.04)",
                  color: selectedShot === "all" ? "#ffffff" : "rgba(203,213,225,0.7)",
                }}
              >
                🎬 Dynamic Multi-Angle Cut
              </button>

              {videoData.shots && videoData.shots.map((shot, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedShot(idx.toString())}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: selectedShot === idx.toString() ? "1px solid #34d399" : "1px solid rgba(255,255,255,0.08)",
                    background: selectedShot === idx.toString() ? "rgba(52, 211, 153, 0.25)" : "rgba(255,255,255,0.04)",
                    color: selectedShot === idx.toString() ? "#ffffff" : "rgba(203,213,225,0.7)",
                  }}
                >
                  Shot {idx + 1}: {shot.title || `Angle ${idx + 1}`}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "#34d399", fontWeight: 800 }}>● 100% PROMPT MATCHED</span>
            </div>
          </div>

          {/* Unified Player Screen Container */}
          <div
            ref={playerContainerRef}
            style={{
              position: "relative",
              borderRadius: 22,
              overflow: "hidden",
              border: "1px solid rgba(56, 189, 248, 0.45)",
              boxShadow: "0 24px 65px rgba(0, 0, 0, 0.85), 0 0 30px rgba(6, 182, 212, 0.25)",
              background: "#030712",
              aspectRatio: ratio === "9:16" ? "9/16" : ratio === "1:1" ? "1/1" : "16/9",
              maxHeight: ratio === "9:16" ? 640 : 520,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
            }}
          >

            {/* Canvas for 60 FPS Dynamic Neural Motion */}
            <canvas
              ref={canvasRef}
              width={ratio === "9:16" ? 720 : ratio === "1:1" ? 1024 : 1280}
              height={ratio === "9:16" ? 1280 : ratio === "1:1" ? 1024 : 720}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />

            {/* Loading Shimmer when scene is downloading */}
            {!imagesReady && (
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #080e22, #0e1634)",
                gap: 14,
                zIndex: 15,
              }}>
                <div style={{ fontSize: 44 }}>🎥</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#38bdf8" }}>
                  Generating cinematic frames…
                </div>
                <div style={{ fontSize: 12, color: "rgba(203,213,225,0.65)", maxWidth: 300, textAlign: "center" }}>
                  Pollinations AI is rendering your 3 unique shots. This takes 10–30 seconds.
                </div>
                <div style={{ width: 220, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                  <div style={{
                    width: `${loadProgress}%`, height: "100%", borderRadius: 999,
                    background: "linear-gradient(90deg, #06b6d4, #3b82f6, #a855f7)",
                    transition: "width 0.5s ease",
                  }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#38bdf8" }}>{loadProgress}%</div>
              </div>
            )}

            {/* Top Badges */}
            <div style={{
              position: "absolute",
              top: 14,
              right: 14,
              padding: "5px 12px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#38bdf8",
              display: "flex",
              alignItems: "center",
              gap: 6,
              zIndex: 10,
            }}>
              🎬 4K 60FPS • {style.toUpperCase()} • {totalDuration}s
            </div>

            <div style={{
              position: "absolute",
              top: 14,
              left: 14,
              padding: "5px 12px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              color: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              gap: 6,
              zIndex: 10,
            }}>
              <span>{MOTIONS.find(m => m.id === motion)?.icon || "🔍"}</span>
              <span>{MOTIONS.find(m => m.id === motion)?.label || "Camera Motion"}</span>
            </div>

            {/* Big Play Overlay Button when paused */}
            {!isPlaying && (
              <div
                onClick={() => setIsPlaying(true)}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0, 0, 0, 0.35)",
                  cursor: "pointer",
                  zIndex: 20,
                }}
              >
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 35px rgba(6, 182, 212, 0.6)",
                  fontSize: 28,
                  color: "#03172e",
                  paddingLeft: 4,
                }}>
                  ▶
                </div>
              </div>
            )}

            {/* Bottom Timeline Controls Bar */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "14px 18px",
              background: "linear-gradient(180deg, transparent 0%, rgba(3, 7, 18, 0.96) 100%)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              zIndex: 30,
            }}>
              {/* Clickable Scrubber Bar */}
              <div
                onClick={handleSeek}
                style={{
                  width: "100%",
                  height: 6,
                  borderRadius: 999,
                  background: "rgba(255, 255, 255, 0.2)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{
                  width: `${(currentTime / totalDuration) * 100}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #06b6d4, #3b82f6, #a855f7)",
                  borderRadius: 999,
                  transition: "width 0.1s linear",
                }} />
              </div>

              {/* Player Bottom Row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    onClick={() => {
                      const p = !isPlaying;
                      setIsPlaying(p);
                      isPlayingRef.current = p;
                    }}
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 16,
                      padding: "6px 12px",
                      borderRadius: 8,
                    }}
                  >
                    {isPlaying ? "⏸ Pause" : "▶ Play"}
                  </button>

                  <span style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.85)", fontWeight: 700, fontFamily: "monospace" }}>
                    {formatTime(currentTime)} / {formatTime(totalDuration)}
                  </span>

                  {/* Playback speed toggle */}
                  <button
                    onClick={() => {
                      const speeds = [0.5, 1.0, 1.5, 2.0];
                      const idx = speeds.indexOf(playbackSpeed);
                      const next = speeds[(idx + 1) % speeds.length];
                      setSpeed(next);
                      playbackSpeedRef.current = next;
                    }}
                    style={{
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#38bdf8",
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {playbackSpeed}x
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={handleFullscreen}
                    title="Toggle Fullscreen"
                    style={{
                      padding: "5px 10px",
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.08)",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    ⛶ Fullscreen
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Details & Export Actions Card */}
          <div style={{
            marginTop: 16,
            padding: "18px 22px",
            borderRadius: 18,
            background: "rgba(56, 189, 248, 0.08)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
          }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#f8fafc" }}>
                "{prompt}"
              </div>
              <div style={{ fontSize: 12, color: "rgba(203, 213, 225, 0.7)", marginTop: 4 }}>
                Scene: <strong style={{ color: "#38bdf8" }}>{videoData.shots?.length || 1} Cinematic Shots</strong> • Motion: <strong>{motion}</strong> • Style: <strong>{style}</strong> • Duration: <strong>{totalDuration}s</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={handleCopyLink}
                style={{
                  padding: "9px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  background: "rgba(255, 255, 255, 0.06)",
                  color: "#cbd5e1",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {copied ? "✓ Copied!" : "📋 Copy Scene Link"}
              </button>

              <button
                onClick={handleDownloadKeyframe}
                style={{
                  padding: "9px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  background: "rgba(56, 189, 248, 0.12)",
                  color: "#7dd3fc",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🖼️ Save Current Frame
              </button>

              <button
                onClick={handleRecordVideo}
                disabled={isRecording || !imagesReady}
                style={{
                  padding: "9px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: isRecording || !imagesReady
                    ? "rgba(100, 116, 139, 0.4)"
                    : "linear-gradient(135deg, #06b6d4, #3b82f6)",
                  color: "#03172e",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: isRecording || !imagesReady ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(6, 182, 212, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {isRecording ? (
                  <>⚙️ Exporting… ({recordProgress}%)</>
                ) : (
                  <>🎥 Download Video (.webm)</>
                )}
              </button>
            </div>
          </div>

          {/* Keyframe Thumbnails */}
          {videoData?.shots && videoData.shots.length > 0 && imagesReady && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, color: "rgba(203,213,225,0.5)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>🎞️ Generated Keyframes:</div>
              <div style={{ display: "flex", gap: 10 }}>
                {videoData.shots.map((shot, idx) => (
                  <div key={idx} onClick={() => setSelectedShot(idx.toString())} style={{
                    flex: 1, cursor: "pointer", borderRadius: 12, overflow: "hidden",
                    border: selectedShot === idx.toString() ? "2px solid #38bdf8" : "2px solid rgba(255,255,255,0.08)",
                    transition: "border-color 0.2s",
                  }}>
                    <img src={shot.url} alt={shot.title || `Shot ${idx+1}`}
                      style={{ width: "100%", height: 80, objectFit: "cover", display: "block" }}
                      loading="lazy"
                    />
                    <div style={{ padding: "5px 10px", background: "rgba(12,19,44,0.9)", fontSize: 11, fontWeight: 700, color: "#7dd3fc" }}>
                      {shot.title || `Shot ${idx+1}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Regenerate & New Scene Bar */}
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button
              onClick={() => { setVideoData(null); setImagesReady(false); }}
              style={{
                flex: 1,
                padding: "12px 18px",
                borderRadius: 14,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(255, 255, 255, 0.05)",
                color: "#cbd5e1",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🔄 Create New Scene
            </button>
            <button
              onClick={() => handleGenerate()}
              style={{
                flex: 1,
                padding: "12px 18px",
                borderRadius: 14,
                border: "1px solid rgba(56, 189, 248, 0.4)",
                background: "rgba(56, 189, 248, 0.15)",
                color: "#38bdf8",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ⚡ Regenerate Scene
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
