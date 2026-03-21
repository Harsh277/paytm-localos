import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Merchant from './pages/Merchant'
import FSE from './pages/FSE'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/merchant" element={<Merchant />} />
      <Route path="/fse" element={<FSE />} />
    </Routes>
  )
}

export default App
