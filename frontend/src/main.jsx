import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import {ReducerProvider} from './context/AppReducer.jsx'
import {BrowserRouter} from 'react-router-dom';


createRoot(document.getElementById('root')).render(

  <StrictMode>
    <BrowserRouter>
    <ReducerProvider>
    <AppProvider>
    <App />
    </AppProvider>
    </ReducerProvider>
    </BrowserRouter>
  </StrictMode>,
)
