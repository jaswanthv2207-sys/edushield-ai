import { useState, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'
import {
  Search,
  Plus,
  User,
  AlertTriangle,
  Save,
  Trash2,
  ShieldCheck,
} from 'lucide-react'
import {
  useCounsellingSessions,
  useHighRiskStudents,
  useAssignCounsellor,
  useCounsellors,
  useUpdateSession,
  useDeleteSession,
} from '@/hooks/useCounselling'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/contexts/ToastContext'

export default function Counselling() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [assignForm, setAssignForm] = useState({
    counsellor_id: 1,
    meeting_date: '',
    priority: 'medium',
    notes: '',
  })
  const { addToast } = useToast()
  const assignCounsellor = useAssignCounsellor()

  const { data: sessions, isLoading: sessionsLoading } = useCounsellingSessions({
    search,
    status: statusFilter,
  })
  const { data: highRiskStudents, isLoading: studentsLoading } = useHighRiskStudents()
  const { data: counsellors } = useCounsellors()
  const updateSession = useUpdateSession()
  const deleteSession = useDeleteSession()

  const handleStatusChange = async (sessionId: number, status: string) => {
    try {
      await updateSession.mutateAsync({ id: sessionId, data: { status } })
      addToast('success', 'Session status updated')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      addToast('error', typeof detail === 'string' ? detail : 'Failed to update session status')
    }
  }

  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm('Delete this counselling session?')) return
    try {
      await deleteSession.mutateAsync(sessionId)
      addToast('success', 'Session deleted')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      addToast('error', typeof detail === 'string' ? detail : 'Failed to delete session')
    }
  }

  // Default the picker to the first available counsellor instead of a
  // hardcoded id that may not exist in this database.
  useEffect(() => {
    if (counsellors?.length && assignForm.counsellor_id === 1) {
      setAssignForm((p) => ({ ...p, counsellor_id: counsellors[0].id }))
    }
  }, [counsellors, assignForm.counsellor_id])

  const handleAssign = async () => {
    if (!selectedStudent) return
    if (!assignForm.meeting_date) {
      addToast('error', 'Meeting date and time is required')
      return
    }
    if (!assignForm.counsellor_id) {
      addToast('error', 'Select a counsellor')
      return
    }

    try {
      await assignCounsellor.mutateAsync({
        student_id: selectedStudent.student.id,
        ...assignForm,
      })
      addToast('success', 'Counsellor assigned successfully')
      setSelectedStudent(null)
      setAssignForm((p) => ({ ...p, meeting_date: '', notes: '' }))
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      addToast('error', typeof detail === 'string' ? detail : 'Failed to assign counsellor')
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="info">Low</Badge>
      case 'medium':
        return <Badge variant="warning">Medium</Badge>
      case 'high':
        return <Badge variant="danger">High</Badge>
      case 'critical':
        return <Badge variant="danger">Critical</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Counselling"
        description="Manage counselling sessions and high-risk students"
      />

      {/* High Risk Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            High Risk Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studentsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !highRiskStudents?.length ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 dark:from-emerald-950 dark:to-emerald-900/60 dark:text-emerald-300">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <p className="font-display text-base font-bold text-slate-900 dark:text-white">
                No high-risk students right now
              </p>
              <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-400">
                Every student is currently within safe thresholds. New risk
                flags will appear here as soon as the model detects them.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {highRiskStudents?.slice(0, 5).map((item: any) => (
                <div
                  key={item.student.id}
                  className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {item.student.full_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        Risk: {item.prediction.risk_percentage}% | {item.prediction.risk_level}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.assigned ? (
                      <Badge variant="success">Assigned</Badge>
                    ) : (
                      <Dialog
                        open={selectedStudent?.student.id === item.student.id}
                        onOpenChange={(open) => {
                          if (!open) setSelectedStudent(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setSelectedStudent(item)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Assign
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Counsellor</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <p className="font-medium">{item.student.full_name}</p>
                              <p className="text-sm text-slate-500">
                                Risk: {item.prediction.risk_percentage}%
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label>Counsellor</Label>
                              <Select
                                value={String(assignForm.counsellor_id)}
                                onValueChange={(v) =>
                                  setAssignForm((p) => ({ ...p, counsellor_id: Number(v) }))
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select counsellor" />
                                </SelectTrigger>
                                <SelectContent>
                                  {(counsellors || []).map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                      {c.full_name} ({c.email})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Meeting Date *</Label>
                              <Input
                                type="datetime-local"
                                value={assignForm.meeting_date}
                                onChange={(e) =>
                                  setAssignForm((p) => ({ ...p, meeting_date: e.target.value }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Priority</Label>
                              <Select
                                value={assignForm.priority}
                                onValueChange={(v) =>
                                  setAssignForm((p) => ({ ...p, priority: v }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Notes</Label>
                              <Textarea
                                value={assignForm.notes}
                                onChange={(e) =>
                                  setAssignForm((p) => ({ ...p, notes: e.target.value }))
                                }
                                placeholder="Add notes about the session..."
                              />
                            </div>
                            <Button onClick={handleAssign} className="w-full">
                              <Save className="w-4 h-4 mr-2" />
                              Save Assignment
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Counselling Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Counselling Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search sessions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sessionsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Counsellor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!sessions?.sessions || sessions.sessions.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-500 dark:from-brand-950 dark:to-brand-900/60 dark:text-brand-300">
                          <Search className="h-7 w-7" />
                        </div>
                        <p className="font-display text-base font-bold text-slate-900 dark:text-white">
                          No counselling sessions found
                        </p>
                        <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-400">
                          {search || (statusFilter && statusFilter !== 'all')
                            ? 'Try adjusting your search or status filter.'
                            : 'Assign a counsellor to a high-risk student to create the first session.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {sessions?.sessions?.map((session: any) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      {session.student_name || `Student #${session.student_id}`}
                    </TableCell>
                    <TableCell>
                      {session.counsellor_name || `Counsellor #${session.counsellor_id}`}
                    </TableCell>
                    <TableCell>
                      {new Date(session.meeting_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getPriorityBadge(session.priority)}</TableCell>
                    <TableCell>
                      <Select
                        value={session.status}
                        onValueChange={(v) => handleStatusChange(session.id, v)}
                      >
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSession(session.id)}
                        disabled={deleteSession.isPending}
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
