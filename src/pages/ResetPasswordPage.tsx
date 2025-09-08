import {useState, useEffect} from 'react'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Brain, Eye, EyeOff, Loader2, CheckCircle, AlertTriangle} from 'lucide-react'
import {useSupabase} from '@/contexts/SupabaseContext'
import {useToast} from '@/hooks/use-toast'

export default function ResetPasswordPage() {
 const navigate = useNavigate()
 const [searchParams] = useSearchParams()
 const {resetPassword} = useSupabase()
 const {toast} = useToast()

 const [token, setToken] = useState('')
 const [newPassword, setNewPassword] = useState('')
 const [confirmPassword, setConfirmPassword] = useState('')
 const [showPassword, setShowPassword] = useState(false)
 const [showConfirmPassword, setShowConfirmPassword] = useState(false)
 const [isLoading, setIsLoading] = useState(false)
 const [isSuccess, setIsSuccess] = useState(false)
 const [isValidToken, setIsValidToken] = useState(true)

 useEffect(() => {
  const urlToken = searchParams.get('token')
  if (urlToken) {
   setToken(urlToken)
  } else {
   setIsValidToken(false)
  }
 }, [searchParams])

 const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  
  if (newPassword !== confirmPassword) {
   toast({
    title: 'Password mismatch',
    description: 'Passwords do not match',
    variant: 'destructive'
   })
   return
  }

  if (newPassword.length < 8) {
   toast({
    title: 'Weak password',
    description: 'Password must be at least 8 characters long',
    variant: 'destructive'
   })
   return
  }

  setIsLoading(true)

  try {
   await resetPassword(token, newPassword)
   setIsSuccess(true)
   toast({
    title: 'Password reset successful!',
    description: 'You can now login with your new password.'
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

 if (!isValidToken) {
  return (
   <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex items-center justify-center p-4">
    <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-sm max-w-lg w-full">
     <CardContent className="p-8 text-center">
      <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Reset Link</h2>
      <p className="text-gray-600 mb-6">This password reset link is invalid or has expired.</p>
      <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-indigo-500 to-purple-500">
       Back to Login
      </Button>
     </CardContent>
    </Card>
   </div>
  )
 }

 return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex items-center justify-center p-4">
   <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-sm max-w-lg w-full">
    <CardHeader className="text-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-8">
     <div className="flex items-center justify-center space-x-3 mb-4">
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
       <Brain className="w-6 h-6 text-white" />
      </div>
      <span className="text-2xl font-black">lvl1</span>
     </div>
     <CardTitle className="text-3xl font-black">Reset Password</CardTitle>
     <p className="text-indigo-100 text-lg">Enter your new password</p>
    </CardHeader>
    <CardContent className="p-8">
     {isSuccess ? (
      <div className="text-center space-y-6">
       <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
       <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Password Reset Complete!</h3>
        <p className="text-gray-600">Your password has been successfully updated.</p>
       </div>
       <Button onClick={() => navigate('/auth')} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 py-4 text-lg font-bold rounded-xl">
        Continue to Login
       </Button>
      </div>
     ) : (
      <form onSubmit={handleResetPassword} className="space-y-6">
       <div className="space-y-2">
        <Label htmlFor="new-password" className="text-gray-700 font-semibold">
         New Password
        </Label>
        <div className="relative">
         <Input 
          id="new-password" 
          type={showPassword ? 'text' : 'password'} 
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required 
          minLength={8}
          className="rounded-xl border-2 pr-12" 
          placeholder="Enter new password"
         />
         <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" 
          onClick={() => setShowPassword(!showPassword)}
         >
          {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
         </Button>
        </div>
       </div>

       <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-gray-700 font-semibold">
         Confirm New Password
        </Label>
        <div className="relative">
         <Input 
          id="confirm-password" 
          type={showConfirmPassword ? 'text' : 'password'} 
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required 
          minLength={8}
          className="rounded-xl border-2 pr-12" 
          placeholder="Confirm new password"
         />
         <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" 
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
         >
          {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
         </Button>
        </div>
       </div>

       <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 py-4 text-lg font-bold rounded-xl"
       >
        {isLoading ? (
         <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Updating Password...
         </>
        ) : (
         'Update Password'
        )}
       </Button>
      </form>
     )}
    </CardContent>
   </Card>
  </div>
 )
}