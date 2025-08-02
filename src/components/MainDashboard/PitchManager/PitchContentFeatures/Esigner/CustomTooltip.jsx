function CustomTooltip({ title, children }) {
  return (
    <span className="relative group">
      {children}
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap transition-opacity duration-200">
        {title}
      </span>
    </span>
  )
}

export default CustomTooltip
