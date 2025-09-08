import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import {Badge} from '@/components/ui/badge'
import {Checkbox} from '@/components/ui/checkbox'
import {Progress} from '@/components/ui/progress'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {Brain, ArrowLeft, Plus, Trash2, CheckCircle, Copy, CreditCard, Upload, Mail, Send, ExternalLink, Calendar, Download, Database, Search, Users, RefreshCw, ArrowRight, AlertTriangle} from 'lucide-react'
import {useToast} from '@/hooks/use-toast'
import {useSupabase} from '@/contexts/SupabaseContext'
import {useAuth} from '@/contexts/AuthContext'
import { resend } from '../lib/resend';

// import { Resend } from 'resend';

export default function CreateQuiz() {
 const navigate = useNavigate()
 const {toast} = useToast()
 const {user} = useAuth()
 const {createQuiz, generateQuestions, saveQuizQuestions, addCandidates, getAvailableTopics, addQuestionsToBank, getQuestionTemplate, importQuestionsFromXLSX, getQuestionsByTopic, getUserQuizzes, getQuizCandidates} = useSupabase()

 const [currentStep, setCurrentStep] = useState(1)
 const [isGenerating, setIsGenerating] = useState(false)
 const [isProcessingPayment, setIsProcessingPayment] = useState(false)
 const [isSendingEmails, setIsSendingEmails] = useState(false)
 const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
 const [isLoadingExistingQuizzes, setIsLoadingExistingQuizzes] = useState(false)

 const [jobDescription, setJobDescription] = useState('')
 const [quizTitle, setQuizTitle] = useState('')
 const [selectedTopics, setSelectedTopics] = useState<string[]>([])
 const [availableTopics, setAvailableTopics] = useState<string[]>([])
 const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])
 const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
 const [timeLimit, setTimeLimit] = useState(45)
 const [deadline, setDeadline] = useState('')

 // Candidate management with validation
 const [candidates, setCandidates] = useState<string[]>([''])
 const [bulkEmails, setBulkEmails] = useState('')
 const [importedEmails, setImportedEmails] = useState<string[]>([])
 const [duplicateEmails, setDuplicateEmails] = useState<string[]>([])

 // Final quiz data
 const [createdQuiz, setCreatedQuiz] = useState<any>(null)
 const [candidateLinks, setCandidateLinks] = useState<any[]>([])

 // XLSX Import
 const [showImportModal, setShowImportModal] = useState(false)
 const [importFile, setImportFile] = useState<File | null>(null)
 const [importTopics, setImportTopics] = useState<string[]>([''])

 // Question Bank and Assessment Reuse
 const [questionBankQuestions, setQuestionBankQuestions] = useState<any[]>([])
 const [searchTerm, setSearchTerm] = useState('')
 const [existingQuizzes, setExistingQuizzes] = useState<any[]>([])
 const [selectedExistingQuiz, setSelectedExistingQuiz] = useState<string>('')

 const steps = [
  {id: 1, title: 'Basic Info', description: 'Assessment details'},
  {id: 2, title: 'Questions', description: 'Get or create questions'},
  {id: 3, title: 'Review', description: 'Review selected questions'},
  {id: 4, title: 'Settings', description: 'Configure and add candidates'},
  {id: 5, title: 'Launch', description: 'Launch assessment'}
 ]

 // Email validation function with duplicate detection
 const validateEmails = (emailList: string[]) => {
  const seen = new Set()
  const duplicates: string[] = []

  emailList.forEach(email => {
   if (email.trim() && email.includes('@')) {
    const normalizedEmail = email.trim().toLowerCase()
    if (seen.has(normalizedEmail)) {
     duplicates.push(email)
    } else {
     seen.add(normalizedEmail)
    }
   }
  })

  setDuplicateEmails(duplicates)
  return duplicates.length === 0
 }

 const loadAvailableTopics = async () => {
  try {
   const topics = await getAvailableTopics()
   setAvailableTopics(topics)
  } catch (error) {
   console.warn('Failed to load topics:', error)
  }
 }

 const loadExistingQuizzes = async () => {
  setIsLoadingExistingQuizzes(true)
  try {
   const quizzes = await getUserQuizzes(user?.id || '')
   setExistingQuizzes(quizzes)
  } catch (error) {
   console.warn('Failed to load existing quizzes:', error)
  } finally {
   setIsLoadingExistingQuizzes(false)
  }
 }

 const searchQuestionBank = async () => {
  if (selectedTopics.length === 0) {
   toast({
    title: 'Select topics first',
    description: 'Please select at least one topic to search questions.',
    variant: 'destructive'
   })
   return
  }

  setIsLoadingQuestions(true)
  try {
   const questions = await getQuestionsByTopic(selectedTopics, 50)
   setQuestionBankQuestions(questions)

   if (questions.length === 0) {
    toast({
     title: 'No questions found',
     description: 'No questions available for selected topics. Try AI generation instead.',
     variant: 'destructive'
    })
   } else {
    toast({
     title: 'Questions loaded!',
     description: `Found ${questions.length} questions in the question bank.`
    })
   }
  } catch (error) {
   toast({
    title: 'Search failed',
    description: 'Failed to search question bank. Please try again.',
    variant: 'destructive'
   })
  } finally {
   setIsLoadingQuestions(false)
  }
 }

 const generateQuestionsAI = async () => {
  if (!jobDescription.trim()) {
   toast({
    title: 'Job description required',
    description: 'Please provide a job description to generate questions.',
    variant: 'destructive'
   })
   return
  }

  setIsGenerating(true)

  try {
   console.log('🤖 Generating new questions with AI...')
   const questions = await generateQuestions(jobDescription, 20, selectedTopics)

   if (questions.length === 0) {
    toast({
     title: 'Generation failed',
     description: 'Failed to generate questions. Questions saved to bank as fallback.',
     variant: 'destructive'
    })
    setIsGenerating(false)
    return
   }

   setGeneratedQuestions(questions)
   setSelectedQuestions(questions.slice(0, 15).map((_, index) => index.toString()))
   setCurrentStep(3)

   toast({
    title: 'Questions generated and saved!',
    description: `Created ${questions.length} new questions and added them to the question bank.`
   })
  } catch (error: any) {
   console.error('Question generation error:', error)
   toast({
    title: 'Generation failed',
    description: error.message || 'Failed to generate questions. Please try again or check your job description.',
    variant: 'destructive'
   })
  } finally {
   setIsGenerating(false)
  }
 }

 const useQuestionBankSelection = () => {
  if (questionBankQuestions.length === 0) {
   toast({
    title: 'No questions selected',
    description: 'Please search and load questions from the question bank first.',
    variant: 'destructive'
   })
   return
  }

  setGeneratedQuestions(questionBankQuestions)
  setSelectedQuestions(questionBankQuestions.slice(0, 15).map((_, index) => index.toString()))
  setCurrentStep(3)

  toast({
   title: 'Questions selected!',
   description: `Using ${questionBankQuestions.length} questions from the question bank.`
  })
 }

 const useExistingQuizQuestions = async () => {
  if (!selectedExistingQuiz) {
   toast({
    title: 'No quiz selected',
    description: 'Please select an existing assessment to reuse.',
    variant: 'destructive'
   })
   return
  }

  setIsLoadingQuestions(true)
  try {
   const selectedQuiz = existingQuizzes.find(q => q.id === selectedExistingQuiz)
   if (selectedQuiz?.topics) {
    const questions = await getQuestionsByTopic(selectedQuiz.topics, 20)
    setGeneratedQuestions(questions)
    setSelectedQuestions(questions.slice(0, 15).map((_, index) => index.toString()))

    setQuizTitle(`${selectedQuiz.title} (Copy)`)
    setTimeLimit(selectedQuiz.time_limit)
    setSelectedTopics(selectedQuiz.topics)

    setCurrentStep(3)

    toast({
     title: 'Assessment copied!',
     description: `Reusing questions from "${selectedQuiz.title}".`
    })
   }
  } catch (error) {
   toast({
    title: 'Copy failed',
    description: 'Failed to copy existing assessment.',
    variant: 'destructive'
   })
  } finally {
   setIsLoadingQuestions(false)
  }
 }

 const handleImportQuestions = async () => {
  if (!importFile) {
   toast({
    title: 'No file selected',
    description: 'Please select an XLSX file to import.',
    variant: 'destructive'
   })
   return
  }

  const validTopics = importTopics.filter(t => t.trim() !== '')
  if (validTopics.length === 0) {
   toast({
    title: 'Topics required',
    description: 'Please specify at least one topic for the imported questions.',
    variant: 'destructive'
   })
   return
  }

  try {
   const result = await importQuestionsFromXLSX(importFile, validTopics)

   toast({
    title: 'Import successful!',
    description: `Imported ${result.imported_count} questions to the question bank.`
   })

   setShowImportModal(false)
   setImportFile(null)
   setImportTopics([''])
   loadAvailableTopics()
  } catch (error) {
   toast({
    title: 'Import failed',
    description: 'Failed to import questions. Please check the file format.',
    variant: 'destructive'
   })
  }
 }

 const downloadTemplate = async () => {
  try {
   const template = await getQuestionTemplate()
   toast({
    title: 'Template downloaded',
    description: 'Question template downloaded successfully.'
   })
  } catch (error) {
   toast({
    title: 'Download failed',
    description: 'Failed to download template.',
    variant: 'destructive'
   })
  }
 }

 const processBulkEmails = () => {
  const emails = bulkEmails
   .split(/[\n,;]+/)
   .map(email => email.trim())
   .filter(email => email?.includes('@'))

  // Validate for duplicates
  if (!validateEmails(emails)) {
   toast({
    title: 'Duplicate emails found',
    description: `Please remove duplicate emails: ${duplicateEmails.join(', ')}`,
    variant: 'destructive'
   })
   return
  }

  setImportedEmails(emails)
  setCandidates(emails)

  toast({
   title: 'Emails imported',
   description: `Successfully imported ${emails.length} email addresses.`
  })
 }

 const addCandidate = () => {
  setCandidates([...candidates, ''])
 }

 const removeCandidate = (index: number) => {
  const newCandidates = candidates.filter((_, i) => i !== index)
  setCandidates(newCandidates)
  // Re-validate after removal
  validateEmails(newCandidates)
 }

 const updateCandidate = (index: number, email: string) => {
  const newCandidates = [...candidates]
  newCandidates[index] = email
  setCandidates(newCandidates)

  // Validate for duplicates in real-time
  validateEmails(newCandidates)
 }

 const handleCandidateKeyPress = (e: React.KeyboardEvent, index: number) => {
  if (e.key === 'Enter') {
   e.preventDefault()
   if (index === candidates.length - 1) {
    addCandidate()
   }
   setTimeout(() => {
    const nextInput = document.querySelector(`input[name="candidate-${index + 1}"]`) as HTMLInputElement
    if (nextInput) {
     nextInput.focus()
    }
   }, 100)
  }
 }

 const validCandidates = candidates.filter(email => email.trim() !== '' && email.includes('@'))
 const totalCost = validCandidates.length * 100

 const handlePaymentAndSetup = async () => {
  // Final validation check
  if (!validateEmails(validCandidates)) {
   toast({
    title: 'Duplicate emails detected',
    description: 'Please remove duplicate emails before proceeding.',
    variant: 'destructive'
   })
   return
  }

  setIsProcessingPayment(true)

  try {
   // Get selected questions objects
   const selectedQuestionObjects = selectedQuestions.map(index => generatedQuestions[Number.parseInt(index)])

   // Create quiz in database with REAL Supabase operations
   const quizData = {
    user_id: user?.id,
    title: quizTitle,
    job_description: jobDescription,
    time_limit: timeLimit,
    total_questions: selectedQuestionObjects.length,
    topics: selectedTopics,
    deadline: deadline ? new Date(deadline).toISOString() : null
   }

   console.log('💾 Creating quiz in REAL Supabase database...', quizData)
   const quiz = await createQuiz(quizData)
   console.log('✅ Quiz created with ID:', quiz.id)

   // Save questions to database with REAL operations
   console.log('💾 Saving quiz questions to REAL database...')
   await saveQuizQuestions(quiz.id, selectedQuestionObjects)
   console.log('✅ Questions saved to database')

   // Add candidates to database with REAL operations
   console.log('👥 Adding candidates to REAL database...')
   const candidateData = validCandidates.map(email => ({email}))
   const candidatesWithLinks = await addCandidates(quiz.id, candidateData)
   console.log('✅ Candidates added to database')

   setCreatedQuiz(quiz)
   setCandidateLinks(candidatesWithLinks)
   setCurrentStep(5)

   toast({
    title: 'Assessment created successfully!',
    description: `Assessment "${quizTitle}" has been saved to database with ${selectedQuestionObjects.length} questions and ${candidatesWithLinks.length} candidates.`
   })
  } catch (error: any) {
   console.error('❌ Assessment creation error:', error)
   toast({
    title: 'Creation failed',
    description: error.message || 'Failed to create assessment.',
    variant: 'destructive'
   })
  } finally {
   setIsProcessingPayment(false)
  }
 }

 const sendEmailsToAll = async () => {
  setIsSendingEmails(true)

  try {
for (const candidate of candidateLinks) {
  await resend.emails.send({
    from: 'lvl1 <onboarding@resend.dev>',
    to: candidate.email,
    subject: `Assessment Invitation: ${createdQuiz.title}`,
    html: `
      <h2>You've been invited to take an assessment</h2>
      <p>Assessment: <strong>${createdQuiz.title}</strong></p>
      <p>Company: <strong>${user?.company || 'Our Company'}</strong></p>
      <p>Hiring Manager: <strong>${user?.name}</strong></p>
      <p>Time Limit: ${timeLimit} minutes</p>
      <p>Questions: ${selectedQuestions.length}</p>
      ${deadline ? `<p>Deadline: ${new Date(deadline).toLocaleDateString()}</p>` : ''}
      <p>Click the link below to start:</p>
      <a href="${window.location.origin}/quiz/${candidate.unique_link}" 
         style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 16px 0;">
        Start Assessment
      </a>
      <p><small>Link: ${window.location.origin}/quiz/${candidate.unique_link}</small></p>
    `,
  });
}

   toast({
    title: 'Emails sent!',
    description: `Successfully sent assessment invitations to ${candidateLinks.length} candidates.`
   })

   navigate('/dashboard')
  } catch (error) {
   toast({
    title: 'Email sending failed',
    description: 'Failed to send some emails. Please try again.',
    variant: 'destructive'
   })
  } finally {
   setIsSendingEmails(false)
  }
 }

 const copyAllLinks = () => {
  const links = candidateLinks.map(candidate => `${candidate.email}: ${window.location.origin}/quiz/${candidate.unique_link}`).join('\n')

  navigator.clipboard.writeText(links)
  toast({
   title: 'Links copied!',
   description: 'All candidate links have been copied to clipboard.'
  })
 }

 const goToNextStep = () => {
  if (currentStep < steps.length) {
   setCurrentStep(currentStep + 1)
  }
 }

 const goToPreviousStep = () => {
  if (currentStep > 1) {
   setCurrentStep(currentStep - 1)
  }
 }

 const canProceedFromStep = (step: number) => {
  switch (step) {
   case 1:
    return quizTitle.trim() !== ''
   case 2:
    return generatedQuestions.length > 0
   case 3:
    return selectedQuestions.length > 0
   case 4:
    return validCandidates.length > 0 && duplicateEmails.length === 0
   default:
    return true
  }
 }

 const overallProgress = (currentStep / steps.length) * 100

 return (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50">
   {/* Header */}
   <header className="bg-white/80 backdrop-blur-lg border-b">
    <div className="px-6 py-4 flex items-center space-x-4">
     <Button variant="ghost" onClick={() => navigate('/dashboard')}>
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Dashboard
     </Button>
     <div className="h-6 w-px bg-gray-300" />
     <div className="flex items-center space-x-2">
      <Brain className="w-5 h-5 text-purple-500" />
      <span className="font-semibold">Create New Assessment</span>
     </div>
    </div>
   </header>

   {/* Progress Steps - Fixed at Top */}
   <div className="bg-white/50 border-b px-6 py-6 sticky top-0 z-50">
    <div className="max-w-6xl mx-auto">
     <div className="flex justify-between items-center mb-6">
      {steps.map((step, index) => (
       <div key={step.id} className="flex flex-col items-center flex-1 relative">
        <div
         className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${currentStep >= step.id ? 'bg-purple-500 text-white shadow-lg scale-110' : currentStep === step.id ? 'bg-purple-100 text-purple-600 border-2 border-purple-500' : 'bg-gray-200 text-gray-600'}`}
        >
         {currentStep > step.id ? <CheckCircle className="w-6 h-6" /> : step.id}
        </div>
        <div className="text-center mt-2">
         <div className={`text-sm font-medium ${currentStep >= step.id ? 'text-purple-600' : 'text-gray-500'}`}>{step.title}</div>
         <div className="text-xs text-gray-500">{step.description}</div>
        </div>
        {index < steps.length - 1 && <div className={`absolute top-6 left-1/2 w-full h-0.5 -z-10 transition-all duration-300 ${currentStep > step.id ? 'bg-purple-500' : 'bg-gray-200'}`} style={{width: 'calc(100% - 48px)', marginLeft: '24px'}} />}
       </div>
      ))}
     </div>
     <Progress value={overallProgress} className="h-2" />
    </div>
   </div>

   <div className="p-6">
    <div className="max-w-6xl mx-auto">
     {/* Step 1: Basic Information */}
     {currentStep === 1 && (
      <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
       <CardHeader className="bg-purple-50">
        <CardTitle className="text-2xl">Assessment Information</CardTitle>
        <p className="text-muted-foreground">Set up your assessment details</p>
       </CardHeader>
       <CardContent className="p-8 space-y-6">
        <div className="space-y-2">
         <Label htmlFor="title">Assessment Title</Label>
         <Input id="title" placeholder="e.g., Senior Java Developer Assessment" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} className="text-lg py-3" />
        </div>

        <div className="space-y-2">
         <Label htmlFor="job-description">Job Description</Label>
         <Textarea id="job-description" placeholder="Enter the complete job description, required skills, experience level, and any specific technologies..." value={jobDescription} onChange={e => setJobDescription(e.target.value)} rows={12} className="text-base" />
        </div>

        <div className="space-y-2">
         <Label>Topics (Optional)</Label>
         <div className="flex flex-wrap gap-2">
          {availableTopics.slice(0, 10).map(topic => (
           <div key={topic} className="flex items-center space-x-2">
            <Checkbox
             checked={selectedTopics.includes(topic)}
             onCheckedChange={checked => {
              if (checked) {
               setSelectedTopics([...selectedTopics, topic])
              } else {
               setSelectedTopics(selectedTopics.filter(t => t !== topic))
              }
             }}
            />
            <span className="text-sm">{topic}</span>
           </div>
          ))}
         </div>
        </div>

        <div className="space-y-2">
         <Label htmlFor="deadline">Assessment Deadline (Optional)</Label>
         <Input id="deadline" type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="text-lg py-3" min={new Date().toISOString().slice(0, 16)} />
        </div>

        <div className="flex justify-between items-center pt-4">
         <div />
         <Button onClick={goToNextStep} disabled={!canProceedFromStep(1)} className="bg-purple-500 hover:bg-purple-600 px-8 py-3 text-lg font-bold">
          Continue to Questions
          <ArrowRight className="w-4 h-4 ml-2" />
         </Button>
        </div>
       </CardContent>
      </Card>
     )}

     {/* Step 2: Get Questions */}
     {currentStep === 2 && (
      <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
       <CardHeader className="bg-purple-50">
        <CardTitle className="text-2xl">Get Questions</CardTitle>
        <p className="text-muted-foreground">Choose how to get questions for your assessment</p>
       </CardHeader>
       <CardContent className="p-8 space-y-6">
        <div className="bg-purple-50 p-6 rounded-2xl">
         <h3 className="font-semibold mb-2">Assessment Summary</h3>
         <p className="text-sm text-gray-600 mb-4">{quizTitle}</p>
         <p className="text-sm">{jobDescription.substring(0, 300)}...</p>
         {deadline && <p className="text-sm text-purple-600 mt-2">📅 Deadline: {new Date(deadline).toLocaleDateString()}</p>}
        </div>

        <Tabs defaultValue="existing" className="space-y-6">
         <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="existing">Use Existing</TabsTrigger>
          <TabsTrigger value="ai-generate">AI Generation</TabsTrigger>
          <TabsTrigger value="question-bank">Question Bank</TabsTrigger>
          <TabsTrigger value="import-xlsx">Import XLSX</TabsTrigger>
         </TabsList>

         <TabsContent value="existing">
          <div className="space-y-4">
           <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Reuse questions from your existing assessments.</p>
            <Button variant="outline" size="sm" onClick={loadExistingQuizzes} disabled={isLoadingExistingQuizzes}>
             <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingExistingQuizzes ? 'animate-spin' : ''}`} />
             Refresh
            </Button>
           </div>

           {existingQuizzes.length > 0 ? (
            <div className="space-y-4">
             <div className="grid gap-4">
              {existingQuizzes.map(quiz => (
               <div key={quiz.id} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedExistingQuiz === quiz.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`} onClick={() => setSelectedExistingQuiz(quiz.id)}>
                <div className="flex justify-between items-start">
                 <div>
                  <h4 className="font-semibold">{quiz.title}</h4>
                  <p className="text-sm text-gray-600">
                   {quiz.total_questions} questions • {quiz.time_limit} min
                  </p>
                  <p className="text-xs text-gray-500">Created: {new Date(quiz.created_at).toLocaleDateString()}</p>
                 </div>
                 <Badge className={`${quiz.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{quiz.status}</Badge>
                </div>
               </div>
              ))}
             </div>

             <Button onClick={useExistingQuizQuestions} disabled={!selectedExistingQuiz || isLoadingQuestions} className="w-full bg-purple-500 hover:bg-purple-600 py-4 text-lg font-bold">
              <Copy className="w-5 h-5 mr-2" />
              {isLoadingQuestions ? 'Loading Questions...' : 'Use Selected Assessment'}
             </Button>
            </div>
           ) : (
            <div className="text-center py-8">
             <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
             <p className="text-gray-600">No existing assessments found.</p>
             <p className="text-sm text-gray-500">Create your first assessment using AI or import questions.</p>
            </div>
           )}
          </div>
         </TabsContent>

         <TabsContent value="ai-generate">
          {isGenerating ? (
           <div className="text-center py-16">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-2">Generating Questions...</h3>
            <p className="text-muted-foreground">Our AI is analyzing your job description and creating relevant questions</p>
           </div>
          ) : (
           <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
             <p className="text-blue-800 font-semibold mb-2">💡 Smart Question Generation</p>
             <p className="text-blue-700 text-sm">AI will generate new questions based on your job description and automatically save them to the database to avoid repeated AI calls.</p>
            </div>

            <Button onClick={generateQuestionsAI} className="w-full bg-purple-500 hover:bg-purple-600 py-4 text-lg font-bold">
             <Brain className="w-5 h-5 mr-2" />
             Generate Questions with AI
            </Button>
           </div>
          )}
         </TabsContent>

         <TabsContent value="question-bank">
          <div className="space-y-4">
           <p className="text-sm text-gray-600">Select questions from our curated question bank organized by topics.</p>

           <div className="flex space-x-2">
            <Input placeholder="Search questions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1" />
            <Button onClick={searchQuestionBank} disabled={isLoadingQuestions || selectedTopics.length === 0} className="bg-purple-500 hover:bg-purple-600">
             <Search className="w-4 h-4 mr-2" />
             {isLoadingQuestions ? 'Searching...' : 'Search'}
            </Button>
           </div>

           {selectedTopics.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
             <p className="text-yellow-800 text-sm">Please select topics from Step 1 to search the question bank.</p>
            </div>
           )}

           {questionBankQuestions.length > 0 && (
            <div className="space-y-4">
             <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold">Found {questionBankQuestions.length} questions</p>
              <p className="text-green-700 text-sm">Topics: {selectedTopics.join(', ')}</p>
             </div>

             <Button onClick={useQuestionBankSelection} className="w-full bg-purple-500 hover:bg-purple-600 py-4 text-lg font-bold">
              <Database className="w-5 h-5 mr-2" />
              Use Selected Questions ({questionBankQuestions.length})
             </Button>
            </div>
           )}
          </div>
         </TabsContent>

         <TabsContent value="import-xlsx">
          <div className="space-y-4">
           <p className="text-sm text-gray-600">Import questions from an Excel spreadsheet using our template format.</p>

           <div className="flex space-x-4">
            <Button variant="outline" onClick={downloadTemplate} className="flex-1">
             <Download className="w-4 h-4 mr-2" />
             Download Template
            </Button>
            <Button variant="outline" onClick={() => setShowImportModal(true)} className="flex-1">
             <Upload className="w-4 h-4 mr-2" />
             Import Questions
            </Button>
           </div>
          </div>
         </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4">
         <Button variant="outline" onClick={goToPreviousStep} className="px-8 py-3">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
         </Button>
         <Button onClick={goToNextStep} disabled={!canProceedFromStep(2)} className="bg-purple-500 hover:bg-purple-600 px-8 py-3 text-lg font-bold">
          Review Questions
          <ArrowRight className="w-4 h-4 ml-2" />
         </Button>
        </div>
       </CardContent>
      </Card>
     )}

     {/* Step 3: Review Questions - BIGGER CONTAINER WITH PROPER SCROLLING */}
     {currentStep === 3 && (
      <div className="space-y-6">
       <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
        <CardHeader className="bg-green-50">
         <CardTitle className="text-2xl">Review Questions</CardTitle>
         <p className="text-muted-foreground">Review and customize your question selection</p>
         <div className="bg-blue-50 p-4 rounded-lg mt-4">
          <p className="text-sm text-blue-800">
           <strong>Note:</strong> Each candidate will receive a randomized selection of questions from your chosen set to ensure unique assessments.
          </p>
         </div>
        </CardHeader>
       </Card>

       {/* LARGE FULL-WIDTH QUESTIONS CONTAINER */}
       <div className="bg-white rounded-3xl shadow-2xl min-h-[800px]">
        <div className="p-6 border-b bg-gray-50 rounded-t-3xl">
         <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
           {selectedQuestions.length} of {generatedQuestions.length} questions selected
          </div>
          <Progress value={(selectedQuestions.length / generatedQuestions.length) * 100} className="w-48 h-2" />
         </div>
        </div>

        {/* MASSIVE SCROLLABLE CONTAINER */}
        <div className="p-8">
         <div className="space-y-8 max-h-[1000px] overflow-y-auto pr-4" style={{scrollbarWidth: 'thin'}}>
          {generatedQuestions.map((question, index) => (
           <div key={index} className="border-2 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 bg-white">
            <div className="flex items-start space-x-6">
             <Checkbox
              checked={selectedQuestions.includes(index.toString())}
              onCheckedChange={checked => {
               if (checked) {
                setSelectedQuestions([...selectedQuestions, index.toString()])
               } else {
                setSelectedQuestions(selectedQuestions.filter(id => id !== index.toString()))
               }
              }}
              className="mt-2 w-6 h-6"
             />
             <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4 mb-4">
               <Badge variant="outline" className={`${question.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border-green-300' : question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-red-100 text-red-700 border-red-300'} px-4 py-2 text-sm font-bold`}>
                {question.difficulty}
               </Badge>
               <Badge variant="secondary" className="px-4 py-2 text-sm font-bold">
                {question.topic}
               </Badge>
              </div>

              <h4 className="font-bold text-xl leading-relaxed text-gray-800 mb-6">{question.question}</h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {Object.entries(question.options).map(([key, value]) => (
                <div key={key} className={`p-6 rounded-xl text-base border-2 transition-all hover:shadow-md ${key === question.correct_answer ? 'bg-green-50 border-green-300 shadow-sm' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                 <span className="font-black text-gray-700 text-lg">{key}:</span> <span className="text-gray-800 ml-2">{value as string}</span>
                </div>
               ))}
              </div>

              <div className="text-base text-gray-700 bg-blue-50 p-6 rounded-xl border border-blue-200">
               <strong className="text-blue-800 text-lg">Explanation:</strong>
               <p className="text-blue-700 mt-2 leading-relaxed">{question.explanation}</p>
              </div>
             </div>
            </div>
           </div>
          ))}
         </div>
        </div>

        <div className="flex justify-between items-center p-8 pt-0">
         <Button variant="outline" onClick={goToPreviousStep} className="px-8 py-3">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Questions
         </Button>
         <Button onClick={goToNextStep} disabled={!canProceedFromStep(3)} className="bg-purple-500 hover:bg-purple-600 px-8 py-3 text-lg font-bold">
          Continue to Settings
          <ArrowRight className="w-4 h-4 ml-2" />
         </Button>
        </div>
       </div>
      </div>
     )}

     {/* Step 4: Settings & Candidates with Email Validation */}
     {currentStep === 4 && (
      <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
       <CardHeader className="bg-purple-50">
        <CardTitle className="text-2xl">Quiz Settings & Candidates</CardTitle>
        <p className="text-muted-foreground">Configure quiz settings and add candidate emails</p>
       </CardHeader>
       <CardContent className="p-8 space-y-8">
        <div className="bg-blue-50 p-6 rounded-2xl">
         <h3 className="font-bold text-lg mb-4">Quiz Configuration</h3>
         <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
           <Label htmlFor="time-limit">Time Limit (minutes)</Label>
           <Input id="time-limit" type="number" min="15" max="120" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} className="text-lg py-3" />
          </div>
          <div className="space-y-2">
           <Label>Selected Questions</Label>
           <div className="text-lg font-semibold text-green-600 bg-white p-3 rounded-lg border">{selectedQuestions.length} questions</div>
          </div>
          <div className="space-y-2">
           <Label>Assessment Deadline</Label>
           <div className="text-lg font-semibold text-purple-600 bg-white p-3 rounded-lg border">{deadline ? new Date(deadline).toLocaleDateString() : 'No deadline'}</div>
          </div>
         </div>
        </div>

        {/* Duplicate Email Warning */}
        {duplicateEmails.length > 0 && (
         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
           <AlertTriangle className="w-5 h-5 text-red-600" />
           <span className="font-semibold text-red-800">Duplicate emails detected:</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{duplicateEmails.join(', ')}</p>
         </div>
        )}

        <div className="space-y-6">
         <h3 className="font-bold text-lg">Add Candidates</h3>

         <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
           <TabsTrigger value="individual">Individual Entry</TabsTrigger>
           <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-4">
           <div className="space-y-3">
            {candidates.map((email, index) => (
             <div key={index} className="flex items-center space-x-2">
              <Input name={`candidate-${index}`} placeholder="candidate@email.com" value={email} onChange={e => updateCandidate(index, e.target.value)} onKeyPress={e => handleCandidateKeyPress(e, index)} type="email" className={`flex-1 ${duplicateEmails.includes(email) ? 'border-red-500 bg-red-50' : ''}`} />
              {candidates.length > 1 && (
               <Button variant="outline" size="icon" onClick={() => removeCandidate(index)}>
                <Trash2 className="w-4 h-4" />
               </Button>
              )}
             </div>
            ))}
           </div>

           <Button variant="outline" onClick={addCandidate} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Candidate (or press Enter)
           </Button>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="bulk-emails">Paste Email Addresses</Label>
            <Textarea id="bulk-emails" placeholder="Paste email addresses separated by commas, semicolons, or new lines:&#10;john@company.com, jane@company.com&#10;bob@company.com" value={bulkEmails} onChange={e => setBulkEmails(e.target.value)} rows={8} className="font-mono text-sm" />
           </div>

           <Button onClick={processBulkEmails} disabled={!bulkEmails.trim()} className="w-full bg-purple-500 hover:bg-purple-600">
            <Upload className="w-4 h-4 mr-2" />
            Import Email Addresses ({bulkEmails.split(/[\n,;]+/).filter(e => e.trim() && e.includes('@')).length} detected)
           </Button>

           {importedEmails.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
             <p className="font-semibold text-green-700 mb-2">✅ Imported {importedEmails.length} emails:</p>
             <div className="text-sm text-green-600 max-h-32 overflow-y-auto">
              {importedEmails.slice(0, 10).map((email, i) => (
               <div key={i}>{email}</div>
              ))}
              {importedEmails.length > 10 && <div>... and {importedEmails.length - 10} more</div>}
             </div>
            </div>
           )}
          </TabsContent>
         </Tabs>
        </div>

        <div className="bg-purple-50 p-6 rounded-2xl">
         <h4 className="font-bold text-lg mb-4">Assessment Summary</h4>
         <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
           <div className="flex justify-between">
            <span>Quiz Title:</span>
            <span className="font-semibold">{quizTitle}</span>
           </div>
           <div className="flex justify-between">
            <span>Questions:</span>
            <span className="font-semibold">{selectedQuestions.length}</span>
           </div>
           <div className="flex justify-between">
            <span>Time Limit:</span>
            <span className="font-semibold">{timeLimit} minutes</span>
           </div>
           {deadline && (
            <div className="flex justify-between">
             <span>Deadline:</span>
             <span className="font-semibold flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(deadline).toLocaleDateString()}
             </span>
            </div>
           )}
          </div>
          <div className="space-y-2">
           <div className="flex justify-between">
            <span>Valid Candidates:</span>
            <span className="font-semibold">{validCandidates.length}</span>
           </div>
           <div className="flex justify-between">
            <span>Cost per Candidate:</span>
            <span className="font-semibold">₹100</span>
           </div>
           <div className="flex justify-between text-lg font-bold text-purple-600">
            <span>Total Cost:</span>
            <span>₹{totalCost}</span>
           </div>
          </div>
         </div>
        </div>

        <div className="flex justify-between items-center pt-4">
         <Button variant="outline" onClick={goToPreviousStep} className="px-8 py-3">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
         </Button>
         <Button onClick={handlePaymentAndSetup} disabled={!canProceedFromStep(4) || isProcessingPayment} className="bg-purple-500 hover:bg-purple-600 px-8 py-3 text-lg font-bold">
          {isProcessingPayment ? (
           <>
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
            Creating Assessment...
           </>
          ) : (
           <>
            <CreditCard className="w-5 h-5 mr-2" />
            Create Assessment (₹{totalCost})
           </>
          )}
         </Button>
        </div>
       </CardContent>
      </Card>
     )}

     {/* Step 5: Launch - NO BACK BUTTON */}
     {currentStep === 5 && (
      <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
       <CardHeader className="bg-green-50">
        <CardTitle className="text-2xl flex items-center">
         <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
         Assessment Created Successfully!
        </CardTitle>
        <p className="text-muted-foreground">Your assessment has been saved to the database. Choose how to distribute it to candidates.</p>
       </CardHeader>
       <CardContent className="p-8 space-y-8">
        <div className="bg-blue-50 p-6 rounded-2xl">
         <h3 className="font-bold text-lg mb-2">{createdQuiz?.title}</h3>
         <p className="text-sm text-gray-600 mb-4">
          Quiz ID: <span className="font-mono font-bold">{createdQuiz?.id}</span>
         </p>
         <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
           <div className="font-bold text-2xl text-blue-600">{selectedQuestions.length}</div>
           <div className="text-gray-600">Questions</div>
          </div>
          <div className="text-center">
           <div className="font-bold text-2xl text-green-600">{timeLimit}m</div>
           <div className="text-gray-600">Time Limit</div>
          </div>
          <div className="text-center">
           <div className="font-bold text-2xl text-purple-600">{candidateLinks.length}</div>
           <div className="text-gray-600">Candidates</div>
          </div>
          {deadline && (
           <div className="text-center">
            <div className="font-bold text-2xl text-purple-600">{new Date(deadline).toLocaleDateString()}</div>
            <div className="text-gray-600">Deadline</div>
           </div>
          )}
         </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
         <Card className="border-2 border-green-200 hover:border-green-400 transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
           <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-white" />
           </div>
           <h3 className="font-bold mb-2">Send Emails to All</h3>
           <p className="text-sm text-gray-600 mb-4">Automatically send invitation emails to all candidates</p>
           <Button onClick={sendEmailsToAll} disabled={isSendingEmails} className="w-full bg-green-500 hover:bg-green-600">
            {isSendingEmails ? (
             <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Sending...
             </>
            ) : (
             <>
              <Send className="w-4 h-4 mr-2" />
              Send to All ({candidateLinks.length})
             </>
            )}
           </Button>
          </CardContent>
         </Card>

         <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
           <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Copy className="w-6 h-6 text-white" />
           </div>
           <h3 className="font-bold mb-2">Copy All Links</h3>
           <p className="text-sm text-gray-600 mb-4">Copy all candidate links to send manually</p>
           <Button onClick={copyAllLinks} variant="outline" className="w-full border-blue-500 text-blue-500 hover:bg-blue-50">
            <Copy className="w-4 h-4 mr-2" />
            Copy Links
           </Button>
          </CardContent>
         </Card>

         <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
           <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-6 h-6 text-white" />
           </div>
           <h3 className="font-bold mb-2">Go to Dashboard</h3>
           <p className="text-sm text-gray-600 mb-4">View your new assessment on the dashboard</p>
           <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full border-purple-500 text-purple-500 hover:bg-purple-50">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Dashboard
           </Button>
          </CardContent>
         </Card>
        </div>

        <div className="space-y-4">
         <h3 className="font-bold text-lg">Candidate Links Preview</h3>
         <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
          {candidateLinks.slice(0, 5).map((candidate, index) => (
           <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
            <span className="text-sm">{candidate.email}</span>
            <code className="text-xs bg-white px-2 py-1 rounded">
             {window.location.origin}/quiz/{candidate.unique_link}
            </code>
           </div>
          ))}
          {candidateLinks.length > 5 && <div className="text-center text-sm text-gray-500 pt-2">... and {candidateLinks.length - 5} more candidates</div>}
         </div>
        </div>

        {/* NO BACK BUTTON ON FINAL STEP - ONLY FORWARD NAVIGATION */}
        <div className="flex justify-end items-center pt-4">
         <Button onClick={() => navigate('/dashboard')} className="bg-purple-500 hover:bg-purple-600 px-8 py-3 text-lg font-bold">
          Go to Dashboard
          <ExternalLink className="w-4 h-4 ml-2" />
         </Button>
        </div>
       </CardContent>
      </Card>
     )}

     {/* XLSX Import Modal */}
     {showImportModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
       <Card className="max-w-md w-full m-4">
        <CardHeader>
         <CardTitle>Import Questions from XLSX</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
         <div className="space-y-2">
          <Label>Select XLSX File</Label>
          <Input type="file" accept=".xlsx" onChange={e => setImportFile(e.target.files?.[0] || null)} />
         </div>

         <div className="space-y-2">
          <Label>Question Topics</Label>
          {importTopics.map((topic, index) => (
           <div key={index} className="flex items-center space-x-2">
            <Input
             placeholder="e.g., JavaScript, React"
             value={topic}
             onChange={e => {
              const newTopics = [...importTopics]
              newTopics[index] = e.target.value
              setImportTopics(newTopics)
             }}
            />
            {importTopics.length > 1 && (
             <Button
              variant="outline"
              size="icon"
              onClick={() => {
               setImportTopics(importTopics.filter((_, i) => i !== index))
              }}
             >
              <Trash2 className="w-4 h-4" />
             </Button>
            )}
           </div>
          ))}
          <Button variant="outline" onClick={() => setImportTopics([...importTopics, ''])}>
           <Plus className="w-4 h-4 mr-2" />
           Add Topic
          </Button>
         </div>

         <div className="flex space-x-2">
          <Button onClick={handleImportQuestions} className="flex-1 bg-purple-500 hover:bg-purple-600">
           Import Questions
          </Button>
          <Button variant="outline" onClick={() => setShowImportModal(false)}>
           Cancel
          </Button>
         </div>
        </CardContent>
       </Card>
      </div>
     )}
    </div>
   </div>

   <style>{`
    .custom-scrollbar::-webkit-scrollbar {
     width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
     background: #f1f1f1;
     border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
     background: #c1c1c1;
     border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
     background: #a1a1a1;
    }
   `}</style>
  </div>
 )
}