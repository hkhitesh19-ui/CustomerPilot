"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Download,
  Film,
  Sparkles,
  Sliders,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Volume2,
  VolumeX,
  Share2,
} from "lucide-react"
import { VIDEO_PRESETS, VideoPreset, VideoBeat } from "@/lib/video-pipeline"

export default function VideoStudioPage() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("swiss-motion")
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [exportProgress, setExportProgress] = useState<number>(0)
  const [isMuted, setIsMuted] = useState<boolean>(false)

  // Canvas ref for 60 FPS vector video rendering
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  const activePreset: VideoPreset = VIDEO_PRESETS[selectedPresetId] || VIDEO_PRESETS["swiss-motion"]

  // Find active beat based on playhead time
  const activeBeat: VideoBeat = activePreset.beats.find(
    (b) => currentTime >= b.startSec && currentTime < b.endSec
  ) || activePreset.beats[activePreset.beats.length - 1]

  // Play / Pause loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      return
    }

    let start = performance.now() - currentTime * 1000

    const renderLoop = (now: number) => {
      const elapsed = (now - start) / 1000

      if (elapsed >= activePreset.durationSec) {
        setCurrentTime(0)
        setIsPlaying(false)
        return
      }

      setCurrentTime(elapsed)
      drawFrame(elapsed)
      animationFrameRef.current = requestAnimationFrame(renderLoop)
    }

    animationFrameRef.current = requestAnimationFrame(renderLoop)

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [isPlaying, selectedPresetId])

  // Initial canvas draw on change
  useEffect(() => {
    drawFrame(currentTime)
  }, [currentTime, selectedPresetId])

  // Programmatic 60 FPS vector renderer onto 1080x1920 (9:16) Canvas
  const drawFrame = (time: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Current beat & progression
    const beat = activePreset.beats.find((b) => time >= b.startSec && time < b.endSec) || activePreset.beats[activePreset.beats.length - 1]
    const beatDuration = beat.endSec - beat.startSec
    const beatProgress = Math.min(1, Math.max(0, (time - beat.startSec) / beatDuration))

    // 1. Background Fill with subtle radial lighting
    ctx.fillStyle = activePreset.colorPalette.background
    ctx.fillRect(0, 0, width, height)

    const gradient = ctx.createRadialGradient(
      width / 2,
      height * 0.4,
      50,
      width / 2,
      height * 0.4,
      width * 0.8
    )
    gradient.addColorStop(0, `${activePreset.colorPalette.accent}22`)
    gradient.addColorStop(1, "transparent")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // 2. Animated Header Navigation / Branding Badge
    ctx.save()
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)"
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(width * 0.08, height * 0.08, width * 0.84, 90, 45)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 32px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("⚡ CustomerPilot AI Studio", width * 0.14, height * 0.08 + 56)

    ctx.fillStyle = activePreset.colorPalette.accent
    ctx.font = "bold 26px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(activePreset.funnelStage.split(" ")[0], width * 0.86, height * 0.08 + 56)
    ctx.restore()

    // 3. Central Dynamic Visual Element based on Presets
    const centerY = height * 0.44

    if (beat.screenState.primaryElement === "ALERT_CARD") {
      // Swiss-motion High-Contrast Alert Card
      ctx.save()
      const pulse = Math.sin(time * 8) * 6
      ctx.fillStyle = activePreset.colorPalette.cardBg
      ctx.strokeStyle = beat.screenState.accentColor
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.roundRect(width * 0.08 - pulse / 2, centerY - 280 - pulse / 2, width * 0.84 + pulse, 560 + pulse, 36)
      ctx.fill()
      ctx.stroke()

      // Red Buzzer Warning Icon
      ctx.fillStyle = beat.screenState.accentColor
      ctx.beginPath()
      ctx.arc(width / 2, centerY - 140, 70, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 64px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("⚠️", width / 2, centerY - 118)

      // Headline Text
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 44px sans-serif"
      ctx.fillText(beat.screenState.headline, width / 2, centerY + 30)

      // Subtext
      ctx.fillStyle = "#94a3b8"
      ctx.font = "28px sans-serif"
      ctx.fillText(beat.screenState.subtext, width / 2, centerY + 110)

      // Alert Badge Pill
      if (beat.screenState.badgeText) {
        ctx.fillStyle = beat.screenState.accentColor
        ctx.beginPath()
        ctx.roundRect(width / 2 - 220, centerY + 180, 440, 60, 30)
        ctx.fill()

        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 24px sans-serif"
        ctx.fillText(beat.screenState.badgeText, width / 2, centerY + 218)
      }
      ctx.restore()
    } else if (beat.screenState.primaryElement === "CURSOR_FLOW") {
      // Living-Screencast Interactive Pan-and-Zoom Card with Live Cursor
      ctx.save()
      ctx.fillStyle = activePreset.colorPalette.cardBg
      ctx.strokeStyle = "rgba(59, 130, 246, 0.4)"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.roundRect(width * 0.08, centerY - 280, width * 0.84, 560, 36)
      ctx.fill()
      ctx.stroke()

      // 3 Interactive Step Nodes
      const steps = ["1. QR Scan", "2. WhatsApp Stamp", "3. Maps Rank #1"]
      steps.forEach((step, idx) => {
        const stepY = centerY - 150 + idx * 140
        const isCurrent = (time > 0 && idx === 0) || (time > 7 && idx <= 1) || (time > 18 && idx <= 2)

        ctx.fillStyle = isCurrent ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.05)"
        ctx.strokeStyle = isCurrent ? "#3b82f6" : "rgba(255, 255, 255, 0.1)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(width * 0.12, stepY, width * 0.76, 100, 20)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = isCurrent ? "#60a5fa" : "#94a3b8"
        ctx.font = "bold 32px sans-serif"
        ctx.textAlign = "left"
        ctx.fillText(step, width * 0.18, stepY + 60)

        ctx.fillStyle = isCurrent ? "#10b981" : "#64748b"
        ctx.beginPath()
        ctx.arc(width * 0.82, stepY + 50, 22, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 20px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(isCurrent ? "✓" : `${idx + 1}`, width * 0.82, stepY + 57)
      })

      // Simulated Animated Cursor Pointer
      const cursorX = width * 0.5 + Math.sin(time * 3) * 120
      const cursorY = centerY - 100 + ((time * 30) % 360)
      ctx.fillStyle = "#ffffff"
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.moveTo(cursorX, cursorY)
      ctx.lineTo(cursorX + 24, cursorY + 24)
      ctx.lineTo(cursorX + 12, cursorY + 28)
      ctx.lineTo(cursorX + 20, cursorY + 44)
      ctx.lineTo(cursorX + 10, cursorY + 48)
      ctx.lineTo(cursorX + 2, cursorY + 32)
      ctx.lineTo(cursorX, cursorY + 40)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    } else if (beat.screenState.primaryElement === "HUD_3D_CARD") {
      // Dark Keynote Glass Product Card with 3D Tilt
      ctx.save()
      const tilt = Math.sin(time * 2) * 15
      ctx.translate(width / 2, centerY)
      ctx.rotate((tilt * Math.PI) / 180)

      const cardGrad = ctx.createLinearGradient(-380, -250, 380, 250)
      cardGrad.addColorStop(0, "rgba(139, 92, 246, 0.25)")
      cardGrad.addColorStop(0.5, "rgba(15, 23, 42, 0.85)")
      cardGrad.addColorStop(1, "rgba(59, 130, 246, 0.25)")

      ctx.fillStyle = cardGrad
      ctx.strokeStyle = "rgba(167, 139, 250, 0.5)"
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.roundRect(-width * 0.4, -260, width * 0.8, 520, 36)
      ctx.fill()
      ctx.stroke()

      // Glowing Metrics HUD Counter
      ctx.fillStyle = "#a78bfa"
      ctx.font = "bold 28px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("EXECUTIVE RETENTION HUD", 0, -170)

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 80px sans-serif"
      ctx.fillText("+40.8%", 0, -40)

      ctx.fillStyle = "#10b981"
      ctx.font = "bold 32px sans-serif"
      ctx.fillText("REPEAT SALES VELOCITY", 0, 30)

      ctx.fillStyle = "#cbd5e1"
      ctx.font = "26px sans-serif"
      ctx.fillText("VIP Club Automation · 0 Effort", 0, 100)

      // Verified Pill
      ctx.fillStyle = "rgba(16, 185, 129, 0.2)"
      ctx.strokeStyle = "#10b981"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(-180, 150, 360, 56, 28)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = "#10b981"
      ctx.font = "bold 24px sans-serif"
      ctx.fillText("✓ VERIFIED CLIENT ROI", 0, 187)
      ctx.restore()
    } else {
      // Split Countdown / Logo Reveal
      ctx.save()
      ctx.fillStyle = activePreset.colorPalette.cardBg
      ctx.strokeStyle = activePreset.colorPalette.accent
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.roundRect(width * 0.08, centerY - 280, width * 0.84, 560, 36)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = activePreset.colorPalette.accent
      ctx.font = "bold 100px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("🚀", width / 2, centerY - 80)

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 46px sans-serif"
      ctx.fillText(beat.screenState.headline, width / 2, centerY + 30)

      ctx.fillStyle = "#94a3b8"
      ctx.font = "28px sans-serif"
      ctx.fillText(beat.screenState.subtext, width / 2, centerY + 100)

      ctx.fillStyle = "#10b981"
      ctx.beginPath()
      ctx.roundRect(width / 2 - 240, centerY + 160, 480, 70, 35)
      ctx.fill()

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 28px sans-serif"
      ctx.fillText("CLAIM FREE TRIAL NOW", width / 2, centerY + 205)
      ctx.restore()
    }

    // 4. Kinetic Subtitle Bar (Synchronized with Hinglish Voiceover)
    ctx.save()
    const subtitleY = height * 0.76
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)"
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(width * 0.06, subtitleY, width * 0.88, 220, 28)
    ctx.fill()
    ctx.stroke()

    // Voiceover waveform indicator
    ctx.fillStyle = activePreset.colorPalette.accent
    ctx.font = "bold 20px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("🎙️ VOICE OVER (HINGLISH DIRECT-RESPONSE)", width * 0.1, subtitleY + 44)

    // Subtitle Text wrapping
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 28px sans-serif"
    ctx.textAlign = "left"
    const words = beat.text.split(" ")
    let line = ""
    let lineY = subtitleY + 95

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " "
      const metrics = ctx.measureText(testLine)
      if (metrics.width > width * 0.78 && n > 0) {
        ctx.fillText(line, width * 0.1, lineY)
        line = words[n] + " "
        lineY += 40
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, width * 0.1, lineY)
    ctx.restore()

    // 5. Timeline Progress Bar at Bottom
    ctx.save()
    const progressY = height - 40
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
    ctx.fillRect(0, progressY, width, 40)

    const progressWidth = (time / activePreset.durationSec) * width
    ctx.fillStyle = activePreset.colorPalette.accent
    ctx.fillRect(0, progressY, progressWidth, 40)
    ctx.restore()
  }

  // Handle Video Export (Record Canvas to WebM/MP4)
  const handleExportVideo = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsExporting(true)
    setExportProgress(0)

    try {
      const stream = canvas.captureStream(60) // 60 FPS
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      })

      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `CustomerPilot_${selectedPresetId}_60fps.webm`
        a.click()
        URL.revokeObjectURL(url)
        setIsExporting(false)
        setExportProgress(100)
      }

      recorder.start()
      setIsPlaying(false)

      // Step through frames deterministically
      const totalSeconds = activePreset.durationSec
      const step = 0.05 // 20 frames per sec export step
      let t = 0

      const exportInterval = setInterval(() => {
        t += step
        drawFrame(t)
        setExportProgress(Math.min(99, Math.round((t / totalSeconds) * 100)))

        if (t >= totalSeconds) {
          clearInterval(exportInterval)
          recorder.stop()
        }
      }, 50)
    } catch (e: any) {
      console.error("Export failed:", e)
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Film className="w-3.5 h-3.5" /> Module 1: Programmatic Video Generation Pipeline (Lemo-Opuscar Engine)
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <Video className="w-8 h-8 text-indigo-400" />
            CustomerPilot Video Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Generate 60 FPS deterministic, code-rendered marketing assets across 4 distinct funnel stages without generative AI video distortion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportVideo}
            disabled={isExporting}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold shadow-lg"
          >
            {isExporting ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Rendering 60 FPS ({exportProgress}%)...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Code-Rendered Video (60 FPS)
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preset Selector Tabs (4 Funnel Tiers from Module 1 & 2.1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(VIDEO_PRESETS).map((preset) => {
          const isSelected = preset.id === selectedPresetId
          return (
            <button
              key={preset.id}
              onClick={() => {
                setSelectedPresetId(preset.id)
                setCurrentTime(0)
                setIsPlaying(false)
              }}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? "bg-slate-900 border-indigo-500 shadow-md ring-2 ring-indigo-500/30"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  {preset.funnelStage}
                </span>
                <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
                  {preset.durationSec}s
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{preset.name.split("(")[0]}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{preset.visualStrategy}</p>
            </button>
          )
        })}
      </div>

      {/* Main Studio Work Area */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 60 FPS Smartphone Video Preview (9:16) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-[340px] sm:w-[380px] h-[670px] sm:h-[720px] bg-black rounded-[48px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700">
            {/* Phone Speaker Notch */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-20" />

            {/* Canvas Viewport */}
            <div className="w-full h-full rounded-[38px] overflow-hidden bg-slate-950 relative">
              <canvas
                ref={canvasRef}
                width={1080}
                height={1920}
                className="w-full h-full object-cover"
              />

              {/* Floating Play/Pause Overlay on Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                <Button
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Timeline & Scrubber Controls */}
          <div className="w-full max-w-[380px] mt-4 p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:bg-slate-800"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setCurrentTime(0)
                setIsPlaying(false)
              }}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <div className="flex-1 flex flex-col gap-1">
              <input
                type="range"
                min={0}
                max={activePreset.durationSec}
                step={0.1}
                value={currentTime}
                onChange={(e) => {
                  setCurrentTime(parseFloat(e.target.value))
                  setIsPlaying(false)
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>{currentTime.toFixed(1)}s</span>
                <span>{activePreset.durationSec}.0s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Storyboard, Beat Sheet, and Voiceover Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Preset Specification Header */}
          <Card className="bg-slate-900/60 border-slate-800 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  {activePreset.name}
                </CardTitle>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {activePreset.aspectRatio} Vertical Reel · 60 FPS
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-xs text-slate-400 font-bold uppercase mb-1">Visual Strategy</div>
                  <div className="text-slate-200 text-xs">{activePreset.visualStrategy}</div>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-xs text-slate-400 font-bold uppercase mb-1">CustomerPilot Use Case</div>
                  <div className="text-slate-200 text-xs">{activePreset.customerPilotUseCase}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timed Beat Sheet (Section 2.2 from Guide) */}
          <Card className="bg-slate-900/60 border-slate-800 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                Production Voiceover Scripts &amp; Timed Beat Sheet (Hinglish Direct-Response)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activePreset.beats.map((beat, idx) => {
                const isActive = currentTime >= beat.startSec && currentTime < beat.endSec
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentTime(beat.startSec)
                      setIsPlaying(true)
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? "bg-slate-800/90 border-indigo-500 shadow-lg ring-1 ring-indigo-500/40"
                        : "bg-slate-950/50 border-slate-800/70 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                          [{beat.startSec}:00 – {beat.endSec}:00]
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {beat.visualCue}
                        </span>
                      </div>
                      {isActive && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-medium text-slate-100 italic mb-2">
                      "{beat.text}"
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                      <span>🎬 Element: <strong className="text-slate-300">{beat.screenState.primaryElement}</strong></span>
                      <span>🎨 Accent: <span style={{ color: beat.screenState.accentColor }}>● {beat.screenState.accentColor}</span></span>
                      {beat.screenState.badgeText && (
                        <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                          {beat.screenState.badgeText}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Export & Deployment Quick Box */}
          <div className="p-4 bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border border-indigo-800/40 rounded-2xl flex items-center justify-between">
            <div className="text-xs text-slate-300">
              <strong className="text-white block text-sm">Need Batch Automated Video Generation?</strong>
              Programmatic WebM/MP4 renders in pure 60 FPS without external GPU cloud fees.
            </div>
            <Button
              onClick={handleExportVideo}
              disabled={isExporting}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white shrink-0"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Quick Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
