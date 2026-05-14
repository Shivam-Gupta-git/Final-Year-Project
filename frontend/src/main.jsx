import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './app/store.js'
import { BrowserRouter } from 'react-router-dom'
import Page404 from './components/Page404.jsx'
import { WishlistProvider } from './components/WishlistContext.jsx'


const isOnline = navigator.onLine

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <WishlistProvider>
        {isOnline ? (
          <App />
        ) : (
          <Page404 type='offline' />
        )}
      </WishlistProvider>
    </Provider>
  </BrowserRouter>
 
)
