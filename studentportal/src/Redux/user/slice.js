import { createSlice } from '@reduxjs/toolkit';

// Initial state for the user slice
// This state will hold the current user, their role, loading status, and any error messages
const initialState = {
    currentUser: null,
    role: null, // 'hod', 'lecturer', or 'student'
    department: null,
    isAuthenticated: false,
    error: null,
    loading: false,
    email: null,
    id: null,
    token: null, // JWT token for API authentication
}

// Create a slice for user-related actions and state
// This slice will handle user sign-in actions and manage the user state
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers:  {
        // Sign In Actions
        signInStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        signInSuccess: (state, action) => {
            state.currentUser = action.payload.user;
            state.role = action.payload.role; // Store user role
            state.department = action.payload.department; // Store department info
            state.token = action.payload.token; // Store JWT token
            state.email = action.payload.email; // Store email
            state.id = action.payload.id; // Store user ID
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
        },
        signInFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
        },

        // Update User Actions
        updateStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateSuccess: (state, action) => {
            state.currentUser = action.payload.user;
            // Update role and department if they changed
            if (action.payload.role) {
                state.role = action.payload.role;
            }
            if (action.payload.department) {
                state.department = action.payload.department;
            }
            state.loading = false;
            state.error = null;
        },
        updateFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Delete User Actions
        deleteUserStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        deleteUserSuccess: (state) => {
            state.loading = false;
            state.currentUser = null;
            state. role = null;
            state.department = null;
            state.isAuthenticated = false;
            state.token = null;
            state.error = null;
            state.email = null;
            state.id = null;
        },
        deleteUserFailure: (state, action) => {
            state. loading = false;
            state. error = action.payload;
        },

        // Sign Out Actions
        signOutStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        signOutSuccess: (state) => {
            state.loading = false;
            state.currentUser = null;
            state.role = null;
            state.department = null;
            state.isAuthenticated = false;
            state.token = null;
            state.email = null;
            state.id = null;
            state.error = null;
        },
        signOutFailure: (state, action) => {
            state. loading = false;
            state. error = action.payload;
        },

        // Clear Error Action
        clearError: (state) => {
            state.error = null;
        },

        // Set Role (for testing or manual role switching)
        setRole: (state, action) => {
            state.role = action.payload;
        },

        // Refresh Token Action (for JWT token refresh)
        refreshTokenSuccess: (state, action) => {
            state. token = action.payload.token;
        }
    }
});

export const {
    signInStart,
    signInSuccess,
    signInFailure,
    updateStart,
    updateSuccess,
    updateFailure,
    deleteUserStart,
    deleteUserFailure,
    deleteUserSuccess,
    signOutStart,
    signOutSuccess,
    signOutFailure,
    clearError,
    setRole,
    refreshTokenSuccess
} = userSlice.actions;

export default userSlice.reducer;