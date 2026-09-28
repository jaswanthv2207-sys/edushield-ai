import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import {
  Search,
  SearchX,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react'
import { useStudents, useDeleteStudent } from '@/hooks/useStudents'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/contexts/ToastContext'

export default function Students() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    grade: '',
    gender: '',
    fee_status: '',
    page: 1,
    page_size: 10,
  })

  // Keep the list in sync with the global header search
  useEffect(() => {
    const term = searchParams.get('search') || ''
    setFilters((prev) =>
      prev.search === term ? prev : { ...prev, search: term, page: 1 }
    )
  }, [searchParams])

  const { data, isLoading } = useStudents(filters)
  const deleteStudent = useDeleteStudent()

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent.mutateAsync(id)
        addToast('success', 'Student deleted successfully')
      } catch {
        addToast('error', 'Failed to delete student')
      }
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    // "All" options use the sentinel value "all"; the API expects an empty filter
    setFilters((prev) => ({ ...prev, [key]: value === 'all' ? '' : value, page: 1 }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Intelligence"
        title="Students"
        description="Manage and monitor student records"
        actions={
          <Button onClick={() => navigate('/students/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, ID, or email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filters.grade || 'all'} onValueChange={(v) => handleFilterChange('grade', v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="9">Grade 9</SelectItem>
                <SelectItem value="10">Grade 10</SelectItem>
                <SelectItem value="11">Grade 11</SelectItem>
                <SelectItem value="12">Grade 12</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.gender || 'all'} onValueChange={(v) => handleFilterChange('gender', v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.fee_status || 'all'} onValueChange={(v) => handleFilterChange('fee_status', v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Fee Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fee Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="scholarship">Scholarship</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Fee Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!data?.students || data.students.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className="flex flex-col items-center justify-center py-14 text-center">
                          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-500 dark:from-brand-950 dark:to-brand-900/60 dark:text-brand-300">
                            <SearchX className="h-7 w-7" />
                          </div>
                          <p className="font-display text-base font-bold text-slate-900 dark:text-white">
                            No students found
                          </p>
                          <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-400">
                            Try adjusting your search or filters — or add a new
                            student to start tracking dropout risk.
                          </p>
                          <div className="mt-5 flex flex-wrap justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setFilters((prev) => ({
                                  ...prev,
                                  search: '',
                                  grade: '',
                                  gender: '',
                                  fee_status: '',
                                  page: 1,
                                }))
                              }
                            >
                              Clear filters
                            </Button>
                            <Button size="sm" onClick={() => navigate('/students/new')}>
                              <Plus className="mr-1.5 h-4 w-4" />
                              Add Student
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {data?.students?.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.student_id}</TableCell>
                      <TableCell>{student.full_name}</TableCell>
                      <TableCell>{student.grade}</TableCell>
                      <TableCell className="capitalize">{student.gender}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`View ${student.full_name}`}
                            onClick={() => navigate(`/students/${student.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${student.full_name}`}
                            onClick={() => navigate(`/students/${student.id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${student.full_name}`}
                            onClick={() => handleDelete(student.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Showing{' '}
                  {data?.total ? (filters.page - 1) * filters.page_size + 1 : 0} to{' '}
                  {Math.min(filters.page * filters.page_size, data?.total || 0)} of{' '}
                  {data?.total || 0} students
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page === 1}
                    onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-slate-600">
                    Page {filters.page} of {data?.total_pages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page >= (data?.total_pages || 1)}
                    onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}
