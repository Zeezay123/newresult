import React from 'react'
import { useDispatch } from 'react-redux';
import { signOutStart, signOutFailure, signOutSuccess } from '../../Redux/user/slice';
import { useNavigate } from 'react-router-dom';

const Signout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    dispatch(signOutStart());

  const response = await  fetch('/api/auth/signout', { credentials: 'include'})
    navigate('/staff-login');
   
    if (response.ok) {
      dispatch(signOutSuccess());
    } else {
      const errorData = await response.json();
      dispatch(signOutFailure(errorData.message || 'Failed to sign out'));
    }

  };

  React.useEffect(() => {
    handleSignOut();
  }, []);


  return (
    <div>Goodbye.....</div>
  )
}

export default Signout