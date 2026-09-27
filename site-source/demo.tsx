import WheelIntroHero from "@/components/ui/wheel-intro-hero"
import PortfolioFooter from "@/components/ui/portfolio-footer"
"use client"

import NewspaperProjects from "@/components/ui/newspaper-projects"

export default function Demo() {
  return (
    // w-full: 21st centres demos in a flex wrapper that would shrink this to 0px.
    <div className="w-full" id="top">
      <WheelIntroHero />
      <NewspaperProjects />
      <PortfolioFooter theme="paper" />
    </div>
  )
}
