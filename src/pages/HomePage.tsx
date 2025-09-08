import {useNavigate} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Brain, Users, Clock, Shield, Trophy, Target, Zap, Sparkles, ArrowRight, Plus, Eye, Calendar} from 'lucide-react'
import {useAuth} from '@/contexts/AuthContext'
import {useSupabase} from '@/contexts/SupabaseContext'

export default function HomePage() {
 const navigate = useNavigate()
 const {user} = useAuth()
 const {getUserQuizzes} = useSupabase()

 // Fetch user's assessments if logged in
 const {data: userQuizzes = []} = useQuery({
  queryKey: ['user-quizzes', user?.id],
  queryFn: () => (user ? getUserQuizzes(user.id) : Promise.resolve([])),
  enabled: !!user
 })

 const handleStartScreening = () => {
  navigate('/auth')
 }

 const handleCreateFirst = () => {
  if (user) {
   navigate('/create-quiz')
  } else {
   navigate('/auth')
  }
 }

 return (
  <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-green-100 overflow-hidden">
   {/* Animated Background Elements */}
   <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}} />
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1000ms', animationDuration: '4s'}} />
    <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-br from-purple-400/10 to-green-400/10 rounded-full blur-3xl animate-bounce" style={{animationDelay: '500ms', animationDuration: '6s'}} />
   </div>

   {/* Header */}
   <header className="relative border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
     <div className="flex items-center space-x-3">
      <div className="relative">
       <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-purple-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
        <Brain className="w-6 h-6 text-white" />
       </div>
       <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
      </div>
      <span className="text-3xl font-black bg-gradient-to-r from-purple-600 via-purple-500 to-green-600 bg-clip-text text-transparent">lvl1</span>
     </div>
     <div className="flex items-center space-x-4">
      {user ? (
       <>
        <span className="text-sm text-gray-600">Welcome, {user.name}</span>
        <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-purple-500 to-green-500">
         Dashboard
        </Button>
       </>
      ) : (
       <Button onClick={() => navigate('/auth')} variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
        Sign In
       </Button>
      )}
      <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 animate-pulse">
       <Sparkles className="w-3 h-3 mr-1" />
       AI-Powered
      </Badge>
     </div>
    </div>
   </header>

   {/* Hero Section */}
   <section className="relative py-24 px-4">
    <div className="container mx-auto text-center">
     <div className="max-w-5xl mx-auto">
      <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]">
       <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
        Filter <span className="text-purple-500 animate-pulse">1000</span> candidates to
        <span className="block bg-gradient-to-r from-purple-500 via-purple-400 to-green-500 bg-clip-text text-transparent">50 in minutes</span>
       </h1>
      </div>

      <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]" style={{animationDelay: '300ms'}}>
       <p className="text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
        AI-powered gamified assessments that identify top talent through smart questioning,
        <span className="font-bold text-purple-600"> video proctoring</span>, and
        <span className="font-bold text-green-600"> behavioral analysis</span>. Pay only for what you use.
       </p>
      </div>

      <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]" style={{animationDelay: '600ms'}}>
       <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <Button size="lg" onClick={handleStartScreening} className="group bg-gradient-to-r from-purple-500 via-purple-400 to-green-500 hover:from-purple-600 hover:to-green-600 text-white px-8 py-4 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300">
         <Users className="w-6 h-6 mr-3" />
         Start Screening Now
         <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button size="lg" variant="outline" className="border-3 border-purple-300 text-purple-600 hover:bg-purple-50 px-8 py-4 text-xl font-bold rounded-2xl transition-all duration-300 hover:scale-105">
         <Zap className="w-5 h-5 mr-2" />
         Watch Demo
        </Button>
       </div>
      </div>

      {/* Floating Stats */}
      <div className="grid md:grid-cols-3 gap-6 mt-16 opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]" style={{animationDelay: '900ms'}}>
       <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
        <div className="text-4xl font-black text-purple-500 mb-2">95%</div>
        <div className="text-gray-700 font-semibold">Time Saved</div>
       </div>
       <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
        <div className="text-4xl font-black text-green-500 mb-2">₹100</div>
        <div className="text-gray-700 font-semibold">Per Candidate</div>
       </div>
       <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
        <div className="text-4xl font-black text-purple-500 mb-2">1000+</div>
        <div className="text-gray-700 font-semibold">Companies Trust Us</div>
       </div>
      </div>
     </div>
    </div>
   </section>

   {/* User's Assessments Section */}
   {user && (
    <section className="relative py-16 px-4 bg-white/50 backdrop-blur-sm">
     <div className="container mx-auto">
      <div className="text-center mb-12">
       <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-purple-600 to-green-600 bg-clip-text text-transparent">Your Assessments</h2>
      </div>

      {userQuizzes.length === 0 ? (
       <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 shadow-xl">
         <Brain className="w-20 h-20 mx-auto mb-6 text-purple-500" />
         <h3 className="text-2xl font-bold mb-4 text-gray-800">Create Your First Assessment Today</h3>
         <p className="text-gray-600 mb-8 text-lg">Start screening candidates with AI-powered assessments. Generate questions from job descriptions and track candidate performance in real-time.</p>
         <Button onClick={handleCreateFirst} className="bg-gradient-to-r from-purple-500 to-green-500 hover:from-purple-600 hover:to-green-600 px-8 py-4 text-lg font-bold rounded-2xl">
          <Plus className="w-5 h-5 mr-2" />
          Create First Assessment
         </Button>
        </div>
       </div>
      ) : (
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userQuizzes.map((quiz: any, index: number) => (
         <Card key={quiz.id} className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-green-50">
           <div className="flex justify-between items-start">
            <div>
             <CardTitle className="text-lg font-bold">{quiz.title}</CardTitle>
             <Badge className={`mt-2 ${quiz.status === 'active' ? 'bg-green-100 text-green-700' : quiz.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}</Badge>
            </div>
           </div>
          </CardHeader>
          <CardContent className="p-6">
           <div className="space-y-3 text-sm">
            <div className="flex justify-between">
             <span className="text-gray-600">Candidates:</span>
             <span className="font-semibold">{quiz.candidates_invited || 0}</span>
            </div>
            <div className="flex justify-between">
             <span className="text-gray-600">Responses:</span>
             <span className="font-semibold">{quiz.responses_received || 0}</span>
            </div>
            <div className="flex justify-between">
             <span className="text-gray-600">Questions:</span>
             <span className="font-semibold">{quiz.total_questions}</span>
            </div>
            <div className="flex justify-between">
             <span className="text-gray-600">Time Limit:</span>
             <span className="font-semibold">{quiz.time_limit}m</span>
            </div>
            {quiz.deadline && (
             <div className="flex justify-between">
              <span className="text-gray-600">Deadline:</span>
              <span className="font-semibold flex items-center">
               <Calendar className="w-3 h-3 mr-1" />
               {new Date(quiz.deadline).toLocaleDateString()}
              </span>
             </div>
            )}
           </div>

           <div className="flex gap-2 mt-6">
            <Button onClick={() => navigate(`/results/${quiz.id}`)} size="sm" className="flex-1">
             <Eye className="w-3 h-3 mr-1" />
             View Results
            </Button>
           </div>
          </CardContent>
         </Card>
        ))}
       </div>
      )}
     </div>
    </section>
   )}

   {/* Features Section */}
   <section className="relative py-24 px-4 bg-white/50 backdrop-blur-sm">
    <div className="container mx-auto">
     <div className="text-center mb-20">
      <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-purple-600 to-green-600 bg-clip-text text-transparent">Why Choose lvl1?</h2>
      <p className="text-2xl text-gray-600 max-w-3xl mx-auto">Built for modern hiring teams who need efficient, fair, and intelligent candidate screening</p>
     </div>

     <div className="grid md:grid-cols-3 gap-8">
      {[
       {
        icon: Brain,
        title: 'AI-Generated Questions',
        description: 'Custom questions generated from job descriptions. Each candidate gets unique assessments tailored to the specific role requirements.',
        color: 'from-purple-500 to-purple-600',
        bgColor: 'from-purple-50 to-purple-100'
       },
       {
        icon: Shield,
        title: 'Anti-Cheat Technology',
        description: 'Video recording, app monitoring, and AI analysis ensure assessment integrity. Detect cheating attempts automatically.',
        color: 'from-green-500 to-green-600',
        bgColor: 'from-green-50 to-green-100'
       },
       {
        icon: Clock,
        title: 'Time-Pressured Testing',
        description: "Gamified interface with timers creates realistic pressure. Measure candidates' performance under stress.",
        color: 'from-purple-500 to-green-500',
        bgColor: 'from-purple-50 to-green-50'
       },
       {
        icon: Target,
        title: 'Precision Filtering',
        description: 'Reduce 1000+ applications to your top 50 candidates with confidence. Data-driven insights for better hiring decisions.',
        color: 'from-blue-500 to-purple-500',
        bgColor: 'from-blue-50 to-purple-50'
       },
       {
        icon: Zap,
        title: 'Pay-Per-Use Model',
        description: '₹100 per candidate assessed. No subscriptions, no hidden fees. Scale your hiring budget with your needs.',
        color: 'from-green-500 to-purple-500',
        bgColor: 'from-green-50 to-purple-50'
       },
       {
        icon: Trophy,
        title: 'Detailed Analytics',
        description: 'Comprehensive reports with scores, time analysis, and authenticity metrics. Export results for further processing.',
        color: 'from-purple-500 to-green-500',
        bgColor: 'from-purple-50 to-green-50'
       }
      ].map((feature, index) => (
       <Card key={index} className={`group border-2 hover:border-transparent bg-gradient-to-br ${feature.bgColor} hover:shadow-2xl transition-all duration-500 transform hover:scale-105 rounded-3xl overflow-hidden opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]`} style={{animationDelay: `${index * 100}ms`}}>
        <CardHeader className="pb-4">
         <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          <feature.icon className="w-8 h-8 text-white" />
         </div>
         <CardTitle className="text-xl font-bold text-gray-800">{feature.title}</CardTitle>
        </CardHeader>
        <CardContent>
         <p className="text-gray-600 leading-relaxed">{feature.description}</p>
        </CardContent>
       </Card>
      ))}
     </div>
    </div>
   </section>

   {/* Footer */}
   <footer className="relative bg-gray-900 text-white py-16 px-4">
    <div className="container mx-auto text-center">
     <div className="flex items-center justify-center space-x-3 mb-6">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-green-500 rounded-2xl flex items-center justify-center">
       <Brain className="w-7 h-7 text-white" />
      </div>
      <span className="text-3xl font-black">lvl1</span>
     </div>
     <p className="text-gray-400 mb-8 text-lg">Intelligent candidate screening for modern hiring teams</p>
     <div className="flex justify-center space-x-8 text-gray-400">
      <a href="#" className="hover:text-white transition-colors font-semibold">
       Privacy Policy
      </a>
      <a href="#" className="hover:text-white transition-colors font-semibold">
       Terms of Service
      </a>
      <a href="#" className="hover:text-white transition-colors font-semibold">
       Contact
      </a>
     </div>
     <div className="mt-8 text-gray-500 text-sm">
      © {new Date().getFullYear()} lvl1 - Professional assessment platform
     </div>
    </div>
   </footer>

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