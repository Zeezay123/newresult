import { Select, TextInput } from 'flowbite-react'
import { CheckCircle, CircleQuestionMark, ClockAlert, FileCheck, FileX, LucideAlignEndVertical, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import {useSelector} from 'react-redux'

const AssignAdvisors = () => {
const [lecturers, setLecturers] = useState([]);
const [levels, setLevels] = useState([]);
const [selectedAdvisor, setSelectedAdvisor] = useState('');
const [Advisors, setAdvisors] = useState([]);
const [programmes, setProgrammes] = useState([]);
const [selectedProgramme, setSelectedProgramme] = useState('');
const [selectedLevel, setSelectedLevel] = useState('');

// Filter and pagination states
const [searchTerm, setSearchTerm] = useState('');
const [filterLevel, setFilterLevel] = useState('');
const [filterProgramme, setFilterProgramme] = useState('');
const [page, setPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);

const departmentid = useSelector(state=>state.user.department)

// const Advisors = [{level:'100 Level'},
//     {name:'Adeyemi Olamide', staffCode:'STF001', LevelID:1},
//     {name:'Oke Chrisrian', staffCode:'STF002', LevelID:2},
//     {name:'Akinola Tobi', staffCode:'STF003', LevelID:3},
//     {name:'Ogunleye Mercy', staffCode:'STF004', LevelID:4}
// ]

useEffect(() => {
  // fetchLecturers();
  // fetchLevels();
  fetchAdvisors();
  fetchProgrammes();
  fetchLevelAndLecturers();
}, [])

// get level and lecturers for advisor assignment

const fetchLevelAndLecturers = async () => {
  try {
    const res = await fetch(`/api/hod/advisors/levelandlecturers`, { credentials: 'include' });
    if(!res.ok){
      console.error("Failed to fetch level and lecturers");
      return;
    }

    const data = await res.json();
    console.log('Level and Lecturers:', data);
    setLevels(data.levels || []);
    setLecturers(data.advisors || []);
  } catch (error) {
    console.error("Failed to fetch level and lecturers:", error);
  }
}

// Get programmes role
const fetchProgrammes = async () => {
  try{
const res = await fetch(`/api/programmes`, { credentials: 'include' });
if(!res.ok){
  console.log("cant fetch programmes");
  return
}

const data = await res.json()
console.log('Programmes:', data);
setProgrammes(data.programmes || []);
  }catch(err){
    console.error("Failed to fetch programmes:", err);
  }
}


const fetchAdvisors = async () => {
  try {
    const res = await fetch (`/api/hod/advisors/assignedadvisors/${departmentid}`, { credentials: 'include' });

    if(!res.ok){
      console.error("Failed to fetch lecturers");
      return;
    }

    const data = await res.json();
    console.log('News Advisors:', data.assignedAdvisors);
    setAdvisors(data.assignedAdvisors || []);
    
  }catch(err){
    console.error("Failed to fetch advisor data:", err);
  }

}




const HandleAssign = async (levelId, advisor,programme )=>{
  console.log('Assigning advisor for level:', levelId, 'with advisor:', advisor, 'for programme:', programme);

try {
    const res = await fetch('/api/hod/advisors/assignadvisor', {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            LevelID: levelId,
            StaffCode: advisor,
            DepartmentID:departmentid,
            ProgrammeID: programme
        })
    });

    if(!res.ok){
        console.log("Failed to assign advisor",res.statusText);
        return;
    }

    console.log("Advisor assigned successfully");

} catch (error) {
    console.log("Failed to assign advisor:", error);
}



}

// Filter advisors based on search and filters
const filteredAdvisors = Advisors.filter((advisor) => {
  const matchSearch = searchTerm === '' || 
    advisor.LevelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.ProgrammeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.StaffName.toLowerCase().includes(searchTerm.toLowerCase());
  
  const matchLevel = filterLevel === '' || advisor.LevelID == filterLevel;
  const matchProgramme = filterProgramme === '' || advisor.ProgrammeID == filterProgramme;
  
  return matchSearch && matchLevel && matchProgramme;
});

