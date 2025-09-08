import {useState, useEffect} from 'react'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Progress} from '@/components/ui/progress'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {Clock, CheckCircle, AlertTriangle, Mail, Calendar, User, Building} from 'lucide-react'

interface CandidatePortalProps {
 candidateData: {
  name: string
  email: string
  quizTitle: string
  company: string
  status: 'pending' | 'in_progress' | 'completed'
  invitationSent: boolean
  startedAt?: string
  completedAt?: string
  score?: number
  timeLimit: number
  questionsTotal: number
  progress?: number
 }
 onStartAssessment: () => void
}

export default function CandidatePortal({candidateData, onStartAssessment}: CandidatePortalProps) {
 const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

 useEffect(() => {
  if (candidateData.status === 'in_progress' && candidateData.startedAt) {
   const startTime = new Date(candidateData.startedAt).getTime()
   const duration = candidateData.timeLimit * 60 * 1000 // Convert to milliseconds
   
   const interval = setInterval(() => {
    const now = Date.now()
    const elapsed = now - startTime
    const remaining = Math.max(0, duration - elapsed)
    
    setTimeRemaining(remaining)
    
    if (remaining === 0) {
     clearInterval(interval)
    }
   }, 1000)

   return () => clearInterval(interval)
  }
 }, [candidateData.status, candidateData.startedAt, candidateData.timeLimit])

 const formatTime = (milliseconds: number) => {
  const minutes = Math.floor(milliseconds / 60000)
  const seconds = Math.floor((milliseconds % 60000) / 1000)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
 }

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'completed':
    return 'bg-green-100 text-green-700 border-green-300'
   case 'in_progress':
    return 'bg-blue-100 text-blue-700 border-blue-300'
   case 'pending':
    return 'bg-yellow-100 text-yellow-700 border-yellow-300'
   default:
    return 'bg-gray-100 text-gray-700 border-gray-300'
  }
 }

 return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
   <div className="max-w-4xl mx-auto">
    {/* Header */}
    <div className="text-center mb-8">
     <div className="flex justify-center items-center space-x-3 mb-4">
      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-green-500 rounded-2xl flex items-center justify-center">
       <CheckCircle className="w-6 h-6 text-white" />
      </div>
      <span className="text-3xl font-black bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
       frstlvl.ai
      </span>
     </div>
     <h1 className="text-2xl font-bold text-gray-800 mb-2">Candidate Portal</h1>
     <p className="text-gray-600">Track your assessment progress and status</p>
    </div>

    {/* Candidate Info Card */}
    <Card className="mb-6 border-0 shadow-xl">
     <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardTitle className="flex items-center text-xl">
       <User className="w-5 h-5 mr-3 text-blue-500" />
       Assessment Information
      </CardTitle>
     </CardHeader>
     <CardContent className="p-6">
      <div className="grid md:grid-cols-2 gap-6">
       <div className="space-y-4">
        <div className="flex items-center space-x-3">
         <User className="w-5 h-5 text-gray-400" />
         <div>
          <div className="text-sm text-gray-500">Candidate</div>
          <div className="font-semibold">{candidateData.name}</div>
         </div>
        </div>
        
        <div className="flex items-center space-x-3">
         <Mail className="w-5 h-5 text-gray-400" />
         <div>
          <div className="text-sm text-gray-500">Email</div>
          <div className="font-semibold">{candidateData.email}</div>
         </div>
        </div>

        <div className="flex items-center space-x-3">
         <Building className="w-5 h-5 text-gray-400" />
         <div>
          <div className="text-sm text-gray-500">Company</div>
          <div className="font-semibold">{candidateData.company}</div>
         </div>
        </div>
       </div>

       <div className="space-y-4">
        <div className="flex items-center space-x-3">
         <CheckCircle className="w-5 h-5 text-gray-400" />
         <div>
          <div className="text-sm text-gray-500">Assessment</div>
          <div className="font-semibold">{candidateData.quizTitle}</div>
         </div>
        </div>

        <div className="flex items-center space-x-3">
         <Clock className="w-5 h-5 text-gray-400" />
         <div>
          <div className="text-sm text-gray-500">Time Limit</div>
          <div className="font-semibold">{candidateData.timeLimit} minutes</div>
         </div>
        </div>

        <div className="flex items-center space-x-3">
         <AlertTriangle className="w-5 h-5 text-gray-400" />
         <div>
          <div className="text-sm text-gray-500">Questions</div>
          <div className="font-semibold">{candidateData.questionsTotal} questions</div>
         </div>
        </div>
       </div>
      </div>
     </CardContent>
    </Card>

    {/* Status Card */}
    <Card className="mb-6 border-0 shadow-xl">
     <CardHeader>
      <CardTitle className="flex items-center justify-between">
       <span className="flex items-center">
        <Calendar className="w-5 h-5 mr-3 text-purple-500" />
        Assessment Status
       </span>
       <Badge className={getStatusColor(candidateData.status)}>
        {candidateData.status.replace('_', ' ').toUpperCase()}
       </Badge>
      </CardTitle>
     </CardHeader>
     <CardContent>
      {candidateData.status === 'pending' && (
       <div className="text-center py-8">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Ready to Start</h3>
        <p className="text-gray-600 mb-6">
         Your assessment is ready. Make sure you have a stable internet connection and a quiet environment.
        </p>
        <Button 
         onClick={onStartAssessment}
         className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 px-8 py-3 text-lg font-bold"
        >
         Start Assessment
        </Button>
       </div>
      )}

      {candidateData.status === 'in_progress' && (
       <div className="text-center py-8">
        <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Assessment in Progress</h3>
        {timeRemaining !== null && (
         <div className="mb-4">
          <div className="text-3xl font-bold text-blue-600 mb-2">
           {formatTime(timeRemaining)}
          </div>
          <Progress 
           value={((candidateData.timeLimit * 60 * 1000 - timeRemaining) / (candidateData.timeLimit * 60 * 1000)) * 100} 
           className="w-64 mx-auto"
          />
         </div>
        )}
        <p className="text-gray-600">
         Progress: {candidateData.progress || 0}% completed
        </p>
       </div>
      )}

      {candidateData.status === 'completed' && (
       <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Assessment Completed</h3>
        <div className="mb-4">
         {candidateData.score !== undefined && (
          <div className="text-3xl font-bold text-green-600 mb-2">
           {candidateData.score}%
          </div>
         )}
         <p className="text-gray-600">
          Completed on {candidateData.completedAt ? new Date(candidateData.completedAt).toLocaleDateString() : 'N/A'}
         </p>
        </div>
        <Alert className="max-w-md mx-auto bg-green-50 border-green-200">
         <CheckCircle className="h-4 w-4 text-green-600" />
         <AlertDescription className="text-green-800">
          Thank you for completing the assessment. Results have been sent to the hiring team.
         </AlertDescription>
        </Alert>
       </div>
      )}
     </CardContent>
    </Card>

    {/* Additional Information */}
    <Card className="border-0 shadow-xl">
     <CardHeader>
      <CardTitle className="flex items-center">
       <AlertTriangle className="w-5 h-5 mr-3 text-orange-500" />
       Important Information
      </CardTitle>
     </CardHeader>
     <CardContent>
      <div className="space-y-3 text-sm">
       <div className="flex items-start space-x-2">
        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
        <span>This assessment is proctored with video monitoring for integrity</span>
       </div>
       <div className="flex items-start space-x-2">
        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
        <span>Ensure your camera and microphone permissions are granted</span>
       </div>
       <div className="flex items-start space-x-2">
        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
        <span>Stay in fullscreen mode throughout the assessment</span>
       </div>
       <div className="flex items-start space-x-2">
        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
        <span>Results will be shared with you via email within 24 hours</span>
       </div>
      </div>
     </CardContent>
    </Card>
   </div>
  </div>
 )
}