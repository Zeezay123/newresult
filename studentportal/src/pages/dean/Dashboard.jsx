import React from 'react'
import { BookOpen, ClipboardCheck, Clock3, Users } from 'lucide-react'
import { Timeline, TimelineContent, TimelineItem, TimelinePoint, TimelineTime } from 'flowbite-react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { currentUser, email } = useSelector((state) => state.user)
  const deanName = currentUser?.username || currentUser?.name || 'Dean User'
  const [stats, setStats] = React.useState({
    RegisteredStudents: 0,
    TotalCourses: 0,
    SubmittedResults: 0,
    PendingResults: 0
  })
  const [sessionInfo, setSessionInfo] = React.useState({ session: '', semester: '' })
  const [submissionTimeline, setSubmissionTimeline] = React.useState([])

  React.useEffect(() => {
    fetchDeanStats()
    fetchSubmissionTimeline()
  }, [])

  const fetchDeanStats = async () => {
    try {
      const response = await fetch('/api/dean/results/stats', { credentials: 'include' })
      if (!response.ok) {
        throw new Error('Failed to fetch dean stats')
      }

      const data = await response.json()
      setStats(data.stats || {
        RegisteredStudents: 0,
        TotalCourses: 0,
        SubmittedResults: 0,
        PendingResults: 0
      })
      setSessionInfo({ session: data.session || '', semester: data.semester || '' })
    } catch (error) {
      console.error('Error fetching dean stats:', error)
    }
  }

  const fetchSubmissionTimeline = async () => {
    try {
      const response = await fetch('/api/dean/results/submission-timeline', { credentials: 'include' })
      if (!response.ok) {
        throw new Error('Failed to fetch dean submission timeline')
      }

      const data = await response.json()
      setSubmissionTimeline((data.results || []).slice(0, 8))
    } catch (error) {
      console.error('Error fetching dean submission timeline:', error)
      setSubmissionTimeline([])
    }
  }

  const getTimelinePointClass = (status) => {
    if (status === 'Approved') return 'text-emerald-600'
    if (status === 'Rejected') return 'text-red-600'
    return 'text-amber-600'
  }

  const summaryCards = [
    {
      title: 'Registered Students',
      value: stats.RegisteredStudents,
      note: 'Students registered for current session.',
      icon: Users,
      tone: 'text-blue-700 bg-blue-50'
    },
    {
      title: 'Number Of Courses',
      value: stats.TotalCourses,
      note: 'Courses registered for current semester.',
      icon: BookOpen,
      tone: 'text-emerald-700 bg-emerald-50'
    },
    {
      title: 'Results Submitted',
      value: stats.SubmittedResults,
      note: 'Results submitted for current semester.',
      icon: ClipboardCheck,
      tone: 'text-violet-700 bg-violet-50'
    },
    {
      title: 'Pending Results',
      value: stats.PendingResults,
      note: 'Results pending for current semester.',
      icon: Clock3,
      tone: 'text-amber-700 bg-amber-50'
    }
  ]

  return (
    <main className='flex flex-col w-full p-4'>
      <div className='flex flex-col gap-2 mb-4'>
        <h1 className='text-black font-bold text-2xl'>Dean Dashboard</h1>
        <p className='text-sm text-slate-600'>Faculty-level summary of registrations, courses, submitted results, and pending HOD approvals.</p>
        <div className='text-sm text-slate-500'>Signed in as {deanName}{email ? ` • ${email}` : ''}{sessionInfo.session ? ` • ${sessionInfo.semester} Semester, ${sessionInfo.session}` : ''}</div>
      </div>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4 w-full'>
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className='flex flex-col rounded-xl bg-white p-5 shadow-sm'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <div className='text-sm text-slate-500'>{card.title}</div>
                  <div className='mt-3 text-3xl font-bold text-slate-900'>{card.value}</div>
                </div>
                <div className={`rounded-lg p-3 ${card.tone}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className='mt-3 text-sm leading-6 text-slate-600'>{card.note}</p>
            </div>
          )
        })}
      </section>

      <section className='mt-6 rounded-xl bg-white p-5 shadow-sm'>
        <div className='flex items-start justify-between gap-4 border-b border-slate-200 pb-4'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Lecturer Submission Timeline</h2>
            <p className='mt-1 text-sm text-slate-600'>Recent lecturer submissions across the faculty, ordered by submission time.</p>
          </div>
          <Link
            to='/dean/lecturer-resubmission'
            className='inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors'
          >
            View All
          </Link>
        </div>

        <div className='pt-5'>
          {submissionTimeline.length === 0 ? (
            <div className='rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500'>
              No recent result submissions were found for the current dean view.
            </div>
          ) : (
            <Timeline>
              {submissionTimeline.map((item) => (
                <TimelineItem key={`${item.CourseID}-${item.LecturerID}`}>
                  <TimelinePoint className={getTimelinePointClass(item.SubmissionStatus)} />
                  <TimelineContent>
                    <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
                      <div className='flex flex-col gap-2 md:flex-row md:items-start md:justify-between'>
                        <div>
                          <h3 className='text-sm font-semibold text-slate-900'>
                            {item.LecturerName} submitted {item.CourseCode}
                          </h3>
                          <p className='mt-1 text-sm text-slate-600'>
                            {item.CourseTitle} • {item.DepartmentName} • {item.ProgrammeName} • {item.LevelName}
                          </p>
                          <p className='mt-2 text-xs font-medium uppercase tracking-wide text-slate-500'>
                            Submission Status: {item.SubmissionStatus} • Students: {item.StudentCount}
                          </p>
                        </div>
                        <TimelineTime>
                          {item.SubmittedDate ? new Date(item.SubmittedDate).toLocaleString() : 'No submission date'}
                        </TimelineTime>
                      </div>
                    </div>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          )}
        </div>
      </section>
    </main>
  )
}

export default Dashboard