// Pagination logic
const totalPages = Math.ceil(filteredAdvisors.length / itemsPerPage);
const pagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);
const startIndex = (page - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedAdvisors = filteredAdvisors.slice(startIndex, endIndex);

const unassignedAdvisors = levels.length - Advisors.length;
  return (
    <div className='flex flex-col gap-4 p-4'>
      {/* Header */}
      <div className='flex flex-col gap-2 mb-2'>
        <h1 className='text-2xl font-bold text-black'>Assign Advisors</h1>
        <p className='text-sm text-slate-600'>View and manage advisor assignments for students in your department.</p>
      </div>

      {/* Statistics Cards */}
      <section className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-500'>Levels</p>
              <p className='text-2xl font-bold text-gray-900'>{levels.length || '-'}</p>
            </div>
            <div className='bg-blue-50 flex items-center justify-center p-2 rounded-md text-blue-700'>
              <LucideAlignEndVertical size={20} />
            </div>
          </div>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-500'>Assigned Advisors</p>
              <p className='text-2xl font-bold text-gray-900'>{Advisors.length || '-'}</p>
            </div>
            <div className='bg-green-50 flex items-center justify-center p-2 rounded-md text-green-600'>
              <CheckCircle size={20} />
            </div>
          </div>
        </div>

       
      </section>

      {/* New Assignment Section */}
      <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
        <div className='p-4 border-b border-gray-200'>
          <h2 className='font-semibold text-lg'>New Assignment</h2>
          <p className='text-sm text-gray-500'>Assign advisors to levels in your department</p>
        </div>

        <div className='p-4'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium text-gray-700'>Select Programme</label>
              <Select onChange={(e) => setSelectedProgramme(e.target.value)} value={selectedProgramme}>
                <option value="">Select Programme</option>
                {programmes.length > 0 ? (
                  programmes.map((programme) => (
                    <option key={programme.ProgrammeID} value={programme.ProgrammeID}>{programme.ProgrammeName}</option>
                  ))
                ) : 'No programmes available'}
              </Select>
            </div>

            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium text-gray-700'>Select Level</label>
              <Select onChange={(e) => setSelectedLevel(e.target.value)} value={selectedLevel}>
                <option value="">Select Level</option>
                {levels.length > 0 ? (
                  levels.map((level) => (
                    <option key={level.LevelID} value={level.LevelID}>{level.LevelName}</option>
                  ))
                ) : 'No levels available'}
              </Select>
            </div>

            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium text-gray-700'>Select Advisor</label>
              <Select onChange={(e) => setSelectedAdvisor(e.target.value)} value={selectedAdvisor}>
                <option value="">Select Advisor</option>
                {lecturers.length > 0 ? (
                  lecturers.map((lecturer) => (
                    <option key={lecturer.StaffID} value={lecturer.StaffNo}>{lecturer.StaffName}</option>
                  ))
                ) : 'No lecturers available'}
              </Select>
            </div>

            <div className='flex items-end'>
              <Button text='Assign' onClick={() => HandleAssign(selectedLevel, selectedAdvisor, selectedProgramme)} />
            </div>
          </div>
        </div>
      </div>

      {/* All Assignments Table */}
      <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
        <div className='p-4 border-b border-gray-200'>
          <h2 className='font-semibold text-lg'>All Assignments</h2>
          <p className='text-sm text-gray-500'>View all assigned advisors for your department</p>
        </div>

        {/* Filters Section */}
        <div className='p-4 border-b border-gray-200 bg-gray-50'>
          <div className='flex items-center gap-2 mb-4'>
            <Search size={18} className='text-gray-600' />
            <h3 className='font-semibold text-sm'>Search & Filter</h3>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='flex flex-col gap-2'>
              <label className='text-xs font-medium text-gray-700'>Search</label>
              <TextInput
                type='search'
                placeholder='Search by level, programme, or advisor...'
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1); // Reset to first page
                }}
                sizing='sm'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-xs font-medium text-gray-700'>Filter by Level</label>
              <Select 
                value={filterLevel} 
                onChange={(e) => {
                  setFilterLevel(e.target.value);
                  setPage(1);
                }}
                sizing='sm'
              >
                <option value="">All Levels</option>
                {levels.length > 0 ? (
                  levels.map((level) => (
                    <option key={level.LevelID} value={level.LevelID}>{level.LevelName}</option>
                  ))
                ) : null}
              </Select>
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-xs font-medium text-gray-700'>Filter by Programme</label>
              <Select 
                value={filterProgramme} 
                onChange={(e) => {
                  setFilterProgramme(e.target.value);
                  setPage(1);
                }}
                sizing='sm'
              >
                <option value="">All Programmes</option>
                {programmes.length > 0 ? (
                  programmes.map((programme) => (
                    <option key={programme.ProgrammeID} value={programme.ProgrammeID}>{programme.ProgrammeName}</option>
                  ))
                ) : null}
              </Select>
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-xs font-medium text-gray-700'>Items Per Page</label>
              <Select 
                value={itemsPerPage} 
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setPage(1);
                }}
                sizing='sm'
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className='px-4 pt-4 pb-2'>
          <p className='text-xs text-gray-600'>
            Showing {filteredAdvisors.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredAdvisors.length)} of {filteredAdvisors.length} assignments
          </p>
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left text-gray-600'>
            <thead className='bg-slate-50 border-b border-gray-200'>
              <tr>
                <th className='p-4 font-semibold text-gray-900'>Level</th>
                <th className='p-4 font-semibold text-gray-900'>Programme</th>
                <th className='p-4 font-semibold text-gray-900'>Advisor / Coordinator</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAdvisors.length > 0 ? (
                paginatedAdvisors.map((advisor) => (
                  <tr key={advisor.AdvisorID} className='border-b border-gray-200 hover:bg-gray-50'>
                    <td className='p-4'>{advisor.LevelName}</td>
                    <td className='p-4'>{advisor.ProgrammeName}</td>
                    <td className='p-4 font-medium text-gray-900'>{advisor.StaffName}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className='p-8 text-center text-gray-400'>No assignments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginatedAdvisors.length > 0 && totalPages > 1 && (
          <div className='flex p-4 items-center justify-between border-t border-gray-200'>
            <div className='text-xs text-gray-500'>
              Page {page} of {totalPages}
            </div>
            
            <div className='flex items-center gap-4'>
              {/* Previous Button */}
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className={`flex items-center justify-center rounded-full border border-slate-300 p-1 ${
                  page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
                disabled={page === 1}
              >
                <ChevronLeft size={18} />
              </button>

              {/* Page Numbers */}
              <div className='flex text-xs gap-2 items-center text-gray-500'>
                {pagesArray.map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`border border-slate-300 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                      pageNum === page
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className={`flex items-center justify-center rounded-full border border-slate-300 p-1 ${
                  page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
                disabled={page === totalPages}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AssignAdvisors