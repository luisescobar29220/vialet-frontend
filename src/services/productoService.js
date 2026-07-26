import api from './api'

export const obtenerProductos = async () => {
    const response = await api.get('/productos')
    return response.data
}

export const crearProducto = async (producto) => {
    const response = await api.post('/productos', producto)
    return response.data
}

export const eliminarProducto = async (codigo) => {
    await api.delete(`/productos/${codigo}`)
}
export const actualizarProducto = async (codigo, producto) => {
    const response = await api.put(`/productos/${codigo}`, producto)
    return response.data
}