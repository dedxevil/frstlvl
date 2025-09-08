import {useState} from 'react'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Download, FileText, Users, BarChart3, Shield, Clock, CheckCircle} from 'lucide-react'

interface ReportData {
 quizTitle: string
 company: string
 dateGenerated: string
 totalCandidates: number
 completedAssessments: number
 averageScore: number
 topPerformers: Array<{
  name: string
  email: string
  score: number
  authenticityScore: number
  timeSpent: number
 }>
 analytics: {
  scoreDistribution: Record<string, number>
  timeAnalytics: {
   averageTime: number
   fastestCompletion: number
   slowestCompletion: number
  }
  authenticityMetrics: {
   highConfidence: number
   mediumConfidence: number
   lowConfidence: number
  }
  redFlags: Array<{
   type: string
   count: number
   percentage: number
  }>
 }
}

interface PDFReportGeneratorProps {
 reportData: ReportData
 onGenerateReport: (format: 'pdf' | 'excel') => void
}

export default function PDFReportGenerator({reportData, onGenerateReport}: PDFReportGeneratorProps) {
 const [isGenerating, setIsGenerating] = useState(false)

 const handleGenerateReport = async (format: 'pdf' | 'excel') => {
  setIsGenerating(true)
  
  // Simulate report generation
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  onGenerateReport(format)
  setIsGenerating(false)
 }

 const generateHTMLReport = () => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Assessment Report - ${reportData.quizTitle}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #ff6b35; }
        .logo { font-size: 28px; font-weight: bold; background: linear-gradient(45deg, #ff6b35, #4ecdc4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .section { margin-bottom: 30px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #ff6b35; }
        .metric-label { font-size: 14px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .score-high { color: #22c55e; font-weight: bold; }
        .score-medium { color: #f59e0b; font-weight: bold; }
        .score-low { color: #ef4444; font-weight: bold; }
        .authenticity-high { background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; }
        .authenticity-medium { background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; }
        .authenticity-low { background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">frstlvl.ai</div>
        <h1>Assessment Report</h1>
        <h2>${reportData.quizTitle}</h2>
        <p><strong>Company:</strong> ${reportData.company}</p>
        <p><strong>Generated:</strong> ${new Date(reportData.dateGenerated).toLocaleDateString()}</p>
    </div>

    <div class="section">
        <h3>Summary Metrics</h3>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${reportData.totalCandidates}</div>
                <div class="metric-label">Total Candidates</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${reportData.completedAssessments}</div>
                <div class="metric-label">Completed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${reportData.averageScore}%</div>
                <div class="metric-label">Average Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${reportData.analytics.timeAnalytics.averageTime}m</div>
                <div class="metric-label">Avg Time</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h3>Top Performers</h3>
        <table>
            <thead>
                <tr>
                    <th>Candidate</th>
                    <th>Email</th>
                    <th>Score</th>
                    <th>Time Spent</th>
                    <th>Authenticity</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.topPerformers.map(candidate => `
                    <tr>
                        <td>${candidate.name}</td>
                        <td>${candidate.email}</td>
                        <td class="${candidate.score >= 80 ? 'score-high' : candidate.score >= 60 ? 'score-medium' : 'score-low'}">${candidate.score}%</td>
                        <td>${candidate.timeSpent}m</td>
                        <td class="${candidate.authenticityScore >= 90 ? 'authenticity-high' : candidate.authenticityScore >= 70 ? 'authenticity-medium' : 'authenticity-low'}">${candidate.authenticityScore}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h3>Score Distribution</h3>
        <table>
            <thead>
                <tr>
                    <th>Score Range</th>
                    <th>Candidates</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(reportData.analytics.scoreDistribution).map(([range, count]) => `
                    <tr>
                        <td>${range}</td>
                        <td>${count}</td>
                        <td>${((count / reportData.completedAssessments) * 100).toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h3>Authenticity Analysis</h3>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${reportData.analytics.authenticityMetrics.highConfidence}</div>
                <div class="metric-label">High Confidence (90%+)</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${reportData.analytics.authenticityMetrics.mediumConfidence}</div>
                <div class="metric-label">Medium Confidence (70-89%)</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${reportData.analytics.authenticityMetrics.lowConfidence}</div>
                <div class="metric-label">Low Confidence (<70%)</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h3>Red Flags Summary</h3>
        <table>
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Occurrences</th>
                    <th>Percentage of Sessions</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.analytics.redFlags.map(flag => `
                    <tr>
                        <td>${flag.type}</td>
                        <td>${flag.count}</td>
                        <td>${flag.percentage.toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
        <p>Generated by frstlvl.ai - AI-Powered Assessment Platform</p>
        <p>This report contains confidential information. Please handle with care.</p>
    </footer>
</body>
</html>
  `
 }

 return (
  <Card className="border-0 shadow-xl">
   <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
    <CardTitle className="flex items-center text-xl">
     <FileText className="w-6 h-6 mr-3 text-purple-500" />
     Report Generation
    </CardTitle>
   </CardHeader>
   <CardContent className="p-6">
    <div className="grid md:grid-cols-2 gap-6 mb-6">
     {/* Summary Stats */}
     <div className="space-y-4">
      <h4 className="font-bold text-lg text-gray-800">Report Summary</h4>
      <div className="space-y-3">
       <div className="flex items-center justify-between">
        <span className="flex items-center">
         <Users className="w-4 h-4 mr-2 text-blue-500" />
         Total Candidates
        </span>
        <Badge variant="outline" className="font-bold">{reportData.totalCandidates}</Badge>
       </div>
       <div className="flex items-center justify-between">
        <span className="flex items-center">
         <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
         Completed
        </span>
        <Badge className="bg-green-100 text-green-700">{reportData.completedAssessments}</Badge>
       </div>
       <div className="flex items-center justify-between">
        <span className="flex items-center">
         <BarChart3 className="w-4 h-4 mr-2 text-orange-500" />
         Average Score
        </span>
        <Badge className="bg-orange-100 text-orange-700">{reportData.averageScore}%</Badge>
       </div>
       <div className="flex items-center justify-between">
        <span className="flex items-center">
         <Clock className="w-4 h-4 mr-2 text-purple-500" />
         Avg Time
        </span>
        <Badge className="bg-purple-100 text-purple-700">{reportData.analytics.timeAnalytics.averageTime}m</Badge>
       </div>
      </div>
     </div>

     {/* Authenticity Overview */}
     <div className="space-y-4">
      <h4 className="font-bold text-lg text-gray-800">Authenticity Overview</h4>
      <div className="space-y-3">
       <div className="flex items-center justify-between">
        <span className="flex items-center">
         <Shield className="w-4 h-4 mr-2 text-green-500" />
         High Confidence
        </span>
        <Badge className="bg-green-100 text-green-700">{reportData.analytics.authenticityMetrics.highConfidence}</Badge>
       </div>
       <div className="flex items-center justify-between">
        <span className="flex items-center">
         <Shield className="w-4 h-4 mr-2 text-yellow-500" />
         Medium Confidence
        </span>
        <Badge className="bg-yellow-100 text-yellow-700">{reportData.analytics.authenticityMetrics.mediumConfidence}</Badge>
       </div>
       <div className="flex items-center justify-between">
        <span className="flex items-center">
         <Shield className="w-4 h-4 mr-2 text-red-500" />
         Low Confidence
        </span>
        <Badge className="bg-red-100 text-red-700">{reportData.analytics.authenticityMetrics.lowConfidence}</Badge>
       </div>
      </div>
     </div>
    </div>

    {/* Action Buttons */}
    <div className="flex gap-4">
     <Button 
      onClick={() => handleGenerateReport('pdf')}
      disabled={isGenerating}
      className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
     >
      <Download className="w-4 h-4 mr-2" />
      {isGenerating ? 'Generating...' : 'Download PDF Report'}
     </Button>
     
     <Button 
      onClick={() => handleGenerateReport('excel')}
      disabled={isGenerating}
      variant="outline"
      className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
     >
      <Download className="w-4 h-4 mr-2" />
      Export to Excel
     </Button>
    </div>

    {/* Preview HTML Report */}
    <div className="mt-6">
     <details className="group">
      <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
       Preview HTML Report Content
      </summary>
      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-xs overflow-auto max-h-40">
       <pre className="whitespace-pre-wrap">{generateHTMLReport().substring(0, 500)}...</pre>
      </div>
     </details>
    </div>
   </CardContent>
  </Card>
 )
}