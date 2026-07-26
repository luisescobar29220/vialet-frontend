import { useState, useEffect } from 'react'
import { obtenerClientes, crearCliente, actualizarCliente, eliminarCliente } from '../services/clienteService'

const formVacio = { dni: '', nombre: '', fechaCumpleanos: '', instagram: '', celular: '' }

function Clientes() {
    const [clientes, setClientes] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [editando, setEditando] = useState(null) // DNI del cliente en edición, o null

    const [formData, setFormData] = useState(formVacio)

    const cargarClientes = async () => {
        try {
            setCargando(true)
            const data = await obtenerClientes()
            setClientes(data)
            setError('')
        } catch (err) {
            setError('No se pudo cargar la base de clientes. Revisa que el backend esté corriendo.')
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarClientes()
    }, [])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const abrirNuevo = () => {
        setFormData(formVacio)
        setEditando(null)
        setMostrarFormulario(true)
    }

    const abrirEdicion = (cliente) => {
        setFormData({
            dni: cliente.dni,
            nombre: cliente.nombre,
            fechaCumpleanos: cliente.fechaCumpleanos || '',
            instagram: cliente.instagram || '',
            celular: cliente.celular || '',
        })
        setEditando(cliente.dni)
        setMostrarFormulario(true)
    }

    const cancelar = () => {
        setMostrarFormulario(false)
        setEditando(null)
        setFormData(formVacio)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const payload = {
                ...formData,
                dni: Number(formData.dni),
                fechaCumpleanos: formData.fechaCumpleanos || null,
            }

            if (editando) {
                await actualizarCliente(editando, payload)
            } else {
                await crearCliente(payload)
            }

            cancelar()
            cargarClientes()
        } catch (err) {
            alert(err.response?.data || 'Error al guardar el cliente')
        }
    }

    const handleEliminar = async (dni) => {
        if (!confirm(`¿Eliminar al cliente con DNI ${dni}?`)) return
        try {
            await eliminarCliente(dni)
            cargarClientes()
        } catch (err) {
            alert('Error al eliminar el cliente')
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Base de Clientes</h1>
                <button
                    onClick={mostrarFormulario ? cancelar : abrirNuevo}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    {mostrarFormulario ? 'Cancelar' : '+ Agregar cliente'}
                </button>
            </div>

            {mostrarFormulario && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl border border-pink-100 p-6 mb-6 grid grid-cols-2 gap-4"
                >
                    <input
                        name="dni"
                        type="number"
                        value={formData.dni}
                        onChange={handleChange}
                        placeholder="DNI"
                        required
                        disabled={!!editando}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                    <input
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Nombre completo"
                        required
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Fecha de cumpleaños</label>
                        <input
                            name="fechaCumpleanos"
                            type="date"
                            value={formData.fechaCumpleanos}
                            onChange={handleChange}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                    </div>
                    <input
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleChange}
                        placeholder="Instagram (ej: @usuario)"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                    <input
                        name="celular"
                        value={formData.celular}
                        onChange={handleChange}
                        placeholder="Celular"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                    <button
                        type="submit"
                        className="bg-pink-500 hover:bg-pink-600 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    >
                        {editando ? 'Guardar cambios' : 'Guardar cliente'}
                    </button>
                </form>
            )}

            <div className="bg-white rounded-xl border border-pink-100 overflow-hidden">
                {cargando ? (
                    <p className="p-6 text-gray-400 text-sm">Cargando clientes...</p>
                ) : error ? (
                    <p className="p-6 text-red-500 text-sm">{error}</p>
                ) : clientes.length === 0 ? (
                    <p className="p-6 text-gray-400 text-sm">No hay clientes registrados todavía.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="bg-pink-50 text-left text-gray-500">
                            <th className="px-4 py-3 font-medium">DNI</th>
                            <th className="px-4 py-3 font-medium">Nombre</th>
                            <th className="px-4 py-3 font-medium">Cumpleaños</th>
                            <th className="px-4 py-3 font-medium">Instagram</th>
                            <th className="px-4 py-3 font-medium">Celular</th>
                            <th className="px-4 py-3 font-medium">Última visita</th>
                            <th className="px-4 py-3 font-medium">Estado</th>
                            <th className="px-4 py-3 font-medium"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {clientes.map((c) => (
                            <tr key={c.dni} className="border-t border-pink-50">
                                <td className="px-4 py-3 text-gray-700">{c.dni}</td>
                                <td className="px-4 py-3 text-gray-700">{c.nombre}</td>
                                <td className="px-4 py-3 text-gray-500">{c.fechaCumpleanos || '—'}</td>
                                <td className="px-4 py-3 text-gray-500">{c.instagram || '—'}</td>
                                <td className="px-4 py-3 text-gray-500">{c.celular || '—'}</td>
                                <td className="px-4 py-3 text-gray-500">{c.fechaUltimaVisita || '—'}</td>
                                <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {c.estado}
                    </span>
                                </td>
                                <td className="px-4 py-3 text-right space-x-3">
                                    <button
                                        onClick={() => abrirEdicion(c)}
                                        className="text-pink-500 hover:text-pink-700 text-xs font-medium"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleEliminar(c.dni)}
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

export default Clientes