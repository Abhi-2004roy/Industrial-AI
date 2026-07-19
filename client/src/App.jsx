import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from './routes'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import { MouseGlow } from './components/common/MouseGlow'
import './styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <QueryClientProvider client={queryClient}>
            <MouseGlow />
            <RouterProvider router={router} />
          </QueryClientProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

