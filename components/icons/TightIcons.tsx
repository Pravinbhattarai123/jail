import React from 'react'

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number }

const base = (size?: number) => ({ width: size ?? 24, height: size ?? 24 })

export const MenuIcon: React.FC<IconProps> = ({ size, className, ...rest }) => (
  <svg className={`block ${className ?? ''}`} {...base(size)} viewBox="2 5 20 14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    <path d="M4 6h18M4 12h18M4 18h18" />
  </svg>
)

export const SearchIcon: React.FC<IconProps> = ({ size, className, ...rest }) => (
  <svg className={`block ${className ?? ''}`} {...base(size)} viewBox="1 1 22 22" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

export const UserIcon: React.FC<IconProps> = ({ size, className, ...rest }) => (
  <svg className={`block ${className ?? ''}`} {...base(size)} viewBox="2 2 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

export const HeartIcon: React.FC<IconProps> = ({ size, className, ...rest }) => (
  <svg className={`block ${className ?? ''}`} {...base(size)} viewBox="2 3 20 19" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

export const CartIcon: React.FC<IconProps> = ({ size, className, ...rest }) => (
  <svg className={`block ${className ?? ''}`} {...base(size)} viewBox="1 2 22 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 12.39A2 2 0 0 0 9.62 15h8.76a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)
