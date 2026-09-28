import api from './api'

export interface GeneratedReport {
  id: number
  report_type: string
  format: string
  title: string
  file_path?: string
  generated_by?: number
  school_id?: number | null
  created_at?: string
}

export interface ReportListResponse {
  reports: GeneratedReport[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface GenerateReportResponse {
  message: string
  file_path: string
  download_url: string
}

export interface GenerateReportParams {
  report_type: string
  format: string
  school_id?: number
  student_id?: number
  start_date?: string
  end_date?: string
}

export const reportService = {
  async generate(params: GenerateReportParams): Promise<GenerateReportResponse> {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })
    const response = await api.post<GenerateReportResponse>(`/reports/generate?${query.toString()}`)
    return response.data
  },

  async list(params: { page?: number; page_size?: number; report_type?: string } = {}): Promise<ReportListResponse> {
    const response = await api.get<ReportListResponse>('/reports/', { params })
    return response.data
  },

  async download(reportId: number, filename?: string): Promise<void> {
    const response = await api.get<Blob>(`/reports/download/${reportId}`, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `report_${reportId}`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
