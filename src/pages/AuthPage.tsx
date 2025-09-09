import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {Brain, ArrowLeft, Eye, EyeOff, Mail, Loader2, CheckCircle} from 'lucide-react'
import {useAuth} from '@/contexts/AuthContext'
import { toast } from "sonner";

export default function AuthPage() {
 const navigate = useNavigate()
 const {login, signup, verifyEmail, resendVerification, forgotPassword, needsVerification, isVerifying} = useAuth()
//  const {toast} = useToast()

 const [isLoading, setIsLoading] = useState(false)
 const [verificationCode, setVerificationCode] = useState('')
 const [showPassword, setShowPassword] = useState(false)
 const [showConfirmPassword, setShowConfirmPassword] = useState(false)
 const [showForgotPassword, setShowForgotPassword] = useState(false)
 const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
 const [resetEmailSent, setResetEmailSent] = useState(false)

 // Strong password validation
 const validatePassword = (password: string) => {
  const errors = []
  if (password.length < 8) errors.push('At least 8 characters')
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter')
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter')
  if (!/\d/.test(password)) errors.push('One number')
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('One special character')
  return errors
 }

 const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setIsLoading(true)

  const formData = new FormData(e.currentTarget)
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
   await login(email, password)
   toast({
    title: 'Welcome back!',
    description: "You've been successfully logged in."
   })
   navigate('/dashboard')
  } catch (error: any) {
   toast({
    title: 'Login failed',
    description: error.message,
    variant: 'destructive'
   })
  } finally {
   setIsLoading(false)
  }
 }

 const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setIsLoading(true)

  const formData = new FormData(e.currentTarget)
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const name = formData.get('name') as string
  const company = formData.get('company') as string

  if (password !== confirmPassword) {
   toast({
    title: 'Password mismatch',
    description: 'Passwords do not match',
    variant: 'destructive'
   })
   setIsLoading(false)
   return
  }

  const passwordErrors = validatePassword(password)
  if (passwordErrors.length > 0) {
   toast({
    title: 'Password too weak',
    description: `Password must have: ${passwordErrors.join(', ')}`,
    variant: 'destructive'
   })
   setIsLoading(false)
   return
  }

  try {
   await signup(email, password, name, company)
   toast({
    title: 'Account created!',
    description: 'Please check your email for a verification code.'
   })
  } catch (error: any) {
   toast({
    title: 'Signup failed',
    description: error.message,
    variant: 'destructive'
   })
  } finally {
   setIsLoading(false)
  }
 }

 const handleVerifyEmail = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()

  try {
   await verifyEmail(verificationCode)
   toast({
    title: 'Email verified!',
    description: 'Welcome to lvl1!'
   })
   navigate('/dashboard')
  } catch (error: any) {
   toast({
    title: 'Verification failed',
    description: error.message,
    variant: 'destructive'
   })
  }
 }

 const handleResendVerification = async () => {
  try {
   await resendVerification()
   toast({
    title: 'Verification email sent!',
    description: 'Please check your inbox for a new verification code.'
   })
  } catch (error: any) {
   toast({
    title: 'Failed to send email',
    description: error.message,
    variant: 'destructive'
   })
  }
 }

 const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setIsLoading(true)

  try {
   await forgotPassword(forgotPasswordEmail)
   setResetEmailSent(true)
   toast({
    title: 'Reset email sent!',
    description: 'Please check your email for password reset instructions.'
   })
  } catch (error: any) {
   toast({
    title: 'Reset failed',
    description: error.message,
    variant: 'destructive'
   })
  } finally {
   setIsLoading(false)
  }
 }

 return (
  <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-green-100 flex flex-col">
   {/* Animated Background Elements */}
   <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}} />
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1000ms', animationDuration: '4s'}} />
   </div>

   {/* Header */}
   <header className="relative border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
     <div className="flex items-center space-x-3">
      <div className="relative">
       <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
        <Brain className="w-6 h-6 text-white" />
       </div>
       <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
      </div>
      <span className="text-3xl font-black text-purple-600">lvl1</span>
     </div>
     <Button variant="ghost" onClick={() => navigate('/')}>
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Home
     </Button>
    </div>
   </header>

   {/* Main Content - Centered */}
   <div className="flex-1 flex items-center justify-center p-4">
    <div className="w-full max-w-lg">
     {needsVerification ? (
      <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-sm">
       <CardHeader className="text-center bg-purple-500 text-white p-8">
        <CardTitle className="text-3xl font-black">Verify Your Email</CardTitle>
        <p className="text-purple-100 text-lg">Enter the verification code sent to your email</p>
       </CardHeader>
       <CardContent className="p-8">
        <div className="space-y-6">
         <div className="text-center">
          <Mail className="w-16 h-16 mx-auto mb-4 text-purple-500" />
          <p className="text-gray-600">We've sent a 6-digit verification code to your email address.</p>
         </div>

         <form onSubmit={handleVerifyEmail} className="space-y-6">
          <div className="space-y-2">
           <Label htmlFor="verification-code" className="text-gray-700 font-semibold">
            Verification Code
           </Label>
           <Input id="verification-code" type="text" placeholder="000000" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} maxLength={6} required className="text-center text-2xl letter-spacing-4 rounded-xl border-2" style={{letterSpacing: '0.5em'}} />
          </div>

          <Button type="submit" disabled={isVerifying || verificationCode.length !== 6} className="w-full bg-purple-500 hover:bg-purple-600 py-4 text-lg font-bold rounded-xl">
           {isVerifying ? (
            <>
             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
             Verifying...
            </>
           ) : (
            'Verify Email'
           )}
          </Button>
         </form>

         <div className="text-center">
          <Button variant="ghost" onClick={handleResendVerification} className="text-purple-600 hover:text-purple-700">
           Didn't receive the code? Resend
          </Button>
         </div>
        </div>
       </CardContent>
      </Card>
     ) : showForgotPassword ? (
      <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-sm">
       <CardHeader className="text-center bg-purple-500 text-white p-8">
        <CardTitle className="text-3xl font-black">Reset Password</CardTitle>
        <p className="text-purple-100 text-lg">Enter your email to receive reset instructions</p>
       </CardHeader>
       <CardContent className="p-8">
        {resetEmailSent ? (
         <div className="text-center space-y-6">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
          <div>
           <h3 className="text-xl font-bold text-gray-800 mb-2">Email Sent!</h3>
           <p className="text-gray-600">Check your inbox for password reset instructions.</p>
          </div>
          <Button
           onClick={() => {
            setShowForgotPassword(false)
            setResetEmailSent(false)
           }}
           className="w-full bg-purple-500 hover:bg-purple-600"
          >
           Back to Login
          </Button>
         </div>
        ) : (
         <form onSubmit={handleForgotPassword} className="space-y-6">
          <div className="space-y-2">
           <Label htmlFor="forgot-email" className="text-gray-700 font-semibold">
            Email Address
           </Label>
           <Input id="forgot-email" type="email" placeholder="Enter your email" value={forgotPasswordEmail} onChange={e => setForgotPasswordEmail(e.target.value)} required className="rounded-xl border-2" />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-purple-500 hover:bg-purple-600 py-4 text-lg font-bold rounded-xl">
           {isLoading ? (
            <>
             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
             Sending...
            </>
           ) : (
            'Send Reset Email'
           )}
          </Button>

          <div className="text-center">
           <Button variant="ghost" onClick={() => setShowForgotPassword(false)} className="text-purple-600 hover:text-purple-700">
            Back to Login
           </Button>
          </div>
         </form>
        )}
       </CardContent>
      </Card>
     ) : (
      <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-sm">
       <CardHeader className="text-center bg-purple-500 text-white p-8">
        <CardTitle className="text-3xl font-black">Welcome to lvl1</CardTitle>
        <p className="text-purple-100 text-lg">Professional candidate assessment platform</p>
       </CardHeader>
       <CardContent className="p-8">
        <Tabs defaultValue="login" className="w-full">
         <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-2xl">
          <TabsTrigger value="login" className="rounded-xl font-bold">
           Sign In
          </TabsTrigger>
          <TabsTrigger value="signup" className="rounded-xl font-bold">
           Sign Up
          </TabsTrigger>
         </TabsList>

         <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-6">
           <div className="space-y-2">
            <Label htmlFor="login-email" className="text-gray-700 font-semibold">
             Work Email
            </Label>
            <Input id="login-email" name="email" type="email" placeholder="john@company.com" required className="rounded-xl border-2" />
           </div>
           <div className="space-y-2">
            <Label htmlFor="login-password" className="text-gray-700 font-semibold">
             Password
            </Label>
            <div className="relative">
             <Input id="login-password" name="password" type={showPassword ? 'text' : 'password'} required className="rounded-xl border-2 pr-12" />
             <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
             </Button>
            </div>
           </div>

           <div className="text-right">
            <Button type="button" variant="ghost" onClick={() => setShowForgotPassword(true)} className="text-purple-600 hover:text-purple-700 p-0 h-auto font-normal">
             Forgot password?
            </Button>
           </div>

           <Button type="submit" className="w-full bg-purple-500 hover:bg-purple-600 py-4 text-lg font-bold rounded-xl" disabled={isLoading}>
            {isLoading ? (
             <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in...
             </>
            ) : (
             'Sign In'
            )}
           </Button>
          </form>
         </TabsContent>

         <TabsContent value="signup">
          <form onSubmit={handleSignup} className="space-y-6">
           <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 font-semibold">
             Full Name
            </Label>
            <Input id="name" name="name" placeholder="John Smith" required className="rounded-xl border-2" />
           </div>
           <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-semibold">
             Work Email
            </Label>
            <Input id="email" name="email" type="email" placeholder="john@company.com" required className="rounded-xl border-2" />
           </div>
           <div className="space-y-2">
            <Label htmlFor="company" className="text-gray-700 font-semibold">
             Company
            </Label>
            <Input id="company" name="company" placeholder="Tech Corp Inc." className="rounded-xl border-2" />
           </div>
           <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-semibold">
             Password
            </Label>
            <div className="relative">
             <Input id="password" name="password" type={showPassword ? 'text' : 'password'} required className="rounded-xl border-2 pr-12" minLength={8} />
             <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
             </Button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
             <p>Password must contain:</p>
             <ul className="list-disc list-inside text-xs space-y-1">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
              <li>One special character (!@#$%^&*)</li>
             </ul>
            </div>
           </div>
           <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold">
             Confirm Password
            </Label>
            <div className="relative">
             <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required className="rounded-xl border-2 pr-12" minLength={8} />
             <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
             </Button>
            </div>
           </div>
           <Button type="submit" className="w-full bg-purple-500 hover:bg-purple-600 py-4 text-lg font-bold rounded-xl" disabled={isLoading}>
            {isLoading ? (
             <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
             </>
            ) : (
             'Create Account'
            )}
           </Button>
          </form>
         </TabsContent>
        </Tabs>
       </CardContent>
      </Card>
     )}
    </div>
   </div>

   {/* Footer */}
   <footer className="relative py-8 text-center text-gray-600 bg-white/50">
    <p className="text-sm">© {new Date().getFullYear()} lvl1 - Professional assessment platform</p>
   </footer>
  </div>
 )
}