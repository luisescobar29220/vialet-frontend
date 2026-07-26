import api from './api'

export const obtenerMovimientos = async () => {
    const response = await api.get('/movimientos')
    return response.data
}

export const obtenerMovimientosPorFecha = async (fecha) => {
    const response = await api.get(`/movimientos/fecha/${fecha}`)
    return response.data
}

export const crearMovimiento = async (movimiento) => {
    const response = await api.post('/movimientos', movimiento)
    return response.data
}
export const eliminarMovimiento = async (id) => {
    await api.delete(`/movimientos/${id}`)
}