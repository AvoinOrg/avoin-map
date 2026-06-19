import React from 'react'

export const LoadingSpinner = () => {
  const dotColor = '#136b42'
  return (
    <span aria-hidden="true" style={{ display: 'inline-block' }}>
      <svg width="80" height="20" viewBox="0 0 80 20" fill="none">
        <circle cx={8} cy="10" r={0} fill={dotColor}>
          <animate
            attributeName="r"
            values="0;6.5;6.5;0"
            keyTimes="0;0.25;0.75;1"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="8" cy="10" r="6.5" fill={dotColor}>
          <animate
            attributeName="cx"
            values="8;32;8"
            keyTimes="0;0.5;1"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="32" cy="10" r="6.5" fill={dotColor}>
          <animate
            attributeName="cx"
            values="32;56;32"
            keyTimes="0;0.5;1"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="56" cy="10" r="6.5" fill={dotColor}>
          <animate
            attributeName="r"
            values="6.5;6.5;0;6.5"
            keyTimes="0;0.25;0.75;1"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </span>
  )
}
