"use client"

import { useEffect, useRef } from "react"
import "@/styles/newspaper-projects.css"
import { brands } from "@/lib/brands"
import { BrandCard } from "@/components/ui/brand-preview"

const newspaper = new URL("../../reference-assets/goat-what-we-do.webm", import.meta.url).href
const newspaperMp4 = new URL("../../reference-assets/goat-what-we-do.mp4", import.meta.url).href
const poster = new URL("../../reference-assets/goat-what-we-do-poster.jpg", import.meta.url).href
const artboard = new URL("../../reference-assets/goat-wemake-artboard.svg", import.meta.url).href
/** Newspaper introduction, six selected projects and collaborations. */
export default function NewspaperProjects() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const mobile = matchMedia("(max-width: 640px)")
    const reduced = matchMedia("(prefers-reduced-motion: reduce)")
    const cards = [...rootRef.current!.querySelectorAll<HTMLElement>(".wemake-card")]
    let observer: IntersectionObserver | undefined
    const update = () => {
      observer?.disconnect()
      cards.forEach(card => card.classList.remove("mobile-reveal", "is-visible"))
      if (!mobile.matches || reduced.matches) return
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            observer?.unobserve(entry.target)
          }
        })
      }, { threshold: .08 })
      cards.forEach(card => { card.classList.add("mobile-reveal"); observer!.observe(card) })
    }
    update()
    mobile.addEventListener("change", update)
    reduced.addEventListener("change", update)
    return () => { observer?.disconnect(); mobile.removeEventListener("change", update); reduced.removeEventListener("change", update) }
  }, [])

  useEffect(() => {
    const section = rootRef.current!
    const inner = section.querySelector<HTMLElement>(".wemake__inner")!
    const intro = section.querySelector<HTMLElement>(".wemake__intro-media")!
    const introScreen = section.querySelector<HTMLElement>(".wemake__screen--intro")!
    const video = section.querySelector<HTMLVideoElement>("video")!
    const title = section.querySelector<HTMLElement>(".wemake__title")!
    const backdrop = section.querySelector<HTMLElement>(".wemake__artboard")!
    const cards = section.querySelector<HTMLElement>(".wemake__cards")!
    const fill = section.querySelector<HTMLElement>(".wemake__progress-fill")!
    const desktop = matchMedia("(min-width: 1025px)")
    const reduced = matchMedia("(prefers-reduced-motion: reduce)")
    let pinned = false
    let distance = 0
    let start = 0
    let raf = 0
    let visible = false
    let disposed = false
    let travel = 0
    let lastFrame = 0
    const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value))

    function updateProgress() {
      const range = cards.scrollWidth - cards.clientWidth
      fill.style.transform = `scaleX(${range > 0 ? cards.scrollLeft / range : 0})`
    }

    function draw(now: number) {
      raf = 0
      if (!pinned) return updateProgress()
      const target = clamp(window.scrollY - start, distance)
      const elapsed = lastFrame ? Math.min(64, now - lastFrame) : 16.67
      lastFrame = now
      // Frame-rate independent damping; every layer uses the same position.
      travel += (target - travel) * (1 - Math.exp(-elapsed / 65))
      if (Math.abs(target - travel) < 0.1) travel = target
      const progress = distance > 0 ? travel / distance : 0
      // Native sticky positioning owns the vertical axis; JS moves only sideways.
      inner.style.transform = `translate3d(${-travel}px, 0, 0)`
      intro.style.transform = `translateX(${travel * 0.5}px) scale(${1 + progress * 0.1})`
      intro.style.opacity = String(Math.max(0.0001, 1 - progress))
      // Keep the heading and background in place while the cards continue past.
      const headingTravel = Math.max(0, travel - window.innerWidth)
      title.style.transform = backdrop.style.transform = `translate3d(${headingTravel}px, 0, 0)`
      if (travel !== target) request()
      else lastFrame = 0
    }

    function request() {
      if (!raf && !disposed) raf = requestAnimationFrame(draw)
    }

    function measure() {
      if (disposed) return
      pinned = desktop.matches && !reduced.matches
      section.classList.toggle("wemake--pinned", pinned)
      for (const element of [inner, intro, title, backdrop]) element.style.transform = ""
      intro.style.opacity = ""
      if (pinned) {
        distance = Math.max(0, inner.scrollWidth - window.innerWidth)
        section.style.height = `${introScreen.offsetHeight + distance}px`
        cards.removeAttribute("tabindex")
      } else {
        section.style.height = ""
        cards.setAttribute("tabindex", "0")
      }
      start = section.getBoundingClientRect().top + window.scrollY
      travel = clamp(window.scrollY - start, distance)
      lastFrame = 0
      cancelAnimationFrame(raf)
      // Apply measured geometry synchronously so a resize cannot flash unpinned content.
      draw(performance.now())
    }

    function play() {
      if (visible && !document.hidden && !reduced.matches && !video.ended) {
        void video.play().catch(() => {})
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) play()
      else video.pause()
    }, { threshold: 0.15 })
    observer.observe(introScreen)

    function visibilityChange() {
      if (document.hidden) video.pause()
      else play()
    }

    function motionChange() {
      measure()
      if (reduced.matches) video.pause()
      else play()
    }

    function focusCard(event: FocusEvent) {
      const card = event.target instanceof Element ? event.target.closest<HTMLElement>(".wemake-card") : null
      if (!pinned || !card) return
      const rect = card.getBoundingClientRect()
      if (rect.left < 0 || rect.right > window.innerWidth) {
        const current = clamp(window.scrollY - start, distance)
        const target = clamp(current + rect.left - 32, distance)
        window.scrollTo({ top: start + target, behavior: "instant" })
      }
    }

    window.addEventListener("scroll", request, { passive: true })
    window.addEventListener("resize", measure)
    desktop.addEventListener("change", measure)
    reduced.addEventListener("change", motionChange)
    document.addEventListener("visibilitychange", visibilityChange)
    cards.addEventListener("scroll", updateProgress, { passive: true })
    section.addEventListener("focusin", focusCard)
    void document.fonts.ready.then(measure)
    measure()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      video.pause()
      window.removeEventListener("scroll", request)
      window.removeEventListener("resize", measure)
      desktop.removeEventListener("change", measure)
      reduced.removeEventListener("change", motionChange)
      document.removeEventListener("visibilitychange", visibilityChange)
      cards.removeEventListener("scroll", updateProgress)
      section.removeEventListener("focusin", focusCard)
    }
  }, [])

  return (
    <>
    <section ref={rootRef} className="wemake" id="what-we-do" aria-labelledby="wemake-title">
      <div className="wemake__viewport">
      <div className="wemake__inner">
        <div className="wemake__screen wemake__screen--intro">
          <div className="wemake__intro-media">
            <video muted playsInline preload="auto" poster={poster} aria-label="What we do — animated newspaper">
              <source src={newspaperMp4} type="video/mp4" />
              <source src={newspaper} type="video/webm" />
            </video>
          </div>
        </div>
        <div className="wemake__screen wemake__screen--cards">
          <div className="wemake__artboard" aria-hidden="true"><img src={artboard} alt="" /></div>
          <div className="wemake__content">
            <h2 className="wemake__title" id="wemake-title">
              Ideas made real.<br /><span className="wemake__accent">Selected work.</span>
            </h2>
            <ul className="wemake__cards" tabIndex={0} aria-label="Selected projects and collaborations">
              {brands.map((brand, index) => (
                <li className="wemake-card portfolio-card" key={brand.slug}>
                  <BrandCard brand={brand} index={index} />
                </li>
              ))}
            </ul>
            <div className="wemake__progress" aria-hidden="true"><span className="wemake__progress-fill" /></div>
          </div>
        </div>
      </div>
      </div>
    </section>

    </>
  )
}
