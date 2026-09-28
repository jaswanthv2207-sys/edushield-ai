import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Printer, Loader2, FileWarning } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/contexts/ToastContext'
import { useReports, useGenerateReport } from '@/hooks/useReports'
import { reportService, GeneratedReport } from '@/services/reportService'

const reportTypes = [
  { value: 'school', label: 'School Report' },
  { value: 'student', label: 'Student Report' },
  { value: 'risk', label: 'Risk Report' },
  { value: 'monthly', label: 'Monthly Report' },
  { value: 'yearly', label: 'Yearly Report' },
]

const reportFormats = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
  { value: 'csv', label: 'CSV' },
]

const labelForType = (value: string) =>
  reportTypes.find((t) => t.value === value)?.label || value

const labelForFormat = (value: string) =>
  reportFormats.find((f) => f.value === value)?.label || value

export default function Reports() {
  const [reportConfig, setReportConfig] = useState({
    report_type: 'school',
    format: 'pdf',
    start_date: '',
    end_date: '',
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const { addToast } = useToast()
  const generateReport = useGenerateReport()
  const { data: reportsData, isLoading, isError } = useReports(10)

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const result = await generateReport.mutateAsync({
        report_type: reportConfig.report_type,
        format: reportConfig.format,
        start_date: reportConfig.start_date || undefined,
        end_date: reportConfig.end_date || undefined,
      })

      // Immediately download the generated file
      const idMatch = result.download_url.match(/\/(\d+)$/)
      const reportId = idMatch ? Number(idMatch[1]) : undefined
      if (reportId) {
        await reportService.download(
          reportId,
          `${reportConfig.report_type}_report.${reportConfig.format === 'excel' ? 'xlsx' : reportConfig.format}`
        )
      }
      addToast('success', 'Report generated and downloaded')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      addToast(
        'error',
        typeof detail === 'string' ? detail : 'Failed to generate report'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async (report: GeneratedReport) => {
    try {
      const extension = report.format === 'excel' ? 'xlsx' : report.format
      await reportService.download(report.id, `${report.title || 'report'}.${extension}`)
      addToast('success', 'Download started')
    } catch {
      addToast('error', 'Failed to download report')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Reports"
        description="Generate and download comprehensive reports"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select
                value={reportConfig.report_type}
                onValueChange={(v) => setReportConfig((p) => ({ ...p, report_type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select
                value={reportConfig.format}
                onValueChange={(v) => setReportConfig((p) => ({ ...p, format: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={reportConfig.start_date}
                onChange={(e) => setReportConfig((p) => ({ ...p, start_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={reportConfig.end_date}
                onChange={(e) => setReportConfig((p) => ({ ...p, end_date: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-8 min-h-[500px]">
              <div className="text-center text-slate-400">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Report Preview</p>
                <p className="text-sm mt-2">
                  {labelForType(reportConfig.report_type)} ({labelForFormat(reportConfig.format)}){' '}
                  &mdash; configure the settings and click "Generate" to create and download a report
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-slate-500">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading reports...
            </div>
          ) : isError ? (
            <div className="text-center py-10 text-red-500">Failed to load reports</div>
          ) : !reportsData?.reports?.length ? (
            <div className="text-center py-10 text-slate-400">
              <FileWarning className="w-10 h-10 mx-auto mb-3 opacity-60" />
              <p className="font-medium">No reports yet</p>
              <p className="text-sm">Generate your first report using the form above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reportsData.reports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {labelForType(report.report_type)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {report.created_at
                          ? new Date(report.created_at).toLocaleDateString()
                          : 'Recently'}{' '}
                        &bull; {labelForFormat(report.format)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(report)}>
                    <Download className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
