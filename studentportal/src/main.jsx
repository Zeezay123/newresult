import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store, persistor } from './Redux/store.js'
import { PersistGate } from 'redux-persist/integration/react'
import { toApiUrl } from './config/api.js'

const originalFetch = globalThis.fetch.bind(globalThis);

globalThis.fetch = (input, init) => {
  if (typeof input === 'string') {
    return originalFetch(toApiUrl(input), init);
  }

  if (input instanceof URL) {
    return originalFetch(new URL(toApiUrl(input.toString())), init);
  }

  if (input instanceof Request) {
    return originalFetch(new Request(toApiUrl(input.url), input), init);
  }

  return originalFetch(input, init);
};


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
)
