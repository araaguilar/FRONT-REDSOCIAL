# Leer primero: frontend de Moment

Este archivo existe para que cualquier persona o IA que toque el frontend entienda la dirección visual antes de modificar pantallas.

## Identidad general

Moment es una red social escolar con estética minimalista, limpia y cálida. La interfaz debe sentirse simple, moderna y viva, sin parecer una plantilla administrativa pesada.

La paleta principal usa rosa/naranja como acento de marca. Evitar saturar pantallas con demasiados colores; el color de marca debe aparecer en acciones importantes, estados activos y detalles sutiles.

## Animaciones

Las animaciones deben ser sutiles y funcionales. No deben llamar más la atención que la acción del usuario.

Reglas actuales:

- Login a registro: transición tipo slide, sin overlay de color ni logo flotante.
- Registro a login: slide contrario.
- Login a recuperar contraseña: slide suave hacia arriba.
- Recuperar contraseña a login: regreso animado, no navegación seca.
- Login visual: la imagen lateral funciona como carrusel aleatorio. No usar intervalo fijo visible; debe cambiar en tiempos variables menores a 3 minutos.
- Cuenta desactivada: si el usuario vuelve con credenciales correctas, mostrar una pantalla cálida de bienvenida y reactivación, no un error genérico.
- Crear momento: el modal aparece subiendo desde abajo con fade.
- Mi perfil: la página y sus bloques entran con fade y subida ligera.
- Configuración: las vistas internas entran con slide/fade suave. Esta animación debe reutilizarse para acciones como cambiar contraseña, mis inicios de sesión, desactivar cuenta y eliminar cuenta.

Evitar animaciones con escalado fuerte, rebotes o wipes que tapen toda la pantalla. Si una animación deja ver fondos blancos raros o se siente a trompicones, reemplazarla por slide/fade.

## Configuración de cuenta

La pantalla de configuración usa navegación interna por cards, no desplegables grandes.

Flujo esperado:

- Configuración muestra la lista principal.
- Al entrar en Cuenta, se cambia a una vista interna del mismo card con opciones de cuenta.
- Las acciones normales van arriba.
- Las acciones delicadas, como desactivar o eliminar cuenta, van al final dentro del mismo card, separadas por un corte visual, no por un card completamente independiente.
- Al entrar en una acción, aparece el panel de detalle a la derecha usando la animación compartida de configuración.

## Sidebar

El sidebar puede estar expandido o contraído según preferencia del usuario. No debe reiniciarse al navegar entre páginas.

La preferencia se guarda en `localStorage` y debe respetarse por usuario.

## Comentarios

Los comentarios de publicaciones son funcionales, no decorativos. Cada comentario admite emojis y tiene límite de 300 caracteres.

Los comentarios pueden recibir me encanta reales y respuestas anidadas. Para rendimiento, cargar primero los comentarios principales y pedir las respuestas bajo demanda al tocar `Ver respuestas`; no traer todo el árbol completo desde el inicio.

La visualización de respuestas debe sentirse como cronología: indentación ligera, línea vertical sutil y acciones pequeñas (`me encanta`, `responder`) sin convertirlo en un chat pesado.

## Formularios de seguridad

Los errores no deben mostrarse como cards grandes. Deben aparecer como texto rojo debajo del campo correspondiente.

En acciones sensibles como cambio de contraseña, credenciales incorrectas o validaciones de seguridad, nunca usar toast ni alertas grandes para errores. El error debe aparecer bajo su campo en rojo, por ejemplo: `Contraseña incorrecta`.

Los códigos de verificación de 6 dígitos usan cuadros individuales. Al validar, los cuadros cambian secuencialmente a verde o rojo, pero sin moverse ni escalar para evitar saltos visuales.

La verificación de contraseña usa BCrypt en backend. No reducir el costo de BCrypt solo para que se sienta más rápido; esa lentitud protege contra fuerza bruta. Si una acción tarda, mejorar la experiencia con loaders estables y mensajes claros.

En recuperar contraseña, una cuenta desactivada no debe mostrarse como inexistente. Primero se informa que está desactivada y desde cuándo; solo si el usuario confirma reactivarla se envía el código. Al completar el cambio de contraseña, la cuenta vuelve a quedar activa.

Si recuperar contraseña detecta una cuenta con estado `eliminacion_pendiente`, no debe decir que solo está desactivada. Debe informar que está en proceso de eliminación, mostrar la fecha límite cuando exista, y plantear la acción como cancelar la eliminación mediante código y cambio de contraseña.

La eliminación de cuenta no borra datos inmediatamente. El usuario debe aceptar checkpoints, validar su contraseña y confirmar en un modal final. Al confirmar, la cuenta queda inactiva con estado `eliminacion_pendiente` y una ventana de 30 días para cancelar la eliminación al reingresar. En login, ese estado debe mostrar una pantalla de rebienvenida enfocada en cancelar la eliminación, con la fecha de eliminación definitiva visible. Pasados esos 30 días, la eliminación definitiva queda reservada para un proceso programado/backend.

## Qué evitar

- Cards dentro de cards sin necesidad.
- Bordes grises innecesarios en login.
- Mensajes de éxito verdes tipo alerta dentro de formularios cuando se pueda usar un pop up/modal pequeño.
- Animaciones que tapen toda la pantalla sin aportar claridad.
- Expandir secciones grandes si una vista interna es más clara.

