function BrandMark({ light = false }) {
  return (
    <a
      className={`brand-mark${light ? ' brand-mark--light' : ''}`}
      href="/"
      aria-label="Luma home"
    >
      <span className="brand-mark__icon" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path
            d="M16 3.5 18.9 13l9.6 3-9.6 2.9-2.9 9.6-3-9.6-9.5-2.9 9.5-3L16 3.5Z"
            fill="currentColor"
          />
          <circle cx="25.5" cy="7" r="2" fill="currentColor" />
        </svg>
      </span>
      <span className="brand-mark__name">luma</span>
    </a>
  )
}

export default BrandMark
