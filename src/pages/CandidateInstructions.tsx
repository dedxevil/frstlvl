import {useState} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Checkbox} from '@/components/ui/checkbox'
import {Badge} from '@/components/ui/badge'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {Clock, Video, Shield, AlertTriangle, CheckCircle, Eye, Brain, Timer, Camera, Sparkles, Zap, Monitor, Mic, Building, User, Calendar} from 'lucide-react'
import { toast } from "sonner";
import {useSupabase} from '@/contexts/SupabaseContext'
import CandidatePortal from '@/components/CandidatePortal'

export default function CandidateInstructions() {
 const {linkId} = useParams()
 const navigate = useNavigate()
//  const {toast} = useToast()
 const {getCandidateByLink} = useSupabase()

 const [agreedToTerms, setAgreedToTerms] = useState(false)
 const [videoPermissionGranted, setVideoPermissionGranted] = useState(false)
 const [audioPermissionGranted, setAudioPermissionGranted] = useState(false)
 const [screenSharePermissionGranted, setScreenSharePermissionGranted] = useState(false)
 const [isRequestingPermissions, setIsRequestingPermissions] = useState(false)
 const [showPortal, setShowPortal] = useState(false)

 // Fetch quiz and candidate data
 const {data: candidateData, isLoading} = useQuery({
  queryKey: ['candidate-quiz', linkId],
  queryFn: () => getCandidateByLink(linkId!),
  enabled: !!linkId
 })

 const quiz = candidateData?.quiz
 const candidate = candidateData?.candidate
 const employer = candidateData?.employer

 const requestAllPermissions = async () => {
  setIsRequestingPermissions(true)

  if (navigator.mediaDevices?.getUserMedia) {
   const videoStream = await navigator.mediaDevices.getUserMedia({
    video: {
     width: 1280,
     height: 720,
     facingMode: 'user'
    },
    audio: true
   })

   if (videoStream) {
    setVideoPermissionGranted(true)
    setAudioPermissionGranted(true)

    // Stop the stream immediately as we just needed permission
    videoStream.getTracks().forEach(track => track.stop())

    toast({
     title: '✅ Camera & Microphone Access Granted',
     description: 'Video proctoring is now enabled.'
    })
   }
  }

  if (navigator.mediaDevices?.getDisplayMedia) {
   const screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false
   })

   if (screenStream) {
    setScreenSharePermissionGranted(true)

    // Stop the stream immediately as we just needed permission
    screenStream.getTracks().forEach(track => track.stop())

    toast({
     title: '✅ Screen Sharing Access Granted',
     description: 'Screen monitoring is now enabled.'
    })
   }
  }

  setIsRequestingPermissions(false)
 }

 const startAssessment = () => {
  if (!agreedToTerms || !videoPermissionGranted || !audioPermissionGranted) {
   toast({
    title: 'Requirements not met',
    description: 'Please complete all requirements before starting.',
    variant: 'destructive'
   })
   return
  }

  // Enable fullscreen mode
  document.documentElement.requestFullscreen()

  navigate(`/quiz/${linkId}/start`)
 }

 const handleShowPortal = () => {
  setShowPortal(true)
 }

 if (isLoading) {
  return (
   <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
    <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full" />
   </div>
  )
 }

 if (!candidateData || !quiz) {
  return (
   <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
    <Card className="max-w-md">
     <CardContent className="p-8 text-center">
      <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Assessment Not Found</h2>
      <p className="text-gray-600">The assessment link you're trying to access is invalid or has expired.</p>
     </CardContent>
    </Card>
   </div>
  )
 }

 if (showPortal) {
  return <CandidatePortal candidateData={{
   name: candidate.name || 'Candidate',
   email: candidate.email,
   quizTitle: quiz.title,
   company: employer?.company || 'Company',
   status: candidate.status,
   invitationSent: candidate.invitation_sent,
   timeLimit: quiz.time_limit,
   questionsTotal: quiz.total_questions
  }} onStartAssessment={startAssessment} />
 }

 // Check if deadline has passed
 const isExpired = quiz.deadline && new Date() > new Date(quiz.deadline)

 return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden">
   {/* Animated Background Elements */}
   <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-br from-orange-300/20 to-yellow-300/20 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-green-300/20 to-emerald-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1000ms'}} />
    <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-br from-purple-300/10 to-pink-300/10 rounded-full blur-3xl animate-bounce" style={{animationDelay: '500ms'}} />
   </div>

   <div className="relative container mx-auto px-4 py-8">
    <div className="max-w-4xl mx-auto">
     {/* Header */}
     <div className="text-center mb-12 opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]">
      <div className="flex justify-center items-center space-x-3 mb-6">
       <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-orange-400 to-green-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
         <Brain className="w-8 h-8 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '300ms'}} />
       </div>
       <span className="text-4xl font-black bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">frstlvl.ai</span>
      </div>
      
      <h1 className="text-5xl font-black mb-4 text-gray-800 leading-tight">{quiz.title}</h1>
      
      <div className="flex items-center justify-center space-x-6 text-lg">
       <div className="flex items-center space-x-2">
        <Building className="w-5 h-5 text-orange-500" />
        <span className="font-semibold text-orange-600">{employer?.company || 'Company'}</span>
       </div>
       <div className="flex items-center space-x-2">
        <User className="w-5 h-5 text-green-500" />
        <span className="font-semibold text-green-600">{employer?.name || 'Hiring Manager'}</span>
       </div>
      </div>
      
      <Badge className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-lg animate-pulse">
       <Sparkles className="w-4 h-4 mr-2" />
       AI-Proctored Assessment
      </Badge>

      {quiz.deadline && (
       <div className="mt-4 flex items-center justify-center space-x-2">
        <Calendar className="w-4 h-4 text-red-500" />
        <span className={`font-semibold ${isExpired ? 'text-red-600' : 'text-blue-600'}`}>
         Deadline: {new Date(quiz.deadline).toLocaleDateString()} at {new Date(quiz.deadline).toLocaleTimeString()}
        </span>
       </div>
      )}

      <div className="mt-6">
       <Button onClick={handleShowPortal} variant="outline" className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100">
        View Candidate Portal
       </Button>
      </div>
     </div>

     {isExpired ? (
      <Card className="mb-8 shadow-2xl border-0 rounded-3xl overflow-hidden">
       <CardContent className="p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-600 mb-4">Assessment Expired</h2>
        <p className="text-gray-600 text-lg">
         This assessment deadline has passed on {new Date(quiz.deadline).toLocaleDateString()}. 
         Please contact the hiring team if you believe this is an error.
        </p>
       </CardContent>
      </Card>
     ) : (
      <>
       {/* Assessment Info */}
       <Card className="mb-8 shadow-2xl border-0 rounded-3xl overflow-hidden opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]" style={{animationDelay: '300ms'}}>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
         <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
          <Eye className="w-6 h-6 mr-3 text-blue-500" />
          Assessment Overview
         </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
         <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
           <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
             <Timer className="w-6 h-6 text-white" />
            </div>
            <div>
             <span className="font-bold text-lg text-gray-800">Duration:</span>
             <Badge variant="outline" className="ml-3 text-lg px-3 py-1 font-bold">
              {quiz.time_limit} minutes
             </Badge>
            </div>
           </div>

           <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-2xl">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
             <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
             <span className="font-bold text-lg text-gray-800">Questions:</span>
             <Badge variant="outline" className="ml-3 text-lg px-3 py-1 font-bold">
              {quiz.total_questions} questions
             </Badge>
            </div>
           </div>

           <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-2xl">
            <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center">
             <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
             <span className="font-bold text-lg text-gray-800">Type:</span>
             <Badge variant="outline" className="ml-3 text-lg px-3 py-1 font-bold">
              Multiple Choice
             </Badge>
            </div>
           </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-green-50 p-6 rounded-2xl">
           <h4 className="font-bold text-lg mb-4 text-gray-800">Important Information:</h4>
           <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
             <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
             <span>This assessment is AI-proctored with video monitoring</span>
            </div>
            <div className="flex items-start space-x-2">
             <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
             <span>Camera and microphone access is required</span>
            </div>
            <div className="flex items-start space-x-2">
             <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
             <span>Stay in fullscreen mode throughout the assessment</span>
            </div>
            <div className="flex items-start space-x-2">
             <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
             <span>One attempt only - you cannot retake this assessment</span>
            </div>
           </div>
          </div>
         </div>
        </CardContent>
       </Card>

       {/* Proctoring Information */}
       <Card className="mb-8 shadow-2xl border-0 rounded-3xl overflow-hidden opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]" style={{animationDelay: '600ms'}}>
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
         <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
          <Shield className="w-6 h-6 mr-3 text-red-500" />
          AI-Powered Proctoring System
         </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
         <Alert className="border-red-200 bg-red-50 mb-6">
          <Shield className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800 font-semibold text-lg">
           <strong>Advanced Monitoring Active:</strong> This assessment uses AI-powered video proctoring with real-time face detection, screen monitoring, and behavior analysis.
          </AlertDescription>
         </Alert>

         <div className="grid md:grid-cols-2 gap-6">
          {[
           {
            icon: Camera,
            title: 'Video Monitoring',
            description: 'Real-time face detection and tracking throughout the assessment',
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50'
           },
           {
            icon: Monitor,
            title: 'Screen Recording',
            description: 'Full screen recording to ensure no external assistance',
            color: 'bg-green-500',
            bgColor: 'bg-green-50'
           },
           {
            icon: Eye,
            title: 'Attention Tracking',
            description: 'AI monitors eye movement and attention patterns',
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50'
           },
           {
            icon: AlertTriangle,
            title: 'Behavior Analysis',
            description: 'Automatic detection of suspicious activities and red flags',
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50'
           }
          ].map((item, index) => (
           <div key={index} className={`${item.bgColor} p-6 rounded-2xl hover:scale-105 transition-transform duration-300`}>
            <div className="flex items-start space-x-4">
             <div className={`w-10 h-10 ${item.color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
              <item.icon className="w-5 h-5" />
             </div>
             <div className="flex-1">
              <h4 className="font-bold text-lg mb-2 text-gray-800">{item.title}</h4>
              <p className="text-gray-700 leading-relaxed">{item.description}</p>
             </div>
            </div>
           </div>
          ))}
         </div>
        </CardContent>
       </Card>

       {/* Permissions */}
       <Card className="mb-8 shadow-2xl border-0 rounded-3xl overflow-hidden opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]" style={{animationDelay: '900ms'}}>
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
         <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
          <Camera className="w-6 h-6 mr-3 text-green-500" />
          Required Permissions
         </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
         <p className="text-lg text-gray-700 leading-relaxed">This AI-proctored assessment requires multiple permissions for comprehensive monitoring and integrity verification.</p>

         <div className="grid md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${videoPermissionGranted ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
           <div className="flex items-center space-x-3 mb-2">
            <Camera className={`w-5 h-5 ${videoPermissionGranted ? 'text-green-600' : 'text-gray-400'}`} />
            <span className="font-semibold">Camera Access</span>
           </div>
           <p className="text-sm text-gray-600">Required for face detection and identity verification</p>
           {videoPermissionGranted && (
            <Badge className="mt-2 bg-green-500 text-white">
             <CheckCircle className="w-3 h-3 mr-1" />
             Granted
            </Badge>
           )}
          </div>

          <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${audioPermissionGranted ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
           <div className="flex items-center space-x-3 mb-2">
            <Mic className={`w-5 h-5 ${audioPermissionGranted ? 'text-green-600' : 'text-gray-400'}`} />
            <span className="font-semibold">Microphone Access</span>
           </div>
           <p className="text-sm text-gray-600">For audio monitoring and background noise detection</p>
           {audioPermissionGranted && (
            <Badge className="mt-2 bg-green-500 text-white">
             <CheckCircle className="w-3 h-3 mr-1" />
             Granted
            </Badge>
           )}
          </div>

          <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${screenSharePermissionGranted ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
           <div className="flex items-center space-x-3 mb-2">
            <Monitor className={`w-5 h-5 ${screenSharePermissionGranted ? 'text-green-600' : 'text-gray-400'}`} />
            <span className="font-semibold">Screen Recording</span>
           </div>
           <p className="text-sm text-gray-600">For screen activity monitoring and recording</p>
           {screenSharePermissionGranted && (
            <Badge className="mt-2 bg-green-500 text-white">
             <CheckCircle className="w-3 h-3 mr-1" />
             Granted
            </Badge>
           )}
          </div>
         </div>

         {!(videoPermissionGranted && audioPermissionGranted && screenSharePermissionGranted) ? (
          <Button onClick={requestAllPermissions} disabled={isRequestingPermissions} className="w-full py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
           <Video className="w-5 h-5 mr-3" />
           {isRequestingPermissions ? (
            <>
             <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
             Requesting Permissions...
            </>
           ) : (
            'Grant All Required Permissions'
           )}
          </Button>
         ) : (
          <div className="flex items-center justify-center space-x-3 p-6 bg-green-100 rounded-2xl animate-pulse">
           <CheckCircle className="w-8 h-8 text-green-500" />
           <span className="text-green-700 font-bold text-xl">All permissions granted!</span>
           <Zap className="w-6 h-6 text-green-500 animate-bounce" />
          </div>
         )}
        </CardContent>
       </Card>

       {/* Terms Agreement */}
       <Card className="mb-8 shadow-2xl border-0 rounded-3xl overflow-hidden opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]" style={{animationDelay: '1200ms'}}>
        <CardContent className="p-8">
         <div className="flex items-start space-x-4">
          <Checkbox checked={agreedToTerms} onCheckedChange={setAgreedToTerms} className="mt-2 w-6 h-6 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" />
          <div className="text-lg">
           <p className="font-bold text-gray-800 mb-3">I understand and agree to the AI-proctored assessment terms:</p>
           <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
            <li>I consent to comprehensive video, audio, and screen recording</li>
            <li>I understand that AI will monitor my behavior and flag suspicious activities</li>
            <li>I will maintain eye contact with the screen and avoid looking away frequently</li>
            <li>I will not use external assistance, resources, or communication devices</li>
            <li>I will remain in fullscreen mode throughout the entire assessment</li>
            <li>I understand this is a one-time assessment with no retakes allowed</li>
           </ul>
          </div>
         </div>
        </CardContent>
       </Card>

       {/* Start Button */}
       <div className="text-center opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]" style={{animationDelay: '1500ms'}}>
        <Button
         onClick={startAssessment}
         disabled={!agreedToTerms || !videoPermissionGranted || !audioPermissionGranted}
         size="lg"
         className="bg-gradient-to-r from-orange-500 via-orange-400 to-green-500 hover:from-orange-600 hover:to-green-600 text-white px-12 py-6 text-2xl font-black rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
         <Clock className="w-7 h-7 mr-4" />
         Start AI-Proctored Assessment
         {agreedToTerms && videoPermissionGranted && audioPermissionGranted && <Sparkles className="w-6 h-6 ml-3 animate-pulse" />}
        </Button>

        {(!agreedToTerms || !videoPermissionGranted || !audioPermissionGranted) && <p className="text-lg text-gray-600 mt-4 animate-pulse">Please complete all requirements above to start the assessment</p>}
       </div>
      </>
     )}
    </div>
   </div>

   <style>{`
    @keyframes fadeInUp {
     from {
      opacity: 0;
      transform: translateY(30px);
     }
     to {
      opacity: 1;
      transform: translateY(0);
     }
    }
   `}</style>
  </div>
 )
}