export const brands = [
  { name: "slice", slug: "slice", href: "https://slice.bank.in/", category: "Banking", headline: "A new bank,\nfor a new India.", image: new URL("../reference-assets/slice-hero.webp", import.meta.url).href, workedWith: true },
  { name: "Commenda", slug: "commenda", href: "https://www.commenda.io/", category: "Global compliance", headline: "Global business.\nClear horizons.", image: new URL("../reference-assets/commenda-hero.webp", import.meta.url).href, workedWith: true },
  { name: "Olórin", slug: "olorin", href: "https://olorin.nadilearning.com/", category: "Learning platform", headline: "Learning,\nwith a little magic.", image: new URL("../reference-assets/olorin-art.png", import.meta.url).href, workedWith: false },
  { name: "Nadi", slug: "nadi", href: "https://www.nadilearning.com/", category: "Education", headline: "We build\ndeep thinkers.", image: new URL("../reference-assets/nadi-hero.png", import.meta.url).href, workedWith: false },
  { name: "Mana", slug: "mana", href: "https://mymana.xyz/freelancers/", category: "Global finance", headline: "Build your wealth\nin dollars.", image: new URL("../reference-assets/mana-card.svg", import.meta.url).href, workedWith: false },
  { name: "RaazMD", slug: "raaz", href: "https://www.raazmd.com/", category: "Health & wellbeing", headline: "Feel like\nyourself again.", image: new URL("../reference-assets/raaz-hero.webp", import.meta.url).href, workedWith: false },
] as const
export type Brand = (typeof brands)[number]
