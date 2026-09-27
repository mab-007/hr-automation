import OlorinHeroPreview from "@/components/ui/olorin-hero-preview"
import type { Brand } from "@/lib/brands"
import "@/styles/brand-cards.css"

/** Designed landing-page previews using original brand assets, not embedded sites. */
export function BrandPreview({ brand, actualHero = false }: { brand: Brand; actualHero?: boolean }) {
  if (actualHero && brand.slug === "olorin") return <OlorinHeroPreview />
  if (actualHero && brand.slug === "nadi") return <div className="actual-nadi"><img src={brand.image} alt="Nadi homepage hero: We build deep thinkers. The score follows. They always do." /></div>
  return (
    <div className={`brand-preview brand-preview--${brand.slug}`}>
      <img className="brand-preview__image" src={brand.image} alt="" loading="eager" decoding="async" />
      <div className="brand-preview__wash" />
      <div className="brand-preview__nav"><span>{brand.name}</span><span>Discover <span aria-hidden="true">↗</span></span></div>
      {brand.slug !== "nadi" && <div className="brand-preview__copy"><span className="brand-preview__eyebrow">{brand.category}</span><h3>{brand.headline}</h3><span className="brand-preview__cta">Explore {brand.name} <span aria-hidden="true">↗</span></span></div>}
      <span className="brand-preview__domain">{new URL(brand.href).hostname.replace("www.", "")}</span>
    </div>
  )
}

export function BrandCard({ brand, index }: { brand: Brand; index: number }) {
  return (
    <a className="brand-card" href={brand.href} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${brand.name}`}>
      <div className="brand-card__frame"><BrandPreview brand={brand} />{brand.workedWith && <span className="brand-card__tag">Worked with</span>}</div>
      <div className="brand-card__caption"><span className="brand-card__number">0{index + 1}</span><h3>{brand.name}</h3><span className="brand-card__category">{brand.category}</span><span aria-hidden="true">↗</span></div>
    </a>
  )
}
