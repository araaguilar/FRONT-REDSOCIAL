import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppSidebar from '../components/AppSidebar'
import MessagesWidget from '../components/MessagesWidget'
import { authService } from '../services/authService'
import { perfilService } from '../services/perfilService'

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:5079/api').replace(/\/api\/?$/, '')

const normalizarMediaUrl = (url) => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}`
}

const datosIniciales = { items: [], pagina: 1, total: 0, totalPaginas: 0, cantidad: 10 }
const inicialesDe = (texto) => (texto || 'MM').replace('@', '').slice(0, 2).toUpperCase()

export default function RelacionesPerfil({ tipo = 'seguidores' }) {
  const { idUsuario } = useParams()
  const [perfil, setPerfil] = useState(null)
  const [datos, setDatos] = useState(datosIniciales)
  const [pagina, setPagina] = useState(1)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    authService.miPerfil().then((resultado) => {
      if (resultado.exito) setPerfil(resultado.datos)
    })
  }, [])

  useEffect(() => {
    let activo = true
    setCargando(true)
    const peticion = tipo === 'seguidos'
      ? perfilService.seguidos(idUsuario, pagina)
      : perfilService.seguidores(idUsuario, pagina)

    peticion.then((resultado) => {
      if (!activo) return
      if (resultado.exito && resultado.datos) setDatos(resultado.datos)
      setCargando(false)
    })

    return () => { activo = false }
  }, [idUsuario, pagina, tipo])

  const alternarSeguimiento = async (persona) => {
    const resultado = await perfilService.alternarSeguimiento(persona.idUsuario)
    if (!resultado.exito || !resultado.datos) return

    setDatos((actual) => ({
      ...actual,
      items: actual.items.map((item) => (
        item.idUsuario === persona.idUsuario
          ? { ...item, siguiendo: resultado.datos.siguiendo }
          : item
      )),
    }))
  }

  const titulo = tipo === 'seguidos' ? 'Seguidos' : 'Seguidores'

  return (
    <main className="app-shell">
      <AppSidebar activo="Perfil" />

      <section className="profile-page relations-page" aria-label={titulo}>
        <div className="profile-section-title">
          <div>
            <h2>{titulo}</h2>
            <span>{datos.total.toLocaleString('es-MX')} perfiles</span>
          </div>
          <Link className="profile-btn" to="/perfil">Volver</Link>
        </div>

        <div className="relations-list">
          {cargando && Array.from({ length: 5 }).map((_, index) => (
            <article className="relation-card skeleton-card" key={index}>
              <div className="skeleton avatar" />
              <div>
                <div className="skeleton line wide" />
                <div className="skeleton line small" />
              </div>
            </article>
          ))}

          {!cargando && datos.items.length === 0 && (
            <section className="profile-empty-moments">
              <h3>Sin {titulo.toLowerCase()}</h3>
              <p>Cuando haya perfiles en esta lista, aparecerán aquí.</p>
            </section>
          )}

          {!cargando && datos.items.map((persona) => {
            const usuarioLimpio = persona.usuario.replace('@', '')
            const esMiPerfil = perfil?.idUsuario === persona.idUsuario
            const foto = normalizarMediaUrl(persona.fotoPerfilUrl)

            return (
              <article className="relation-card" key={persona.idUsuario}>
                <Link to={esMiPerfil ? '/perfil' : `/perfil/${usuarioLimpio}`}>
                  <div className="profile-avatar">{foto ? <img src={foto} alt={persona.nombre} /> : inicialesDe(persona.nombre)}</div>
                  <div>
                    <strong>{persona.nombre}</strong>
                    <span>{persona.usuario}</span>
                  </div>
                </Link>
                {!esMiPerfil && (
                  <button className={persona.siguiendo ? 'siguiendo' : ''} onClick={() => alternarSeguimiento(persona)}>
                    {persona.siguiendo ? 'Siguiendo' : 'Seguir'}
                  </button>
                )}
              </article>
            )
          })}
        </div>

        <div className="moderation-pagination">
          <button onClick={() => setPagina((valor) => Math.max(1, valor - 1))} disabled={datos.pagina <= 1}>Anterior</button>
          <span>Página {datos.pagina} de {Math.max(datos.totalPaginas, 1)}</span>
          <button onClick={() => setPagina((valor) => valor + 1)} disabled={datos.pagina >= datos.totalPaginas}>Siguiente</button>
        </div>
      </section>

      <MessagesWidget />
    </main>
  )
}
