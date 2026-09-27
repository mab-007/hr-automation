import { useEffect, useRef } from "react"
import "@/styles/portfolio-footer.css"

const linkedin = "https://www.linkedin.com/in/amarnath-bhakat-158723170/"
const aryanLinkedin = "https://www.linkedin.com/in/aryan-kumar-84546120a/"
const email = "mailto:works.amarnath@gmail.com"

export default function PortfolioFooter({ theme = "dark" }: { theme?: "dark" | "paper" }) {
  const statsRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const section = statsRef.current!
    const motion = matchMedia("(prefers-reduced-motion: reduce)")
    if (motion.matches || !("IntersectionObserver" in window)) return
    section.classList.add("impact--animate")
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { section.classList.add("impact--visible"); observer.disconnect() }
    }, { threshold: 0.12 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])
  return (
    <div className={`portfolio-ending portfolio-ending--${theme}`}>
      <section ref={statsRef} className="impact" aria-labelledby="impact-title">
        <div className="impact__intro"><p className="footer-label">The work, in numbers.</p><h2 id="impact-title">Built.<br />Launched.<br /><em>Scaled.</em></h2><p>Experience that turns<br />ambition into outcomes.</p></div>
        <dl className="impact__grid">
          <div className="impact__stat"><dt>Years of experience</dt><dd>8<span>+</span></dd><p>Across engineering, product, and execution.</p></div>
          <div className="impact__stat"><dt>Monthly GTV</dt><dd className="impact__gtv">₹750<span>Cr+</span></dd><p>Supported through the current-account product.</p></div>
          <div className="impact__stat"><dt>Companies built from 0 → 1</dt><dd>5<span>+</span></dd><p>Helped turn early ideas into live products.</p></div>
          <div className="impact__stat"><dt>Users across three markets</dt><dd className="impact__markets"><span className="impact__market-row"><span><i aria-hidden="true">🇺🇸</i> USA</span><span><i aria-hidden="true">🇮🇳</i> India</span></span><span className="impact__market-row"><span><i aria-hidden="true">🇵🇭</i> Philippines</span></span></dd><p>Products used across borders.</p></div>
        </dl>
      </section>
      <footer className="portfolio-footer">
      <section className="portfolio-contact" aria-labelledby="contact-title">
        <div className="portfolio-contact__head"><p className="footer-label">Got something in mind?</p><p>A new platform. A better experience.<br />Something that should exist.</p></div>
        <a className="portfolio-contact__cta" href={`${email}?subject=Let%E2%80%99s%20build%20a%20product`} aria-label="Email Amarnath about your project">
          <h2 id="contact-title">YOUR MOVE.</h2><span className="footer-arrow" aria-hidden="true">↗</span>
        </a>
        <div className="portfolio-contact__bottom"><address className="footer-contact-details"><a href={email}>works.amarnath@gmail.com <span aria-hidden="true">↗</span></a><a href="mailto:aryankumar0310@gmail.com">aryankumar0310@gmail.com <span aria-hidden="true">↗</span></a></address><div className="footer-contact-right"><a className="footer-phone" href="https://wa.me/916203325207" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp at +91 6203325207"><strong>+91 6203325207</strong> <span aria-hidden="true">↗</span></a><div className="footer-social-links"><a href={linkedin} target="_blank" rel="noopener noreferrer">Amarnath Bhakat ↗</a><a href={aryanLinkedin} target="_blank" rel="noopener noreferrer">Aryan Kumar ↗</a><a href="#top">Back to top ↑</a></div></div></div>
      </section>
      </footer>
    </div>
  )
}
