import React, { useEffect, useState } from 'react'
import DashboardCard from '../../components/Layout/advisor/DashboardCard'
import ResultsTable from '../../components/Layout/advisor/ResultsTable'
import { useDispatch, useSelector } from 'react-redux'
import { signInFailure, signInStart, signInSuccess } from '../../Redux/user/slice.js'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'

const Dashboard = () => {
  const [isHod, setIsHod] = useState(false);
  const [isLecturer, setIsLecturer] = useState(false);

  const user = useSelector((state) => state.user.id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/advisor/roles/getroles', { credentials: 'include' });
      const data = await response.json();
      setIsHod(data.isHod);
      setIsLecturer(data.isLecturer);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const goToLecturerDash = async () => {
    try {
      dispatch(signInStart());
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: user, role: 'Lecturer' }),
      });
      const alldata = await response.json();
      const data = alldata.user;
      if (alldata.success === false) {
        return dispatch(signInFailure(alldata.message || "Can't login"));
      }
      if (response.ok) {
        dispatch(signInSuccess({
          user: data.user,
          role: data.role,
          department: data.department,
          token: alldata.token,
          id: data.id,
          email: data.email,
        }));
        return navigate('/redirect');
      }
    } catch (error) {
      dispatch(signInFailure(error.message || "Couldn't switch dashboard"));
    }
  };

  const goToHodDash = async () => {
    try {
      dispatch(signInStart());
      const response = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: user }),
      });
      const alldata = await response.json();
      const data = alldata.user;
      if (alldata.success === false) {
        return dispatch(signInFailure(alldata.message || "Can't login"));
      }
      if (response.ok) {
        dispatch(signInSuccess({
          user: data.user,
          role: data.role,
          department: data.department,
          token: alldata.token,
          id: data.id,
          email: data.email,
        }));
        return navigate('/redirect');
      }
    } catch (error) {
      dispatch(signInFailure(error.message || "Couldn't switch dashboard"));
    }
  };

  return (
    <main className='flex flex-col w-full p-4'>
      <div className='bg-white rounded-lg shadow-sm flex items-center justify-between p-4'>
        <div className='py-4 px-2'>
          <h1 className='text-3xl font-bold text-black'>Level Advisor Dashboard</h1>
          <p className='text-sm text-slate-500'>Review and approve student results</p>
        </div>

        <div className='flex gap-4'>
          {isLecturer && <Button text="Lecturer Dashboard" onClick={goToLecturerDash} />}
          {isHod && <Button text="HOD Dashboard" onClick={goToHodDash} />}
        </div>
      </div>

      <DashboardCard />

      <div className='mt-6'>
        <h2 className='text-xl font-semibold text-gray-800 mb-4'>Recent Results</h2>
        <ResultsTable />
      </div>
    </main>
  )
}

export default Dashboard