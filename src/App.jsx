import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import Movimientos from './pages/Movimientos'
import Inventario from './pages/Inventario'

function App() {
    return (
        <div className="flex bg-pink-50/30 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/clientes" element={<Clientes />} />
                    <Route path="/movimientos" element={<Movimientos />} />
                    <Route path="/inventario" element={<Inventario />} />
                </Routes>
            </main>
        </div>
    )
}

export default App