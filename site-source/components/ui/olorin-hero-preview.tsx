import { useEffect, useRef } from "react"
import { vertexShader, fragmentShader } from "@/lib/olorin-shaders"

/** Original student hero copy and shader, scaled to the expanding card. */
export default function OlorinHeroPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current!
    const gl = canvas.getContext("webgl", { antialias: false, powerPreference: "low-power" })
    if (!gl) return
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null }
      return shader
    }
    const vertex = compile(gl.VERTEX_SHADER, vertexShader)
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentShader)
    if (!vertex || !fragment) return
    const program = gl.createProgram()!
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment); return }
    gl.useProgram(program)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(program, "aPos")
    gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)
    gl.uniform1f(gl.getUniformLocation(program, "uHorizon"), .74)
    gl.uniform1f(gl.getUniformLocation(program, "uSky"), .62)
    ;[[27,52,120],[37,99,235],[123,166,246],[214,228,251]].forEach(([r,g,b],i) => gl.uniform3f(gl.getUniformLocation(program, `uC${i}`),r/255,g/255,b/255))
    const resolution = gl.getUniformLocation(program,"uRes")
    const time = gl.getUniformLocation(program,"uTime")
    const motion = matchMedia("(prefers-reduced-motion: reduce)")
    let raf = 0, last = 0, visible = true
    function paint(now: number) {
      const w = Math.max(1, Math.round(canvas.clientWidth * .5)), h = Math.max(1, Math.round(canvas.clientHeight * .5))
      if (canvas.width !== w || canvas.height !== h) { canvas.width=w; canvas.height=h; gl!.viewport(0,0,w,h) }
      gl!.uniform2f(resolution,w,h); gl!.uniform1f(time, motion.matches ? 12 : now / 1000 + 12)
      gl!.drawArrays(gl!.TRIANGLE_STRIP,0,4)
    }
    function tick(now: number) {
      raf = 0
      if (!visible || document.hidden) return
      if(now-last > 33) { paint(now); last=now }
      if(!motion.matches) raf=requestAnimationFrame(tick)
    }
    function resume() { if(!raf) raf=requestAnimationFrame(tick) }
    const observer = new IntersectionObserver(([e]) => { visible=e.isIntersecting; if(visible) resume() })
    observer.observe(canvas)
    const resize = new ResizeObserver(() => paint(performance.now())); resize.observe(canvas)
    document.addEventListener("visibilitychange",resume); motion.addEventListener("change",resume)
    paint(performance.now()); resume()
    return () => { cancelAnimationFrame(raf); observer.disconnect(); resize.disconnect(); document.removeEventListener("visibilitychange",resume); motion.removeEventListener("change",resume); gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment) }
  }, [])
  return (
    <div className="actual-olorin">
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="actual-olorin__nav" aria-hidden="true"><span><b>Olórin</b><i>Products⌄</i></span><span><i>EN</i><i>Contact Us</i><em>Log in</em></span></div>
      <div className="actual-olorin__copy"><h3>A guide for the<br />journey ahead.</h3><p><b>For students</b> — revision notes, practice, and a clear view of what you&apos;ve mastered.</p><span>Log in</span></div>
    </div>
  )
}
