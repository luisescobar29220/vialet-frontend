import api from './api'

export const obtenerNota = async (mes) => {
    const response = await api.get(`/notas/${mes}`)
    return response.data.contenido
}

export const guardarNota = async (mes, contenido) => {
    await api.put(`/notas/${mes}`, { contenido })
}