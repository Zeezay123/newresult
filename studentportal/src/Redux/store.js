import { configureStore, combineReducers } from '@reduxjs/toolkit'
import userReducer from './user/slice.js'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import persistStore from 'redux-persist/es/persistStore'

// Create a Redux store with the user reducer
// This store will manage the state of the user in the application

const rootReducer = combineReducers ({
    user: userReducer
})

const persistConfig = {
    key: 'root',
    storage,
    version: 1,
}

const persistedReducer = persistReducer(persistConfig, rootReducer) 

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
        serializableCheck: false, // disable serializable check for redux persist
    }),
  
})

export const persistor = persistStore(store) 