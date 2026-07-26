import { useState, useEffect } from 'react'
import { obtenerClientes } from '../services/clienteService'
import { obtenerMovimientos } from '../services/movimientoService'
import { obtenerProductos } from '../services/productoService'

const mesActual = () => new Date().toISOString().slice(0, 7)

function Dashboard() {
    const [clientes, setClientes] = useState([])
    const [movimientos, setMovimientos] = useState([])
    const [productos, setProductos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setCargando(true)
                const [dataClientes, dataMovimientos, dataProductos] = await Promise.all([
                    obtenerClientes(),
                    obtenerMovimientos(),
                    obtenerProductos(),
                ])
                setClientes(dataClientes)
                setMovimientos(dataMovimientos)
                setProductos(dataProductos)
                setError('')
            } catch (err) {
                setError('No se pudo cargar el resumen. Revisa que el backend esté corriendo.')
            } finally {
                setCargando(false)
            }
        }
        cargarDatos()
    }, [])

    if (cargando) {
        return <p className="text-gray-400 text-sm">Cargando resumen...</p>
    }

    if (error) {
        return <p className="text-red-500 text-sm">{error}</p>
    }

    const movimientosDelMes = movimientos.filter((m) => m.fecha.slice(0, 7) === mesActual())
    const ingresos = movimientosDelMes.reduce((sum, m) => sum + Number(m.ingreso), 0)
    const egresos = movimientosDelMes.reduce((sum, m) => sum + Number(m.egreso), 0)
    const utilidad = ingresos - egresos

    const clientasActivas = clientes.filter((c) => c.estado === 'activo').length
    const clientesParaLlamar = clientes.filter((c) => c.estado === 'llamar')

    const mesHoy = new Date().getMonth() + 1
    const diaHoy = new Date().getDate()

    // Todos los cumpleaños de este mes (pasados y futuros)
    const cumpleañosEsteMes = clientes
        .filter((c) => c.fechaCumpleanos && Number(c.fechaCumpleanos.split('-')[1]) === mesHoy)
        .map((c) => {
            const dia = Number(c.fechaCumpleanos.split('-')[2])
            return { ...c, dia, diasFaltantes: dia - diaHoy }
        })
        .sort((a, b) => a.dia - b.dia)

    const alertasInventario = productos.filter((p) => p.estado === 'bajo').length

    const hoyTexto = new Date().toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Resumen General</h1>
                <p className="text-sm text-gray-400">Hoy es {hoyTexto}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 border border-green-100 rounded-xl p-5 text-center">
                    <p className="text-xs text-green-600 font-medium mb-1">Ingresos</p>
                    <p className="text-2xl font-bold text-green-700">S/ {ingresos.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-1">Este mes</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center">
                    <p className="text-xs text-red-600 font-medium mb-1">Egresos</p>
                    <p className="text-2xl font-bold text-red-700">S/ {egresos.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-1">Este mes</p>
                </div>
                <div className="bg-pink-50 border border-pink-100 rounded-xl p-5 text-center">
                    <p className="text-xs text-pink-600 font-medium mb-1">Utilidad</p>
                    <p className="text-2xl font-bold text-pink-700">S/ {utilidad.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-1">Este mes</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 text-center">
                    <p className="text-xs text-purple-600 font-medium mb-1">Clientas activas</p>
                    <p className="text-2xl font-bold text-purple-700">{clientasActivas}</p>
                    <p className="text-xs text-gray-400 mt-1">Total</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5 text-center">
                    <p className="text-xs text-yellow-600 font-medium mb-1">Cumpleaños</p>
                    <p className="text-2xl font-bold text-yellow-700">{cumpleañosEsteMes.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Este mes</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 text-center">
                    <p className="text-xs text-orange-600 font-medium mb-1">Inventario</p>
                    <p className="text-2xl font-bold text-orange-700">{alertasInventario}</p>
                    <p className="text-xs text-gray-400 mt-1">Alertas</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Próximos cumpleaños */}
                <div className="bg-white rounded-xl border border-pink-100 overflow-hidden">
                    <div className="px-5 py-3 border-b border-pink-50">
                        <h2 className="text-sm font-semibold text-gray-700">Cumpleaños de este mes</h2>
                    </div>
                    {cumpleañosEsteMes.length === 0 ? (
                        <p className="p-5 text-sm text-gray-400">No hay cumpleaños este mes.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="bg-pink-50/50 text-left text-gray-500">
                                <th className="px-5 py-2 font-medium">Fecha</th>
                                <th className="px-5 py-2 font-medium">Nombre</th>
                                <th className="px-5 py-2 font-medium">Estado</th>
                            </tr>
                            </thead>
                            <tbody>
                            {cumpleañosEsteMes.map((c) => (
                                <tr key={c.dni} className="border-t border-pink-50">
                                    <td className="px-5 py-2 text-gray-500">
                                        {String(c.dia).padStart(2, '0')}/{String(mesHoy).padStart(2, '0')}
                                    </td>
                                    <td className="px-5 py-2 text-gray-700">{c.nombre}</td>
                                    <td className="px-5 py-2 text-gray-500">
                                        {c.diasFaltantes > 0 && `En ${c.diasFaltantes} días`}
                                        {c.diasFaltantes === 0 && 'Hoy 🎉'}
                                        {c.diasFaltantes < 0 && 'Ya pasó'}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Clientes para llamar */}
                <div className="bg-white rounded-xl border border-pink-100 overflow-hidden">
                    <div className="px-5 py-3 border-b border-pink-50">
                        <h2 className="text-sm font-semibold text-gray-700">Para llamar</h2>
                    </div>
                    {clientesParaLlamar.length === 0 ? (
                        <p className="p-5 text-sm text-gray-400">No hay clientas pendientes de contactar.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="bg-pink-50/50 text-left text-gray-500">
                                <th className="px-5 py-2 font-medium">Nombre</th>
                                <th className="px-5 py-2 font-medium">Última visita</th>
                                <th className="px-5 py-2 font-medium">Celular</th>
                            </tr>
                            </thead>
                            <tbody>
                            {clientesParaLlamar.map((c) => (
                                <tr key={c.dni} className="border-t border-pink-50">
                                    <td className="px-5 py-2 text-gray-700">{c.nombre}</td>
                                    <td className="px-5 py-2 text-gray-500">{c.fechaUltimaVisita || '—'}</td>
                                    <td className="px-5 py-2 text-gray-500">{c.celular || '—'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard