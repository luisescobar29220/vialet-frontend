import { useState, useEffect, useMemo } from 'react'
import { obtenerMovimientos, crearMovimiento, eliminarMovimiento } from '../services/MovimientoService'
import { obtenerClientes } from '../services/clienteService'
import { obtenerNota, guardarNota } from '../services/notaService'

const formVacio = { dni: '', nombre: '', descripcion: '', ingreso: '', egreso: '' }
const OTRO = '__otro__'

const claveMes = (fechaStr) => fechaStr.slice(0, 7) // "2026-07-23" -> "2026-07"

const nombreMes = (clave) => {
    const [anio, mes] = clave.split('-')
    const fecha = new Date(Number(anio), Number(mes) - 1, 1)
    const texto = fecha.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
    return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function Movimientos() {
    const [movimientos, setMovimientos] = useState([])
    const [clientes, setClientes] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [formData, setFormData] = useState(formVacio)
    const [clienteSeleccionado, setClienteSeleccionado] = useState('')
    const [mesSeleccionado, setMesSeleccionado] = useState(claveMes(new Date().toISOString()))
    const [mostrarNotas, setMostrarNotas] = useState(false)
    const [contenidoNota, setContenidoNota] = useState('')
    const [guardandoNota, setGuardandoNota] = useState(false)
    const [busquedaCliente, setBusquedaCliente] = useState('')
    const [mostrarListaClientes, setMostrarListaClientes] = useState(false)

    const cargarDatos = async () => {
        try {
            setCargando(true)
            const [dataMovimientos, dataClientes] = await Promise.all([
                obtenerMovimientos(),
                obtenerClientes(),
            ])
            dataMovimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha) || b.id - a.id)
            setMovimientos(dataMovimientos)
            setClientes(dataClientes)
            setError('')
        } catch (err) {
            setError('No se pudo cargar los movimientos. Revisa que el backend esté corriendo.')
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarDatos()
    }, [])

    useEffect(() => {
        obtenerNota(mesSeleccionado).then(setContenidoNota).catch(() => setContenidoNota(''))
    }, [mesSeleccionado])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const clientesFiltrados = useMemo(() => {
        if (!busquedaCliente) return clientes
        return clientes.filter((c) =>
            c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase())
        )
    }, [clientes, busquedaCliente])

    const handleSeleccionarCliente = (cliente) => {
        setClienteSeleccionado(String(cliente.dni))
        setFormData({ ...formData, dni: String(cliente.dni), nombre: cliente.nombre })
        setBusquedaCliente(cliente.nombre)
        setMostrarListaClientes(false)
    }

    const handleSeleccionarOtro = () => {
        setClienteSeleccionado(OTRO)
        setFormData({ ...formData, dni: '', nombre: busquedaCliente })
        setMostrarListaClientes(false)
    }

    const handleGuardarNota = async () => {
        setGuardandoNota(true)
        try {
            await guardarNota(mesSeleccionado, contenidoNota)
        } catch (err) {
            alert('No se pudo guardar la nota')
        } finally {
            setGuardandoNota(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const payload = {
                dni: formData.dni ? Number(formData.dni) : null,
                nombre: formData.nombre || null,
                descripcion: formData.descripcion,
                ingreso: formData.ingreso ? Number(formData.ingreso) : 0,
                egreso: formData.egreso ? Number(formData.egreso) : 0,
            }
            await crearMovimiento(payload)
            setFormData(formVacio)
            setClienteSeleccionado('')
            setBusquedaCliente('')
            setMostrarFormulario(false)
            cargarDatos()
        } catch (err) {
            alert(err.response?.data || 'Error al registrar el movimiento')
        }
    }

    const handleEliminar = async (id) => {
        if (!confirm('¿Eliminar este movimiento? Esta acción no se puede deshacer.')) return
        try {
            await eliminarMovimiento(id)
            cargarDatos()
        } catch (err) {
            alert('Error al eliminar el movimiento')
        }
    }

    const mesesDisponibles = useMemo(() => {
        const claves = new Set(movimientos.map((m) => claveMes(m.fecha)))
        claves.add(claveMes(new Date().toISOString()))
        return Array.from(claves).sort((a, b) => b.localeCompare(a))
    }, [movimientos])

    const movimientosDelMes = useMemo(
        () => movimientos.filter((m) => claveMes(m.fecha) === mesSeleccionado),
        [movimientos, mesSeleccionado]
    )

    const totalIngresos = movimientosDelMes.reduce((sum, m) => sum + Number(m.ingreso), 0)
    const totalEgresos = movimientosDelMes.reduce((sum, m) => sum + Number(m.egreso), 0)
    const utilidad = totalIngresos - totalEgresos

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Movimientos</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setMostrarNotas(!mostrarNotas)}
                        className="bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        📝 Bloc de notas
                    </button>
                    <button
                        onClick={() => setMostrarFormulario(!mostrarFormulario)}
                        className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        {mostrarFormulario ? 'Cancelar' : '+ Nuevo movimiento'}
                    </button>
                </div>
            </div>

            <div className="flex gap-2 mb-6 border-b border-pink-100 overflow-x-auto">
                {mesesDisponibles.map((clave) => (
                    <button
                        key={clave}
                        onClick={() => setMesSeleccionado(clave)}
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                            mesSeleccionado === clave
                                ? 'border-pink-500 text-pink-600'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {nombreMes(clave)}
                    </button>
                ))}
            </div>

            {mostrarNotas && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-yellow-700">
                            Notas de {nombreMes(mesSeleccionado)}
                        </p>
                        <button
                            onClick={handleGuardarNota}
                            disabled={guardandoNota}
                            className="text-xs bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-1 rounded-md font-medium transition-colors disabled:opacity-50"
                        >
                            {guardandoNota ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                    <textarea
                        value={contenidoNota}
                        onChange={(e) => setContenidoNota(e.target.value)}
                        placeholder="Apunta aquí lo que necesites recordar de este mes..."
                        rows={5}
                        className="w-full bg-white border border-yellow-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 resize-y"
                    />
                </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                    <p className="text-xs text-green-600 font-medium">Ingresos</p>
                    <p className="text-2xl font-bold text-green-700">S/ {totalIngresos.toFixed(2)}</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-xs text-red-600 font-medium">Egresos</p>
                    <p className="text-2xl font-bold text-red-700">S/ {totalEgresos.toFixed(2)}</p>
                </div>
                <div className="bg-pink-50 border border-pink-100 rounded-xl p-4">
                    <p className="text-xs text-pink-600 font-medium">Utilidad</p>
                    <p className="text-2xl font-bold text-pink-700">S/ {utilidad.toFixed(2)}</p>
                </div>
            </div>

            {mostrarFormulario && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl border border-pink-100 p-6 mb-6 grid grid-cols-2 gap-4"
                >
                    <div className="col-span-2 relative">
                        <label className="block text-xs text-gray-400 mb-1">Cliente</label>
                        <input
                            type="text"
                            value={busquedaCliente}
                            onChange={(e) => {
                                setBusquedaCliente(e.target.value)
                                setMostrarListaClientes(true)
                                setClienteSeleccionado('')
                            }}
                            onFocus={() => setMostrarListaClientes(true)}
                            onBlur={() => setTimeout(() => setMostrarListaClientes(false), 150)}
                            placeholder="Escribe el nombre del cliente..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                        {mostrarListaClientes && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                                {clientesFiltrados.map((c) => (
                                    <li
                                        key={c.dni}
                                        onMouseDown={() => handleSeleccionarCliente(c)}
                                        className="px-3 py-2 text-sm hover:bg-pink-50 cursor-pointer"
                                    >
                                        {c.nombre} — DNI {c.dni}
                                    </li>
                                ))}
                                {busquedaCliente && (
                                    <li
                                        onMouseDown={handleSeleccionarOtro}
                                        className="px-3 py-2 text-sm text-pink-600 hover:bg-pink-50 cursor-pointer border-t border-gray-100"
                                    >
                                        + Usar "{busquedaCliente}" (cliente no registrado)
                                    </li>
                                )}
                            </ul>
                        )}
                    </div>

                    <input
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        placeholder="Descripción del servicio"
                        required
                        className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                    <input
                        name="ingreso"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.ingreso}
                        onChange={handleChange}
                        placeholder="Ingreso (S/)"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                    <input
                        name="egreso"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.egreso}
                        onChange={handleChange}
                        placeholder="Egreso (S/)"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                    <button
                        type="submit"
                        className="col-span-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    >
                        Guardar movimiento
                    </button>
                </form>
            )}

            <div className="bg-white rounded-xl border border-pink-100 overflow-hidden">
                {cargando ? (
                    <p className="p-6 text-gray-400 text-sm">Cargando movimientos...</p>
                ) : error ? (
                    <p className="p-6 text-red-500 text-sm">{error}</p>
                ) : movimientosDelMes.length === 0 ? (
                    <p className="p-6 text-gray-400 text-sm">No hay movimientos en {nombreMes(mesSeleccionado).toLowerCase()}.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="bg-pink-50 text-left text-gray-500">
                            <th className="px-4 py-3 font-medium">Fecha</th>
                            <th className="px-4 py-3 font-medium">Cliente</th>
                            <th className="px-4 py-3 font-medium">Descripción</th>
                            <th className="px-4 py-3 font-medium">Ingreso</th>
                            <th className="px-4 py-3 font-medium">Egreso</th>
                            <th className="px-4 py-3 font-medium">Saldo</th>
                            <th className="px-4 py-3 font-medium"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {movimientosDelMes.map((m) => (
                            <tr key={m.id} className="border-t border-pink-50">
                                <td className="px-4 py-3 text-gray-500">{m.fecha}</td>
                                <td className="px-4 py-3 text-gray-700">{m.nombre || '—'}</td>
                                <td className="px-4 py-3 text-gray-700">{m.descripcion}</td>
                                <td className="px-4 py-3 text-green-600">S/ {Number(m.ingreso).toFixed(2)}</td>
                                <td className="px-4 py-3 text-red-500">S/ {Number(m.egreso).toFixed(2)}</td>
                                <td className="px-4 py-3 font-medium text-gray-800">S/ {Number(m.saldo).toFixed(2)}</td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => handleEliminar(m.id)}
                                        className="text-red-400 hover:text-red-600 text-xs font-medium"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default Movimientos