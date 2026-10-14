import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppSidebar from '../components/AppSidebar'
import CampoPassword from '../components/CampoPassword'
import SuccessPop from '../components/SuccessPop'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'

const reglasPassword = [
  { id: 'longitud', texto: 'Mínimo 8 caracteres', valida: (valor) => valor.length >= 8 },
  { id: 'mayuscula', texto: 'Al menos una mayúscula', valida: (valor) => /[A-ZÁÉÍÓÚÑ]/.test(valor) },
  { id: 'especial', texto: 'Al menos un carácter especial', valida: (valor) => /[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ]/.test(valor) },
]

const reglasFuerzaPassword = [
  (valor) => valor.length >= 8,
  (valor) => /[a-záéíóúñ]/.test(valor),
  (valor) => /[A-ZÁÉÍÓÚÑ]/.test(valor),
  (valor) => /\d/.test(valor),
  (valor) => /[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ]/.test(valor),
]

const ajustes = [
  { titulo: 'Cuenta', descripcion: 'Datos personales, nombre de usuario y correo.' },
  { titulo: 'Privacidad', descripcion: 'Controla quien puede ver tus momentos y enviarte mensajes.' },
  { titulo: 'Notificaciones', descripcion: 'Administra avisos de me encanta, comentarios y mensajes.' },
  { titulo: 'Seguridad', descripcion: 'Contrasena, sesiones activas y proteccion de la cuenta.' },
]

const opcionesCuenta = [
  { id: 'password', titulo: 'Cambiar contraseña', descripcion: 'Actualiza la contraseña con la que entras a Moment.', tono: 'normal' },
  { id: 'sesiones', titulo: 'Mis inicios de sesión', descripcion: 'Revisa los dispositivos y accesos recientes de tu cuenta.', tono: 'normal' },
  { id: 'email', titulo: 'Correo electrónico', descripcion: 'Consulta o cambia el correo ligado a tu cuenta.', tono: 'normal' },
  { id: 'actividad', titulo: 'Actividad de la cuenta', descripcion: 'Historial de cambios importantes y movimientos de seguridad.', tono: 'normal' },
]

const accionesCuenta = [
  { id: 'desactivar', titulo: 'Desactivar cuenta', descripcion: 'Oculta temporalmente tu perfil y tus momentos.', tono: 'warning' },
  { id: 'eliminar', titulo: 'Eliminar cuenta', descripcion: 'Borra tu cuenta y la informacion asociada de forma permanente.', tono: 'danger' },
]

const todasOpcionesCuenta = [...opcionesCuenta, ...accionesCuenta]

