import { NavLink } from 'react-router-dom'

const menuItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/clientes', label: 'Base de Clientes', icon: '👤' },
    { path: '/movimientos', label: 'Movimientos', icon: '💰' },
    { path: '/inventario', label: 'Inventario', icon: '📦' },
]

function Sidebar() {
    return (
        <aside className="w-64 min-h-screen bg-white border-r border-pink-100 flex flex-col">
            <div className="p-6 border-b border-pink-100">
                <h1 className="text-2xl font-bold text-pink-600">Vialet</h1>
                <p className="text-sm text-gray-400">Studio</p>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-pink-100 text-pink-700'
                                    : 'text-gray-600 hover:bg-pink-50'
                            }`
                        }
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}

export default Sidebar