import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import Home from './Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LearningModule from './pages/LearningModule.jsx'
import Stories from './pages/Stories.jsx'
import LearnerDashboard from './pages/LearnerDashboard.jsx'
import BookLibrary from './pages/BookLibrary.jsx'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/learn" element={<LearnerDashboard />} />
        <Route path="/library" element={<BookLibrary />} />
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/modules/:moduleId"
          element={<LearningModule />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
