import {createContext, useContext, useState, useEffect, type ReactNode} from 'react'
import {useNavigate} from 'react-router-dom'
import {useSupabase} from './SupabaseContext'

interface User {
 id: string
 email: string
 name: string
 company?: string
 email_verified: boolean
}

interface AuthContextType {
 user: User | null
 loading: boolean
 isVerifying: boolean
 needsVerification: boolean
 login: (email: string, password: string) => Promise<void>
 signup: (email: string, password: string, name: string, company?: string) => Promise<void>
 verifyEmail: (code: string) => Promise<void>
 resendVerification: () => Promise<void>
 forgotPassword: (email: string) => Promise<void>
 logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({children}: {children: ReactNode}) {
 const [user, setUser] = useState<User | null>(null)
 const [loading, setLoading] = useState(true)
 const [isVerifying, setIsVerifying] = useState(false)
 const [needsVerification, setNeedsVerification] = useState(false)
 const [pendingEmail, setPendingEmail] = useState<string>('')
 const navigate = useNavigate()

 const {createUser, authenticateUser, verifyEmail: verifyEmailService, resendVerification: resendVerificationService, forgotPassword: forgotPasswordService} = useSupabase()

 // Generate proper UUID from email
 const generateUUIDFromEmail = (email: string): string => {
  // Create a hash from email
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
   const char = email.charCodeAt(i);
   hash = ((hash << 5) - hash) + char;
   hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to positive number and create UUID
  const positiveHash = Math.abs(hash);
  const hex = positiveHash.toString(16).padStart(8, '0');
  
  // Create proper UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuid = [
   hex.slice(0, 8),
   hex.slice(0, 4),
   '4' + hex.slice(0, 3), // Version 4 UUID
   'a' + hex.slice(0, 3), // Variant bits
   (hex + hex).slice(0, 12) // Ensure 12 characters
  ].join('-');
  
  return uuid;
 }

 useEffect(() => {
  // Check if user is logged in from localStorage
  const savedUser = localStorage.getItem('lvl1_user')
  if (savedUser) {
   try {
    const userData = JSON.parse(savedUser)
    // Ensure the user object has all required properties with safe defaults
    if (userData?.id && userData?.email && userData?.name) {
     const safeUserData: User = {
      id: userData.id || '',
      email: userData.email || '',
      name: userData.name || '',
      company: userData.company || '',
      email_verified: userData.email_verified ?? false
     }
     setUser(safeUserData)

     // Auto-redirect to dashboard if user is already logged in
     const currentPath = window.location.pathname
     if (currentPath === '/' || currentPath === '/auth') {
      console.log('🔄 User session active, redirecting to dashboard...')
      navigate('/dashboard')
     }
    } else {
     // Invalid user data, clear localStorage
     localStorage.removeItem('lvl1_user')
    }
   } catch (error) {
    console.error('Error parsing saved user:', error)
    localStorage.removeItem('lvl1_user')
   }
  }
  setLoading(false)
 }, [navigate])

 const login = async (email: string, password: string) => {
  try {
   const userData = await authenticateUser(email, password)

   // Validate and safely construct user object
   if (!userData || !userData.email) {
    throw new Error('Invalid user data received from server')
   }

   // Generate proper UUID from email
   const properUUID = generateUUIDFromEmail(userData.email)

   // Ensure userData has all required properties with safe defaults
   const safeUserData: User = {
    id: properUUID, // Use generated UUID
    email: userData.email,
    name: userData.name || userData.email.split('@')[0],
    company: userData.company || '',
    email_verified: userData.email_verified ?? false
   }

   console.log('✅ Login successful with UUID:', properUUID)
   setUser(safeUserData)
   localStorage.setItem('lvl1_user', JSON.stringify(safeUserData))
   setNeedsVerification(false)
   setPendingEmail('')

   // Navigate to dashboard after successful login
   navigate('/dashboard')
  } catch (error: any) {
   if (error.message?.includes('verify your email')) {
    setPendingEmail(email)
    setNeedsVerification(true)
    throw new Error('Please verify your email before logging in. Check your inbox for the verification code.')
   }
   throw error
  }
 }

 const signup = async (email: string, password: string, name: string, company?: string) => {
  try {
   await createUser(email, password, name, company)
   setPendingEmail(email)
   setNeedsVerification(true)
  } catch (error: any) {
   if (error.message?.includes('duplicate key') || error.message?.includes('already exists')) {
    throw new Error('An account with this email already exists. Please try logging in instead.')
   }
   throw error
  }
 }

 const verifyEmail = async (code: string) => {
  setIsVerifying(true)
  try {
   const userData = await verifyEmailService(pendingEmail, code)

   // Validate and safely construct user object
   if (!userData || !userData.email) {
    throw new Error('Invalid user data received after verification')
   }

   // Generate proper UUID from email
   const properUUID = generateUUIDFromEmail(userData.email)

   // Ensure userData has all required properties with safe defaults
   const safeUserData: User = {
    id: properUUID, // Use generated UUID
    email: userData.email,
    name: userData.name || userData.email.split('@')[0],
    company: userData.company || '',
    email_verified: true // Set to true after successful verification
   }

   setUser(safeUserData)
   localStorage.setItem('lvl1_user', JSON.stringify(safeUserData))
   setNeedsVerification(false)
   setPendingEmail('')

   // Navigate to dashboard after verification
   navigate('/dashboard')
  } catch (error: any) {
   if (error.message?.includes('Invalid verification code')) {
    throw new Error('Invalid or expired verification code. Please try again.')
   }
   throw error
  } finally {
   setIsVerifying(false)
  }
 }

 const resendVerification = async () => {
  try {
   await resendVerificationService(pendingEmail)
  } catch (error: any) {
   throw new Error('Failed to send verification email. Please try again.')
  }
 }

 const forgotPassword = async (email: string) => {
  await forgotPasswordService(email)
 }

 const logout = () => {
  setUser(null)
  setNeedsVerification(false)
  setPendingEmail('')
  localStorage.removeItem('lvl1_user')
  navigate('/')
 }

 return (
  <AuthContext.Provider
   value={{
    user,
    loading,
    isVerifying,
    needsVerification,
    login,
    signup,
    verifyEmail,
    resendVerification,
    forgotPassword,
    logout
   }}
  >
   {children}
  </AuthContext.Provider>
 )
}

export function useAuth() {
 const context = useContext(AuthContext)
 if (context === undefined) {
  throw new Error('useAuth must be used within an AuthProvider')
 }
 return context
}