import api from './api'

export const obtenerClientes = async () => {
    const response = await api.get('/clientes')
    return response.data
}

export const crearCliente = async (cliente) => {
    const response = await api.post('/clientes', cliente)
    return response.data
}

export const eliminarCliente = async (dni) => {
    await api.delete(`/clientes/${dni}`)
}

export const actualizarCliente = async (dni, cliente) => {
    const response = await api.put(`/clientes/${dni}`, cliente)
    return response.data
}