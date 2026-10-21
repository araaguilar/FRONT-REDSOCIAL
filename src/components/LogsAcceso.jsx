import { useEffect, useState } from 'react'
import { adminService } from '../services/adminService'

const vacio = { items: [], pagina: 1, total: 0, totalPaginas: 0 }
const fechaLocal = (fecha) => new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium', timeStyle: 'medium',
}).format(new Date(fecha))

export default function LogsAcceso() {
  const [datos, setDatos] = useState(vacio)
  const [pagina, setPagina] = useState(1)
  const [q, setQ] = useState('')
  const [estado, setEstado] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [actualizacion, setActualizacion] = useState(0)

  useEffect(() => {
    let vigente = true
    const timer = window.setTimeout(async () => {
      setCargando(true)
      setError('')
      const inicio = desde ? new Date(desde).toISOString() : undefined
      const fin = hasta ? new Date(hasta).toISOString() : undefined
      if (inicio && fin && inicio > fin) {
        if (vigente) { setError('La fecha inicial debe ser anterior a la final.'); setCargando(false) }
        return
      }
      const resultado = await adminService.logsAcceso({
        pagina, q, exitoso: estado === '' ? undefined : estado === 'true', desde: inicio, hasta: fin,
      })
      if (!vigente) return
      if (resultado.exito && resultado.datos) setDatos(resultado.datos)
      else setError(resultado.mensaje || 'No se pudieron cargar los logs.')
      setCargando(false)
    }, 250)
    return () => { vigente = false; window.clearTimeout(timer) }
  }, [pagina, q, estado, desde, hasta, actualizacion])

  const cambiar = (setter) => (e) => { setter(e.target.value); setPagina(1) }
  return (
    <section className="moderator-panel access-logs">
      <div className="profile-section-title">
        <h2>Logs de acceso</h2>
        <button onClick={() => setActualizacion((v) => v + 1)} disabled={cargando}>Actualizar</button>
      </div>
      <p>Inicios de sesión y reactivaciones. Fecha y hora en tu zona local ({Intl.DateTimeFormat().resolvedOptions().timeZone}).</p>
      <div className="access-log-filters">
        <label>Usuario o IP<input className="admin-search" maxLength={100} value={q} onChange={cambiar(setQ)} placeholder="Buscar usuario, correo o IP" /></label>
        <label>Resultado<select value={estado} onChange={cambiar(setEstado)}><option value="">Todos</option><option value="true">Exitoso</option><option value="false">Fallido</option></select></label>
        <label>Desde<input type="datetime-local" value={desde} onChange={cambiar(setDesde)} /></label>
        <label>Hasta<input type="datetime-local" value={hasta} onChange={cambiar(setHasta)} /></label>
      </div>
      {error && <p role="alert">{error}</p>}
      {cargando && <p role="status">Cargando accesos…</p>}
      {!cargando && !error && <>
        <p>{datos.total} registros. En intentos fallidos, el identificador fue escrito por quien intentó entrar.</p>
        <div className="access-log-table">
          <table>
            <thead><tr><th>Usuario / identificador</th><th>Evento</th><th>Resultado</th><th>Fecha y hora</th><th>Dirección IP</th></tr></thead>
            <tbody>{datos.items.map((item) => <tr key={item.idLogAcceso}>
              <td>{item.identificador}{item.idUsuario != null && <small> · ID {item.idUsuario}</small>}</td>
              <td>{item.evento === 'reactivacion' ? 'Reactivación' : 'Inicio de sesión'}</td>
              <td>{item.exitoso ? 'Exitoso' : 'Fallido'}</td>
              <td>{fechaLocal(item.fechaUtc)}</td><td>{item.direccionIp || 'No disponible'}</td>
            </tr>)}</tbody>
          </table>
        </div>
        {datos.items.length === 0 && <p>No hay accesos que coincidan con los filtros.</p>}
        <div className="moderation-pagination">
          <button onClick={() => setPagina((v) => Math.max(1, v - 1))} disabled={pagina <= 1}>Anterior</button>
          <span>Página {datos.pagina} de {Math.max(1, datos.totalPaginas)}</span>
          <button onClick={() => setPagina((v) => v + 1)} disabled={pagina >= datos.totalPaginas}>Siguiente</button>
        </div>
      </>}
    </section>
  )
}
