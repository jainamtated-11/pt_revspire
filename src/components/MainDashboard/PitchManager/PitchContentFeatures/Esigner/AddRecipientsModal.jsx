"use client"

import { useState } from "react"
import { X, Plus, Mail, UserIcon } from "lucide-react"

function AddRecipientsModal({ isOpen, onClose, recipients, setRecipients, hexColor }) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")

  const addRecipient = () => {
    if (fullName.trim() && email.trim()) {
      const newRecipient = {
        id: Date.now(),
        full_name: fullName.trim(),
        email: email.trim(),
        order: recipients.length + 1,
        status: "Draft",
      }
      setRecipients([...recipients, newRecipient])
      setFullName("")
      setEmail("")
    }
  }

  const removeRecipient = (id) => {
    setRecipients(recipients.filter((r) => r.id !== id))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: hexColor }} />
            <h3 className="text-lg font-bold text-gray-900">Add Recipients</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-gray-600 mb-4 leading-relaxed">Add recipients who need to sign this document.</p>

          <div className="space-y-3">
            {/* Full Name Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                  style={{ focusRingColor: `${hexColor}50` }}
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="email"
                  placeholder="person@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                  style={{ focusRingColor: `${hexColor}50` }}
                />
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={addRecipient}
              disabled={!fullName.trim() || !email.trim()}
              className="w-full py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Plus className="w-3 h-3" />
              Add Recipient
            </button>
          </div>

          {/* Recipients List */}
          {recipients.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Recipients ({recipients.length})</h4>
              <div className="max-h-32 overflow-y-auto space-y-1.5">
                {recipients.map((recipient, index) => (
                  <div
                    key={recipient.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: hexColor }}
                      >
                        {recipient.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{recipient.full_name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[120px]">{recipient.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeRecipient(recipient.id)}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 px-3 text-white rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg text-sm"
            style={{ backgroundColor: hexColor }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddRecipientsModal
