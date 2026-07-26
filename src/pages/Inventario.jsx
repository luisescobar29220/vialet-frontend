import { useState, useEffect } from 'react'
import { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } from '../services/productoService'

const estadoColores = {
    lleno: 'bg-green-100 text-green-700',
    medio: 'bg-yellow-100 text-yellow-700',
    bajo: 'bg-red-100 text-red-700',
}

const formVacio = { codigo: '', nombreProducto: '', marca: '', categoria: '', cantidad: '' }

function Inventario() {
    const [productos, setProductos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [editando, setEditando] = useState(null) // código del producto en edición, o null

    const [formData, setFormData] = useState(formVacio)

    const cargarProductos = async () => {
        try {
            setCargando(true)
            const data = await obtenerProductos()
            setProductos(data)
            setError('')
        } catch (err) {
            setError('No se pudo cargar el inventario. Revisa que el backend esté corriendo.')
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarProductos()
    }, [])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const abrirNuevo = () => {
        setFormData(formVacio)
        setEditando(null)
        setMostrarFormulario(true)
    }

    const abrirEdicion = (producto) => {
        setFormData({
            codigo: producto.codigo,
            nombreProducto: producto.nombreProducto,
            marca: producto.marca || '',
            categoria: producto.categoria || '',
            cantidad: producto.cantidad,
        })
        setEditando(producto.codigo)
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
            const payload = { ...formData, cantidad: parseInt(formData.cantidad, 10) }

            if (editando) {
                await actualizarProducto(editando, payload)
            } else {
                await crearProducto(payload)
            }

            cancelar()
            cargarProductos()
        } catch (err) {
            alert(err.response?.data || 'Error al guardar el producto')
        }
    }

    const handleEliminar = async (codigo) => {
        if (!confirm(`¿Eliminar el producto ${codigo}?`)) return
        try {
            await eliminarProducto(codigo)
            cargarProductos()
        } catch (err) {
            alert('Error al eliminar el producto')
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
                <button
                    onClick={mostrarFormulario ? cancelar : abrirNuevo}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    {mostrarFormulario ? 'Cancelar' : '+ Agregar producto'}
                </button>
            </div>

            {mostrarFormulario && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl border border-pink-100 p-6 mb-6 grid grid-cols-2 gap-4"
                >
                    <input
                        name="codigo"
                        value={formData.codigo}
                        onChange={handleChange}
                        placeholder="Código (ej: ESM-001)"
                        required
                        disabled={!!editando}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                    <input
                        name="nombreProducto"
                        value={formData.nombreProducto}
                        onChange={handleChange}
                        placeholder="Nombre del producto"
                        required
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                    <input
                        name="marca"
                        value={formData.marca}
                        onChange={handleChange}
                        placeholder="Marca"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                    <input
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleChange}
                        placeholder="Categoría"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                    <input
                        name="cantidad"
                        type="number"
                        min="0"
                        value={formData.cantidad}
                        onChange={handleChange}
                        placeholder="Cantidad"
                        required
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                    <button
                        type="submit"
                        className="bg-pink-500 hover:bg-pink-600 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    >
                        {editando ? 'Guardar cambios' : 'Guardar producto'}
                    </button>
                </form>
            )}

            <div className="bg-white rounded-xl border border-pink-100 overflow-hidden">
                {cargando ? (
                    <p className="p-6 text-gray-400 text-sm">Cargando inventario...</p>
                ) : error ? (
                    <p className="p-6 text-red-500 text-sm">{error}</p>
                ) : productos.length === 0 ? (
                    <p className="p-6 text-gray-400 text-sm">No hay productos registrados todavía.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="bg-pink-50 text-left text-gray-500">
                            <th className="px-4 py-3 font-medium">Código</th>
                            <th className="px-4 py-3 font-medium">Producto</th>
                            <th className="px-4 py-3 font-medium">Marca</th>
                            <th className="px-4 py-3 font-medium">Categoría</th>
                            <th className="px-4 py-3 font-medium">Cantidad</th>
                            <th className="px-4 py-3 font-medium">Estado</th>
                            <th className="px-4 py-3 font-medium"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {productos.map((p) => (
                            <tr key={p.codigo} className="border-t border-pink-50">
                                <td className="px-4 py-3 text-gray-700">{p.codigo}</td>
                                <td className="px-4 py-3 text-gray-700">{p.nombreProducto}</td>
                                <td className="px-4 py-3 text-gray-500">{p.marca}</td>
                                <td className="px-4 py-3 text-gray-500">{p.categoria}</td>
                                <td className="px-4 py-3 text-gray-700">{p.cantidad}</td>
                                <td className="px-4 py-3">
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColores[p.estado] || 'bg-gray-100 text-gray-600'}`}
                    >
                      {p.estado}
                    </span>
                                </td>
                                <td className="px-4 py-3 text-right space-x-3">
                                    <button
                                        onClick={() => abrirEdicion(p)}
                                        className="text-pink-500 hover:text-pink-700 text-xs font-medium"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleEliminar(p.codigo)}
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

export default Inventario