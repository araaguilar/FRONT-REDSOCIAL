import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:5079/api').replace(/\/api\/?$/, '')

const normalizarMediaUrl = (url) => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}`
}

const herramientas = [
  { icono: '⌂', texto: 'Inicio', ruta: '/inicio' },
  { icono: '⌕', texto: 'Buscar', ruta: '/buscar' },
  { icono: '+', texto: 'Crear', ruta: '#' },
  { icono: '♡', texto: 'Favoritos', ruta: '/favoritos' },
  { icono: '✉', texto: 'Mensajes', ruta: '/mensajes' },
]

const SIDEBAR_KEY_BASE = 'moment_sidebar_contraido'

export default function AppSidebar({ activo = 'Inicio' }) {
  const navigate = useNavigate()
  const { usuario, perfilActual } = useAuth()
  const sidebarStorageKey = useMemo(() => (
    `${SIDEBAR_KEY_BASE}_${usuario?.idUsuario ?? usuario?.nombreUsuario ?? 'anon'}`
  ), [usuario?.idUsuario, usuario?.nombreUsuario])
  const [sidebarContraido, setSidebarContraido] = useState(() => {
    const guardado = localStorage.getItem(SIDEBAR_KEY_BASE)
    return guardado === 'true'
  })
  const nombre = perfilActual?.nombrePerfil || usuario?.nombrePerfil || usuario?.nombreUsuario || usuario?.usuario || 'Raul'
  const nombreUsuario = perfilActual?.nombreUsuario || usuario?.nombreUsuario || usuario?.usuario || nombre
  const fotoPerfilUrl = normalizarMediaUrl(perfilActual?.fotoPerfilUrl)
  const rol = usuario?.rolActivo ?? usuario?.rol ?? 'usuario'
  const puedeCambiarRol = (usuario?.roles?.length ?? 0) > 1
  const herramientasVisibles = ['moderador', 'admin'].includes(rol)
    ? [...herramientas, { icono: '!', texto: 'Moderador', ruta: '/moderador' }]
    : herramientas

  const abrirCrearMomento = () => {
    navigate('/inicio?crear=1')
  }

  useEffect(() => {
    const guardadoUsuario = localStorage.getItem(sidebarStorageKey)
    const guardadoGeneral = localStorage.getItem(SIDEBAR_KEY_BASE)
    setSidebarContraido((guardadoUsuario ?? guardadoGeneral) === 'true')
  }, [sidebarStorageKey])

  const alternarSidebar = () => {
    setSidebarContraido((valor) => {
      const siguiente = !valor
      localStorage.setItem(sidebarStorageKey, String(siguiente))
      localStorage.setItem(SIDEBAR_KEY_BASE, String(siguiente))
      return siguiente
    })
  }

  return (
    <aside className={`sidebar${sidebarContraido ? ' contraido' : ''}`}>
      <div>
        <div className="sidebar-head">
          <Link className="brand" to="/inicio">
            <span className="brand-mark">M</span>
            <span>Moment</span>
          </Link>
          <button
            className="sidebar-toggle"
            onClick={alternarSidebar}
            aria-label={sidebarContraido ? 'Expandir sidebar' : 'Contraer sidebar'}
          >
            {sidebarContraido ? '›' : '‹'}
          </button>
        </div>

        <Link className="brand brand-compact" to="/inicio">
          <span className="brand-mark">M</span>
        </Link>

        <nav className="side-nav" aria-label="Herramientas principales">
          {herramientasVisibles.map((item) => {
            const contenido = (
              <>
                <span className="nav-icon">{item.icono}</span>
                <span>{item.texto}</span>
              </>
            )

            return item.ruta === '#'
              ? (
                <button
                  className={`nav-item${activo === item.texto ? ' activo' : ''}`}
                  key={item.texto}
                  onClick={abrirCrearMomento}
                >
                  {contenido}
                </button>
              )
              : (
                <Link className={`nav-item${activo === item.texto ? ' activo' : ''}`} key={item.texto} to={item.ruta}>
                  {contenido}
                </Link>
              )
          })}
        </nav>
      </div>

      <div className={`profile-mini-card${puedeCambiarRol ? ' con-rol' : ''}`}>
        <Link className="profile-mini" to="/perfil">
          <div className="profile-avatar">
            {fotoPerfilUrl ? <img src={fotoPerfilUrl} alt="Foto de perfil" /> : nombre.slice(0, 2).toUpperCase()}
          </div>
          <div className="profile-copy">
            <strong>{nombre}</strong>
            <span>@{String(nombreUsuario).replace('@', '').toLowerCase()}</span>
          </div>
        </Link>

        {puedeCambiarRol && (
          <button className="profile-role-switch" onClick={() => navigate('/seleccionar-entrada')}>
            Cambiar rol
          </button>
        )}
      </div>
    </aside>
  )
}
