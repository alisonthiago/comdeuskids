import React from 'react'
import { ChevronRight } from 'lucide-react'

export interface StitchRailProps {
  title: string
  icon?: React.ReactNode
  seeAllLink?: string
  children: React.ReactNode
}

export default function StitchRail({ title, icon, seeAllLink, children }: StitchRailProps) {
  return (
    <section className="cdk-stitch-rail">
      <div className="cdk-rail-header">
        <h2 className="cdk-rail-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {icon}
          {title}
        </h2>
      </div>

      <div className="cdk-cards-scroll-container">
        {children}
        {seeAllLink && (
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
            <ChevronRight size={28} color="#94a3b8" />
          </div>
        )}
      </div>
    </section>
  )
}
