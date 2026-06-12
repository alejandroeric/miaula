# Contexto del proyecto MiAula

## Sobre el dueño

Eric Nofal. Principiante en programación pero aprendiendo a usar Claude Code de forma profesional. Habla español rioplatense (Argentina, "vos").

Su enfoque NO es escribir código línea por línea — es escribir prompts profesionales y entender el ecosistema. Cuando le expliques cosas, hacelo paso a paso, con ejemplos concretos y preguntas para verificar comprensión. Evitá info dumps.

## Qué es MiAula

App web educativa para nivel primario. La usa su hija para practicar y cargar tareas diariamente. Es un proyecto con *datos emocionalmente importantes* (las tareas de la hija dependen de esta app).

Características clave:
- App de archivo único HTML (o dividida en index.html + style.css + app.js post-refactor)
- Se usa principalmente desde la notebook de la casa
- Persistencia: *localStorage del navegador* (atado a la URL del archivo)
- Integra Claude API (Anthropic) para chat de tareas con IA — modelo en migración a Haiku
- La API key se ingresa por UI, NO está hardcodeada en el código (bien hecho)

## Stack técnico real

- *HTML + CSS + JavaScript vanilla* — sin frameworks.
- *NO* usar Python, Flask, SQLite ni stacks pesados.
- Si se proponen cambios estructurales (split de archivos, build tools, etc.), pedir confirmación del dueño primero.

## Historia importante del proyecto

- Versión original MiAula_FINAL.html creada con Claude.ai (no Claude Code).
- 2026-06-10/11: Eric empezó a aprender Claude Code y a migrar sus apps.
- 2026-06-11: Sin tener este CLAUDE.md disponible en la notebook, intentó migrar con ayuda de un Claude sin contexto. La receta generada esa vez *omitió git e ignoró el backup de localStorage*. Por suerte los datos no se perdieron, pero la migración quedó incompleta.

## Estado actual al iniciar sesión

Verificar al arrancar:
- ¿La carpeta miaula/ tiene .git/? Si NO, proponer git init antes de cualquier modificación.
- ¿Existe MiAula_FINAL.html original como red de seguridad? Si SÍ, no tocarlo.
- ¿Los datos de la hija siguen visibles al abrir la app? Si NO, parar y avisar antes de cualquier cosa.

## Reglas no negociables

### Datos de la hija = activos críticos
- *Backup de localStorage antes de cualquier cambio estructural* (mover archivos, cambiar paths, dividir HTML en partes).
- Si hay duda sobre si un cambio puede afectar localStorage, *detenerse y preguntar* al dueño.
- El archivo original MiAula_FINAL.html se mantiene intacto como red de seguridad hasta nuevo aviso.

### Seguridad
- API keys (Anthropic, Alpha Vantage, etc.) *NUNCA en código fuente*. Solo en UI vía localStorage o .env.
- Sin secrets hardcodeados.

### Control de versiones (git)

*Regla #1 — Inicialización obligatoria:* si la carpeta del proyecto no tiene .git/, ANTES de cualquier modificación proponer git init + primer commit con el estado actual.

*Regla #2 — Commits descriptivos:* mensajes claros, en castellano, que expliquen el "qué" y el "por qué". Evitar mensajes vagos tipo "fix", "update", "cambios", "campeon".

*Regla #3 — No commitear sin pedirlo:* no hacer commits automáticos sin que el dueño los apruebe explícitamente (salvo el primer commit de inicialización, que es esperado).

*Regla #4 — Backup antes de cambios riesgosos:* antes de modificar lógica que toca localStorage o estructura de archivos, sugerir backup primero.

Identidad git ya configurada globalmente: Eric Nofal / alejoanton@hotmail.com.

## Workflow profesional esperado

1. *Plan antes de código*: para tareas no triviales, presentar plan primero. Esperar OK.
2. *Edit > Write*: preferir Edit a Write siempre que se pueda. Solo usar Write para archivos nuevos o reescrituras planeadas.
3. *Leer antes de modificar*: nunca tocar archivo sin haberlo leído antes.
4. *Considerar localStorage*: cualquier cambio que afecte URL/path del archivo requiere plan de backup/restore.
5. *Verificar visualmente*: después de cambios significativos, recomendar abrir la app y confirmar que los datos siguen ahí.

## Recetas y workflows

Si existe RECETA_MIGRACION_APPS.md en la carpeta del usuario, esa es la receta autorizada. Cualquier receta generada el 2026-06-11 sin contemplar git ni backup debe ignorarse.

## Restricciones generales (defaults)

- *No commitear a git* sin que el dueño lo pida explícitamente.
- *No instalar paquetes nuevos* sin avisar y justificar.
- *No borrar archivos* sin confirmar — especialmente MiAula_FINAL.html original.
- *No ejecutar recetas viejas* sin antes leer este CLAUDE.md y la receta autorizada.
- *Si existen instrucciones contradictorias*, preguntar al dueño cuál usar.

## Estilo de comunicación esperado

- Español rioplatense ("vos", no "tú").
- Paso a paso, con ejemplos concretos y preguntas de verificación.
- Validar el "por qué" antes del "cómo" cuando es un concepto nuevo.
- Sin emojis salvo que el dueño los use primero o los pida.
- Sin info dumps. Una idea por turno.
