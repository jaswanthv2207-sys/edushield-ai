import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Brain,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { useStudent, useDeleteStudent } from '@/hooks/useStudents'
import { usePredictionHistory } from '@/hooks/usePredictions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useToast } from '@/contexts/ToastContext'

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { data: student, isLoading } = useStudent(Number(id))
  const { data: predictions } = usePredictionHistory(Number(id))
  const deleteStudent = useDeleteStudent()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this student?')) return
    try {
      await deleteStudent.mutateAsync(Number(id))
      addToast('success', 'Student deleted successfully')
      navigate('/students')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      addToast('error', typeof detail === 'string' ? detail : 'Failed to delete student')
    }
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Student not found</p>
        <Button onClick={() => navigate('/students')} className="mt-4">
          Back to Students
        </Button>
      </div>
    )
  }

  const latestPrediction = predictions?.[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" aria-label="Back to students" onClick={() => navigate('/students')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {student.full_name}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Student ID: {student.student_id} • Grade {student.grade}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/students/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleteStudent.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2 text-red-500" />
            {deleteStudent.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {student.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{student.full_name}</p>
                  <p className="text-sm text-slate-500">Age: {student.age}</p>
                  <p className="text-sm text-slate-500 capitalize">{student.gender}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{student.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{student.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{student.city}, {student.district}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Grade {student.grade} {student.section}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Attendance</span>
                <Badge
                  variant={
                    student.attendance_percentage >= 75
                      ? 'success'
                      : student.attendance_percentage >= 50
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {student.attendance_percentage}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Final Grade</span>
                <span className="font-medium">{student.final_grade}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Previous Failures</span>
                <span className="font-medium">{student.previous_failures}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Study Time</span>
                <span className="font-medium">{student.study_time_weekly} hrs/week</span>
              </div>
            </CardContent>
          </Card>

          {/* Socioeconomic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Socioeconomic Factors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Family Support</span>
                <Badge variant="outline" className="capitalize">{student.family_support}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Internet Access</span>
                {student.internet_access ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Fee Status</span>
                <Badge
                  variant={
                    student.fee_status === 'paid'
                      ? 'success'
                      : student.fee_status === 'overdue'
                      ? 'danger'
                      : 'warning'
                  }
                >
                  {student.fee_status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Medical Condition</span>
                <Badge variant="outline" className="capitalize">{student.medical_condition}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Higher Ed Interest</span>
                {student.higher_education_interest ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Latest Prediction */}
          {latestPrediction && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-500" />
                  Latest AI Prediction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-3xl font-bold text-slate-900">
                      {latestPrediction.risk_percentage}%
                    </p>
                    <p className="text-sm text-slate-500">Risk Score</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Badge
                      variant={
                        latestPrediction.risk_level === 'high'
                          ? 'danger'
                          : latestPrediction.risk_level === 'medium'
                          ? 'warning'
                          : 'success'
                      }
                      className="text-lg px-4 py-1"
                    >
                      {latestPrediction.risk_level.toUpperCase()}
                    </Badge>
                    <p className="text-sm text-slate-500 mt-2">Risk Level</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-3xl font-bold text-slate-900">
                      {latestPrediction.confidence_score}%
                    </p>
                    <p className="text-sm text-slate-500">Confidence</p>
                  </div>
                </div>

                {latestPrediction.risk_factors && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Risk Factors:</p>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        try {
                          const factors = typeof latestPrediction.risk_factors === 'string'
                            ? JSON.parse(latestPrediction.risk_factors)
                            : latestPrediction.risk_factors
                          return factors.map((factor: string, i: number) => (
                            <Badge key={i} variant="danger" className="text-xs">
                              {factor}
                            </Badge>
                          ))
                        } catch {
                          return null
                        }
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Prediction History */}
          <Card>
            <CardHeader>
              <CardTitle>Prediction History</CardTitle>
            </CardHeader>
            <CardContent>
              {predictions && predictions.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={predictions.reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="created_at" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="risk_percentage"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-slate-400 py-8">No prediction history available</p>
              )}
            </CardContent>
          </Card>

          {/* Details Tabs */}
          <Tabs defaultValue="academic">
            <TabsList>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="family">Family</TabsTrigger>
            </TabsList>

            <TabsContent value="academic">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Attendance Percentage</p>
                      <p className="text-xl font-bold text-slate-900">{student.attendance_percentage}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Final Grade</p>
                      <p className="text-xl font-bold text-slate-900">{student.final_grade}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Previous Failures</p>
                      <p className="text-xl font-bold text-slate-900">{student.previous_failures}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Study Time (weekly)</p>
                      <p className="text-xl font-bold text-slate-900">{student.study_time_weekly} hrs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personal">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Age</p>
                      <p className="text-xl font-bold text-slate-900">{student.age}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Gender</p>
                      <p className="text-xl font-bold text-slate-900 capitalize">{student.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Distance from School</p>
                      <p className="text-xl font-bold text-slate-900">{student.distance_from_school} km</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Internet Access</p>
                      <p className="text-xl font-bold text-slate-900">
                        {student.internet_access ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="family">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Family Support</p>
                      <p className="text-xl font-bold text-slate-900 capitalize">{student.family_support}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Parent Education</p>
                      <p className="text-xl font-bold text-slate-900">{student.parent_education || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Family Income</p>
                      <p className="text-xl font-bold text-slate-900">{student.family_income || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Fee Status</p>
                      <p className="text-xl font-bold text-slate-900 capitalize">{student.fee_status}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