export default function Configuracion() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [confirmarSalida, setConfirmarSalida] = useState(false)
  const [seccion, setSeccion] = useState('')
  const [detalle, setDetalle] = useState('')
  const [passwordForm, setPasswordForm] = useState({ actual: '', nueva: '', confirmar: '' })
  const [erroresPassword, setErroresPassword] = useState({})
  const [guardandoPassword, setGuardandoPassword] = useState(false)
  const [popExito, setPopExito] = useState('')

  const passwordCumple = reglasPassword.every((regla) => regla.valida(passwordForm.nueva))
  const noCoinciden = passwordForm.confirmar !== '' && passwordForm.nueva !== passwordForm.confirmar
  const passwordLista = passwordForm.actual !== '' && passwordCumple && passwordForm.confirmar !== '' && passwordForm.nueva === passwordForm.confirmar
  const nivelPassword = passwordForm.nueva ? Math.max(1, reglasFuerzaPassword.filter((regla) => regla(passwordForm.nueva)).length) : 0
  const textoNivelPassword = ['', 'Muy débil', 'Débil', 'Media', 'Buena', 'Segura'][nivelPassword]

  const cerrarSesion = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const onPasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
    setErroresPassword(({ [e.target.name]: _, general: __, ...resto }) => resto)
  }

  const bloquearPortapapeles = (e) => e.preventDefault()

  const guardarPassword = async (e) => {
    e.preventDefault()
    const errores = {}
    if (!passwordForm.actual) errores.actual = 'La contraseña actual es obligatoria'
    if (!passwordCumple) errores.nueva = 'La contraseña debe cumplir las reglas'
    if (!passwordForm.confirmar) errores.confirmar = 'Confirma la nueva contraseña'
    else if (passwordForm.nueva !== passwordForm.confirmar) errores.confirmar = 'Las contraseñas no coinciden'

    setErroresPassword(errores)
    if (Object.keys(errores).length > 0) return

    setGuardandoPassword(true)
    const resultado = await authService.cambiarPasswordAutenticado(passwordForm.actual, passwordForm.nueva)
    setGuardandoPassword(false)

    if (!resultado.exito) {
      const mensaje = resultado.status
        ? 'Contraseña incorrecta'
        : 'Ups, algo salió mal. Inténtalo más tarde'
      setErroresPassword({ actual: mensaje })
      return
    }

    setPasswordForm({ actual: '', nueva: '', confirmar: '' })
    setErroresPassword({})
    setPopExito('Contraseña actualizada')
    window.setTimeout(() => setPopExito(''), 1800)
  }

  return (
    <main className="app-shell">
      <AppSidebar />

      <section className="settings-page" aria-label="Configuracion">
        <header className="settings-header">
          <p className="feed-kicker">Mi cuenta</p>
          <h1>Configuracion</h1>
          <span>Administra como se ve, se protege y se comporta tu experiencia en Moment.</span>
        </header>

        <div className={`settings-layout${detalle ? ' con-detalle' : ''}`}>
          {!detalle && (
          <div>
            <div className={`settings-master ${detalle ? 'detail-mode' : ''}`}>
              {!detalle && !seccion ? (
                <div className="settings-list settings-main-list">
                  {ajustes.map((ajuste) => (
                    <div className="settings-item" key={ajuste.titulo}>
                      <button
                        className="settings-row"
                        onClick={ajuste.titulo === 'Cuenta' ? () => setSeccion('cuenta') : undefined}
                      >
                        <span>
                          <strong>{ajuste.titulo}</strong>
                          <small>{ajuste.descripcion}</small>
                        </span>
                        <i>›</i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : !detalle && seccion === 'cuenta' ? (
                <div className="settings-list settings-main-list settings-section-list">
                  <button className="back-row settings-back-row" onClick={() => setSeccion('')}>‹ Volver a configuracion</button>
                  <div className="settings-section-head">
                    <p className="feed-kicker">Cuenta</p>
                    <h3>Cuenta</h3>
                    <span>Administra los accesos y el estado de tu cuenta.</span>
                  </div>

                  <div className="account-group">
                    {opcionesCuenta.map((opcion) => (
                      <button
                        className={`account-option ${opcion.tono}`}
                        key={opcion.id}
                        onClick={() => setDetalle(opcion.id)}
                      >
                        <span>
                          <strong>{opcion.titulo}</strong>
                          <small>{opcion.descripcion}</small>
                        </span>
                        <i>›</i>
                      </button>
                    ))}
                  </div>

                  <div className="account-group account-danger-group">
                    <span className="account-group-label">Acciones de cuenta</span>
                    {accionesCuenta.map((opcion) => (
                      <button
                        className={`account-option ${opcion.tono}`}
                        key={opcion.id}
                        onClick={() => setDetalle(opcion.id)}
                      >
                        <span>
                          <strong>{opcion.titulo}</strong>
                          <small>{opcion.descripcion}</small>
                        </span>
                        <i>›</i>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {!detalle && !seccion && (
              <section className="logout-section">
                <div>
                  <strong>Cerrar sesion</strong>
                  <p>Sal de tu cuenta en este dispositivo.</p>
                </div>
                <button className="danger-btn" onClick={() => setConfirmarSalida(true)}>Cerrar sesion</button>
              </section>
            )}
          </div>
          )}

          {detalle && (
          <section className="settings-detail" aria-label="Detalle de configuracion">
            <button className="back-row settings-detail-back" onClick={() => setDetalle('')}>‹ Volver a cuenta</button>
            {detalle === 'password' && (
              <>
                <p className="feed-kicker">Cuenta</p>
                <h2>Cambiar contraseña</h2>
                <p className="detail-copy">Actualiza tu contraseña. Te enviaremos un aviso por correo cuando se guarde el cambio.</p>
                <form className="detail-form" onSubmit={guardarPassword} noValidate>
                  <div className="campo">
                    <CampoPassword invalido={Boolean(erroresPassword.actual)} name="actual" placeholder="Contraseña actual" aria-label="Contraseña actual" value={passwordForm.actual} onChange={onPasswordChange} autoComplete="current-password" maxLength={72} disabled={guardandoPassword} />
                    {erroresPassword.actual && <span className="campo-error">{erroresPassword.actual}</span>}
                  </div>
                  <div className="campo">
                    <CampoPassword invalido={Boolean(erroresPassword.nueva)} name="nueva" placeholder="Nueva contraseña" aria-label="Nueva contraseña" value={passwordForm.nueva} onChange={onPasswordChange} autoComplete="new-password" maxLength={72} disabled={guardandoPassword} onCopy={bloquearPortapapeles} onCut={bloquearPortapapeles} onPaste={bloquearPortapapeles} />
                    {erroresPassword.nueva && <span className="campo-error">{erroresPassword.nueva}</span>}
                  </div>
                  <div className="campo">
                    <CampoPassword invalido={noCoinciden || Boolean(erroresPassword.confirmar)} name="confirmar" placeholder="Confirmar nueva contraseña" aria-label="Confirmar nueva contraseña" value={passwordForm.confirmar} onChange={onPasswordChange} autoComplete="new-password" maxLength={72} disabled={guardandoPassword} onCopy={bloquearPortapapeles} onCut={bloquearPortapapeles} onPaste={bloquearPortapapeles} />
                    {(noCoinciden || erroresPassword.confirmar) && <span className="campo-error">{erroresPassword.confirmar || 'Las contraseñas no coinciden'}</span>}
                    <div className={`password-meter nivel-${nivelPassword}`} aria-live="polite">
                      {Array.from({ length: 5 }).map((_, index) => <span key={index} />)}
                      {textoNivelPassword && <strong>{textoNivelPassword}</strong>}
                    </div>
                    <ul className="password-rules" aria-label="Reglas de contraseña">
                      {reglasPassword.map((regla) => <li className={regla.valida(passwordForm.nueva) ? 'cumple' : ''} key={regla.id}>{regla.texto}</li>)}
                    </ul>
                  </div>
                  <button disabled={guardandoPassword || !passwordLista}>{guardandoPassword ? <span className="spinner" /> : 'Guardar cambios'}</button>
                </form>
              </>
            )}

            {detalle === 'desactivar' && (
              <>
                <p className="feed-kicker">Cuenta</p>
                <h2>Desactivar cuenta</h2>
                <p className="detail-copy">Tu perfil quedaria oculto temporalmente y podrias volver cuando inicies sesion de nuevo.</p>
                <div className="detail-warning">
                  <strong>Antes de continuar</strong>
                  <span>Tus momentos no se borran, solo dejan de estar visibles.</span>
                </div>
                <button className="warning-btn">Desactivar cuenta</button>
              </>
            )}

            {detalle === 'eliminar' && (
              <>
                <p className="feed-kicker">Cuenta</p>
                <h2>Eliminar cuenta</h2>
                <p className="detail-copy">Esta accion eliminaria tu perfil, momentos, mensajes y preferencias de forma permanente.</p>
                <div className="detail-warning danger">
                  <strong>Accion permanente</strong>
                  <span>Mas adelante agregaremos una confirmacion fuerte antes de permitir esto.</span>
                </div>
                <button className="danger-btn">Eliminar cuenta</button>
              </>
            )}

            {detalle === 'sesiones' && (
              <>
                <p className="feed-kicker">Cuenta</p>
                <h2>Mis inicios de sesión</h2>
                <p className="detail-copy">Aqui mostraremos los dispositivos, ubicaciones aproximadas y fechas de acceso recientes.</p>
                <div className="detail-list">
                  <div>
                    <strong>Este dispositivo</strong>
                    <span>Windows · Sesion actual</span>
                  </div>
                  <div>
                    <strong>Ultimo acceso registrado</strong>
                    <span>Hoy · Navegador principal</span>
                  </div>
                </div>
              </>
            )}

            {detalle === 'email' && (
              <>
                <p className="feed-kicker">Cuenta</p>
                <h2>Correo electrónico</h2>
                <p className="detail-copy">Aqui podremos cambiar el correo usando verificacion de seguridad antes de guardar.</p>
                <div className="detail-form">
                  <input type="email" placeholder="Correo actual" autoComplete="email" maxLength={100} />
                  <input type="email" placeholder="Nuevo correo" autoComplete="email" maxLength={100} />
                  <button>Enviar verificacion</button>
                </div>
              </>
            )}

            {detalle === 'actividad' && (
              <>
                <p className="feed-kicker">Cuenta</p>
                <h2>Actividad de la cuenta</h2>
                <p className="detail-copy">Registro de acciones importantes para auditoria y seguridad del usuario.</p>
                <div className="detail-list">
                  <div>
                    <strong>Contraseña actualizada</strong>
                    <span>Pendiente de conectar con backend.</span>
                  </div>
                  <div>
                    <strong>Foto de perfil modificada</strong>
                    <span>Pendiente de historial real.</span>
                  </div>
                </div>
              </>
            )}
          </section>
          )}
        </div>
      </section>

      {confirmarSalida && (
        <div className="modal-backdrop" role="presentation">
          <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="cerrar-sesion-titulo">
            <h2 id="cerrar-sesion-titulo">Cerrar sesion</h2>
            <p>¿Seguro que quieres cerrar sesion en Moment?</p>
            <div>
              <button className="profile-btn" onClick={() => setConfirmarSalida(false)}>Cancelar</button>
              <button className="danger-btn" onClick={cerrarSesion}>Si, cerrar sesion</button>
            </div>
          </section>
        </div>
      )}

      <SuccessPop visible={Boolean(popExito)} mensaje={popExito} />

    </main>
  )
}
