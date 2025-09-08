import {useParams, useNavigate} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {Progress} from '@/components/ui/progress'
import {ArrowLeft, Download, Mail, Eye, Clock, Users, BarChart3, TrendingUp, Shield, Video, Brain, AlertTriangle, CheckCircle} from 'lucide-react'
import PDFReportGenerator from '@/components/PDFReportGenerator'

interface CandidateResult {
 id: string
 name: string
 email: string
 score: number
 timeSpent: number // in minutes
 completedAt: string
 status: 'completed' | 'in_progress' | 'not_started'
 authenticityScore: number // 0-100
 flaggedActivities: string[]
 correctAnswers: number
 totalAnswers: number
 proctoringData: {
  faceDetectionRate: number
  attentionScore: number
  suspiciousActivities: number
  videoRecordingUrl?: string
 }
}

export default function Results() {
 const {quizId} = useParams()
 const navigate = useNavigate()

 // Mock data - in real app, fetch based on quizId
 const {data: quizData} = useQuery({
  queryKey: ['quiz-results', quizId],
  queryFn: async () => {
   return {
    title: 'Senior Java Developer Assessment',
    totalQuestions: 15,
    timeLimit: 45,
    createdAt: '2024-01-15',
    candidatesInvited: 25,
    responsesReceived: 18,
    averageScore: 78,
    averageTime: 38,
    company: 'TechCorp Inc.'
   }
  }
 })

 const {data: candidates = []} = useQuery({
  queryKey: ['candidate-results', quizId],
  queryFn: async (): Promise<CandidateResult[]> => {
   return [
    {
     id: '1',
     name: 'John Smith',
     email: 'john.smith@email.com',
     score: 92,
     timeSpent: 35,
     completedAt: '2024-01-16T10:30:00Z',
     status: 'completed',
     authenticityScore: 95,
     flaggedActivities: [],
     correctAnswers: 14,
     totalAnswers: 15,
     proctoringData: {
      faceDetectionRate: 98,
      attentionScore: 94,
      suspiciousActivities: 0
     }
    },
    {
     id: '2',
     name: 'Sarah Johnson',
     email: 'sarah.j@email.com',
     score: 88,
     timeSpent: 42,
     completedAt: '2024-01-16T14:20:00Z',
     status: 'completed',
     authenticityScore: 98,
     flaggedActivities: [],
     correctAnswers: 13,
     totalAnswers: 15,
     proctoringData: {
      faceDetectionRate: 99,
      attentionScore: 96,
      suspiciousActivities: 0
     }
    },
    {
     id: '3',
     name: 'Mike Chen',
     email: 'mike.chen@email.com',
     score: 67,
     timeSpent: 44,
     completedAt: '2024-01-16T16:45:00Z',
     status: 'completed',
     authenticityScore: 72,
     flaggedActivities: ['Tab switching detected', 'Extended idle time', 'Multiple faces detected'],
     correctAnswers: 10,
     totalAnswers: 15,
     proctoringData: {
      faceDetectionRate: 85,
      attentionScore: 68,
      suspiciousActivities: 3
     }
    },
    {
     id: '4',
     name: 'Emily Davis',
     email: 'emily.d@email.com',
     score: 95,
     timeSpent: 33,
     completedAt: '2024-01-16T11:15:00Z',
     status: 'completed',
     authenticityScore: 100,
     flaggedActivities: [],
     correctAnswers: 14,
     totalAnswers: 15,
     proctoringData: {
      faceDetectionRate: 100,
      attentionScore: 98,
      suspiciousActivities: 0
     }
    },
    {
     id: '5',
     name: 'Alex Rodriguez',
     email: 'alex.r@email.com',
     score: 0,
     timeSpent: 0,
     completedAt: '',
     status: 'not_started',
     authenticityScore: 0,
     flaggedActivities: [],
     correctAnswers: 0,
     totalAnswers: 0,
     proctoringData: {
      faceDetectionRate: 0,
      attentionScore: 0,
      suspiciousActivities: 0
     }
    }
   ]
  }
 })

 const completedCandidates = candidates.filter(c => c.status === 'completed')
 const topPerformers = completedCandidates
  .sort((a, b) => {
   // Sort by score first, then by authenticity score
   if (b.score !== a.score) return b.score - a.score
   return b.authenticityScore - a.authenticityScore
  })
  .slice(0, 10)

 // Report data for PDF generation
 const reportData = {
  quizTitle: quizData?.title || '',
  company: quizData?.company || '',
  dateGenerated: new Date().toISOString(),
  totalCandidates: candidates.length,
  completedAssessments: completedCandidates.length,
  averageScore: quizData?.averageScore || 0,
  topPerformers: topPerformers.map(c => ({
   name: c.name,
   email: c.email,
   score: c.score,
   authenticityScore: c.authenticityScore,
   timeSpent: c.timeSpent
  })),
  analytics: {
   scoreDistribution: {
    '90-100%': completedCandidates.filter(c => c.score >= 90).length,
    '80-89%': completedCandidates.filter(c => c.score >= 80 && c.score < 90).length,
    '70-79%': completedCandidates.filter(c => c.score >= 70 && c.score < 80).length,
    '60-69%': completedCandidates.filter(c => c.score >= 60 && c.score < 70).length,
    'Below 60%': completedCandidates.filter(c => c.score < 60).length
   },
   timeAnalytics: {
    averageTime: quizData?.averageTime || 0,
    fastestCompletion: Math.min(...completedCandidates.map(c => c.timeSpent)),
    slowestCompletion: Math.max(...completedCandidates.map(c => c.timeSpent))
   },
   authenticityMetrics: {
    highConfidence: completedCandidates.filter(c => c.authenticityScore >= 90).length,
    mediumConfidence: completedCandidates.filter(c => c.authenticityScore >= 70 && c.authenticityScore < 90).length,
    lowConfidence: completedCandidates.filter(c => c.authenticityScore < 70).length
   },
   redFlags: [
    { type: 'Tab switching', count: 2, percentage: 11.1 },
    { type: 'Multiple faces detected', count: 1, percentage: 5.6 },
    { type: 'Extended idle time', count: 1, percentage: 5.6 },
    { type: 'Copy/paste detected', count: 0, percentage: 0 }
   ]
  }
 }

 const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
  if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  return 'text-red-600 bg-red-50 border-red-200'
 }

 const getAuthenticityColor = (score: number) => {
  if (score >= 90) return 'text-green-600'
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-600'
 }

 const handleGenerateReport = (format: 'pdf' | 'excel') => {
  // Mock report generation
  console.log(`Generating ${format} report...`, reportData)
  // In real app, this would trigger actual PDF/Excel generation
 }

 return (
  <div className="min-h-screen bg-gray-50">
   {/* Header */}
   <header className="bg-white border-b">
    <div className="px-6 py-4 flex justify-between items-center">
     <div className="flex items-center space-x-4">
      <Button variant="ghost" onClick={() => navigate('/dashboard')}>
       <ArrowLeft className="w-4 h-4 mr-2" />
       Back to Dashboard
      </Button>
      <div className="h-6 w-px bg-gray-300" />
      <div className="flex items-center space-x-2">
       <Brain className="w-5 h-5 text-orange-500" />
       <span className="font-semibold">AI Assessment Results</span>
      </div>
     </div>

     <div className="flex space-x-2">
      <Button variant="outline">
       <Download className="w-4 h-4 mr-2" />
       Export CSV
      </Button>
      <Button variant="outline">
       <Mail className="w-4 h-4 mr-2" />
       Send Results
      </Button>
     </div>
    </div>
   </header>

   <div className="p-6">
    {/* Quiz Info */}
    <div className="mb-6">
     <h1 className="text-2xl font-bold mb-2">{quizData?.title}</h1>
     <div className="flex items-center space-x-4 text-sm text-muted-foreground">
      <span>Created: {new Date(quizData?.createdAt || '').toLocaleDateString()}</span>
      <span>•</span>
      <span>{quizData?.totalQuestions} questions</span>
      <span>•</span>
      <span>{quizData?.timeLimit} minutes</span>
      <span>•</span>
      <Badge className="bg-blue-100 text-blue-700">
       <Shield className="w-3 h-3 mr-1" />
       AI Proctored
      </Badge>
     </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
     <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
       <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
       <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
       <div className="text-2xl font-bold">
        {quizData?.responsesReceived}/{quizData?.candidatesInvited}
       </div>
       <Progress value={((quizData?.responsesReceived || 0) / (quizData?.candidatesInvited || 1)) * 100} className="h-2 mt-2" />
      </CardContent>
     </Card>

     <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
       <CardTitle className="text-sm font-medium">Average Score</CardTitle>
       <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
       <div className="text-2xl font-bold">{quizData?.averageScore}%</div>
       <p className="text-xs text-muted-foreground">Across all candidates</p>
      </CardContent>
     </Card>

     <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
       <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
       <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
       <div className="text-2xl font-bold">{quizData?.averageTime}m</div>
       <p className="text-xs text-muted-foreground">Time to complete</p>
      </CardContent>
     </Card>

     <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
       <CardTitle className="text-sm font-medium">High Authenticity</CardTitle>
       <Shield className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
       <div className="text-2xl font-bold text-green-600">{reportData.analytics.authenticityMetrics.highConfidence}</div>
       <p className="text-xs text-muted-foreground">90%+ authenticity</p>
      </CardContent>
     </Card>

     <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
       <CardTitle className="text-sm font-medium">Top Scorers</CardTitle>
       <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
       <div className="text-2xl font-bold">{topPerformers.filter(c => c.score >= 80).length}</div>
       <p className="text-xs text-muted-foreground">Scored 80%+</p>
      </CardContent>
     </Card>
    </div>

    {/* Results Tabs */}
    <Tabs defaultValue="candidates" className="space-y-6">
     <TabsList>
      <TabsTrigger value="candidates">All Candidates</TabsTrigger>
      <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
      <TabsTrigger value="analytics">Analytics</TabsTrigger>
      <TabsTrigger value="reports">AI Reports</TabsTrigger>
     </TabsList>

     <TabsContent value="candidates">
      <Card>
       <CardHeader>
        <CardTitle>Candidate Results with AI Proctoring Data</CardTitle>
       </CardHeader>
       <CardContent>
        <div className="space-y-4">
         {candidates.map(candidate => (
          <div key={candidate.id} className="flex items-center justify-between p-6 border rounded-lg bg-white shadow-sm">
           <div className="flex items-center space-x-4">
            <div>
             <h3 className="font-medium">{candidate.name}</h3>
             <p className="text-sm text-muted-foreground">{candidate.email}</p>
            </div>
           </div>

           <div className="flex items-center space-x-6">
            {candidate.status === 'completed' ? (
             <>
              <div className="text-center">
               <div className={`text-lg font-bold px-3 py-1 rounded-lg border ${getScoreColor(candidate.score)}`}>{candidate.score}%</div>
               <div className="text-xs text-muted-foreground">
                {candidate.correctAnswers}/{candidate.totalAnswers}
               </div>
              </div>

              <div className="text-center">
               <div className="text-sm font-medium">{candidate.timeSpent}m</div>
               <div className="text-xs text-muted-foreground">Time taken</div>
              </div>

              <div className="text-center">
               <div className={`text-sm font-medium ${getAuthenticityColor(candidate.authenticityScore)}`}>
                <Shield className="w-4 h-4 inline mr-1" />
                {candidate.authenticityScore}%
               </div>
               <div className="text-xs text-muted-foreground">Authenticity</div>
              </div>

              <div className="text-center">
               <div className="text-sm font-medium text-blue-600">
                {candidate.proctoringData.faceDetectionRate}%
               </div>
               <div className="text-xs text-muted-foreground">Face Detection</div>
              </div>

              {candidate.flaggedActivities.length > 0 ? (
               <Badge variant="destructive" className="text-xs">
                {candidate.flaggedActivities.length} red flags
               </Badge>
              ) : (
               <Badge className="bg-green-100 text-green-700 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Clean
               </Badge>
              )}
             </>
            ) : candidate.status === 'in_progress' ? (
             <Badge variant="secondary">In Progress</Badge>
            ) : (
             <Badge variant="outline">Not Started</Badge>
            )}

            <div className="flex space-x-2">
             <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-1" />
              Details
             </Button>
             {candidate.proctoringData.videoRecordingUrl && (
              <Button variant="outline" size="sm">
               <Video className="w-4 h-4 mr-1" />
               Video
              </Button>
             )}
            </div>
           </div>
          </div>
         ))}
        </div>
       </CardContent>
      </Card>
     </TabsContent>

     <TabsContent value="top-performers">
      <Card>
       <CardHeader>
        <CardTitle>AI-Recommended Top Performers</CardTitle>
        <p className="text-muted-foreground">Candidates ranked by combined score and authenticity metrics</p>
       </CardHeader>
       <CardContent>
        <div className="space-y-4">
         {topPerformers.map((candidate, index) => (
          <div key={candidate.id} className="flex items-center justify-between p-6 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
           <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">{index + 1}</div>
            <div>
             <h3 className="font-medium">{candidate.name}</h3>
             <p className="text-sm text-muted-foreground">{candidate.email}</p>
             <div className="flex items-center space-x-2 mt-1">
              <Badge className="bg-blue-100 text-blue-700 text-xs">
               Face Detection: {candidate.proctoringData.faceDetectionRate}%
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 text-xs">
               Attention: {candidate.proctoringData.attentionScore}%
              </Badge>
             </div>
            </div>
           </div>

           <div className="flex items-center space-x-6">
            <div className="text-center">
             <div className="text-xl font-bold text-green-600">{candidate.score}%</div>
             <div className="text-xs text-muted-foreground">Score</div>
            </div>

            <div className="text-center">
             <div className="text-sm font-medium text-green-600">
              <Shield className="w-4 h-4 inline mr-1" />
              {candidate.authenticityScore}%
             </div>
             <div className="text-xs text-muted-foreground">Authentic</div>
            </div>

            <div className="flex space-x-2">
             <Button size="sm" className="bg-green-500 hover:bg-green-600">
              <Mail className="w-4 h-4 mr-1" />
              Contact
             </Button>
             <Button variant="outline" size="sm">
              <Video className="w-4 h-4 mr-1" />
              View Recording
             </Button>
            </div>
           </div>
          </div>
         ))}
        </div>
       </CardContent>
      </Card>
     </TabsContent>

     <TabsContent value="analytics">
      <div className="grid md:grid-cols-2 gap-6">
       <Card>
        <CardHeader>
         <CardTitle>Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
         <div className="space-y-4">
          {Object.entries(reportData.analytics.scoreDistribution).map(([range, count]) => (
           <div key={range} className="flex justify-between items-center">
            <span>{range}</span>
            <div className="flex items-center space-x-2">
             <div className="w-32 h-2 bg-gray-200 rounded">
              <div 
               className="h-2 bg-gradient-to-r from-orange-500 to-green-500 rounded" 
               style={{width: `${(count / completedCandidates.length) * 100}%`}} 
              />
             </div>
             <span className="text-sm font-medium">{count}</span>
            </div>
           </div>
          ))}
         </div>
        </CardContent>
       </Card>

       <Card>
        <CardHeader>
         <CardTitle>AI Proctoring Insights</CardTitle>
        </CardHeader>
        <CardContent>
         <div className="space-y-4">
          <div className="flex justify-between">
           <span>High Authenticity (90%+)</span>
           <span className="font-bold text-green-600">{reportData.analytics.authenticityMetrics.highConfidence} candidates</span>
          </div>
          <div className="flex justify-between">
           <span>Medium Authenticity (70-89%)</span>
           <span className="font-bold text-yellow-600">{reportData.analytics.authenticityMetrics.mediumConfidence} candidates</span>
          </div>
          <div className="flex justify-between">
           <span>Low Authenticity (&lt;70%)</span>
           <span className="font-bold text-red-600">{reportData.analytics.authenticityMetrics.lowConfidence} candidates</span>
          </div>

          <div className="pt-4 border-t">
           <h4 className="font-medium mb-2">Red Flag Analysis</h4>
           <div className="text-sm space-y-1">
            {reportData.analytics.redFlags.map((flag, index) => (
             <div key={index} className="flex justify-between">
              <span>{flag.type}</span>
              <span className={flag.count > 0 ? 'text-red-600 font-medium' : ''}>{flag.count} instances</span>
             </div>
            ))}
           </div>
          </div>

          <div className="pt-4 border-t">
           <h4 className="font-medium mb-2">AI Recommendations</h4>
           <div className="text-sm space-y-2">
            <div className="flex items-start space-x-2">
             <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
             <span>Focus on candidates with 90%+ authenticity scores</span>
            </div>
            <div className="flex items-start space-x-2">
             <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
             <span>Review video recordings for flagged candidates</span>
            </div>
            <div className="flex items-start space-x-2">
             <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
             <span>Consider top 4 performers for immediate interviews</span>
            </div>
           </div>
          </div>
         </div>
        </CardContent>
       </Card>
      </div>
     </TabsContent>

     <TabsContent value="reports">
      <PDFReportGenerator 
       reportData={reportData}
       onGenerateReport={handleGenerateReport}
      />
     </TabsContent>
    </Tabs>
   </div>
  </div>
 )
}