import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Room from './pages/Room'
import Create from './pages/Create'
import My from './pages/My'
import Login from './pages/Login'
import AuthCallback from './pages/Auth/Callback'
import CreateDone from './pages/Create/Done'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/r/:roomCode" element={<Room />} />
        <Route path="/create" element={<Create />} />
        <Route path="/my" element={<My />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/create/done" element={<CreateDone />} />
      </Routes>
    </BrowserRouter>
  )
}