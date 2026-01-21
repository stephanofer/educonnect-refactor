/**
 * Daily.co configuration and helpers
 * 
 * For testing: Uses a fixed public test room
 * For production: Would create rooms via Daily REST API (server-side)
 */

// Test room configuration
// VITE_DAILY_DOMAIN can be either:
// - Full URL: "https://educonnectcall.daily.co"
// - Just subdomain: "educonnectcall"
const RAW_DAILY_DOMAIN = import.meta.env.VITE_DAILY_DOMAIN || "";
const TEST_ROOM_NAME = "educonnect-test-room";

/**
 * Get the base Daily.co URL (handles both full URL and subdomain formats)
 */
function getDailyBaseUrl(): string {
  if (!RAW_DAILY_DOMAIN) {
    console.warn("VITE_DAILY_DOMAIN not set, using placeholder");
    return "https://your-domain.daily.co";
  }
  
  // If it's already a full URL, use it directly
  if (RAW_DAILY_DOMAIN.startsWith("http")) {
    // Remove trailing slash if present
    return RAW_DAILY_DOMAIN.replace(/\/$/, "");
  }
  
  // Otherwise, construct the URL from subdomain
  return `https://${RAW_DAILY_DOMAIN}.daily.co`;
}

/**
 * Get the Daily room URL for a session
 * In production, this would fetch the meeting_url from the session record
 * For testing, we use a fixed public room
 */
export function getDailyRoomUrl(sessionId: string): string {
  const baseUrl = getDailyBaseUrl();
  
  // For testing: always return the test room URL
  // This allows multiple users to join the same room for testing
  if (sessionId === "test-session") {
    return `${baseUrl}/${TEST_ROOM_NAME}`;
  }
  
  // For real sessions, construct URL from session ID
  // In production, you'd fetch the meeting_url from the database
  return `${baseUrl}/session-${sessionId.slice(0, 8)}`;
}

/**
 * Daily Prebuilt configuration
 * No recording, no transcription, simple UI
 */
export const dailyConfig = {
  // Disable all recording/transcription features
  showLeaveButton: true,
  showFullscreenButton: true,
  showLocalVideo: true,
  showParticipantsBar: true,
  
  // Styling
  iframeStyle: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    border: "none",
    zIndex: 9999,
  },
  
  // Theme to match app
  theme: {
    colors: {
      accent: "#6366f1", // Primary color (indigo)
      accentText: "#ffffff",
      background: "#1a1a2e",
      backgroundAccent: "#16213e",
      baseText: "#ffffff",
      border: "#334155",
      mainAreaBg: "#0f0f23",
      mainAreaBgAccent: "#1a1a2e",
      mainAreaText: "#ffffff",
      supportiveText: "#94a3b8",
    },
  },
};

/**
 * Test session data for development
 * This appears for all users in "Mis Sesiones" for testing the video call
 */
export const TEST_SESSION = {
  id: "test-session",
  status: "confirmed" as const,
  scheduledAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago (can join now)
  durationMinutes: 60,
  description: "Sesión de prueba para que prueben las sesiones de educonnect ",
  subjectName: "Matematicas",
  // For student view
  tutorId: "test-tutor",
  tutorName: "Hector Vega Magallanes",
  tutorAvatar: null,
  // For tutor view  
  studentId: "test-student",
  studentName: "Estudiante de Prueba",
  studentAvatar: null,
  // Extras
  hasMaterials: false,
  materialsCount: 0,
};
