import {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Input} from '@/components/ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {Checkbox} from '@/components/ui/checkbox'
import {Plus, Brain, Users, Clock, Search, Filter, BarChart3, Settings, LogOut, Eye, Download, Calendar, AlertTriangle, CheckCircle, Link, X, RefreshCw, Edit, Send, Mail, Trash2} from 'lucide-react'
import {useAuth} from '@/contexts/AuthContext'
import {useSupabase} from '@/contexts/SupabaseContext'
import {useToast} from '@/hooks/use-toast'
import { resend } from '../lib/resend';

export default function EmployerDashboard() {
 const navigate = useNavigate()
 const {user, logout} = useAuth()
 const {getUserQuizzes, getQuizCandidates, updateQuizQuestions, addCandidatesToExistingQuiz, getQuestionsByTopic} = useSupabase()
 const {toast} = useToast()

 // All hooks at the top level - no conditional calls
 const [searchTerm, setSearchTerm] = useState('')
 const [statusFilter, setStatusFilter] = useState('all')
 const [showFilters, setShowFilters] = useState(false)
 const [isRefreshing, setIsRefreshing] = useState(false)
 const [showEditModal, setShowEditModal] = useState(false)
 const [editingAssessment, setEditingAssessment] = useState(null)
 const [editQuestions, setEditQuestions] = useState([])
 const [selectedEditQuestions, setSelectedEditQuestions] = useState([])
 const [showSendModal, setShowSendModal] = useState(false)
 const [sendingAssessment, setSendingAssessment] = useState(null)
 const [newCandidates, setNewCandidates] = useState([''])
 const [isSending, setIsSending] = useState(false)

 // Fetch user's quizzes with real-time refetch - hook at top level
 const {
  data: quizzesData = [],
  refetch,
  isLoading
 } = useQuery({
  queryKey: ['user-quizzes', user?.id],
  queryFn: () => {
   console.log('🔄 Fetching quizzes from REAL Supabase database for user:', user?.id)
   return getUserQuizzes(user?.id || '')
  },
  enabled: !!user,
  refetchOnWindowFocus: true,
  refetchInterval: 30000 // Auto-refresh every 30 seconds
 })

 // Ensure quizzes is always an array - defensive programming
 const quizzes = Array.isArray(quizzesData) ? quizzesData : []

 // Auto-refresh on mount to show loader effect
 useEffect(() => {
  if (user) {
   handleRefreshData()
  }
 }, [user])

 // Calculate stats from REAL data with array safety checks
 const stats = {
  totalQuizzes: quizzes.length,
  totalCandidates: Array.isArray(quizzes) ? quizzes.reduce((sum, quiz) => sum + (quiz.candidates_invited || 0), 0) : 0,
  totalResponses: Array.isArray(quizzes) ? quizzes.reduce((sum, quiz) => sum + (quiz.responses_received || 0), 0) : 0,
  averageScore: Array.isArray(quizzes) && quizzes.length > 0 ? Math.round(quizzes.reduce((sum, quiz) => sum + (quiz.average_score || 0), 0) / quizzes.length) : 0
 }

 // Filter quizzes based on search and status
 const filteredQuizzes = Array.isArray(quizzes) ? quizzes.filter(quiz => {
  const matchesSearch = quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) || quiz.job_description?.toLowerCase().includes(searchTerm.toLowerCase())
  const matchesStatus = statusFilter === 'all' || quiz.status === statusFilter
  return matchesSearch && matchesStatus
 }) : []

 const getStatusColor = (status) => {
  switch (status) {
   case 'active':
    return 'bg-green-100 text-green-700'
   case 'completed':
    return 'bg-blue-100 text-blue-700'
   case 'draft':
    return 'bg-gray-100 text-gray-700'
   default:
    return 'bg-gray-100 text-gray-700'
  }
 }

 const getDeadlineStatus = (deadline) => {
  if (!deadline) return null

  const now = new Date()
  const deadlineDate = new Date(deadline)
  const timeDiff = deadlineDate.getTime() - now.getTime()
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

  if (daysDiff < 0) {
   return {text: 'Expired', color: 'text-red-600', icon: AlertTriangle}
  }
  if (daysDiff <= 3) {
   return {text: `${daysDiff} days left`, color: 'text-orange-600', icon: AlertTriangle}
  }
  return {text: `${daysDiff} days left`, color: 'text-green-600', icon: CheckCircle}
 }

 const clearFilters = () => {
  setSearchTerm('')
  setStatusFilter('all')
  setShowFilters(false)
 }

 const handleLogout = () => {
  logout()
  navigate('/')
 }

 const handleRefreshData = async () => {
  setIsRefreshing(true)
  try {
   console.log('🔄 Manually refreshing data from REAL Supabase database...')
   await refetch()
   toast({
    title: 'Data refreshed',
    description: 'Fetched latest assessments from database.'
   })
  } catch (error) {
   console.error('❌ Refresh failed:', error)
   toast({
    title: 'Refresh failed',
    description: 'Failed to refresh data from database.',
    variant: 'destructive'
   })
  } finally {
   setTimeout(() => setIsRefreshing(false), 800) // Minimum loader time for UX
  }
 }

 // Edit Assessment Functions
 const handleEditAssessment = async (assessment) => {
  setEditingAssessment(assessment)

  try {
   console.log('📝 Loading questions for editing assessment:', assessment.id)
   // Fetch questions from database for this assessment's topics
   const questions = await getQuestionsByTopic(assessment.topics || [], 50)
   setEditQuestions(Array.isArray(questions) ? questions : [])
   setSelectedEditQuestions(Array.isArray(questions) ? questions.slice(0, assessment.total_questions || 15).map((_, i) => i.toString()) : [])
   setShowEditModal(true)
  } catch (error) {
   toast({
    title: 'Failed to load questions',
    description: 'Could not load questions for editing.',
    variant: 'destructive'
   })
  }
 }

 const handleSaveEditedQuestions = async () => {
  if (!editingAssessment) return

  try {
   const selectedQuestionObjects = selectedEditQuestions.map(index => editQuestions[Number.parseInt(index)])
   console.log('💾 Updating questions in REAL Supabase database...')
   await updateQuizQuestions(editingAssessment.id, selectedQuestionObjects)

   toast({
    title: 'Questions updated!',
    description: `Updated assessment with ${selectedQuestionObjects.length} questions.`
   })

   setShowEditModal(false)
   refetch() // Refresh data
  } catch (error) {
   console.error('❌ Update failed:', error)
   toast({
    title: 'Update failed',
    description: 'Failed to update assessment questions.',
    variant: 'destructive'
   })
  }
 }

 // Send Assessment Functions
 const handleSendAssessment = (assessment) => {
  setSendingAssessment(assessment)
  setNewCandidates([''])
  setShowSendModal(true)
 }

 const addNewCandidate = () => {
  setNewCandidates([...newCandidates, ''])
 }

 const removeNewCandidate = (index) => {
  setNewCandidates(newCandidates.filter((_, i) => i !== index))
 }

 const updateNewCandidate = (index, email) => {
  const updated = [...newCandidates]
  updated[index] = email
  setNewCandidates(updated)
 }

 const handleSendToNewCandidates = async () => {
  if (!sendingAssessment) return

  const validEmails = newCandidates.filter(email => email.trim() && email.includes('@'))
  if (validEmails.length === 0) {
   toast({
    title: 'No valid emails',
    description: 'Please add at least one valid email address.',
    variant: 'destructive'
   })
   return
  }

  setIsSending(true)

  try {
   console.log('👥 Adding new candidates to REAL Supabase database...')
   // Add candidates to database
   const candidateData = validEmails.map(email => ({email}))
   const addedCandidates = await addCandidatesToExistingQuiz(sendingAssessment.id, candidateData)

   // Send emails to new candidates
   for (const candidate of addedCandidates) {
    await resend.emails.send({
     from: 'lvl1 <onboarding@resend.dev>',
     to: candidate.email,
     subject: `Assessment Invitation: ${sendingAssessment.title}`,
     html: `
      <h2>You've been invited to take an assessment</h2>
      <p>Assessment: <strong>${sendingAssessment.title}</strong></p>
      <p>Company: <strong>${user?.company || 'Our Company'}</strong></p>
      <p>Hiring Manager: <strong>${user?.name}</strong></p>
      <p>Time Limit: ${sendingAssessment.time_limit} minutes</p>
      <p>Questions: ${sendingAssessment.total_questions}</p>
      ${sendingAssessment.deadline ? `<p>Deadline: ${new Date(sendingAssessment.deadline).toLocaleDateString()}</p>` : ''}
      <p>Click the link below to start:</p>
      <a href="${window.location.origin}/quiz/${candidate.unique_link}" 
         style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 16px 0;">
        Start Assessment
      </a>
      <p><small>Link: ${window.location.origin}/quiz/${candidate.unique_link}</small></p>
     `
    })
   }

   toast({
    title: 'Assessment sent!',
    description: `Successfully sent assessment to ${validEmails.length} new candidates.`
   })

   setShowSendModal(false)
   refetch() // Refresh data
  } catch (error) {
   console.error('❌ Send failed:', error)
   toast({
    title: 'Failed to send',
    description: 'Failed to send assessment to new candidates.',
    variant: 'destructive'
   })
  } finally {
   setIsSending(false)
  }
 }

 return (
  <div className="min-h-screen bg-gray-50">
   {/* Header */}
   <header className="bg-white border-b">
    <div className="px-6 py-4 flex justify-between items-center">
     <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
       <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-green-500 rounded-lg flex items-center justify-center">
        <Brain className="w-5 h-5 text-white" />
       </div>
       <span className="text-xl font-black text-purple-600">lvl1</span>
      </div>
      <div className="h-6 w-px bg-gray-300" />
      <span className="text-gray-600">Dashboard</span>
     </div>

     <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-600">Welcome, {user?.name || 'User'}</span>
      <Button variant="ghost" size="icon" onClick={handleLogout}>
       <LogOut className="w-4 h-4" />
      </Button>
     </div>
    </div>
   </header>

   <div className="p-6">
    {/* Stats Cards with REAL Data */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
     <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
       <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
       <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
       <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
       <p className="text-xs text-muted-foreground">Your assessments</p>
      </CardContent>
     </Card>

     <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
       <CardTitle className="text-sm font-medium">Candidates Invited</CardTitle>
       <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
       <div className="text-2xl font-bold">{stats.totalCandidates}</div>
       <p className="text-xs text-muted-foreground">Total invitations sent</p>
      </CardContent>
     </Card>

     <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
       <CardTitle className="text-sm font-medium">Responses Received</CardTitle>
       <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
       <div className="text-2xl font-bold">{stats.totalResponses}</div>
       <p className="text-xs text-muted-foreground">Completed assessments</p>
      </CardContent>
     </Card>

     <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
       <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
       <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
       <div className="text-2xl font-bold">{stats.averageScore}%</div>
       <p className="text-xs text-muted-foreground">Performance metric</p>
      </CardContent>
     </Card>
    </div>

    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
     <div className="lg:col-span-2">
      <Card>
       <CardHeader>
        <div className="flex justify-between items-center">
         <CardTitle>Your Assessments</CardTitle>
         <div className="flex space-x-2">
          <Button className="bg-purple-500 hover:bg-purple-600" onClick={() => navigate('/create-quiz')}>
           <Plus className="w-4 h-4 mr-2" />
           Create New Assessment
          </Button>
          <Button variant="outline" onClick={handleRefreshData} disabled={isRefreshing}>
           <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
           {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
         </div>
        </div>

        <div className="flex space-x-4 items-center">
         <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search assessments..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
         </div>
         <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filter
          {(statusFilter !== 'all' || searchTerm) && <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full" />}
         </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
         <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
          <div className="flex justify-between items-center">
           <h4 className="font-semibold">Filters</h4>
           <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
            <X className="w-4 h-4" />
           </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
             <SelectTrigger>
              <SelectValue placeholder="All statuses" />
             </SelectTrigger>
             <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
             </SelectContent>
            </Select>
           </div>
          </div>

          <div className="flex space-x-2">
           <Button size="sm" onClick={clearFilters} variant="outline">
            Clear All Filters
           </Button>
           <div className="text-sm text-gray-500 flex items-center">
            Showing {filteredQuizzes.length} of {quizzes.length} assessments
           </div>
          </div>
         </div>
        )}
       </CardHeader>
       <CardContent>
        {isLoading || isRefreshing ? (
         <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading assessments from database...</p>
          <p className="text-gray-500 text-sm">Fetching real data from Supabase...</p>
         </div>
        ) : filteredQuizzes.length === 0 ? (
         <div className="text-center py-12">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">{quizzes.length === 0 ? 'No assessments created yet' : 'No assessments match your filters'}</h3>
          <p className="text-gray-500 mb-6">{quizzes.length === 0 ? 'Create your first AI-powered assessment to start screening candidates.' : 'Try adjusting your search terms or filters.'}</p>
          {quizzes.length === 0 ? (
           <Button onClick={() => navigate('/create-quiz')} className="bg-purple-500 hover:bg-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Create First Assessment
           </Button>
          ) : (
           <Button onClick={clearFilters} variant="outline">
            Clear Filters
           </Button>
          )}
         </div>
        ) : (
         <div className="space-y-4">
          {filteredQuizzes.map(quiz => {
           const deadlineStatus = getDeadlineStatus(quiz.deadline)

           return (
            <div key={quiz.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
             <div className="flex justify-between items-start mb-2">
              <div>
               <h3 className="font-semibold text-lg">{quiz.title}</h3>
               <p className="text-sm text-gray-600 mb-2">{quiz.job_description?.substring(0, 100)}...</p>
              </div>
              <Badge className={getStatusColor(quiz.status)}>{quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}</Badge>
             </div>

             <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
               <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {quiz.candidates_invited || 0} candidates
               </span>
               <span className="flex items-center">
                <Link className="w-4 h-4 mr-1" />
                {quiz.responses_received || 0} responses
               </span>
               <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {quiz.time_limit} min
               </span>
               <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(quiz.created_at).toLocaleDateString()}
               </span>
               {deadlineStatus && (
                <span className={`flex items-center ${deadlineStatus.color}`}>
                 <deadlineStatus.icon className="w-4 h-4 mr-1" />
                 {deadlineStatus.text}
                </span>
               )}
              </div>

              <div className="flex space-x-2">
               <Button variant="outline" size="sm" onClick={() => handleEditAssessment(quiz)}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
               </Button>
               <Button variant="outline" size="sm" onClick={() => handleSendAssessment(quiz)}>
                <Send className="w-4 h-4 mr-1" />
                Send
               </Button>
               <Button variant="outline" size="sm" onClick={() => navigate(`/results/${quiz.id}`)}>
                <Eye className="w-4 h-4 mr-1" />
                Results
               </Button>
              </div>
             </div>
            </div>
           )
          })}
         </div>
        )}
       </CardContent>
      </Card>
     </div>

     <div className="space-y-6">
      <Card>
       <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
       </CardHeader>
       <CardContent className="space-y-3">
        <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/create-quiz')}>
         <Plus className="w-4 h-4 mr-2" />
         Create New Assessment
        </Button>
        <Button className="w-full justify-start" variant="outline">
         <Download className="w-4 h-4 mr-2" />
         Export All Results
        </Button>
        <Button className="w-full justify-start" variant="outline">
         <Settings className="w-4 h-4 mr-2" />
         Account Settings
        </Button>
       </CardContent>
      </Card>

      <Card>
       <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
       </CardHeader>
       <CardContent>
        <div className="space-y-3 text-sm">
         {quizzes.slice(0, 3).map((quiz, index) => (
          <div key={quiz.id} className="flex items-center space-x-2">
           <div className="w-2 h-2 bg-green-500 rounded-full" />
           <span>Assessment "{quiz.title}" created</span>
          </div>
         ))}
         {quizzes.length === 0 && <div className="text-gray-500 text-center py-4">No recent activity</div>}
        </div>
       </CardContent>
      </Card>
     </div>
    </div>
   </div>

   {/* Edit Assessment Modal */}
   <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
     <DialogHeader>
      <DialogTitle>Edit Assessment: {editingAssessment?.title}</DialogTitle>
     </DialogHeader>
     <div className="space-y-4">
      <p className="text-sm text-gray-600">Select questions for this assessment. Currently selected: {selectedEditQuestions.length}</p>

      <div className="space-y-4 max-h-96 overflow-y-auto">
       {editQuestions.map((question, index) => (
        <div key={index} className="border rounded-lg p-4">
         <div className="flex items-start space-x-3">
          <Checkbox
           checked={selectedEditQuestions.includes(index.toString())}
           onCheckedChange={checked => {
            if (checked) {
             setSelectedEditQuestions([...selectedEditQuestions, index.toString()])
            } else {
             setSelectedEditQuestions(selectedEditQuestions.filter(id => id !== index.toString()))
            }
           }}
           className="mt-1"
          />
          <div className="flex-1">
           <div className="flex gap-2 mb-2">
            <Badge variant="outline">{question.difficulty}</Badge>
            <Badge variant="secondary">{question.topic}</Badge>
           </div>
           <p className="font-medium mb-2">{question.question_text || question.question}</p>
           <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(question.options).map(([key, value]) => (
             <div key={key} className={`p-2 rounded ${key === question.correct_answer ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              <strong>{key}:</strong> {value}
             </div>
            ))}
           </div>
          </div>
         </div>
        </div>
       ))}
      </div>

      <div className="flex justify-end space-x-2">
       <Button variant="outline" onClick={() => setShowEditModal(false)}>
        Cancel
       </Button>
       <Button onClick={handleSaveEditedQuestions} className="bg-purple-500 hover:bg-purple-600">
        Save Changes ({selectedEditQuestions.length} questions)
       </Button>
      </div>
     </div>
    </DialogContent>
   </Dialog>

   {/* Send Assessment Modal */}
   <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
    <DialogContent className="max-w-md">
     <DialogHeader>
      <DialogTitle>Send Assessment: {sendingAssessment?.title}</DialogTitle>
     </DialogHeader>
     <div className="space-y-4">
      <p className="text-sm text-gray-600">Add new candidates to send this assessment to:</p>

      <div className="space-y-3">
       {newCandidates.map((email, index) => (
        <div key={index} className="flex items-center space-x-2">
         <Input placeholder="candidate@email.com" value={email} onChange={e => updateNewCandidate(index, e.target.value)} type="email" className="flex-1" />
         {newCandidates.length > 1 && (
          <Button variant="outline" size="icon" onClick={() => removeNewCandidate(index)}>
           <Trash2 className="w-4 h-4" />
          </Button>
         )}
        </div>
       ))}
      </div>

      <Button variant="outline" onClick={addNewCandidate} className="w-full">
       <Plus className="w-4 h-4 mr-2" />
       Add Another Candidate
      </Button>

      <div className="flex justify-end space-x-2">
       <Button variant="outline" onClick={() => setShowSendModal(false)}>
        Cancel
       </Button>
       <Button onClick={handleSendToNewCandidates} disabled={isSending} className="bg-purple-500 hover:bg-purple-600">
        {isSending ? (
         <>
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
          Sending...
         </>
        ) : (
         <>
          <Mail className="w-4 h-4 mr-2" />
          Send Assessment
         </>
        )}
       </Button>
      </div>
     </div>
    </DialogContent>
   </Dialog>
  </div>
 )
}