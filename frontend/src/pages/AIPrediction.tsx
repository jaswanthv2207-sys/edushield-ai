import { useState } from 'react'
import { Upload, FileText, Download, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react'
import { predictionService } from '@/services/predictionService'
import PageHeader from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/contexts/ToastContext'

export default function AIPrediction() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const { addToast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setProgress(0)

    // Show progress while the request is in flight
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90))
    }, 200)

    try {
      const response = await predictionService.uploadCsv(file)
      setResults(response)
      setProgress(100)
      addToast('success', `Processed ${response.total_processed} students`)
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        (typeof err?.response?.data?.detail === 'string'
          ? err.response.data.detail
          : 'Failed to generate predictions')
      addToast('error', typeof detail === 'string' ? detail : 'Failed to generate predictions')
    } finally {
      clearInterval(interval)
      setIsUploading(false)
    }
  }

  const handleExport = () => {
    if (!results) return

    const csvContent = [
      'Risk Level, Risk Percentage, Confidence Score, Recommendations',
      ...results.results.map(
        (r: any) => {
          let recs: string[] = []
          try {
            recs = typeof r.recommendations === 'string'
              ? JSON.parse(r.recommendations)
              : r.recommendations || []
          } catch { recs = [] }
          return `${r.risk_level},${r.risk_percentage}%,${r.confidence_score}%,${recs.join('; ')}`
        }
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'predictions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Intelligence"
        title="AI Prediction"
        description="Upload student data for bulk dropout risk prediction"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                Drag and drop your CSV file here, or click to browse
              </p>
              <p className="text-sm text-slate-400 mb-4">
                Required columns: gender, age, attendance_percentage, previous_failures, final_grade, family_support, internet_access, fee_status, medical_condition, higher_education_interest
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" asChild>
                  <span>Choose File</span>
                </Button>
              </label>
              {file && (
                <p className="mt-4 text-sm text-green-600 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {file.name}
                </p>
              )}
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Processing...</span>
                  <span className="text-slate-600">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Predictions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Prediction Results</CardTitle>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                    <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-600">{results.high_risk_count}</p>
                    <p className="text-sm text-red-600">High Risk</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-600">{results.medium_risk_count}</p>
                    <p className="text-sm text-yellow-600">Medium Risk</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{results.low_risk_count}</p>
                    <p className="text-sm text-green-600">Low Risk</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {results.results?.map((result: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            result.risk_level === 'high'
                              ? 'danger'
                              : result.risk_level === 'medium'
                              ? 'warning'
                              : 'success'
                          }
                        >
                          {result.risk_level}
                        </Badge>
                        <span className="text-sm text-slate-600">
                          {result.risk_percentage}% risk
                        </span>
                      </div>
                      <span className="text-sm text-slate-500">
                        {result.confidence_score}% confidence
                      </span>
                    </div>
                  ))}
                </div>

                <Button onClick={handleExport} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Predictions
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No predictions yet. Upload a CSV file to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
