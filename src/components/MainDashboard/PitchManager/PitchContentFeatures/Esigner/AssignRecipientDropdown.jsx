"use client"

import { useEffect, useRef } from "react"
import { User, Check } from "lucide-react"

function AssignRecipientDropdown({ isOpen, onClose, recipients, onAssign, position }) {
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[102] min-w-[200px] overflow-hidden"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <div className="p-2 border-b bg-gray-50">
        <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          <User className="w-3 h-3" />
          Assign to Recipient
        </h4>
      </div>

      <div className="max-h-32 overflow-y-auto">
        {recipients.length === 0 ? (
          <div className="p-3 text-center text-gray-500 text-xs">No recipients added yet</div>
        ) : (
          recipients.map((recipient) => (
            <button
              key={recipient.id}
              onClick={() => {
                onAssign(recipient)
                onClose()
              }}
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-blue-50 text-left transition-colors group"
            >
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                {recipient.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{recipient.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{recipient.email}</p>
              </div>
              <Check className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default AssignRecipientDropdown
