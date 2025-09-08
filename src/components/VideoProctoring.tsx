import {useState, useEffect, useRef} from 'react'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {Badge} from '@/components/ui/badge'
import {Camera, Eye, Shield, AlertTriangle, CheckCircle, Activity} from 'lucide-react'

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

interface VideoPromtoringProps {
 onRedFlag: (flag: string) => void
 onDataUpdate: (data: ProctoringData) => void
 isActive: boolean
}

export default function VideoProctoring({onRedFlag, onDataUpdate, isActive}: VideoPromtoringProps) {
 const videoRef = useRef<HTMLVideoElement>(null)
 const canvasRef = useRef<HTMLCanvasElement>(null)
 const streamRef = useRef<MediaStream | null>(null)
 
 const [proctoringData, setProctoringData] = useState<ProctoringData>({
  faceDetected: false,
  faceConfidence: 0,
  isLookingAtScreen: true,
  facesCount: 0,
  attentionScore: 100,
  redFlags: [],
  activityLog: []
 })
 
 const [monitoringStats, setMonitoringStats] = useState({
  totalChecks: 0,
  successfulDetections: 0,
  flaggedEvents: 0,
  sessionStartTime: Date.now()
 })

 // Initialize camera and start monitoring
 useEffect(() => {
  if (isActive) {
   initializeCamera()
   startMonitoring()
  } else {
   cleanup()
  }

  return cleanup
 }, [isActive])

 const initializeCamera = async () => {
  if (navigator.mediaDevices?.getUserMedia) {
   const stream = await navigator.mediaDevices.getUserMedia({
    video: { 
     width: 640, 
     height: 480,
     facingMode: 'user'
    },
    audio: true
   })

   if (videoRef.current) {
    videoRef.current.srcObject = stream
    streamRef.current = stream
   }
  }
 }

 const cleanup = () => {
  if (streamRef.current) {
   streamRef.current.getTracks().forEach(track => track.stop())
   streamRef.current = null
  }
 }

 const startMonitoring = () => {
  // Face detection monitoring
  const faceDetectionInterval = setInterval(() => {
   if (videoRef.current && canvasRef.current) {
    performFaceDetection()
   }
  }, 2000)

  // Screen activity monitoring
  const screenMonitoringInterval = setInterval(() => {
   monitorScreenActivity()
  }, 1000)

  // Cleanup intervals when component unmounts
  return () => {
   clearInterval(faceDetectionInterval)
   clearInterval(screenMonitoringInterval)
  }
 }

 const performFaceDetection = () => {
  // Simulated face detection (in real app, use TensorFlow.js or similar)
  const mockDetection = {
   faceDetected: Math.random() > 0.1, // 90% chance of detecting face
   faceConfidence: 0.8 + Math.random() * 0.2, // 80-100% confidence
   facesCount: Math.random() > 0.95 ? 2 : 1, // Occasionally detect multiple faces
   isLookingAtScreen: Math.random() > 0.15 // 85% chance of looking at screen
  }

  const newData = {
   ...proctoringData,
   faceDetected: mockDetection.faceDetected,
   faceConfidence: mockDetection.faceConfidence,
   facesCount: mockDetection.facesCount,
   isLookingAtScreen: mockDetection.isLookingAtScreen
  }

  // Check for red flags
  const newRedFlags = [...proctoringData.redFlags]
  
  if (!mockDetection.faceDetected) {
   addRedFlag('No face detected', 'warning')
   if (!newRedFlags.includes('No face detected')) {
    newRedFlags.push('No face detected')
   }
  }

  if (mockDetection.facesCount > 1) {
   addRedFlag('Multiple faces detected', 'error')
   if (!newRedFlags.includes('Multiple faces detected')) {
    newRedFlags.push('Multiple faces detected')
   }
  }

  if (!mockDetection.isLookingAtScreen) {
   addRedFlag('Looking away from screen', 'warning')
  }

  // Update attention score
  const sessionDuration = (Date.now() - monitoringStats.sessionStartTime) / 1000
  const attentionScore = Math.max(0, 100 - (newRedFlags.length * 5))

  newData.redFlags = newRedFlags
  newData.attentionScore = attentionScore

  setProctoringData(newData)
  onDataUpdate(newData)

  setMonitoringStats(prev => ({
   ...prev,
   totalChecks: prev.totalChecks + 1,
   successfulDetections: mockDetection.faceDetected ? prev.successfulDetections + 1 : prev.successfulDetections
  }))
 }

 const monitorScreenActivity = () => {
  // Monitor for tab switching, fullscreen, etc.
  const isFullscreen = !!document.fullscreenElement
  const isHidden = document.hidden

  if (isHidden) {
   addRedFlag('Tab switching detected', 'warning')
   onRedFlag('Tab switching detected')
  }

  if (!isFullscreen) {
   addRedFlag('Not in fullscreen mode', 'info')
  }
 }

 const addRedFlag = (event: string, severity: 'info' | 'warning' | 'error') => {
  const logEntry = {
   timestamp: new Date().toISOString(),
   event,
   severity
  }

  setProctoringData(prev => ({
   ...prev,
   activityLog: [...prev.activityLog, logEntry]
  }))

  if (severity === 'error' || severity === 'warning') {
   onRedFlag(event)
   setMonitoringStats(prev => ({
    ...prev,
    flaggedEvents: prev.flaggedEvents + 1
   }))
  }
 }

 return (
  <div className="space-y-4">
   {/* Camera Feed */}
   <Card className="border-2 border-blue-200 bg-blue-50">
    <CardHeader className="pb-3">
     <CardTitle className="flex items-center text-blue-700">
      <Camera className="w-5 h-5 mr-2" />
      Video Monitoring
     </CardTitle>
    </CardHeader>
    <CardContent>
     <div className="flex gap-4">
      <div className="relative">
       <video
        ref={videoRef}
        autoPlay
        muted
        className="w-48 h-36 bg-gray-900 rounded-lg object-cover"
       />
       <canvas ref={canvasRef} className="hidden" width={640} height={480} />
       
       {/* Overlay indicators */}
       <div className="absolute top-2 left-2 flex gap-1">
        {proctoringData.faceDetected ? (
         <Badge className="bg-green-500 text-white">
          <CheckCircle className="w-3 h-3 mr-1" />
          Face Detected
         </Badge>
        ) : (
         <Badge className="bg-red-500 text-white">
          <AlertTriangle className="w-3 h-3 mr-1" />
          No Face
         </Badge>
        )}
       </div>

       <div className="absolute bottom-2 left-2">
        <Badge variant="outline" className="bg-white/80">
         Recording...
        </Badge>
       </div>
      </div>

      <div className="flex-1 space-y-3">
       <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex justify-between">
         <span>Face Confidence:</span>
         <span className="font-bold">{(proctoringData.faceConfidence * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
         <span>Faces Detected:</span>
         <span className="font-bold">{proctoringData.facesCount}</span>
        </div>
        <div className="flex justify-between">
         <span>Looking at Screen:</span>
         <span className={`font-bold ${proctoringData.isLookingAtScreen ? 'text-green-600' : 'text-red-600'}`}>
          {proctoringData.isLookingAtScreen ? 'Yes' : 'No'}
         </span>
        </div>
        <div className="flex justify-between">
         <span>Attention Score:</span>
         <span className="font-bold text-blue-600">{proctoringData.attentionScore}%</span>
        </div>
       </div>
      </div>
     </div>
    </CardContent>
   </Card>

   {/* Red Flags Alert */}
   {proctoringData.redFlags.length > 0 && (
    <Alert className="border-orange-200 bg-orange-50">
     <Shield className="h-4 w-4 text-orange-600" />
     <AlertDescription className="text-orange-800">
      <div className="font-semibold mb-2">Security Alerts ({proctoringData.redFlags.length})</div>
      <div className="space-y-1 text-sm">
       {proctoringData.redFlags.slice(-3).map((flag, index) => (
        <div key={index} className="flex items-center gap-2">
         <AlertTriangle className="w-3 h-3" />
         {flag}
        </div>
       ))}
       {proctoringData.redFlags.length > 3 && (
        <div className="text-xs text-orange-600">
         ... and {proctoringData.redFlags.length - 3} more alerts
        </div>
       )}
      </div>
     </AlertDescription>
    </Alert>
   )}

   {/* Monitoring Statistics */}
   <Card className="border border-gray-200">
    <CardHeader className="pb-3">
     <CardTitle className="flex items-center text-gray-700 text-sm">
      <Activity className="w-4 h-4 mr-2" />
      Session Statistics
     </CardTitle>
    </CardHeader>
    <CardContent>
     <div className="grid grid-cols-4 gap-4 text-xs">
      <div className="text-center">
       <div className="font-bold text-lg text-blue-600">{monitoringStats.totalChecks}</div>
       <div className="text-gray-600">Total Checks</div>
      </div>
      <div className="text-center">
       <div className="font-bold text-lg text-green-600">{monitoringStats.successfulDetections}</div>
       <div className="text-gray-600">Successful</div>
      </div>
      <div className="text-center">
       <div className="font-bold text-lg text-red-600">{monitoringStats.flaggedEvents}</div>
       <div className="text-gray-600">Red Flags</div>
      </div>
      <div className="text-center">
       <div className="font-bold text-lg text-purple-600">{Math.floor((Date.now() - monitoringStats.sessionStartTime) / 1000)}s</div>
       <div className="text-gray-600">Session Time</div>
      </div>
     </div>
    </CardContent>
   </Card>
  </div>
 )
}