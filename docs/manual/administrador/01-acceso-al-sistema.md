# 1. Acceso al sistema

En este capítulo aprenderás a entrar a AgroFenix, a cambiar tu contraseña, a salir del sistema de forma segura y a resolver los problemas más comunes al ingresar. Si administras el sistema, también verás cómo consultar quién tiene una sesión abierta y cómo cerrarla.

**Antes de empezar necesitas:**

- La aplicación **Fénix** instalada en el computador. Si no la tienes, comunícate con el área de sistemas.
- Un usuario y una contraseña entregados por el administrador del sistema. AgroFenix no permite crear tu propia cuenta.
- El computador conectado a internet. La aplicación consulta la información en un servidor y no funciona sin conexión.

---

## 1.1 Iniciar sesión

**Cuándo se usa:** cada vez que abres la aplicación o después de haber cerrado sesión.
**Permiso requerido:** ninguno.

1. Abre la aplicación **Fénix** desde el escritorio o el menú de inicio.
2. En el campo **"Usuario"**, escribe tu nombre de usuario.
3. En el campo **"Contraseña"**, escribe tu contraseña.
4. Haz clic en el botón **"Login"**.

![Pantalla de inicio de sesión de AgroFenix](img/01-acceso-01.png)

Si los datos son correctos, la aplicación te lleva a la pantalla principal y el menú lateral izquierdo muestra los módulos a los que tienes acceso.

> **Importante:** el menú no es igual para todos. Cada usuario ve únicamente los módulos que su cargo tiene autorizados. Si esperabas ver una opción y no aparece, no es un error de la aplicación: es un permiso que hay que asignar. Consulta el capítulo *2. Usuarios y permisos*.

**Si algo sale mal:**

| Mensaje en pantalla | Qué significa | Qué hacer |
|---|---|---|
| **Usuario o contraseña incorrectos** | Los datos no coinciden con ningún usuario registrado. | Verifica que no tengas activado el bloqueo de mayúsculas y vuelve a intentarlo. Si persiste, pide al administrador que verifique tu usuario. |
| **No se pudo conectar con el servidor** | El computador no logró comunicarse con el servidor de AgroFenix. | Revisa tu conexión a internet. Si la conexión funciona, avisa al área de sistemas: el problema está en el servidor. |
| **No se pudo iniciar sesión, intenta más tarde** | El servidor respondió con un error. No es culpa de tus datos. | Espera unos minutos e intenta de nuevo. Si continúa, reporta al área de sistemas. |
| **No se pudo establecer la conexión con el servidor** | Tu usuario y contraseña son correctos, pero la aplicación no pudo abrir el canal de datos con el servidor. | Cierra la aplicación por completo, vuelve a abrirla e intenta de nuevo. Si el mensaje se repite, reporta al área de sistemas. |

---

## 1.2 Definir tu contraseña la primera vez

**Cuándo se usa:** la primera vez que ingresas con un usuario nuevo, o cuando el administrador restablece tu contraseña.
**Permiso requerido:** ninguno.

Cuando el administrador crea tu usuario, te entrega una contraseña temporal. La primera vez que la uses, AgroFenix te obliga a reemplazarla antes de dejarte entrar.

1. Inicia sesión con tu usuario y la contraseña temporal (procedimiento *1.1*).
2. La aplicación muestra la ventana **"Actualiza tu contraseña"**. Esta ventana no se puede omitir.
3. En el campo **"contraseña"**, escribe la contraseña temporal que te entregaron.
4. En el campo **"Nueva contraseña"**, escribe la contraseña que vas a usar de ahora en adelante.
5. En el campo **"Confirmar contraseña"**, escribe exactamente la misma contraseña nueva.
6. Haz clic en el botón de guardar.
7. La aplicación te devuelve a la pantalla de inicio de sesión. Ingresa de nuevo, esta vez con tu contraseña nueva.

![Ventana de actualización de contraseña](img/01-acceso-02.png)

> **Importante:**
> - La contraseña nueva debe tener **mínimo 6 caracteres**.
> - Después de cambiarla, el sistema cierra la sesión a propósito y te pide entrar otra vez. No es un error.
> - Tu contraseña es personal. No la compartas ni la dejes anotada junto al computador: todo lo que se registre con tu usuario queda a tu nombre.

**Si algo sale mal:**

| Mensaje en pantalla | Qué significa | Qué hacer |
|---|---|---|
| **La contraseña no puede ser menor de 6 caracteres** | La contraseña nueva es demasiado corta. | Escribe una de 6 caracteres o más. |
| **Las contraseñas no coinciden** | Lo escrito en "Nueva contraseña" y en "Confirmar contraseña" es distinto. | Vuelve a escribir ambos campos con cuidado. |
| **Confirma la contraseña** | Dejaste vacío el campo de confirmación. | Repite la contraseña nueva en ese campo. |
| **No se pudo actualizar la contraseña** | El servidor rechazó el cambio. Lo más común es que la contraseña temporal esté mal escrita. | Verifica la contraseña actual y vuelve a intentarlo. Si persiste, pide al administrador que la restablezca. |

