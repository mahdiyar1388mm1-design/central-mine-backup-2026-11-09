// Persists the logged-in session (access/refresh token + user) in
// localStorage so it survives page reloads. Plain key/value reads and
// writes — no framework state here, so both the API client (attaching the
// bearer token) and React code (checking "is logged in") can use it without
// needing a provider.

export type StoredUser = {
  id: string
  phoneNumber: string
  name?: string
  role: string
}

export type Session = {
  token: string
  refreshToken: string
  user: StoredUser
}

const ACCESS_TOKEN_KEY = 'centralmine.accessToken'
const REFRESH_TOKEN_KEY = 'centralmine.refreshToken'
const USER_KEY = 'centralmine.user'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredUser
  } catch {
    return null
  }
}

export function isLoggedIn(): boolean {
  return getAccessToken() !== null
}

export function saveSession(session: Session): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, session.token)
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(session.user))
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
