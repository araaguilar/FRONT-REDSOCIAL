import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { necesitaSelectorDeEntrada, rutaInicialPorRol } from '../utils/rutasPorRol'
import { REACTIVAR_CUENTA_KEY } from './Login'

export default function CuentaDesactivada() {
  const navigate = useNavigate()
  const { reactivarCuenta, estaAutenticado, usuario } = useAuth()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const datos = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem(REACTIVAR_CUENTA_KEY) ?? 'null')
    } catch {
      return null
    }
  }, [])

  if (estaAutenticado) {
    if (necesitaSelectorDeEntrada(usuario)) return <Navigate to="/seleccionar-entrada" replace />
    return <Navigate to={rutaInicialPorRol(usuario?.rolActivo ?? usuario?.rol)} replace />
  }

  if (!datos?.usuarioOEmail || !datos?.password) return <Navigate to="/login" replace />

  const fechaDesactivacion = datos.fechaDesactivacion
    ? new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(datos.fechaDesactivacion))
    : null

  const reactivar = async () => {
    setCargando(true)
    setError('')
    const resultado = await reactivarCuenta(datos.usuarioOEmail, datos.password)
    setCargando(false)

    if (!resultado.exito) {
      setError(resultado.mensaje === 'Ups, algo salió mal. Inténtalo más tarde' ? resultado.mensaje : 'No pudimos reactivar tu cuenta. Vuelve a iniciar sesión.')
      return
    }

    sessionStorage.removeItem(REACTIVAR_CUENTA_KEY)
    if (necesitaSelectorDeEntrada(resultado.datos)) navigate('/seleccionar-entrada', { replace: true })
    else navigate(rutaInicialPorRol(resultado.datos?.rolActivo ?? resultado.datos?.rol ?? 'usuario'), { replace: true })
  }

  const volver = () => {
    sessionStorage.removeItem(REACTIVAR_CUENTA_KEY)
    navigate('/login', { replace: true })
  }

  return (
    <main className="auth reactivation-page">
      <section className="reactivation-card">
        <div className="auth-brand">
          <span className="brand-mark">M</span>
          <strong>Moment</strong>
        </div>
        <p className="feed-kicker">Cuenta desactivada</p>
        <h1>Sabíamos que regresarías</h1>
        <p>
          Tu cuenta está pausada. Tu perfil y tus momentos no se muestran públicamente mientras permanezca desactivada.
        </p>
        {fechaDesactivacion && (
          <span className="reactivation-date">Desactivada desde el {fechaDesactivacion}</span>
        )}
        <ul className="reactivation-notes">
          <li>Al reactivarla volverás a entrar con esta misma cuenta.</li>
          <li>Te enviaremos un aviso por correo cuando quede activa.</li>
          <li>Si no quieres continuar, puedes volver al login sin cambiar nada.</li>
        </ul>
        {error && <span className="campo-error">{error}</span>}
        <div>
          <button className="btn" onClick={reactivar} disabled={cargando}>
            {cargando ? <span className="spinner" /> : 'Reactivar cuenta'}
          </button>
          <button className="reactivation-login-btn" type="button" onClick={volver} disabled={cargando}>
            Volver al login
          </button>
        </div>
      </section>
    </main>
  )
}
