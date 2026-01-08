/**
 * Safely encode a string to base64, supporting UTF-8 characters
 * Works in both browser and Node.js environments
 */
export function safeBase64Encode(str: string): string {
  if (typeof window !== "undefined") {
    // Browser environment
    try {
      // Convert UTF-8 string to base64 safely
      return btoa(unescape(encodeURIComponent(str)))
    } catch (error) {
      console.error("[base64] Encoding error:", error)
      // Fallback: return original string if encoding fails
      return str
    }
  } else {
    // Node.js environment
    return Buffer.from(str, "utf-8").toString("base64")
  }
}

/**
 * Safely decode a base64 string, supporting UTF-8 characters
 * Works in both browser and Node.js environments
 */
export function safeBase64Decode(base64: string): string {
  if (typeof window !== "undefined") {
    // Browser environment
    try {
      return decodeURIComponent(escape(atob(base64)))
    } catch (error) {
      console.error("[base64] Decoding error:", error)
      // Fallback: return original string if decoding fails
      return base64
    }
  } else {
    // Node.js environment
    return Buffer.from(base64, "base64").toString("utf-8")
  }
}

/**
 * Check if a string contains characters outside Latin1 range
 */
export function hasNonLatin1Chars(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 255) {
      return true
    }
  }
  return false
}
