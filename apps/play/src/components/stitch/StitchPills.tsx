import React from 'react'

export interface StitchPillItem {
  id: string
  label: string
  customClass?: string
}

export interface StitchPillsProps {
  items: StitchPillItem[]
  activeId: string
  onChange: (id: string) => void
}

export default function StitchPills({ items, activeId, onChange }: StitchPillsProps) {
  return (
    <div className="cdk-filter-pills-row" role="tablist">
      {items.map((item) => {
        const isActive = item.id === activeId
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-tv-focus
            tabIndex={0}
            onClick={() => onChange(item.id)}
            className={`cdk-filter-pill cdk-tv-focus ${item.customClass || ''} ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
