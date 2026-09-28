import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Loader2, CheckCircle, AlertTriangle, XCircle, Lightbulb } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { useManualPrediction } from '@/hooks/usePredictions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/contexts/ToastContext'

export default function ManualPrediction() {
  const [formData, setFormData] = useState({
    gender: '',
    age: 16,
    school_id: 1,
    attendance_percentage: 85,
    previous_failures: 0,
    final_grade: 75,
    family_support: 'medium',
    internet_access: true,
    fee_status: 'paid',
    medical_condition: 'none',
    higher_education_interest: true,
    study_time_weekly: 10,
    distance_from_school: 5,
  })
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToast()
  const manualPrediction = useManualPrediction()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await manualPrediction.mutateAsync(formData)
      setResult(response)
      addToast('success', 'Prediction generated successfully')
    } catch {
      addToast('error', 'Failed to generate prediction')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Intelligence"
        title="Manual Prediction"
        description="Enter student details to get instant dropout risk assessment"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Student Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange('age', parseInt(e.target.value))}
                    min={5}
                    max={30}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Attendance (%)</Label>
                  <Input
                    type="number"
                    value={formData.attendance_percentage}
                    onChange={(e) => handleChange('attendance_percentage', parseFloat(e.target.value))}
                    min={0}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Previous Failures</Label>
                  <Input
                    type="number"
                    value={formData.previous_failures}
                    onChange={(e) => handleChange('previous_failures', parseInt(e.target.value))}
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Final Grade (%)</Label>
                  <Input
                    type="number"
                    value={formData.final_grade}
                    onChange={(e) => handleChange('final_grade', parseFloat(e.target.value))}
                    min={0}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Study Time (hrs/week)</Label>
                  <Input
                    type="number"
                    value={formData.study_time_weekly}
                    onChange={(e) => handleChange('study_time_weekly', parseFloat(e.target.value))}
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Family Support</Label>
                  <Select value={formData.family_support} onValueChange={(v) => handleChange('family_support', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fee Status</Label>
                  <Select value={formData.fee_status} onValueChange={(v) => handleChange('fee_status', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="scholarship">Scholarship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Medical Condition</Label>
                  <Select value={formData.medical_condition} onValueChange={(v) => handleChange('medical_condition', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="chronic">Chronic</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Distance from School (km)</Label>
                  <Input
                    type="number"
                    value={formData.distance_from_school}
                    onChange={(e) => handleChange('distance_from_school', parseFloat(e.target.value))}
                    min={0}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.internet_access}
                    onChange={(e) => handleChange('internet_access', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="text-sm text-slate-600">Internet Access</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.higher_education_interest}
                    onChange={(e) => handleChange('higher_education_interest', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="text-sm text-slate-600">Higher Education Interest</span>
                </label>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Predict Risk
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Risk Score Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Prediction Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.5 }}
                      className="relative w-40 h-40 mx-auto mb-4"
                    >
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="12"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke={
                            result.risk_level === 'high'
                              ? '#ef4444'
                              : result.risk_level === 'medium'
                              ? '#f59e0b'
                              : '#10b981'
                          }
                          strokeWidth="12"
                          strokeDasharray={`${result.risk_percentage * 4.4} 440`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-slate-900">
                          {result.risk_percentage}%
                        </span>
                        <span className="text-sm text-slate-500">Risk Score</span>
                      </div>
                    </motion.div>

                    <Badge
                      variant={
                        result.risk_level === 'high'
                          ? 'danger'
                          : result.risk_level === 'medium'
                          ? 'warning'
                          : 'success'
                      }
                      className="text-lg px-4 py-1"
                    >
                      {result.risk_level.toUpperCase()} RISK
                    </Badge>

                    <p className="text-sm text-slate-500 mt-2">
                      Confidence: {result.confidence_score}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Factors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.risk_factors?.map((factor: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-500" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendations?.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Intervention */}
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Intervention</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    {result.intervention_suggested}
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Calculator className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">No prediction yet</p>
                <p className="text-sm">Fill in the form and click "Predict Risk" to see results</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
