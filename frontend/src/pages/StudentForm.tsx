import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Loader2, GraduationCap } from 'lucide-react'
import { useStudent, useCreateStudent, useUpdateStudent } from '@/hooks/useStudents'
import { useSchools } from '@/hooks/useSchools'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/contexts/ToastContext'

const studentSchema = z.object({
  student_id: z.string().trim().min(1, 'Student ID is required').max(50, 'Max 50 characters'),
  full_name: z.string().trim().min(1, 'Full name is required').max(255, 'Max 255 characters'),
  email: z.string().trim().email('Enter a valid email').or(z.literal('')).optional(),
  phone: z.string().trim().max(20, 'Max 20 characters').optional(),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Gender is required' }),
  }),
  age: z.coerce
    .number({ invalid_type_error: 'Age is required' })
    .min(5, 'Age must be at least 5')
    .max(30, 'Age must be 30 or less'),
  school_id: z.coerce
    .number({ invalid_type_error: 'Select a school' })
    .min(1, 'Select a school'),
  grade: z.string().trim().min(1, 'Grade is required').max(20),
  section: z.string().trim().max(10).optional(),
  attendance_percentage: z.coerce
    .number({ invalid_type_error: 'Attendance is required' })
    .min(0, 'Cannot be negative')
    .max(100, 'Cannot exceed 100'),
  final_grade: z.coerce
    .number({ invalid_type_error: 'Grade is required' })
    .min(0, 'Cannot be negative')
    .max(100, 'Cannot exceed 100'),
  previous_failures: z.coerce
    .number({ invalid_type_error: 'Required' })
    .min(0, 'Cannot be negative')
    .max(20, 'Too large'),
  study_time_weekly: z.coerce
    .number({ invalid_type_error: 'Required' })
    .min(0, 'Cannot be negative')
    .max(80, 'Cannot exceed 80 hours'),
  distance_from_school: z.coerce
    .number({ invalid_type_error: 'Required' })
    .min(0, 'Cannot be negative')
    .max(1000, 'Cannot exceed 1000 km'),
  family_support: z.enum(['high', 'medium', 'low'], {
    errorMap: () => ({ message: 'Select an option' }),
  }),
  internet_access: z.boolean(),
  fee_status: z.enum(['paid', 'pending', 'overdue', 'scholarship'], {
    errorMap: () => ({ message: 'Select an option' }),
  }),
  medical_condition: z.enum(['none', 'minor', 'chronic', 'severe'], {
    errorMap: () => ({ message: 'Select an option' }),
  }),
  higher_education_interest: z.boolean(),
  address: z.string().optional(),
  city: z.string().trim().optional(),
  district: z.string().trim().optional(),
  state: z.string().trim().optional(),
  parent_education: z.string().trim().optional(),
  family_income: z.string().trim().optional(),
})

type StudentFormValues = z.infer<typeof studentSchema>

const defaultValues: StudentFormValues = {
  student_id: '',
  full_name: '',
  email: '',
  phone: '',
  gender: 'male',
  age: 15,
  school_id: 1,
  grade: '9',
  section: '',
  attendance_percentage: 75,
  final_grade: 60,
  previous_failures: 0,
  study_time_weekly: 6,
  distance_from_school: 3,
  family_support: 'medium',
  internet_access: true,
  fee_status: 'paid',
  medical_condition: 'none',
  higher_education_interest: true,
  address: '',
  city: '',
  district: '',
  state: 'Rajasthan',
  parent_education: '',
  family_income: '',
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-red-600 mt-1">{message}</p>
}

