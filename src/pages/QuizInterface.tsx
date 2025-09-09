import {useState, useEffect} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Progress} from '@/components/ui/progress'
import {Badge} from '@/components/ui/badge'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {Clock, ArrowRight, ArrowLeft, Flag, CheckCircle, AlertTriangle, Brain, Zap, Star, Shield} from 'lucide-react'
// import {useToast} from '@/hooks/use-toast'
import { toast } from "sonner";
import VideoProctoring from '@/components/VideoProctoring'

interface Question {
 id: string
 question: string
 options: {
  A: string
  B: string
  C: string
  D: string
 }
 difficulty: string
 topic: string
}

interface ProctoringData {
 faceDetected: boolean
 faceConfidence: number
 isLookingAtScreen: boolean
 facesCount: number
 attentionScore: number
 redFlags: string[]
 activityLog: Array<{
  timestamp: string
  event: string
  severity: 'info' | 'warning' | 'error'
 }>
}

export default function QuizInterface() {
 const {linkId} = useParams()
 const navigate = useNavigate()
//  const {toast} = useToast()

 const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
 const [answers, setAnswers] = useState<Record<string, string>>({})
 const [timeRemaining, setTimeRemaining] = useState(45 * 60) // 45 minutes in seconds
 const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
 const [isSubmitting, setIsSubmitting] = useState(false)
 const [showQuestionTransition, setShowQuestionTransition] = useState(false)
 const [proctoringData, setProctoringData] = useState<ProctoringData | null>(null)
 const [sessionRedFlags, setSessionRedFlags] = useState<string[]>([])
 const [authenticityScore, setAuthenticityScore] = useState(100)

 // Mock questions - in real app, these would be fetched based on linkId
 const questions: Question[] = [
  {
   id: '1',
   question: 'Which of the following best describes the difference between JDK and JRE?',
   options: {
    A: 'JDK is for development, JRE is for running Java applications',
    B: 'JDK is older version, JRE is newer version',
    C: 'JDK is for mobile, JRE is for desktop',
    D: 'There is no difference between JDK and JRE'
   },
   difficulty: 'Easy',
   topic: 'Core Java'
  },
  {
   id: '2',
   question: 'What is the purpose of the volatile keyword in Java?',
   options: {
    A: 'To make a variable constant',
    B: 'To ensure thread-safe access to a variable',
    C: 'To make a variable private',
    D: 'To optimize memory usage'
   },
   difficulty: 'Medium',
   topic: 'Multithreading'
  },
  {
   id: '3',
   question: 'Which design pattern ensures a class has only one instance?',
   options: {
    A: 'Factory Pattern',
    B: 'Observer Pattern',
    C: 'Singleton Pattern',
    D: 'Builder Pattern'
   },
   difficulty: 'Medium',
   topic: 'Design Patterns'
  }
 ]

 const currentQuestion = questions[currentQuestionIndex]

 // Timer effect
 useEffect(() => {
  if (timeRemaining <= 0) {
   handleSubmit()
   return
  }

  const timer = setInterval(() => {
   setTimeRemaining(prev => prev - 1)
  }, 1000)

  return () => clearInterval(timer)
 }, [timeRemaining])

 // Monitor window focus and tab switching
 useEffect(() => {
  const handleVisibilityChange = () => {
   if (document.hidden) {
    handleRedFlag('Tab switching detected - left assessment window')
   }
  }

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
   e.preventDefault()
   e.returnValue = 'Are you sure you want to leave the assessment?'
  }

  const handleKeyDown = (e: KeyboardEvent) => {
   // Prevent common cheating shortcuts
   if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 'f')) {
    e.preventDefault()
    handleRedFlag(`Attempted keyboard shortcut: Ctrl+${e.key.toUpperCase()}`)
   }
   
   if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
    e.preventDefault()
    handleRedFlag('Attempted to open developer tools')
   }
  }

  const handleContextMenu = (e: MouseEvent) => {
   e.preventDefault()
   handleRedFlag('Right-click context menu attempted')
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('beforeunload', handleBeforeUnload)
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('contextmenu', handleContextMenu)

  return () => {
   document.removeEventListener('visibilitychange', handleVisibilityChange)
   window.removeEventListener('beforeunload', handleBeforeUnload)
   document.removeEventListener('keydown', handleKeyDown)
   document.removeEventListener('contextmenu', handleContextMenu)
  }
 }, [])

 // Format time display
 const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
 }

 const handleAnswerSelect = (option: string) => {
  setAnswers(prev => ({
   ...prev,
   [currentQuestion.id]: option
  }))

  // Add visual feedback
  const element = document.querySelector(`[data-option="${option}"]`)
  element?.classList.add('animate-pulse')
  setTimeout(() => {
   element?.classList.remove('animate-pulse')
  }, 300)
 }

 const handleNext = () => {
  if (currentQuestionIndex < questions.length - 1) {
   setShowQuestionTransition(true)
   setTimeout(() => {
    setCurrentQuestionIndex(prev => prev + 1)
    setShowQuestionTransition(false)
   }, 200)
  }
 }

 const handlePrevious = () => {
  if (currentQuestionIndex > 0) {
   setShowQuestionTransition(true)
   setTimeout(() => {
    setCurrentQuestionIndex(prev => prev - 1)
    setShowQuestionTransition(false)
   }, 200)
  }
 }

 const handleFlag = () => {
  const newFlagged = new Set(flaggedQuestions)
  if (flaggedQuestions.has(currentQuestion.id)) {
   newFlagged.delete(currentQuestion.id)
  } else {
   newFlagged.add(currentQuestion.id)
  }
  setFlaggedQuestions(newFlagged)

  toast({
   title: flaggedQuestions.has(currentQuestion.id) ? 'Question unflagged' : 'Question flagged',
   description: flaggedQuestions.has(currentQuestion.id) ? 'Removed flag from this question' : 'You can review this question later'
  })
 }

 const handleRedFlag = (flagDescription: string) => {
  setSessionRedFlags(prev => [...prev, flagDescription])
  setAuthenticityScore(prev => Math.max(0, prev - 5))
  
  toast({
   title: '⚠️ Security Alert',
   description: flagDescription,
   variant: 'destructive'
  })
 }

 const handleProctoringUpdate = (data: ProctoringData) => {
  setProctoringData(data)
  
  // Update authenticity score based on proctoring data
  const newScore = Math.max(0, 100 - (data.redFlags.length * 3) - (sessionRedFlags.length * 5))
  setAuthenticityScore(newScore)
 }

 const handleSubmit = async () => {
  setIsSubmitting(true)

  // Mock submission with proctoring data
  const submissionData = {
   answers,
   timeSpent: (45 * 60) - timeRemaining,
   authenticityScore,
   redFlags: [...sessionRedFlags, ...(proctoringData?.redFlags || [])],
   proctoringData,
   completedAt: new Date().toISOString()
  }

  // Simulate submission
  await new Promise(resolve => setTimeout(resolve, 2000))

  toast({
   title: 'Assessment submitted successfully!',
   description: 'Your responses and proctoring data have been recorded.'
  })

  // Exit fullscreen
  if (document.fullscreenElement) {
   document.exitFullscreen()
  }

  // In real app, navigate to results or thank you page
  navigate('/')
 }

 const answeredCount = Object.keys(answers).length
 const progressPercentage = (answeredCount / questions.length) * 100

 const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
   case 'Easy':
    return 'bg-green-100 text-green-700 border-green-300'
   case 'Medium':
    return 'bg-yellow-100 text-yellow-700 border-yellow-300'
   case 'Hard':
    return 'bg-red-100 text-red-700 border-red-300'
   default:
    return 'bg-gray-100 text-gray-700 border-gray-300'
  }
 }

 return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
   {/* Animated Background */}
   <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-orange-200/30 to-yellow-200/30 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1000ms'}} />
   </div>

   {/* Header */}
   <header className="relative bg-white/80 backdrop-blur-lg border-b sticky top-0 z-50 shadow-sm">
    <div className="px-6 py-4 flex justify-between items-center">
     <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-3">
       <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-green-500 rounded-lg flex items-center justify-center">
        <Brain className="w-5 h-5 text-white" />
       </div>
       <span className="font-black text-xl">frstlvl.ai</span>
      </div>
      <div className="h-6 w-px bg-gray-300" />
      <div className="flex items-center space-x-2">
       <Zap className="w-4 h-4 text-orange-500" />
       <span className="text-sm text-gray-600 font-semibold">AI-Proctored Assessment</span>
      </div>
     </div>

     <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
       <Shield className="w-4 h-4 text-green-500" />
       <span className="text-sm font-semibold">Authenticity: {authenticityScore}%</span>
      </div>
      
      <div className={`flex items-center space-x-3 px-4 py-2 rounded-2xl transition-all duration-300 ${timeRemaining <= 300 ? 'bg-red-100 text-red-700 animate-pulse' : timeRemaining <= 600 ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
       <Clock className="w-5 h-5" />
       <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
      </div>

      <Button onClick={handleSubmit} variant="outline" disabled={isSubmitting} className="font-semibold hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all">
       {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
      </Button>
     </div>
    </div>
   </header>

   <div className="container mx-auto px-4 py-6">
    <div className="max-w-7xl mx-auto">
     {/* Progress */}
     <div className="mb-8 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]">
      <div className="flex justify-between items-center mb-4">
       <div className="flex items-center space-x-3">
        <span className="text-lg font-bold text-gray-800">
         Question {currentQuestionIndex + 1} of {questions.length}
        </span>
        <Badge variant="outline" className="animate-pulse">
         <Star className="w-3 h-3 mr-1" />
         AI Monitored
        </Badge>
       </div>
       <span className="text-sm text-gray-600 font-medium">
        {answeredCount} answered • {flaggedQuestions.size} flagged • {questions.length - answeredCount} remaining
       </span>
      </div>
      <div className="bg-white rounded-2xl p-2 shadow-sm">
       <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-3 rounded-xl" />
      </div>
     </div>

     <div className="grid lg:grid-cols-4 gap-8">
      {/* Question Content */}
      <div className="lg:col-span-2">
       <Card className={`shadow-2xl border-0 rounded-3xl overflow-hidden transition-all duration-500 ${showQuestionTransition ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        <CardHeader className="bg-gradient-to-r from-orange-50 to-green-50 border-b">
         <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
           <Badge variant="outline" className={`${getDifficultyColor(currentQuestion.difficulty)} font-semibold`}>
            {currentQuestion.difficulty}
           </Badge>
           <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-semibold">
            {currentQuestion.topic}
           </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleFlag} className={`transition-all duration-300 ${flaggedQuestions.has(currentQuestion.id) ? 'text-orange-500 bg-orange-100' : 'hover:text-orange-500 hover:bg-orange-50'}`}>
           <Flag className="w-4 h-4" />
          </Button>
         </div>
         <CardTitle className="text-2xl leading-relaxed text-gray-800 font-bold">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
         <div className="space-y-4">
          {Object.entries(currentQuestion.options).map(([key, value]) => (
           <button
            key={key}
            data-option={key}
            onClick={() => handleAnswerSelect(key)}
            className={`w-full p-6 text-left border-2 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${
             answers[currentQuestion.id] === key ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-100 shadow-lg scale-[1.02]' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
            }`}
           >
            <div className="flex items-start space-x-4">
             <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 ${answers[currentQuestion.id] === key ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 bg-white text-gray-600'}`}>{key}</div>
             <span className="flex-1 text-lg leading-relaxed">{value}</span>
            </div>
           </button>
          ))}
         </div>
        </CardContent>
       </Card>

       {/* Navigation */}
       <div className="flex justify-between items-center mt-8">
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="px-6 py-3 font-semibold rounded-2xl hover:scale-105 transition-all">
         <ArrowLeft className="w-4 h-4 mr-2" />
         Previous
        </Button>

        <div className="text-center">
         {answers[currentQuestion.id] ? (
          <div className="flex items-center justify-center text-green-600 bg-green-100 px-4 py-2 rounded-2xl">
           <CheckCircle className="w-5 h-5 mr-2" />
           <span className="font-semibold">Answered</span>
          </div>
         ) : (
          <div className="flex items-center justify-center text-orange-600 bg-orange-100 px-4 py-2 rounded-2xl animate-pulse">
           <AlertTriangle className="w-5 h-5 mr-2" />
           <span className="font-semibold">Not answered</span>
          </div>
         )}
        </div>

        {currentQuestionIndex === questions.length - 1 ? (
         <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 px-6 py-3 font-bold rounded-2xl hover:scale-105 transition-all">
          {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
         </Button>
        ) : (
         <Button onClick={handleNext} className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 px-6 py-3 font-bold rounded-2xl hover:scale-105 transition-all">
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
         </Button>
        )}
       </div>
      </div>

      {/* Proctoring Panel */}
      <div className="lg:col-span-1">
       <VideoProctoring 
        onRedFlag={handleRedFlag}
        onDataUpdate={handleProctoringUpdate}
        isActive={true}
       />
      </div>

      {/* Question Navigator */}
      <div className="lg:col-span-1">
       <Card className="shadow-xl border-0 rounded-3xl overflow-hidden mb-6">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
         <CardTitle className="text-lg font-bold text-gray-800">Question Navigator</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
         <div className="grid grid-cols-3 gap-3 mb-6">
          {questions.map((question, index) => (
           <button
            key={question.id}
            onClick={() => {
             setShowQuestionTransition(true)
             setTimeout(() => {
              setCurrentQuestionIndex(index)
              setShowQuestionTransition(false)
             }, 200)
            }}
            className={`w-full h-12 text-sm font-bold rounded-xl border-2 transition-all duration-300 hover:scale-110 ${
             index === currentQuestionIndex
              ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
              : answers[question.id]
                ? 'border-green-500 bg-green-100 text-green-700 hover:bg-green-200'
                : flaggedQuestions.has(question.id)
                  ? 'border-orange-500 bg-orange-100 text-orange-700 hover:bg-orange-200'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
           >
            {index + 1}
           </button>
          ))}
         </div>

         <div className="space-y-3 text-xs">
          <div className="flex items-center space-x-2">
           <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded" />
           <span className="font-medium">Answered</span>
          </div>
          <div className="flex items-center space-x-2">
           <div className="w-4 h-4 bg-orange-100 border-2 border-orange-500 rounded" />
           <span className="font-medium">Flagged</span>
          </div>
          <div className="flex items-center space-x-2">
           <div className="w-4 h-4 bg-blue-500 border-2 border-blue-500 rounded" />
           <span className="font-medium">Current</span>
          </div>
          <div className="flex items-center space-x-2">
           <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded" />
           <span className="font-medium">Not attempted</span>
          </div>
         </div>
        </CardContent>
       </Card>

       {/* Progress Summary */}
       <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
         <CardTitle className="text-lg font-bold text-gray-800">Progress Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
         <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center">
           <span className="font-medium">Total Questions:</span>
           <Badge variant="outline" className="font-bold">
            {questions.length}
           </Badge>
          </div>
          <div className="flex justify-between items-center">
           <span className="font-medium">Answered:</span>
           <Badge className="bg-green-500 text-white font-bold">{answeredCount}</Badge>
          </div>
          <div className="flex justify-between items-center">
           <span className="font-medium">Remaining:</span>
           <Badge className="bg-orange-500 text-white font-bold">{questions.length - answeredCount}</Badge>
          </div>
          <div className="flex justify-between items-center">
           <span className="font-medium">Flagged:</span>
           <Badge className="bg-blue-500 text-white font-bold">{flaggedQuestions.size}</Badge>
          </div>
          <div className="flex justify-between items-center">
           <span className="font-medium">Authenticity:</span>
           <Badge className={`font-bold ${authenticityScore >= 80 ? 'bg-green-500' : authenticityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
            {authenticityScore}%
           </Badge>
          </div>

          <div className="pt-4">
           <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-green-500 transition-all duration-500 ease-out" style={{width: `${progressPercentage}%`}} />
           </div>
           <div className="text-center mt-2 font-bold text-gray-700">{Math.round(progressPercentage)}% Complete</div>
          </div>
         </div>
        </CardContent>
       </Card>
      </div>
     </div>
    </div>
   </div>

   {/* Warning for low time */}
   {timeRemaining <= 300 && timeRemaining > 0 && (
    <Alert className="fixed bottom-6 right-6 w-80 border-red-300 bg-red-50 shadow-2xl rounded-2xl animate-bounce">
     <AlertTriangle className="h-5 w-5 text-red-600" />
     <AlertDescription className="text-red-700 font-semibold">
      <strong>Warning:</strong> Only {formatTime(timeRemaining)} remaining!
     </AlertDescription>
    </Alert>
   )}

   <style jsx>{`
    @keyframes fadeInUp {
     from {
      opacity: 0;
      transform: translateY(20px);
     }
     to {
      opacity: 1;
      transform: translateY(0);
     }
    }
    
    .animate-fade-in-up {
     animation: fadeInUp 0.6s ease-out;
    }
   `}</style>
  </div>
 )
}