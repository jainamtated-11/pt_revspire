"use client"

import { useState, useRef, useEffect } from "react"
import { Edit3, Trash2, User, GripVertical, PenTool } from "lucide-react"
import AssignRecipientDropdown from "./AssignRecipientDropdown"

function PlaceholderElement({
  placeholder,
  onUpdate,
  onDelete,
  onAssign,
  isSelected,
  onClick,
  recipients,
  color,
  disabled = false,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(placeholder.name)
  const [showAssignDropdown, setShowAssignDropdown] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const elementRef = useRef(null)

  const handleDragStart = (e) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(true)
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  useEffect(() => {
    if (!isDragging || disabled) return

    let animationFrameId

    const handleMouseMove = (e) => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }

      animationFrameId = requestAnimationFrame(() => {
        if (!elementRef.current) return
        const containerRect = elementRef.current.parentElement.getBoundingClientRect()
        const newX = e.clientX - containerRect.left - dragOffset.x
        const newY = e.clientY - containerRect.top - dragOffset.y

        onUpdate(placeholder.id, {
          position: { x: newX, y: newY },
        })
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isDragging, dragOffset, placeholder.id, onUpdate, disabled])

  const handleNameUpdate = () => {
    if (disabled) return
    onUpdate(placeholder.id, { name })
    setIsEditing(false)
  }

  const handleAssignClick = (e) => {
    if (disabled) return
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setDropdownPosition({ x: rect.left, y: rect.bottom + 5 })
    setShowAssignDropdown(true)
  }

  const baseStyle = {
    left: placeholder.position.x,
    top: placeholder.position.y,
    border: `2px solid ${color}`,
    backgroundColor: `${color}08`,
    color: color,
    fontSize: "14px",
    fontFamily: "inherit",
    boxSizing: "border-box",
    zIndex: 100,
    position: "absolute",
    transition: "all 0.2s ease",
    pointerEvents: "auto",
    cursor: isDragging ? "grabbing" : "default",
  }

  const textStyle = {
    ...baseStyle,
    minWidth: 80,
    width: placeholder.width || "fit-content",
    height: "auto",
    padding: "4px 8px",
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "6px",
    fontWeight: "500",
    fontSize: "12px",
  }

  const signatureStyle = {
    ...baseStyle,
    minWidth: 120,
    minHeight: 40,
    width: placeholder.width || 160,
    height: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    borderRadius: "8px",
    borderStyle: "dashed",
  }

  return (
    <>
      <div
        ref={elementRef}
        className={`group select-none transition-all duration-200 ${
          isSelected ? "ring-2 ring-blue-400 ring-offset-2 shadow-lg scale-105" : "hover:shadow-md"
        }`}
        style={placeholder.type === "text" ? textStyle : signatureStyle}
        onClick={disabled ? undefined : onClick}
      >
        {/* Controls */}
        {!disabled && (
          <div
            className={`absolute -top-7 left-1/2 -translate-x-1/2 flex gap-0.5 transition-all duration-200 z-30 ${
              isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
            }`}
          >
            {/* Drag handle */}
            <button
              onMouseDown={handleDragStart}
              className="w-5 h-5 bg-gray-600 text-white rounded-md flex items-center justify-center text-xs hover:bg-gray-700 shadow-md cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-110"
              title="Drag to move"
              tabIndex={-1}
            >
              <GripVertical size={10} />
            </button>

            {/* Edit button for text placeholders */}
            {placeholder.type === "text" && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                }}
                className="w-5 h-5 bg-amber-500 text-white rounded-md flex items-center justify-center text-xs hover:bg-amber-600 shadow-md transition-all duration-200 hover:scale-110"
                title="Edit text"
                tabIndex={-1}
              >
                <Edit3 size={10} />
              </button>
            )}

            {/* Assign button */}
            <button
              onClick={handleAssignClick}
              className="w-5 h-5 bg-emerald-500 text-white rounded-md flex items-center justify-center text-xs hover:bg-emerald-600 shadow-md transition-all duration-200 hover:scale-110"
              title="Assign to recipient"
              tabIndex={-1}
            >
              <User size={10} />
            </button>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(placeholder.id)
              }}
              className="w-5 h-5 bg-red-500 text-white rounded-md flex items-center justify-center text-xs hover:bg-red-600 shadow-md transition-all duration-200 hover:scale-110"
              title="Delete"
              tabIndex={-1}
            >
              <Trash2 size={10} />
            </button>
          </div>
        )}

        {/* Content */}
        {isEditing && placeholder.type === "text" ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameUpdate}
            onKeyPress={(e) => e.key === "Enter" && handleNameUpdate()}
            className="text-sm bg-transparent border-none outline-none text-center w-full font-medium"
            autoFocus
            style={{ color }}
          />
        ) : placeholder.type === "signature" ? (
          <div className="flex flex-col items-center w-full h-full justify-center text-center">
            <PenTool className="mb-1" size={16} style={{ color }} />
            <span className="text-xs font-semibold" style={{ color }}>
              Sign Here
            </span>
          </div>
        ) : (
          <span className="flex items-center gap-2 pointer-events-none">
            <span className="text-sm font-medium" style={{ color }}>
              {placeholder.name}
            </span>
          </span>
        )}
      </div>

      <AssignRecipientDropdown
        isOpen={showAssignDropdown}
        onClose={() => setShowAssignDropdown(false)}
        recipients={recipients}
        onAssign={(recipient) => onAssign(placeholder.id, recipient.id)}
        position={dropdownPosition}
      />
    </>
  )
}

export default PlaceholderElement
