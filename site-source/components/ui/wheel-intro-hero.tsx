"use client"

import { useEffect, useRef, useState } from "react"
import TigerTearReveal, { clamp01, smooth } from "./tiger-tear-reveal"
import Wheel365Mark, { WHEEL_INK } from "./wheel-365-mark"
import "../../styles/wheel-intro.css"

export default function WheelIntroHero() {
  const root = useRef<HTMLElement>(null)
  const [frame, setFrame] = useState({ progress: 0, angle: 0, diameter: 440, startX: 36, reduced: false })

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    let raf = 0
    let last = 0
    let progress = 0
    let angle = 0
    let visible = true
    const tick = (now: number) => {
      raf = 0
      if (!root.current || !visible || document.hidden) return
      const dt = last ? Math.min(now - last, 50) : 16
      last = now
      const bounds = root.current.getBoundingClientRect()
      const target = clamp01(-bounds.top / Math.max(1, bounds.height - innerHeight))
      const previousProgress = progress
      progress += (target - progress) * (1 - Math.exp(-dt / 65))
      if (Math.abs(target - progress) < .00005) progress = target
      const settle = smooth(0, .36, progress)
      // Keep rotation clockwise as the wheel shrinks; never unwind its angle.
      if (!media.matches) angle += dt * .025 * (1 - settle) + Math.max(0, Math.min(progress, .36) - Math.min(previousProgress, .36)) * 720
      const scale = Math.min(innerWidth / 928, innerHeight / 468)
      setFrame({ progress, angle, diameter: Math.min(innerWidth * .84, innerHeight * .94) / scale, startX: 500 - innerWidth / (2 * scale), reduced: media.matches })
      if (!media.matches && (settle < 1 || progress !== target)) raf = requestAnimationFrame(tick)
    }
    const request = () => { if (!raf) { last = 0; raf = requestAnimationFrame(tick) } }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) request() })
    if (root.current) observer.observe(root.current)
    addEventListener("scroll", request, { passive: true })
    addEventListener("resize", request)
    document.addEventListener("visibilitychange", request)
    media.addEventListener("change", request)
    request()
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      removeEventListener("scroll", request)
      removeEventListener("resize", request)
      document.removeEventListener("visibilitychange", request)
      media.removeEventListener("change", request)
    }
  }, [])

  const settle = frame.reduced ? 1 : smooth(0, .36, frame.progress)
  const reveal = frame.reduced ? 1 : smooth(.38, .49, frame.progress)
  const tear = frame.reduced ? 0 : clamp01((frame.progress - .54) / .46)
  const copy = frame.reduced ? 0 : 1 - smooth(.025, .19, frame.progress)
  return <section ref={root} className="wheel-intro" aria-label="Wheel365 — from idea to launch">
    <div className="wheel-intro__stage">
      <TigerTearReveal word="Wheel 365" tagline="" hint={false} progress={tear} wordMark={<>
        <Wheel365Mark settle={settle} reveal={reveal} startDiameter={frame.diameter} startX={frame.startX} rotation={frame.reduced ? 0 : frame.angle} />
        <text x="500" y="150" textAnchor="middle" fill={WHEEL_INK} opacity={reveal} style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 32, fontWeight: 700, letterSpacing: ".04em" }}>FROM IDEA TO LAUNCH</text>
      </>} />
      <div className="wheel-intro__copy" style={{ opacity: copy, visibility: copy > 0 ? "visible" : "hidden", transform: `translateY(calc(-50% - ${(1 - copy) * 24}px))` }}>
        <p className="wheel-intro__label">WHEEL / 365</p>
        <h1>IDEAS DON’T<br />STAND STILL.</h1>
        <p className="wheel-intro__statement">Neither do we.</p>
      </div>
      <div className="wheel-intro__hint" aria-hidden="true" style={{ opacity: frame.reduced ? 0 : 1 - smooth(0, .08, frame.progress) }}>SCROLL TO SET IT IN MOTION ↓</div>
    </div>
  </section>
}