---

## 1.3 Cerrar sesión

**Cuándo se usa:** siempre que te retires del computador, aunque sea por poco tiempo, y en especial si el equipo es compartido.
**Permiso requerido:** ninguno.

1. Ubica el menú lateral izquierdo.
2. Baja hasta el final del menú.
3. Haz clic en **"Cerrar sesión"**.

![Botón de cerrar sesión al pie del menú lateral](img/01-acceso-03.png)

La aplicación vuelve de inmediato a la pantalla de inicio de sesión.

> **Importante:** cerrar la ventana de la aplicación no siempre es lo mismo que cerrar sesión. Usa siempre el botón **"Cerrar sesión"**.

---

## 1.4 Si el sistema te saca solo

Puede aparecer un aviso en pantalla que dice **"Sesión finalizada — Se perdió la conexión con el servidor. Vuelve a iniciar sesión."**

Esto ocurre cuando la aplicación pierde la comunicación con el servidor: se cayó el internet, se reinició el servidor, o un administrador cerró tu sesión desde el módulo de sesiones.

**Qué hacer:**

1. Verifica que el computador tenga internet.
2. Inicia sesión de nuevo (procedimiento *1.1*).
3. Si el aviso vuelve a aparecer varias veces seguidas, reporta al área de sistemas.

> **Importante:** la información que ya habías guardado antes del aviso no se pierde. Lo que estabas escribiendo en un formulario sin guardar, sí.

---

## 1.5 Consultar las sesiones activas

**Cuándo se usa:** para saber qué usuarios tienen el sistema abierto en este momento.
**Permiso requerido:** `sesiones:read`.

1. En el menú lateral, haz clic en **"Administración"**.
2. Haz clic en **"Sesiones"**.
3. La pantalla muestra la lista de sesiones abiertas con tres datos:
   - **Usuario** — el nombre de usuario que tiene la sesión abierta.
   - **Cargo** — el cargo con el que ingresó, que determina lo que puede ver y hacer.
   - **Expira** — fecha y hora en que la sesión caduca automáticamente.

![Listado de sesiones activas](img/01-acceso-04.png)

> **Importante:** si la lista aparece vacía con el mensaje *"No hay sesiones activas en este momento"*, significa que nadie tiene el sistema abierto. Las sesiones desaparecen solas de esta lista cuando el usuario cierra sesión o cuando llega la fecha de expiración.

---

## 1.6 Cerrar la sesión de otro usuario

**Cuándo se usa:** cuando un empleado dejó su sesión abierta en un equipo al que ya no tiene acceso, cuando se retira de la empresa, o ante cualquier sospecha de que alguien más está usando su cuenta.
**Permiso requerido:** `sesiones:read`.
**Antes de empezar:** avisa a la persona si es posible. Perderá lo que esté escribiendo sin guardar.

1. Entra a **Administración → Sesiones** (procedimiento *1.5*).
2. Ubica la fila del usuario cuya sesión quieres cerrar.
3. Haz clic en el ícono de **papelera** al final de la fila.
4. La sesión desaparece del listado.

![Acción para cerrar la sesión de un usuario](img/01-acceso-05.png)

> **Importante:** esta acción cierra **todas** las sesiones de ese usuario, no solo la de un computador. Si la persona tenía el sistema abierto en dos equipos, se cierran los dos. En su pantalla aparecerá el aviso *"Sesión finalizada"* y tendrá que ingresar de nuevo.

> **Importante:** cerrar la sesión **no** desactiva al usuario. La persona puede volver a entrar de inmediato con su misma contraseña. Si necesitas retirarle el acceso de forma definitiva, debes desactivar el usuario; consulta el capítulo *2. Usuarios y permisos*.

---

## 1.7 Preguntas frecuentes

**Olvidé mi contraseña. ¿Cómo la recupero?**
AgroFenix no tiene recuperación automática de contraseña. Comunícate con el administrador del sistema para que la restablezca. Te entregará una contraseña temporal y, al ingresar, el sistema te pedirá definir una nueva (procedimiento *1.2*).

**Entré, pero no veo un módulo que necesito.**
El menú muestra solo lo que tu cargo tiene autorizado. Solicita al administrador que revise los permisos de tu cargo.

**¿Puedo tener el sistema abierto en dos computadores al mismo tiempo?**
Sí, el sistema lo permite. Ten en cuenta que si un administrador cierra tu sesión, se cierran todas a la vez.

**¿Cuánto dura una sesión abierta?**
Hasta la fecha y hora que aparece en la columna **"Expira"** del módulo de sesiones. Al cumplirse ese plazo, el sistema te pide ingresar de nuevo.
