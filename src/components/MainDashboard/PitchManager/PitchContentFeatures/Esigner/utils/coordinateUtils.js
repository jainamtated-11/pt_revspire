/**
 * Converts screen coordinates to PDF coordinates with high precision
 * @param {number} screenX - X coordinate on screen (relative to PDF page element)
 * @param {number} screenY - Y coordinate on screen (relative to PDF page element)
 * @param {object} pageDimensions - Page dimensions object with pdfWidth, pdfHeight, displayWidth, displayHeight
 * @returns {object} PDF coordinates {x, y}
 */
export function calculatePdfCoordinates(screenX, screenY, pageDimensions) {
  if (!pageDimensions) {
    console.warn("Page dimensions not available for coordinate conversion")
    return { x: screenX, y: screenY }
  }

  const { pdfWidth, pdfHeight, displayWidth, displayHeight } = pageDimensions

  if (!pdfWidth || !pdfHeight || !displayWidth || !displayHeight) {
    console.warn("Invalid page dimensions:", pageDimensions)
    return { x: screenX, y: screenY }
  }

  const scaleX = pdfWidth / displayWidth
  const scaleY = pdfHeight / displayHeight

  const pdfX = screenX * scaleX

  // Adjust Y to push placeholder slightly downward (e.g., +16px visually)
  const correctedScreenY = screenY + 16 // shift down by 16px
  const pdfY = pdfHeight - correctedScreenY * scaleY

  const result = {
    x: Math.round(pdfX * 1000000) / 1000000,
    y: Math.round(pdfY * 1000000) / 1000000,
  }

  return result
}

/**
 * Converts PDF coordinates to screen coordinates with high precision
 * @param {number} pdfX - X coordinate in PDF
 * @param {number} pdfY - Y coordinate in PDF (bottom-up coordinate system)
 * @param {object} pageDimensions - Page dimensions object
 * @returns {object} Screen coordinates {x, y}
 */
export function calculateScreenCoordinates(pdfX, pdfY, pageDimensions) {
  if (!pageDimensions) {
    console.warn("Page dimensions not available for coordinate conversion")
    return { x: pdfX, y: pdfY }
  }

  const { pdfWidth, pdfHeight, displayWidth, displayHeight } = pageDimensions

  if (!pdfWidth || !pdfHeight || !displayWidth || !displayHeight) {
    console.warn("Invalid page dimensions:", pageDimensions)
    return { x: pdfX, y: pdfY }
  }

  // Convert PDF coordinates to screen coordinates with exact ratios
  const scaleX = displayWidth / pdfWidth
  const scaleY = displayHeight / pdfHeight

  const screenX = pdfX * scaleX

  // Convert from PDF's bottom-up Y to screen's top-down Y
  const screenY = displayHeight - pdfY * scaleY

  return {
    x: Math.round(screenX * 1000000) / 1000000,
    y: Math.round(screenY * 1000000) / 1000000,
  }
}

/**
 * Validates that coordinates are within bounds
 * @param {object} coords - Coordinates to validate
 * @param {object} bounds - Boundary dimensions
 * @returns {boolean} Whether coordinates are valid
 */
export function validateCoordinates(coords, bounds) {
  return coords.x >= 0 && coords.x <= bounds.width && coords.y >= 0 && coords.y <= bounds.height
}
