import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Brain, TrendingUp, Users, Clock, Target, 
  AlertTriangle, CheckCircle, BarChart3, PieChart, 
  Award, Lightbulb, Star, Zap
} from 'lucide-react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from "sonner";

export default function AnalyticsDashboard() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  // const { toast } = toast();
  const { getQuizAnalytics, generateAIInsights } = useSupabase();
  
  const [insights, setInsights] = useState<any>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Fetch quiz analytics
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['quiz-analytics', quizId],
    queryFn: () => getQuizAnalytics(quizId!),
    enabled: !!quizId
  });

  // Generate AI insights
  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const aiInsights = await generateAIInsights(quizId!);
      setInsights(aiInsights);
      toast({
        title: 'AI Insights Generated!',
        description: 'Advanced analytics with AI recommendations are now available.'
      });
    } catch (error: any) {
      toast({
        title: 'Failed to generate insights',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
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
              <BarChart3 className="w-5 h-5 text-orange-500" />
              <span className="font-semibold">Advanced Analytics</span>
            </div>
          </div>

          <Button 
            onClick={handleGenerateInsights}
            disabled={isGeneratingInsights}
            className="bg-gradient-to-r from-orange-500 to-green-500"
          >
            {isGeneratingInsights ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate AI Insights
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="p-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Candidates</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">{analytics?.total_candidates || 0}</div>
              <Progress 
                value={(analytics?.completed_assessments / analytics?.total_candidates) * 100 || 0} 
                className="h-2 mt-2"
              />
              <p className="text-xs text-blue-600 mt-1">
                {analytics?.completed_assessments || 0} completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Average Score</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800">{analytics?.average_score || 0}%</div>
              <Progress 
                value={analytics?.average_score || 0} 
                className="h-2 mt-2" 
              />
              <p className="text-xs text-green-600 mt-1">
                Performance metric
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-800">
                {Math.round(analytics?.completion_rate || 0)}%
              </div>
              <Progress 
                value={analytics?.completion_rate || 0} 
                className="h-2 mt-2"
              />
              <p className="text-xs text-orange-600 mt-1">
                Assessment engagement
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Top Performers</CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-800">
                {analytics?.score_distribution?.excellent || 0}
              </div>
              <Progress 
                value={(analytics?.score_distribution?.excellent / analytics?.total_candidates) * 100 || 0} 
                className="h-2 mt-2"
              />
              <p className="text-xs text-purple-600 mt-1">
                90%+ score
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
            <TabsTrigger value="distribution">Score Distribution</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <div>
                        <span className="font-medium text-green-800">Excellent (90-100%)</span>
                        <p className="text-sm text-green-600">Top-tier candidates</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-800">
                          {analytics?.score_distribution?.excellent || 0}
                        </div>
                        <Badge className="bg-green-500 text-white">
                          {Math.round((analytics?.score_distribution?.excellent / analytics?.total_candidates) * 100 || 0)}%
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <div>
                        <span className="font-medium text-blue-800">Good (70-89%)</span>
                        <p className="text-sm text-blue-600">Strong candidates</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-800">
                          {analytics?.score_distribution?.good || 0}
                        </div>
                        <Badge className="bg-blue-500 text-white">
                          {Math.round((analytics?.score_distribution?.good / analytics?.total_candidates) * 100 || 0)}%
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                      <div>
                        <span className="font-medium text-yellow-800">Average (50-69%)</span>
                        <p className="text-sm text-yellow-600">Moderate performance</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-800">
                          {analytics?.score_distribution?.average || 0}
                        </div>
                        <Badge className="bg-yellow-500 text-white">
                          {Math.round((analytics?.score_distribution?.average / analytics?.total_candidates) * 100 || 0)}%
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                      <div>
                        <span className="font-medium text-red-800">Below Average (&lt;50%)</span>
                        <p className="text-sm text-red-600">Needs improvement</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-800">
                          {analytics?.score_distribution?.poor || 0}
                        </div>
                        <Badge className="bg-red-500 text-white">
                          {Math.round((analytics?.score_distribution?.poor / analytics?.total_candidates) * 100 || 0)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-orange-500" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.top_performers?.slice(0, 5).map((candidate: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-green-800">{candidate.name || candidate.email}</p>
                            <p className="text-sm text-green-600">{candidate.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-800">{candidate.score}%</div>
                          <div className="text-xs text-green-600">
                            {Math.floor((candidate.time_taken || 0) / 60)}m {(candidate.time_taken || 0) % 60}s
                          </div>
                        </div>
                      </div>
                    )) || <p className="text-gray-500 text-center py-8">No completed assessments yet</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="distribution">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-purple-500" />
                  Score Distribution Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Performance Breakdown</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                        <span className="flex-1">Excellent (90-100%)</span>
                        <span className="font-bold">{analytics?.score_distribution?.excellent || 0} candidates</span>
                      </div>
                      <Progress 
                        value={(analytics?.score_distribution?.excellent / analytics?.total_candidates) * 100 || 0}
                        className="h-3"
                      />
                      
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                        <span className="flex-1">Good (70-89%)</span>
                        <span className="font-bold">{analytics?.score_distribution?.good || 0} candidates</span>
                      </div>
                      <Progress 
                        value={(analytics?.score_distribution?.good / analytics?.total_candidates) * 100 || 0}
                        className="h-3"
                      />
                      
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                        <span className="flex-1">Average (50-69%)</span>
                        <span className="font-bold">{analytics?.score_distribution?.average || 0} candidates</span>
                      </div>
                      <Progress 
                        value={(analytics?.score_distribution?.average / analytics?.total_candidates) * 100 || 0}
                        className="h-3"
                      />
                      
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                        <span className="flex-1">Below Average (&lt;50%)</span>
                        <span className="font-bold">{analytics?.score_distribution?.poor || 0} candidates</span>
                      </div>
                      <Progress 
                        value={(analytics?.score_distribution?.poor / analytics?.total_candidates) * 100 || 0}
                        className="h-3"
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-purple-800 mb-4">Key Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-purple-700">Interview Ready:</span>
                        <span className="font-bold text-purple-800">
                          {(analytics?.score_distribution?.excellent || 0) + (analytics?.score_distribution?.good || 0)} candidates
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Above Average:</span>
                        <span className="font-bold text-purple-800">
                          {Math.round(((analytics?.score_distribution?.excellent || 0) + (analytics?.score_distribution?.good || 0)) / (analytics?.total_candidates || 1) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Mean Score:</span>
                        <span className="font-bold text-purple-800">{analytics?.average_score || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-orange-500" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-800 mb-2">Overall Performance</h3>
                        <p className="text-blue-700">{insights.overall_performance}</p>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-2">Hiring Insights</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Interview Ready:</span>
                            <span className="font-bold">{insights.hiring_insights.interview_ready} candidates</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Needs Review:</span>
                            <span className="font-bold">{insights.hiring_insights.needs_review} candidates</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Qualified:</span>
                            <span className="font-bold">{insights.hiring_insights.total_qualified} candidates</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h3 className="font-semibold text-orange-800 mb-2">Assessment Health</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Difficulty Level:</span>
                            <Badge variant="outline" className="border-orange-300 text-orange-700">
                              {insights.assessment_health.difficulty_level}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Candidate Engagement:</span>
                            <Badge variant="outline" className="border-orange-300 text-orange-700">
                              {insights.assessment_health.candidate_engagement}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {insights.recommendations.length > 0 && (
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <h3 className="font-semibold text-yellow-800 mb-2">Recommendations</h3>
                          <ul className="space-y-1 text-sm text-yellow-700">
                            {insights.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <Lightbulb className="w-4 h-4 mr-2 mt-0.5 text-yellow-600" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No AI Insights Generated Yet</h3>
                    <p className="text-gray-500 mb-4">Click the "Generate AI Insights" button to get advanced analytics and recommendations.</p>
                    <Button 
                      onClick={handleGenerateInsights}
                      disabled={isGeneratingInsights}
                      className="bg-gradient-to-r from-orange-500 to-green-500"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Insights Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Hiring Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">Immediate Interview Candidates</h4>
                    <p className="text-sm text-green-700 mb-3">
                      {analytics?.score_distribution?.excellent || 0} candidates scored 90%+ and are ready for immediate interviews.
                    </p>
                    <Badge className="bg-green-500 text-white">
                      Priority: High
                    </Badge>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Secondary Review Pool</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      {analytics?.score_distribution?.good || 0} candidates (70-89%) show strong potential and warrant further review.
                    </p>
                    <Badge className="bg-blue-500 text-white">
                      Priority: Medium
                    </Badge>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Consider Rejection</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      {analytics?.score_distribution?.poor || 0} candidates scored below 50% and may not meet role requirements.
                    </p>
                    <Badge variant="outline" className="border-gray-400 text-gray-700">
                      Priority: Low
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                    Process Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics?.completion_rate < 70 && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-2">Improve Completion Rate</h4>
                      <p className="text-sm text-orange-700">
                        Current completion rate is {Math.round(analytics.completion_rate)}%. Consider simplifying the assessment or reducing time pressure.
                      </p>
                    </div>
                  )}

                  {analytics?.average_score < 50 && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-2">Review Question Difficulty</h4>
                      <p className="text-sm text-red-700">
                        Average score is {analytics.average_score}%. Questions might be too difficult for the target role level.
                      </p>
                    </div>
                  )}

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">Optimization Suggestions</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Send reminder emails to incomplete candidates</li>
                      <li>• Consider offering different difficulty levels</li>
                      <li>• Analyze time-per-question metrics</li>
                      <li>• Review questions with lowest success rates</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}