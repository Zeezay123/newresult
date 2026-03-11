import React from 'react'
import { Table, TextInput } from 'flowbite-react'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'

const Departments = () => {
  const [departments, setDepartments] = React.useState([])
  const [filteredDepartments, setFilteredDepartments] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')

  React.useEffect(() => {
    fetchDepartments()
  }, [])

  React.useEffect(() => {
    filterDepartments()
  }, [searchTerm, departments])

  const fetchDepartments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/senate/departments`, {
        credentials: 'include'
      })

      if (!response.ok) {
        console.error('Failed to fetch departments')
        return
      }

      const data = await response.json()
      setDepartments(data.departments || [])
      setFilteredDepartments(data.departments || [])
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterDepartments = () => {
    if (!searchTerm) {
      setFilteredDepartments(departments)
      return
    }

    const filtered = departments.filter((dept) =>
      dept.DepartmentName?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    setFilteredDepartments(filtered)
  }

  return (
    <main className="flex flex-col w-full p-4">
      <div className="py-4 px-2">
        <h1 className="text-3xl font-bold text-black">Departments Overview</h1>
        <p className="text-sm text-slate-500">View department statistics and performance</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <TextInput
          icon={Search}
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-slate-600 text-sm">Total Departments</p>
          <p className="text-2xl font-bold text-gray-900">{filteredDepartments.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-slate-600 text-sm">Total Students</p>
          <p className="text-2xl font-bold text-blue-600">
            {filteredDepartments.reduce((sum, d) => sum + (d.TotalStudents || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-slate-600 text-sm">Average Pass Rate</p>
          <p className="text-2xl font-bold text-green-600">
            {filteredDepartments.length > 0
              ? (filteredDepartments.reduce((sum, d) => sum + (d.PassRate || 0), 0) / filteredDepartments.length).toFixed(1)
              : 0}%
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 bg-white rounded-lg">Loading departments...</div>
      ) : filteredDepartments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-slate-500">No departments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Department</Table.HeadCell>
                <Table.HeadCell>Total Students</Table.HeadCell>
                <Table.HeadCell>Total Courses</Table.HeadCell>
                <Table.HeadCell>Pass Rate</Table.HeadCell>
                <Table.HeadCell>Average GPA</Table.HeadCell>
                <Table.HeadCell>Trend</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {filteredDepartments.map((dept) => (
                  <Table.Row key={dept.DepartmentID} className="bg-white hover:bg-slate-50">
                    <Table.Cell className="font-medium text-gray-900">
                      {dept.DepartmentName}
                    </Table.Cell>
                    <Table.Cell>{dept.TotalStudents || 0}</Table.Cell>
                    <Table.Cell>{dept.TotalCourses || 0}</Table.Cell>
                    <Table.Cell>
                      <span className={`font-semibold ${
                        (dept.PassRate || 0) >= 70 ? 'text-green-600' : 
                        (dept.PassRate || 0) >= 50 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {(dept.PassRate || 0).toFixed(1)}%
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {(dept.AverageGPA || 0).toFixed(2)}
                    </Table.Cell>
                    <Table.Cell>
                      {(dept.Trend || 0) > 0 ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp size={16} />
                          <span className="text-sm">+{dept.Trend}%</span>
                        </div>
                      ) : (dept.Trend || 0) < 0 ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <TrendingDown size={16} />
                          <span className="text-sm">{dept.Trend}%</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">No change</span>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </div>
      )}
    </main>
  )
}

export default Departments
