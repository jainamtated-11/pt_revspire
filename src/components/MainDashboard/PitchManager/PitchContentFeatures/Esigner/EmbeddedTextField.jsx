"use client"

import { useState, useRef, useEffect } from "react"
import { Trash2, Edit3, GripVertical } from "lucide-react"

function EmbeddedTextField({ textField, onUpdate, onDelete, isSelected, onClick, color, disabled = false }) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(textField.text || "")
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

        onUpdate(textField.id, {
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
  }, [isDragging, dragOffset, textField.id, onUpdate, disabled])

  const handleTextUpdate = () => {
    if (disabled) return
    onUpdate(textField.id, { text })
    setIsEditing(false)
  }

  const textStyle = {
    position: "absolute",
    left: textField.position.x,
    top: textField.position.y,
    minWidth: 80,
    border: `2px solid ${color}`,
    backgroundColor: `${color}08`,
    color: "#1f2937",
    fontSize: textField.fontSize || "12px",
    fontFamily: "Arial, sans-serif",
    padding: "4px 8px",
    zIndex: 100,
    cursor: isDragging ? "grabbing" : "default",
    borderRadius: "6px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  }

  return (
    <div
      ref={elementRef}
      className={`group select-none transition-all duration-200 ${
        isSelected ? "ring-2 ring-purple-400 ring-offset-2 shadow-lg scale-105" : "hover:shadow-md"
      }`}
      style={textStyle}
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

          {/* Edit button */}
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

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(textField.id)
            }}
            className="w-5 h-5 bg-red-500 text-white rounded-md flex items-center justify-center text-xs hover:bg-red-600 shadow-md transition-all duration-200 hover:scale-110"
            title="Delete"
            tabIndex={-1}
          >
            <Trash2 size={10} />
          </button>
        </div>
      )}

      {isEditing ? (
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleTextUpdate}
          onKeyPress={(e) => e.key === "Enter" && handleTextUpdate()}
          className="bg-transparent border-none outline-none w-full font-medium"
          autoFocus
          style={{ color: "#1f2937" }}
        />
      ) : (
        <div onClick={() => !disabled && setIsEditing(true)} className={`${!disabled ? "cursor-text" : ""}`}>
          {text || "Click to edit text"}
        </div>
      )}
    </div>
  )
}

export default EmbeddedTextField
