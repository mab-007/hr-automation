import { useId, useLayoutEffect, useRef, useState } from "react"

const wheel = new URL("../../reference-assets/wheel-smooth.png", import.meta.url).href
export const WHEEL_INK = "#9E2A2B"

/** User-supplied smooth-rim wheel, sized to the actual visible numeral height. */
export default function Wheel365Mark({ settle = 1, reveal = 1, startDiameter = 440, startX = 500, rotation = 0 }: { settle?: number; reveal?: number; startDiameter?: number; startX?: number; rotation?: number }) {
  const inkId = `wheel-ink-${useId().replace(/[^a-zA-Z0-9]/g, "")}`
  const textRef = useRef<SVGTextElement>(null)
  const [size, setSize] = useState({ top: 202, height: 206 })
  useLayoutEffect(() => {
    let disposed = false
    const measure = () => {
      if (disposed || !textRef.current) return
      const style = getComputedStyle(textRef.current)
      const context = document.createElement("canvas").getContext("2d")
      if (!context) return
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
      const metrics = context.measureText("365")
      const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
      if (height > 0) setSize({ top: 404 - metrics.actualBoundingBoxAscent, height })
    }
    measure()
    void document.fonts.ready.then(measure)
    return () => { disposed = true }
  }, [])
  return (
    <g aria-hidden="true">
      <defs>
        <filter id={inkId} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
          {/* Solid #9E2A2B; remove both the white background and grey spoke openings. */}
          <feColorMatrix type="matrix" values="0 0 0 0 0.619608  0 0 0 0 0.164706  0 0 0 0 0.168627  0 -4 0 3 0" />
        </filter>
      </defs>
      <g transform={`translate(${startX + (274 - startX) * settle} ${278 + (size.top + size.height / 2 - 278) * settle}) rotate(${rotation})`}>
      <svg x={-(startDiameter + (size.height - startDiameter) * settle) / 2} y={-(startDiameter + (size.height - startDiameter) * settle) / 2} width={startDiameter + (size.height - startDiameter) * settle} height={startDiameter + (size.height - startDiameter) * settle} viewBox="0 4 1016 1016" overflow="hidden">
        <image href={wheel} width="1016" height="1024" filter={`url(#${inkId})`} />
      </svg>
      </g>
      <text ref={textRef} opacity={reveal} transform={`translate(0 ${18 * (1 - reveal)})`} x="645" y="404" textAnchor="middle" textLength="420" lengthAdjust="spacingAndGlyphs" fill={WHEEL_INK} style={{ fontFamily: 'Impact, "Arial Black", sans-serif', fontSize: 250, fontWeight: 400 }}>365</text>
    </g>
  )
}
