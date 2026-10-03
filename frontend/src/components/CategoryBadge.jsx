import React from 'react'
import { getCategoryBadgeClass } from '../utils/formatters'

export default function CategoryBadge({ category }) {
  return (
    <span className={`badge ${getCategoryBadgeClass(category)}`}>
      {category}
    </span>
  )
}
