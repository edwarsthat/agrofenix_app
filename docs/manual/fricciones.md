# Fricciones de UX detectadas al documentar

Anotaciones encontradas mientras se escribía el manual. **No son bugs**: son puntos donde explicar el sistema cuesta más de lo que debería, lo que casi siempre indica un problema de interfaz. Material directo para cotizar la Fase 2.

Formato: `[Capítulo] Observación → posible arreglo`.

---

## Capítulo 1 · Acceso al sistema

- **[Cap. 1] El botón de la pantalla de login dice "Login", en inglés, mientras el resto de la pantalla está en español** ("Iniciar sesión", "Ingresa tus credenciales para continuar"). Documentarlo obliga a escribir una palabra en inglés en medio de un manual en español.
  → Posible arreglo: cambiar el texto del botón a "Ingresar" o "Iniciar sesión".

- **[Cap. 1] En la ventana de cambio de contraseña, el primer campo se llama "contraseña"** (en minúscula, sin tilde de contexto) y no aclara que se refiere a la contraseña *actual*. El usuario no distingue entre "contraseña", "Nueva contraseña" y "Confirmar contraseña" a primera vista.
  → Posible arreglo: renombrar a "Contraseña actual". Corregir también la mayúscula inicial para que quede consistente con los otros dos campos.

- **[Cap. 1] No existe recuperación de contraseña autogestionada.** Todo olvido depende del administrador. Es aceptable para una planta pequeña, pero conviene que sea una decisión consciente y no un vacío.
  → Posible arreglo (Fase 2): restablecimiento por parte del administrador desde el módulo de usuarios, con generación de contraseña temporal visible una sola vez.

- **[Cap. 1] Tras cambiar la contraseña obligatoria, el sistema cierra la sesión y devuelve al login** en lugar de entrar directamente. Hay que explicarlo en el manual como "no es un error", que es la señal clásica de un comportamiento que conviene cambiar en vez de documentar.
  → Posible arreglo: iniciar sesión automáticamente tras el cambio, o mostrar un mensaje explícito ("Contraseña actualizada. Ingresa de nuevo").

- **[Cap. 1] La ventana de cambio de contraseña tiene un botón de cancelar** (`onCancel` conectado a cerrar el modal), pese a estar diseñada como obligatoria (sin botón de cerrar, sin cierre con Esc ni clic afuera). Si el usuario cancela, queda con la sesión a medias y sin instrucción de qué hacer.
  → Posible arreglo: ocultar el botón de cancelar en este flujo, o que cancelar devuelva explícitamente al login.

- **[Cap. 1] No hay confirmación al cerrar la sesión de otro usuario** desde Administración → Sesiones. Un clic en la papelera desconecta a la persona de inmediato y en todos sus equipos.
  → Posible arreglo: diálogo de confirmación que advierta que se cierran todas las sesiones de ese usuario.

- **[Cap. 1] El módulo de sesiones no muestra desde qué equipo o desde cuándo está abierta la sesión**, solo usuario, cargo y expiración. Para su propósito real —detectar accesos indebidos— falta el dato más útil.
  → Posible arreglo (Fase 2): agregar hora de inicio y algún identificador del equipo o la IP.

- **[Cap. 1] El menú lateral oculta silenciosamente lo que el usuario no tiene permitido.** Es correcto desde lo técnico, pero genera el reporte más frecuente de soporte: "no me aparece la opción". El manual tiene que explicarlo dos veces.
  → Posible arreglo: no es un cambio de interfaz necesariamente; puede bastar con un texto de ayuda en la pantalla de inicio.

- **[Cap. 1] El aviso "Sesión finalizada — Se perdió la conexión con el servidor" aparece igual cuando se cayó el internet que cuando un administrador cerró la sesión a propósito.** Son dos situaciones distintas con respuestas distintas.
  → Posible arreglo: distinguir el mensaje cuando el cierre viene de una revocación administrativa.
