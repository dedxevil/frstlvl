import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {Toaster} from '@/components/ui/sonner'
import {AuthProvider} from '@/contexts/AuthContext'
import {SupabaseProvider} from '@/contexts/SupabaseContext'
import HomePage from '@/pages/HomePage'
import AuthPage from '@/pages/AuthPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import EmployerDashboard from '@/pages/EmployerDashboard'
import CreateQuiz from '@/pages/CreateQuiz'
import QuizInterface from '@/pages/QuizInterface'
import Results from '@/pages/Results'
import CandidateInstructions from '@/pages/CandidateInstructions'

const queryClient = new QueryClient({
 defaultOptions: {
  queries: {
   retry: 2,
   staleTime: 5 * 60 * 1000 // 5 minutes
  }
 }
})

export default function App() {
 return (
  <QueryClientProvider client={queryClient}>
   <SupabaseProvider>
    <Router>
     <AuthProvider>
      <div className="min-h-screen bg-background">
       <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<EmployerDashboard />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/quiz/:linkId" element={<CandidateInstructions />} />
        <Route path="/quiz/:linkId/start" element={<QuizInterface />} />
        <Route path="/results/:quizId" element={<Results />} />
       </Routes>
       <Toaster />
      </div>
     </AuthProvider>
    </Router>
   </SupabaseProvider>
  </QueryClientProvider>
//  <div className="p-10 bg-red-500 text-white text-2xl">
//       🚀 Tailwind is working!
//     </div>
 )
}