export default function StudentForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const { addToast } = useToast()

  const { data: student, isLoading: loadingStudent, isError: studentError } = useStudent(
    isEdit ? Number(id) : undefined
  )
  const { data: schools, isLoading: loadingSchools } = useSchools()
  const createStudent = useCreateStudent()
  const updateStudent = useUpdateStudent()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues,
  })

  // Prefill the form when editing
  useEffect(() => {
    if (isEdit && student) {
      reset({
        student_id: student.student_id,
        full_name: student.full_name,
        email: student.email || '',
        phone: student.phone || '',
        gender: student.gender,
        age: student.age,
        school_id: student.school_id,
        grade: student.grade,
        section: student.section || '',
        attendance_percentage: student.attendance_percentage,
        final_grade: student.final_grade,
        previous_failures: student.previous_failures,
        study_time_weekly: student.study_time_weekly,
        distance_from_school: student.distance_from_school,
        family_support: student.family_support,
        internet_access: student.internet_access,
        fee_status: student.fee_status,
        medical_condition: student.medical_condition,
        higher_education_interest: student.higher_education_interest,
        address: student.address || '',
        city: student.city || '',
        district: student.district || '',
        state: student.state || 'Rajasthan',
        parent_education: student.parent_education || '',
        family_income: student.family_income || '',
      })
    }
  }, [isEdit, student, reset])

  const schoolOptions = useMemo(() => schools?.schools || [], [schools])

  const onSubmit = async (values: StudentFormValues) => {
    setIsSubmitting(true)
    const payload = {
      ...values,
      section: values.section?.trim() || undefined,
      address: values.address?.trim() || undefined,
      city: values.city?.trim() || undefined,
      district: values.district?.trim() || undefined,
      state: values.state?.trim() || 'Rajasthan',
      parent_education: values.parent_education?.trim() || undefined,
      family_income: values.family_income?.trim() || undefined,
      email: values.email?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
    }

    try {
      if (isEdit) {
        await updateStudent.mutateAsync({ id: Number(id), student: payload })
        addToast('success', 'Student updated successfully')
        navigate(`/students/${id}`)
      } else {
        const created = await createStudent.mutateAsync(payload as any)
        addToast('success', 'Student created successfully')
        navigate(`/students/${created.id}`)
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      addToast(
        'error',
        typeof detail === 'string' ? detail : `Failed to ${isEdit ? 'update' : 'create'} student`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isEdit && loadingStudent) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (isEdit && (studentError || !student)) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-lg font-medium text-slate-900 dark:text-white">Student not found</p>
        <Button variant="outline" onClick={() => navigate('/students')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Students
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Back to students" onClick={() => navigate('/students')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {isEdit ? 'Edit Student' : 'Add Student'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {isEdit
                ? 'Update the student record and risk factors'
                : 'Register a new student for dropout risk monitoring'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Basic information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="student_id">Student ID *</Label>
              <Input id="student_id" placeholder="STU20240001" {...register('student_id')} />
              <FieldError message={errors.student_id?.message} />
            </div>

            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" placeholder="Aarav Sharma" {...register('full_name')} />
              <FieldError message={errors.full_name?.message} />
            </div>

            <div>
              <Label htmlFor="age">Age *</Label>
              <Input id="age" type="number" placeholder="15" {...register('age')} />
              <FieldError message={errors.age?.message} />
            </div>

            <div>
              <Label>Gender *</Label>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.gender?.message} />
            </div>

            <div>
              <Label>School *</Label>
              <Controller
                control={control}
                name="school_id"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                    disabled={loadingSchools}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={loadingSchools ? 'Loading schools...' : 'Select school'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {schoolOptions.map((school) => (
                        <SelectItem key={school.id} value={String(school.id)}>
                          {school.name} ({school.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.school_id?.message} />
            </div>

            <div>
              <Label htmlFor="grade">Grade / Class *</Label>
              <Input id="grade" placeholder="10" {...register('grade')} />
              <FieldError message={errors.grade?.message} />
            </div>

            <div>
              <Label htmlFor="section">Section</Label>
              <Input id="section" placeholder="A" {...register('section')} />
              <FieldError message={errors.section?.message} />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="student@school.edu" {...register('email')} />
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="9876543210" {...register('phone')} />
              <FieldError message={errors.phone?.message} />
            </div>
          </CardContent>
        </Card>

        {/* Academic & risk factors */}
        <Card>
          <CardHeader>
            <CardTitle>Academic &amp; Risk Factors</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="attendance_percentage">Attendance % *</Label>
              <Input
                id="attendance_percentage"
                type="number"
                step="0.1"
                {...register('attendance_percentage')}
              />
              <FieldError message={errors.attendance_percentage?.message} />
            </div>

            <div>
              <Label htmlFor="final_grade">Final Grade (%) *</Label>
              <Input id="final_grade" type="number" step="0.1" {...register('final_grade')} />
              <FieldError message={errors.final_grade?.message} />
            </div>

            <div>
              <Label htmlFor="previous_failures">Previous Failures *</Label>
              <Input id="previous_failures" type="number" {...register('previous_failures')} />
              <FieldError message={errors.previous_failures?.message} />
            </div>

            <div>
              <Label htmlFor="study_time_weekly">Study Hours / Week *</Label>
              <Input
                id="study_time_weekly"
                type="number"
                step="0.5"
                {...register('study_time_weekly')}
              />
              <FieldError message={errors.study_time_weekly?.message} />
            </div>

            <div>
              <Label htmlFor="distance_from_school">Distance from School (km) *</Label>
              <Input
                id="distance_from_school"
                type="number"
                step="0.5"
                {...register('distance_from_school')}
              />
              <FieldError message={errors.distance_from_school?.message} />
            </div>

            <div>
              <Label>Family Support *</Label>
              <Controller
                control={control}
                name="family_support"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.family_support?.message} />
            </div>

            <div>
              <Label>Fee Status *</Label>
              <Controller
                control={control}
                name="fee_status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="scholarship">Scholarship</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.fee_status?.message} />
            </div>

            <div>
              <Label>Medical Condition *</Label>
              <Controller
                control={control}
                name="medical_condition"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="chronic">Chronic</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.medical_condition?.message} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label htmlFor="internet_access" className="cursor-pointer">
                Internet Access
              </Label>
              <Controller
                control={control}
                name="internet_access"
                render={({ field }) => (
                  <Switch
                    id="internet_access"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label htmlFor="higher_education_interest" className="cursor-pointer">
                Higher Education Interest
              </Label>
              <Controller
                control={control}
                name="higher_education_interest"
                render={({ field }) => (
                  <Switch
                    id="higher_education_interest"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional details */}
        <Card>
          <CardHeader>
            <CardTitle>Address &amp; Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2 lg:col-span-3">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="House no, street, village" {...register('address')} />
              <FieldError message={errors.address?.message} />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Jaipur" {...register('city')} />
              <FieldError message={errors.city?.message} />
            </div>

            <div>
              <Label htmlFor="district">District</Label>
              <Input id="district" placeholder="Jaipur" {...register('district')} />
              <FieldError message={errors.district?.message} />
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" placeholder="Rajasthan" {...register('state')} />
              <FieldError message={errors.state?.message} />
            </div>

            <div>
              <Label htmlFor="parent_education">Parent Education</Label>
              <Input id="parent_education" placeholder="Secondary" {...register('parent_education')} />
              <FieldError message={errors.parent_education?.message} />
            </div>

            <div>
              <Label htmlFor="family_income">Family Income</Label>
              <Input id="family_income" placeholder="Below 2 LPA" {...register('family_income')} />
              <FieldError message={errors.family_income?.message} />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/students')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? 'Update Student' : 'Create Student'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
