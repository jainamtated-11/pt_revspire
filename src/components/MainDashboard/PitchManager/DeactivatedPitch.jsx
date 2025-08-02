import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser } from "@fortawesome/free-solid-svg-icons"

const DeactivatedPitch = ({ ownerDetails, orgHex }) => {
  // Enhanced color utilities
  const lightenColor = (hex, percent) => {
    percent = Math.min(100, Math.max(0, percent))
    const num = Number.parseInt(hex.replace("#", ""), 16)
    const R = (num >> 16) + Math.round((255 - (num >> 16)) * (percent / 100))
    const G = ((num >> 8) & 0x00ff) + Math.round((255 - ((num >> 8) & 0x00ff)) * (percent / 100))
    const B = (num & 0x0000ff) + Math.round((255 - (num & 0x0000ff)) * (percent / 100))
    return `#${(
      0x1000000 +
      (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 0 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)}`
  }

  const darkenColor = (hex, percent) => {
    percent = Math.min(100, Math.max(0, percent))
    const num = Number.parseInt(hex.replace("#", ""), 16)
    const R = Math.round((num >> 16) * (1 - percent / 100))
    const G = Math.round(((num >> 8) & 0x00ff) * (1 - percent / 100))
    const B = Math.round((num & 0x0000ff) * (1 - percent / 100))
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
  }

  const backgroundColor = lightenColor(orgHex, 97)
  const cardShadowColor = lightenColor(orgHex, 85)

  const getProfilePictureUrl = () => {
    const photo = ownerDetails?.profilePhoto

    if (!photo) return null

    if (typeof photo === "string") {
      if (photo.startsWith("blob:") || photo.startsWith("http") || photo.startsWith("data:")) {
        return photo
      }
    }

    if (photo.type === "Buffer" && Array.isArray(photo.data)) {
      try {
        const uint8Array = new Uint8Array(photo.data)
        const blob = new Blob([uint8Array], { type: "image/jpeg" })
        return URL.createObjectURL(blob)
      } catch (error) {
        console.error("Error converting buffer to blob:", error)
        return null
      }
    }

    try {
      const blob = photo instanceof Blob ? photo : new Blob([photo], { type: "image/jpeg" })
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error("Error creating blob URL:", error)
      return null
    }
  }

  console.log("ownerDetails", ownerDetails)

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${backgroundColor} 0%, ${lightenColor(orgHex, 99)} 100%)`,
      }}
    >
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div
          className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01]"
          style={{
            boxShadow: `0 20px 40px -12px ${cardShadowColor}40, 0 0 0 1px ${lightenColor(orgHex, 90)}`,
          }}
        >
          {/* Header Section */}
          <div
            className="relative px-6 pt-8 pb-6 text-center"
            style={{
              background: `linear-gradient(135deg, ${lightenColor(orgHex, 96)} 0%, ${lightenColor(orgHex, 98)} 100%)`,
            }}
          >
            {/* Company Logo */}
            {ownerDetails?.companyLogo ? (
              <div>
                <img
                  src={ownerDetails.companyLogo}
                  alt="Company Logo"
                  className="object-contain max-w-full max-h-16 mx-auto block"
                  onError={(e) => {
                    e.target.style.display = "none"
                  }}
                />
              </div>
            ) : (
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-lg"
                style={{
                  backgroundColor: lightenColor(orgHex, 85),
                  boxShadow: `0 6px 20px ${orgHex}20`,
                }}
              >
                <FontAwesomeIcon icon={faUser} className="text-xl" style={{ color: orgHex }} />
              </div>
            )}
            <h1 className="text-xl font-bold mb-2 leading-tight pt-4" style={{ color: darkenColor(orgHex, 10) }}>
              Your Sales Room is not longer Active
            </h1>
          </div>

          {/* User Message Section */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div
              className="rounded-xl p-4 border-l-4"
              style={{
                backgroundColor: lightenColor(orgHex, 97),
                borderLeftColor: orgHex,
              }}
            >
              <div className="flex items-start space-x-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: lightenColor(orgHex, 80) }}
                >
                  <FontAwesomeIcon icon={faUser} className="text-sm" style={{ color: orgHex }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-1">Message from the owner:</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    👋 Hey! Thanks for the interest in our sales room. While this content is no longer active, I'd be happy
                    to discuss your needs and provide alternative solutions. Please don't hesitate to reach out!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="px-6 py-5">
            <div
              className="rounded-xl p-4 border transition-all duration-300"
              style={{
                backgroundColor: lightenColor(orgHex, 98),
                borderColor: lightenColor(orgHex, 88),
              }}
            >
              <div className="flex items-center mb-4">
                <FontAwesomeIcon icon={faUser} className="text-lg mr-2" style={{ color: orgHex }} />
                <h2 className="text-lg font-bold text-gray-800">Contact Information</h2>
              </div>

              <div className="flex items-center gap-4">
                {/* Profile Photo */}
                <div className="flex-shrink-0">
                  <div
                    className="w-20 h-20 rounded-full overflow-hidden shadow-md border-3 transition-transform duration-300 hover:scale-105"
                    style={{ borderColor: lightenColor(orgHex, 70) }}
                  >
                    {getProfilePictureUrl() ? (
                      <img
                        src={getProfilePictureUrl() || "/placeholder.svg"}
                        alt={ownerDetails?.fullName || "Profile"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none"
                          e.target.nextSibling.style.display = "flex"
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex items-center justify-center ${getProfilePictureUrl() ? "hidden" : "flex"}`}
                      style={{ backgroundColor: lightenColor(orgHex, 80) }}
                    >
                      <FontAwesomeIcon icon={faUser} className="text-xl" style={{ color: orgHex }} />
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="flex-1">
                  <div>
                    <div className="text-lg font-semibold text-gray-800">
                      {ownerDetails?.fullName || ""}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      {ownerDetails?.title || ""}
                    </div>
                  </div>

                  <div>
                    {ownerDetails?.email ? (
                      <a
                        href={`mailto:${ownerDetails.email}`}
                        className="inline-flex items-center text-sm font-medium transition-all duration-200 hover:underline group"
                        style={{ color: orgHex }}
                      >
                        {ownerDetails.email}
                      </a>
                    ) : (
                      <div className="text-sm text-gray-500">Not available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeactivatedPitch
