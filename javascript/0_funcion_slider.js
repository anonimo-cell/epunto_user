// Variable global única para recordar el ID de la vista seleccionada por el usuario
let vistaObjetivoSeleccionada = null;

// Historial de vistas visitadas (para el botón "Volver")
let historialVistas = [];

// Apaga todos los botones del menú inferior y de la cabecera
function apagarBotonesMenu() {
    document.querySelectorAll('.multi-slider .btn-menu, .btn-login-header').forEach(btn => {
        btn.classList.remove('active');
    });
}

// Quita la marca de seleccionado a los botones de categoría
function limpiarCategoriasActivas() {
    document.querySelectorAll('.btn-cate-1, .btn-cate').forEach(btn => btn.classList.remove('activ-cate'));
}

// ==========================================
// 1. GESTIÓN DE PESTAÑAS PRINCIPALES
// ==========================================
function cambiarEstadoslider(elemento) {
    const idVistaDestino = elemento ? elemento.getAttribute('data-vista') : null;

    // Guardamos la vista actual en el historial antes de ir al login
    if (idVistaDestino === 'vista-login') {
        const vistaAbierta = obtenerVistaVisible();
        if (vistaAbierta) historialVistas.push(vistaAbierta.id);
    }

    // 1. Apagamos todos los botones y encendemos el que corresponde
    apagarBotonesMenu();

    if (elemento) {
        const esBotonInterno = elemento.closest('.slider-subir') ||
            elemento.classList.contains('btn-subir');

        // Si pulsamos directamente un menú principal o cabecera, lo encendemos
        if (!esBotonInterno) {
            elemento.classList.add('active');
        }
        // Si navegamos por un submenú, buscamos a su padre y lo encendemos
        else {
            const vistaMenuPadre = (elemento.closest('#vista-subir') || (idVistaDestino && idVistaDestino.includes('prod-')))
                ? 'vista-subir'
                : 'vista-ver';
            const botonMenuPadre = document.querySelector(`.multi-slider .btn-menu[data-vista="${vistaMenuPadre}"]`);
            if (botonMenuPadre) botonMenuPadre.classList.add('active');
        }
    }

    // 2. Mostramos la vista destino
    ocultarTodasLasVistas();
    if (idVistaDestino) {
        const vistaMostrar = document.getElementById(idVistaDestino);
        if (vistaMostrar) vistaMostrar.style.display = 'flex';
    }

    reiniciarCategorias();
    vistaObjetivoSeleccionada = null;
    opcionSubirSeleccionada = null;
}


// ==========================================
// 2. SELECCIÓN DE CATEGORÍA (NAVEGACIÓN DIRECTA)
// ==========================================
function seleccionarCategoria1(elemento) {
    elemento.parentElement.querySelectorAll('.activ-cate').forEach(btn => btn.classList.remove('activ-cate'));
    elemento.classList.add('activ-cate');

    vistaObjetivoSeleccionada = elemento.getAttribute('data-vista');
    realizarBusqueda();
}

// ==========================================
// 3. NAVEGACIÓN INTERNA
// ==========================================
function realizarBusqueda() {
    if (!vistaObjetivoSeleccionada) {
        return;
    }

    const vistaDestino = document.getElementById(vistaObjetivoSeleccionada);
    if (!vistaDestino) {
        console.warn(`El elemento HTML con ID '${vistaObjetivoSeleccionada}' no existe.`);
        return;
    }

    // Guardamos en el historial la vista de la que venimos
    const vistaActual = obtenerVistaVisible();
    if (vistaActual && vistaActual.id !== vistaObjetivoSeleccionada) {
        historialVistas.push(vistaActual.id);
    }

    ocultarTodasLasVistas();
    vistaDestino.style.display = 'flex';
}


// Botón "Volver": regresa a la vista anterior del historial
function regresarAnterior() {
    if (historialVistas.length === 0) {
        regresarvolver(); // Sin historial: volvemos al inicio
        return;
    }

    mostrarVista(historialVistas.pop());
    limpiarCategoriasActivas();
}


// ==========================================
// 4. LIMPIEZA Y RETORNO AL MENÚ (1 = Ver, 2 = Subir)
// ==========================================
function regresarvolver(opcion) {
    const idDestino = opcion === 2 ? 'vista-subir' : 'vista-ver';
    mostrarVista(idDestino);

    // Encendemos solo el botón del menú correspondiente
    apagarBotonesMenu();
    const btnInferior = document.querySelector(`.multi-slider .btn-menu[data-vista="${idDestino}"]`);
    if (btnInferior) btnInferior.classList.add('active');

    // Limpieza de estados en memoria
    reiniciarCategorias();
    vistaObjetivoSeleccionada = null;
    opcionSubirSeleccionada = null;
    limpiarCategoriasActivas();
}


// ==========================================
// INICIALIZACIÓN: vista "Ver" por defecto
// ==========================================
window.addEventListener("DOMContentLoaded", () => {
    const botonVer = document.querySelector('.multi-slider .btn-menu[data-vista="vista-ver"]');
    if (botonVer) {
        cambiarEstadoslider(botonVer);
    } else {
        mostrarVista('vista-ver');
    }
});


// =========================================================================
// VALIDACIÓN INTEGRAL EN BLOQUE Y SUBIDA A SUPABASE
// =========================================================================
async function validarYPublicar(elemento) {
    const vistaActual = elemento.closest('.subvista-contenido');
    if (!vistaActual) return;

    // 1. Limpiamos cualquier borde rojo de validaciones anteriores
    vistaActual.querySelectorAll('.campo-error').forEach(el => {
        el.classList.remove('campo-error');
    });

    let errores = [];

    function registrarError(campo, selectorAcordeon) {
        if (campo) {
            campo.classList.add('campo-error');
            errores.push({ elemento: campo, acordeon: selectorAcordeon });
        }
    }

    // ==========================================
    // A) VALIDACIÓN: PRODUCTO DE BAJO COSTE
    // ==========================================
    if (vistaActual.id === 'vista-prod-baj') {

        const titulo = vistaActual.querySelector('#seccion-info input[type="text"]');
        if (!titulo || titulo.value.trim() === "") registrarError(titulo || vistaActual, "#seccion-info");

        const descripcion = vistaActual.querySelector('#seccion-info textarea');
        if (!descripcion || descripcion.value.trim() === "") registrarError(descripcion || vistaActual, "#seccion-info");

        const areaImagen = vistaActual.querySelector('#seccion-info .area-carga-imagen');
        const previewImg = areaImagen ? areaImagen.querySelector('.preview-container') : null;
        if (!previewImg || previewImg.style.display === 'none') registrarError(areaImagen || vistaActual, "#seccion-info");

        const txtDificultad = document.getElementById('valor-dificultad');
        if (!txtDificultad || txtDificultad.innerText.toLowerCase().includes("no seleccionada")) registrarError(txtDificultad ? txtDificultad.closest('button') : vistaActual, "#seccion-filt");

        const txtPrecio = document.getElementById('valor-precio');
        if (!txtPrecio || txtPrecio.innerText.toLowerCase().includes("no seleccionada")) registrarError(txtPrecio ? txtPrecio.closest('button') : vistaActual, "#seccion-filt");

        const txtN1Baj = document.getElementById('valor-n1');
        if (!txtN1Baj || txtN1Baj.innerText.toLowerCase().includes("no seleccionada")) {
            registrarError(txtN1Baj ? txtN1Baj.closest('button') : vistaActual, ".guia-card");
        }

        // 2. Validar Categoría 2 (Bajo coste)
        const txtN2Baj = document.getElementById('valor-n2');
        if (!txtN2Baj || txtN2Baj.innerText.toLowerCase().includes("no seleccionada")) {
            registrarError(txtN2Baj ? txtN2Baj.closest('button') : vistaActual, ".guia-card");
        }

        // 3. Validar Categoría 3 (Bajo coste)
        const txtN3Baj = document.getElementById('valor-n3');
        if (!txtN3Baj || txtN3Baj.innerText.toLowerCase().includes("no seleccionada")) {
            registrarError(txtN3Baj ? txtN3Baj.closest('button') : vistaActual, ".guia-card");
        }

        const txtTiempo = document.getElementById('valor-tiempo');
        if (!txtTiempo || txtTiempo.innerText.toLowerCase().includes("no seleccionada")) registrarError(txtTiempo ? txtTiempo.closest('button') : vistaActual, "#seccion-filt");

        const txtN1 = document.getElementById('valor-n1');
        if (!txtN1 || txtN1.innerText.toUpperCase().includes("no seleccionada")) registrarError(txtN1 ? txtN1.closest('button') : vistaActual, "#seccion-cate");

        const materialesItems = vistaActual.querySelectorAll('#lista-materiales .material-item');
        if (materialesItems.length === 0) {
            const btnAñadirMat = vistaActual.querySelector('#btn-agregar-material');
            registrarError(btnAñadirMat, "#seccion-materiales");
        } else {
            for (let i = 0; i < materialesItems.length; i++) {
                const txtMat = materialesItems[i].querySelector('input');
                if (!txtMat || txtMat.value.trim() === "") {
                    registrarError(txtMat || materialesItems[i], "#seccion-materiales");
                }
            }
        }
        const pasos = vistaActual.querySelectorAll('#lista-pasos .paso-item');
        if (pasos.length === 0) {
            const btnAñadirPaso = vistaActual.querySelector('#btn-agregar-paso');
            registrarError(btnAñadirPaso, "#seccion-pasos");
        } else {
            for (let i = 0; i < pasos.length; i++) {
                const txtPaso = pasos[i].querySelector('textarea');
                if (!txtPaso || txtPaso.value.trim() === "") registrarError(txtPaso || pasos[i], "#seccion-pasos");
            }
        }


    }

    // ==========================================
    // A.2) VALIDACIÓN: PRODUCTO COMERCIALIZADO
    // ==========================================
    if (vistaActual.id === 'vista-prod-com') {

        // 1. Validar Título
        const tituloCom = vistaActual.querySelector('.paso-columna-texto input[type="text"]');
        if (!tituloCom || tituloCom.value.trim() === "") {
            registrarError(tituloCom || vistaActual, ".form-grid");
        }

        // 2. Validar Precio Comercializado
        const txtPrecioCom = document.getElementById('valor-precio-comercializado');
        if (!txtPrecioCom || txtPrecioCom.innerText.toLowerCase().includes("no seleccionada")) {
            const contenedorPrecio = vistaActual.querySelector('.contenedor-slider-filtros');
            registrarError(contenedorPrecio || vistaActual, ".form-grid");
        }

        // 3. Validar Imagen del Producto
        const areaImagenCom = vistaActual.querySelector('.paso-columna-imagen .area-carga-imagen');
        const previewImgCom = areaImagenCom ? areaImagenCom.querySelector('.preview-container') : null;
        if (!previewImgCom || previewImgCom.style.display === 'none') {
            registrarError(areaImagenCom || vistaActual, ".form-grid");
        }

        // 4. Validar Descripción
        const descripcionCom = vistaActual.querySelector('.form-row textarea');
        if (!descripcionCom || descripcionCom.value.trim() === "") {
            registrarError(descripcionCom || vistaActual, vistaActual);
        }

        // 5. Validar Enlace (si lo añadiste en el paso anterior)
        const enlaceCom = vistaActual.querySelector('.input-enlace');
        if (enlaceCom && enlaceCom.value.trim() === "") {
            registrarError(enlaceCom, vistaActual);
        }
        const txtN1Com = document.getElementById('valor-n1-com');
        if (!txtN1Com || txtN1Com.innerText.toLowerCase().includes("no seleccionada")) {
            registrarError(txtN1Com ? txtN1Com.closest('button') : vistaActual, ".guia-card");
        }

        // 2. Validar Categoría 2 (Comercializado)
        const txtN2Com = document.getElementById('valor-n2-com');
        if (!txtN2Com || txtN2Com.innerText.toLowerCase().includes("no seleccionada")) {
            registrarError(txtN2Com ? txtN2Com.closest('button') : vistaActual, ".guia-card");
        }

        // 3. Validar Categoría 3 (Comercializado)
        const txtN3Com = document.getElementById('valor-n3-com');
        if (!txtN3Com || txtN3Com.innerText.toLowerCase().includes("no seleccionada")) {
            registrarError(txtN3Com ? txtN3Com.closest('button') : vistaActual, ".guia-card");
        }
    }


    // ==========================================
    // B) SI HAY ERRORES: SCROLL AL PRIMERO Y FRENADO
    // ==========================================
    if (errores.length > 0) {
        const primerError = errores[0];
        if (primerError.acordeon) {
            const detalles = vistaActual.querySelector(primerError.acordeon);
            if (detalles && detalles.tagName === 'DETAILS') detalles.open = true;
        }
        primerError.elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
        primerError.elemento.focus();
        return false; // ¡AQUÍ SE FRENA Y NO AVANZA NI ENVÍA!
    }

    // ==========================================
    // C) SI TODO ESTÁ CORRECTO: SUBIR A SUPABASE SEGÚN LA VISTA
    // ==========================================

    // C.1) Subida para Producto de Bajo Coste
    if (vistaActual.id === 'vista-prod-baj') {
        const tituloFinal = vistaActual.querySelector('#seccion-info input[type="text"]').value.trim();
        const descripcionFinal = vistaActual.querySelector('#seccion-info textarea').value.trim();
        const imgPrincipal = vistaActual.querySelector('#seccion-info .img-preview').src;

        const dificultadFinal = document.getElementById('valor-dificultad').innerText;
        const precioFinal = document.getElementById('valor-precio').innerText;
        const tiempoFinal = document.getElementById('valor-tiempo').innerText;

        // <-- NUEVO: Recoger Categoría 1 y 2 para Bajo Coste
        const spanNivel1 = vistaActual.querySelector('#valor-n1');
        const categoria1Final = spanNivel1 ? spanNivel1.innerText.trim() : "Sin categoría";

        const spanNivel2 = vistaActual.querySelector('#valor-n2');
        const categoria2Final = spanNivel2 ? spanNivel2.innerText.trim() : "Sin categoría";

        // Nivel 3 (Ya lo tenías)
        const spanNivel3 = vistaActual.querySelector('#valor-n3');
        const categoriaFinal = spanNivel3 ? spanNivel3.innerText.trim() : "Sin categoría";

        let arrayMateriales = [];
        vistaActual.querySelectorAll('#lista-materiales .material-item').forEach((nodo) => {
            const textoMat = nodo.querySelector('input').value.trim();
            if (textoMat !== "") arrayMateriales.push(textoMat);
        });

        const conclusionesFinal = vistaActual.querySelector('#seccion-conclusiones textarea').value.trim();

        let arrayPasos = [];
        const nodosPasos = vistaActual.querySelectorAll('#lista-pasos .paso-item');
        nodosPasos.forEach((nodo) => {
            const textoPaso = nodo.querySelector('textarea').value.trim();
            const imgPasoEl = nodo.querySelector('.img-preview');
            const imgPasoFinal = (imgPasoEl && imgPasoEl.src && imgPasoEl.src.startsWith('data:')) ? imgPasoEl.src : null;

            arrayPasos.push({ texto: textoPaso, imagen: imgPasoFinal });
        });

        const textoOriginalBoton = elemento.innerText;
        elemento.innerText = "Subiendo producto... ";
        elemento.disabled = true;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const nombreUsuario = nombreVisibleDe(user) || "Anónimo";
            const fechaActual = new Date().toISOString();

            const { data, error } = await supabase
                .from('verproductos')
                .insert([
                    {
                        titulo: tituloFinal,
                        descripcion: descripcionFinal,
                        imagen_url: imgPrincipal,
                        dificultad: dificultadFinal,
                        precio: precioFinal,
                        tiempo: tiempoFinal,
                        categoria1: categoria1Final, // <-- NUEVO
                        categoria2: categoria2Final, // <-- NUEVO
                        categoria: categoriaFinal,
                        materiales: arrayMateriales,
                        conclusiones: conclusionesFinal,
                        pasos: arrayPasos,
                        producto: 0,
                        usuario: nombreUsuario,
                        fecha: fechaActual
                    }
                ]);

            if (error) throw error;

            cacheCatalogo.clear(); // para que el producto nuevo aparezca en el catálogo
            actualizarCategoriasVisibles(); // y su categoría, si antes estaba vacía
            limpiarFormulariosCompletos();

            //  Inyectamos todos los textos dinámicos para BAJO COSTE
            const tituloExito = document.getElementById('texto-exito-publicado');
            if (tituloExito) tituloExito.innerText = "Producto de bajo coste publicado con éxito";

            const btnExito = document.getElementById('btn-volver-publicado');
            if (btnExito) btnExito.innerText = "Subir más productos";

            // Modificamos la miga de pan intermedia
            const migaFormulario = document.getElementById('miga-tipo-formulario');
            if (migaFormulario) migaFormulario.innerText = "Formulario producto de bajo coste";

            vistaObjetivoSeleccionada = elemento.getAttribute('data-vista');
            if (typeof realizarBusqueda === 'function') realizarBusqueda();

        } catch (error) {
            console.error("Error al guardar en Supabase:", error);
        } finally {
            elemento.innerText = textoOriginalBoton;
            elemento.disabled = false;
        }
    }
    // C.2) Subida para Producto Comercializado
    // ==========================================
    // SUBIDA A SUPABASE: PRODUCTO COMERCIALIZADO
    // ==========================================
    else if (vistaActual.id === 'vista-prod-com') {
        // 1. Recopilamos los datos del formulario comercializado
        const tituloFinal = vistaActual.querySelector('.paso-columna-texto input[type="text"]').value.trim();
        const precioFinal = document.getElementById('valor-precio-comercializado').innerText;
        const imgPrincipal = vistaActual.querySelector('.paso-columna-imagen .img-preview').src;
        const descripcionFinal = vistaActual.querySelector('.form-row textarea').value.trim();

        // <-- NUEVO: Recoger Categoría 1 y 2 para Comercializado
        const spanNivel1Com = document.getElementById('valor-n1-com');
        const categoria1Final = spanNivel1Com ? spanNivel1Com.innerText.trim() : "Sin categoría";

        const spanNivel2Com = document.getElementById('valor-n2-com');
        const categoria2Final = spanNivel2Com ? spanNivel2Com.innerText.trim() : "Sin categoría";

        // Recogemos la categoría final del nivel 3 comercializado (Ya lo tenías)
        const spanNivel3Com = document.getElementById('valor-n3-com');
        const categoriaFinal = spanNivel3Com ? spanNivel3Com.innerText.trim() : "Sin categoría";

        // Recogemos el enlace
        const textareas = vistaActual.querySelectorAll('textarea');
        const enlaceFinal = textareas[1] ? textareas[1].value.trim() : "";

        // Feedback visual en el botón
        const textoOriginalBoton = elemento.innerText;
        elemento.innerText = "Subiendo producto...";
        elemento.disabled = true;

        try {
            // 2. Enviamos a Supabase
            const { data: { user } } = await supabase.auth.getUser();
            const nombreUsuario = nombreVisibleDe(user) || "Anónimo";
            const fechaActual = new Date().toISOString();

            const { data, error } = await supabase
                .from('verproductos')
                .insert([
                    {
                        titulo: tituloFinal,
                        precio: precioFinal,
                        categoria1: categoria1Final, // <-- NUEVO
                        categoria2: categoria2Final, // <-- NUEVO
                        categoria: categoriaFinal,
                        imagen_url: imgPrincipal,
                        descripcion: descripcionFinal,
                        enlace: enlaceFinal,
                        producto: 1, // 1 = Producto comercializado
                        usuario: nombreUsuario,
                        fecha: fechaActual
                    }
                ]);

            if (error) throw error;

            cacheCatalogo.clear(); // para que el producto nuevo aparezca en el catálogo
            actualizarCategoriasVisibles(); // y su categoría, si antes estaba vacía
            limpiarFormulariosCompletos();


            //  Inyectamos todos los textos dinámicos para COMERCIALIZADO
            const tituloExito = document.getElementById('texto-exito-publicado');
            if (tituloExito) tituloExito.innerText = "Producto comercializado publicado con éxito";

            const btnExito = document.getElementById('btn-volver-publicado');
            if (btnExito) btnExito.innerText = "Subir más productos";

            // Modificamos la miga de pan intermedia
            const migaFormulario = document.getElementById('miga-tipo-formulario');
            if (migaFormulario) migaFormulario.innerText = "Formulario producto comercializado";

            vistaObjetivoSeleccionada = elemento.getAttribute('data-vista');
            if (typeof realizarBusqueda === 'function') realizarBusqueda();

        } catch (error) {
            console.error("Error al guardar el producto comercializado en Supabase:", error);
        } finally {
            elemento.innerText = textoOriginalBoton;
            elemento.disabled = false;
        }
    }


    // C.3) Para otras pantallas genéricas
    else {
        vistaObjetivoSeleccionada = elemento.getAttribute('data-vista');
        if (typeof realizarBusqueda === 'function') realizarBusqueda();
    }
}
// =========================================================================
// UX: LIMPIEZA AUTOMÁTICA DE ERRORES AL INTERACTUAR
// =========================================================================

// 1. Quitar el borde rojo al instante cuando el usuario escribe en un campo de texto
document.addEventListener('input', function (event) {
    if (event.target.classList.contains('campo-error')) {
        event.target.classList.remove('campo-error');
    }

    // Si el usuario vuelve a escribir en las contraseñas, ocultamos el texto de error automáticamente
    if (event.target.id === 'psswd-1' || event.target.id === 'psswd-2') {
        const textoErrorPass = document.getElementById('error-texto-pass');
        if (textoErrorPass) textoErrorPass.style.display = 'none';
    }

    // Al cambiar el correo se quitan sus avisos ("ya tiene cuenta", "no es válido")
    if (event.target.id === 'solicitud-contacto') {
        const errorCorreo = document.getElementById('error-texto-correo');
        if (errorCorreo) errorCorreo.style.display = 'none';
    }

    // Inicio de sesión: el aviso se oculta cuando ya no queda ningún campo en rojo
    if (event.target.id === 'login-usuario-modal' || event.target.id === 'login-password-modal') {
        const avisoLogin = document.getElementById('mensaje-error-login-modal');
        if (avisoLogin && !document.querySelector('#modal-login .campo-error')) avisoLogin.style.display = 'none';
    }

    // Registrarse: igual
    if (event.target.closest('#vista-solicitud')) ocultarAvisoSolicitudSiCorrecto();
});

// Oculta el aviso "Falta rellenar..." de Registrarse cuando ya no queda nada en rojo
function ocultarAvisoSolicitudSiCorrecto() {
    const aviso = document.getElementById('mensaje-error-solicitud');
    if (aviso && !document.querySelector('#vista-solicitud .campo-error')) aviso.style.display = 'none';
}

// 2. Quitar el borde rojo al interactuar (hacer clic) con botones de categorías o filtros
document.addEventListener('click', function (event) {
    const elementoConError = event.target.closest('.campo-error');
    if (elementoConError) {
        elementoConError.classList.remove('campo-error');
    }
});

// 3. Quitar el borde rojo específicamente cuando se selecciona una foto nueva
document.addEventListener('change', function (event) {
    if (event.target.type === 'file') {
        const areaImagen = event.target.closest('.area-carga-imagen');
        if (areaImagen && areaImagen.classList.contains('campo-error')) {
            areaImagen.classList.remove('campo-error');
        }
    }
});

// 4. Observador para cambios en textos de los filtros
const observadorTextos = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        const span = mutation.target.parentElement;
        if (span && span.classList.contains('btn-sele-filt')) {
            if (!span.textContent.toLowerCase().includes("no seleccionada")) {
                const boton = span.closest('button');
                if (boton && boton.classList.contains('campo-error')) {
                    boton.classList.remove('campo-error');
                }
            }
        }
    });
});

document.querySelectorAll('.btn-sele-filt').forEach(span => {
    observadorTextos.observe(span, { characterData: true, childList: true, subtree: true });
});

// A. Función para añadir filas de materiales (el primero no lleva botón de borrar)
function agregarFilaMaterial() {
    const contenedor = document.getElementById('lista-materiales');
    const totalMateriales = contenedor.querySelectorAll('.material-item').length;

    if (totalMateriales >= 5) {
        return;
    }

    const div = document.createElement('div');
    div.className = 'material-item';
    div.style.cssText = "display: flex; gap: 10px; align-items: center; margin-bottom: 10px;";

    const numero = totalMateriales + 1;

    // Si es el primer material (totalMateriales === 0), NO añadimos el botón "X"
    if (totalMateriales === 0) {
        div.innerHTML = `
            <input type="text" placeholder="Escribe qué material" maxlength="20" aria-label="Material ${numero}" aria-required="true" class="input-material" style="flex: 1; padding: 8px; border: 1px solid #767676; border-radius: 6px;">
        `;
    } else {
        // A partir del segundo material, sí llevan el botón de eliminar
        div.innerHTML = `
            <input type="text" placeholder="Escribe qué material" maxlength="20" aria-label="Material ${numero}" aria-required="true" class="input-material" style="flex: 1; padding: 8px; border: 1px solid #767676; border-radius: 6px;">
            <button type="button" onclick="eliminarFilaMaterial(this)" aria-label="Eliminar material ${numero}" style="background-color: #d93025; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; min-width: 44px; min-height: 44px;">X</button>
        `;
    }

    contenedor.appendChild(div);

    // El foco va al campo nuevo para poder escribir directamente
    if (totalMateriales > 0) div.querySelector('input').focus();
}

// Elimina una fila de material y devuelve el foco a un sitio lógico
function eliminarFilaMaterial(boton) {
    boton.parentElement.remove();

    const contenedor = document.getElementById('lista-materiales');
    contenedor.querySelectorAll('.material-item').forEach((fila, indice) => {
        const campo = fila.querySelector('input');
        const botonEliminar = fila.querySelector('button');
        if (campo) campo.setAttribute('aria-label', `Material ${indice + 1}`);
        if (botonEliminar) botonEliminar.setAttribute('aria-label', `Eliminar material ${indice + 1}`);
    });

    const botonAnadir = document.getElementById('btn-agregar-material');
    if (botonAnadir) botonAnadir.focus();
    if (typeof anunciar === 'function') anunciar('Material eliminado');
}
// B. Autorellenar la primera fila vacía al cargar
document.addEventListener('DOMContentLoaded', () => {
    const listaMat = document.getElementById('lista-materiales');
    if (listaMat && listaMat.children.length === 0) {
        agregarFilaMaterial();
    }
});


// =========================================================================
// CONTROL DE SELECCIÓN DE PRECIO EN PRODUCTOS COMERCIALIZADOS
// =========================================================================
function cambiarOpcionPrecioComercializado(botonPulsado, opcionElegida) {
    const contenedor = botonPulsado.closest('.contenedor-slider-filtros');
    const botones = contenedor.querySelectorAll('button');

    // Apagamos todos los botones del grupo
    botones.forEach(btn => {
        btn.classList.remove('active-filtro');
    });

    // Encendemos solo el botón pulsado
    botonPulsado.classList.add('active-filtro');

    // Guardamos el valor seleccionado en el elemento de control interno
    const spanValor = document.getElementById('valor-precio-comercializado');
    if (spanValor) {
        spanValor.innerText = opcionElegida;
    }
}


// ==========================================
// FUNCIÓN PARA LIMPIAR AMBOS FORMULARIOS
// ==========================================
function limpiarFormulariosCompletos() {
    // 1. Limpiar Formulario de Bajo Coste (#vista-prod-baj)
    const vistaBaj = document.getElementById('vista-prod-baj');
    if (vistaBaj) {
        const tituloBaj = vistaBaj.querySelector('#seccion-info input[type="text"]');
        if (tituloBaj) tituloBaj.value = "";

        const descBaj = vistaBaj.querySelector('#seccion-info textarea');
        if (descBaj) descBaj.value = "";

        const areaImgBaj = vistaBaj.querySelector('#seccion-info .preview-container');
        const btnImgBaj = vistaBaj.querySelector('#seccion-info .btn-subir-imagen-paso');
        const fileBaj = vistaBaj.querySelector('#seccion-info .file-input');
        if (areaImgBaj) areaImgBaj.style.display = 'none';
        if (btnImgBaj) btnImgBaj.style.display = 'inline-block';
        if (fileBaj) fileBaj.value = "";

        // Resetear sliders/botones de filtros de bajo coste
        vistaBaj.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('active-filtro'));
        ['valor-dificultad', 'valor-precio', 'valor-tiempo'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = "No seleccionada";
        });

        // Limpiar materiales y pasos dinámicos si lo deseas
        const listaMat = vistaBaj.querySelector('#lista-materiales');
        if (listaMat) listaMat.innerHTML = '';
        const listaPasos = vistaBaj.querySelector('#lista-pasos');
        if (listaPasos) listaPasos.innerHTML = '';

        const descConcl = vistaBaj.querySelector('#seccion-conclusiones textarea');
        if (descConcl) descConcl.value = "";

        // Resetear categorías de bajo coste
        if (typeof resetearFormularioDOM === 'function') resetearFormularioDOM('');
    }

    // 2. Limpiar Formulario Comercializado (#vista-prod-com)
    const vistaCom = document.getElementById('vista-prod-com');
    if (vistaCom) {
        const tituloCom = vistaCom.querySelector('.paso-columna-texto input[type="text"]');
        if (tituloCom) tituloCom.value = "";

        const descCom = vistaCom.querySelector('.form-row textarea');
        if (descCom) descCom.value = "";

        const enlaceCom = vistaCom.querySelector('.input-enlace');
        if (enlaceCom) enlaceCom.value = "";

        vistaCom.querySelectorAll('.contenedor-slider-filtros .btn-filtro').forEach(btn => btn.classList.remove('active-filtro'));
        const spanPrecioCom = document.getElementById('valor-precio-comercializado');
        if (spanPrecioCom) spanPrecioCom.innerText = "No seleccionada";

        const previewCom = vistaCom.querySelector('.preview-container');
        const btnSubirCom = vistaCom.querySelector('.btn-subir-imagen-paso');
        const fileCom = vistaCom.querySelector('.file-input');
        if (previewCom) previewCom.style.display = 'none';
        if (btnSubirCom) btnSubirCom.style.display = 'inline-block';
        if (fileCom) fileCom.value = "";

        // Resetear categorías de comercializado
        if (typeof resetearFormularioDOM === 'function') resetearFormularioDOM('-com');
    }
}


// =========================================================================
// BÚSQUEDA DE PRODUCTOS POR TEXTO (INTELIGENTE / CONTEXTUAL)
// =========================================================================
async function ejecutarBusquedaTexto(event, inputElement) {
    if (event.key === 'Enter' || event.keyCode === 13) {

        const terminoBusqueda = inputElement.value.trim();

        if (terminoBusqueda === "") {
            return;
        }

        inputElement.blur();

        // 🌟 Búsqueda segura del contexto de la pantalla actual 🌟
        let tituloVista = "";
        const vistaActual = inputElement.closest('.subvista-contenido') || document.querySelector('.subvista-contenido');

        if (vistaActual) {
            const tituloVistaEl = vistaActual.querySelector('.titulo-linea-superior, .titulo-linea-sup');
            if (tituloVistaEl) {
                tituloVista = tituloVistaEl.innerText.trim();
            }
        }

        let url = `titulo=ilike.*${encodeURIComponent(terminoBusqueda)}*&order=fecha.desc`;
        let textoMiga = "Búsqueda global";

        if (tituloVista && tituloVista.toLowerCase() !== "ver productos" && tituloVista.toLowerCase() !== "cargando...") {
            url += `&categoria1=ilike.*${encodeURIComponent(tituloVista)}*`;
            textoMiga = `Búsqueda en ${tituloVista}`;
        }

        const tituloMolde = document.getElementById('titulo-dinamico');
        if (tituloMolde) tituloMolde.innerText = `"${terminoBusqueda}"`;

        const iconoMolde = document.getElementById('icono-dinamico');
        if (iconoMolde) iconoMolde.src = 'svg/buscar/buscar_input.svg';

        const navMigasCatalogo = document.querySelector('#vista-productos-final .migas-pan');
        if (navMigasCatalogo) {
            navMigasCatalogo.innerHTML = `
                <span class="miga-enlace" onclick="regresarvolver(1)">Ver Productos</span>
                <span class="miga-separador">&rarr;</span>
                <span class="miga-actual" id="miga-dinamica">${textoMiga}</span>
            `;
        }

        const contenedorProductos = document.getElementById('contenedor-productos-dinamico');
        if (contenedorProductos) {
            contenedorProductos.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <p class="mensaje-catalogo">Buscando "${terminoBusqueda}"...</p>
                </div>
            `;
        }

        vistaObjetivoSeleccionada = 'vista-productos-final';
        if (typeof realizarBusqueda === 'function') realizarBusqueda();

        try {
            // cargarProductos (abrirproducto.js) pide solo lo de las tarjetas
            productosGlobales = await cargarProductos(url);

            const btnComercializado = document.getElementById('btn-opcion-2');
            const btnBajoCoste = document.getElementById('btn-opcion-1');

            if (btnComercializado && btnBajoCoste) {
                btnComercializado.classList.remove('active-filtro');
                btnBajoCoste.classList.add('active-filtro');
            }
            tipoFiltroGlobal = 0;

            if (typeof renderizarProductosFiltrados === 'function') {
                renderizarProductosFiltrados();
            }

        } catch (error) {
            console.error("Error en la búsqueda por texto:", error);
            if (contenedorProductos) {
                contenedorProductos.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                        <p class="mensaje-catalogo mensaje-catalogo-error">Hubo un problema al realizar la búsqueda.</p>
                    </div>
                `;
            }
        }

        inputElement.value = "";
    }
}

// =========================================================================
// VALIDACIÓN GLOBAL: CREAR CUENTA EN SUPABASE AUTH Y TABLA 'usuarios'
// =========================================================================
async function validarFormularioSolicitud(elemento) {
    const vistaActual = document.getElementById('vista-solicitud');
    if (!vistaActual) return;

    // 1. Limpiar errores previos
    vistaActual.querySelectorAll('.campo-error').forEach(el => el.classList.remove('campo-error'));
    const textoErrorPass = document.getElementById('error-texto-pass');
    if (textoErrorPass) textoErrorPass.style.display = 'none';
    const avisoSolicitud = document.getElementById('mensaje-error-solicitud');
    if (avisoSolicitud) avisoSolicitud.style.display = 'none';

    let errores = [];
    let faltan = []; // lo que falta por rellenar (si hay algo, se muestra el aviso)

    // 2. Capturar campos
    const usuario = document.getElementById('solicitud-usuario');
    const pass1 = document.getElementById('psswd-1');
    const pass2 = document.getElementById('psswd-2');
    const contacto = document.getElementById('solicitud-contacto');
    const fundacion = document.getElementById('solicitud-fundacion');

    // 3. Validar textos
    if (!usuario || !usuario.value.trim()) { errores.push(usuario); faltan.push('el nombre de usuario'); }
    if (!contacto || !contacto.value.trim()) { errores.push(contacto); faltan.push('el correo'); }

    // El correo tiene que tener forma de correo: ahí se envía el código de verificación
    const errorCorreo = document.getElementById('error-texto-correo');
    if (errorCorreo) errorCorreo.style.display = 'none';
    if (contacto && contacto.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto.value.trim())) {
        errores.push(contacto);
        if (errorCorreo) {
            errorCorreo.innerText = "Escribe un correo electrónico válido (por ejemplo, nombre@gmail.com).";
            errorCorreo.style.display = 'block';
        }
    } else if (contacto && contacto.value.trim() && await correoYaRegistrado(contacto.value)) {
        // Se comprueba ya, para avisar a la vez que del resto de errores
        errores.push(contacto);
        if (errorCorreo) {
            errorCorreo.innerText = "Ese correo ya tiene una cuenta. Inicia sesión o usa otro correo.";
            errorCorreo.style.display = 'block';
        }
    }


    // 4. Validar contraseñas (todos los fallos a la vez, no solo el primero)
    if (!pass1 || !pass1.value.trim()) { errores.push(pass1); faltan.push('la contraseña'); }
    if (!pass2 || !pass2.value.trim()) { errores.push(pass2); faltan.push('repetir la contraseña'); }

    const fallosPass = [];
    if (pass1 && pass1.value.trim() !== '' && pass1.value.trim().length < 6) {
        // Supabase no acepta contraseñas de menos de 6 caracteres
        fallosPass.push("La contraseña debe tener al menos 6 caracteres.");
    }
    if (pass1 && pass2 && pass1.value.trim() !== '' && pass2.value.trim() !== '' && pass1.value !== pass2.value) {
        fallosPass.push("Las contraseñas no coinciden. Revísalas.");
    }
    if (fallosPass.length > 0) {
        errores.push(pass1);
        errores.push(pass2);
        if (textoErrorPass) {
            textoErrorPass.innerText = fallosPass.join("\n");
            textoErrorPass.style.display = 'block';
        }
    }

    // 5. Validar selección de perfil
    if (!perfilSeleccionadoSolicitud) {
        // Se marcan en rojo los botones de perfil (no la tarjeta entera)
        vistaActual.querySelectorAll('.btn-rela').forEach(btn => btn.classList.add('campo-error'));
        errores.push(vistaActual.querySelector('#sele-relacion .btn-rela'));
        faltan.push('tu relación con el Parkinson');
    }

    // 6. FRENAR SI HAY ERRORES BÁSICOS: los campos quedan en rojo y debajo
    //    se dice qué falta (sin mensajes que tapen la pantalla)
    if (errores.length > 0) {
        errores.forEach(el => {
            if (el && el.classList) el.classList.add('campo-error');
        });
        if (avisoSolicitud && faltan.length > 0) {
            avisoSolicitud.innerText = "Faltan por rellenar los campos obligatorios resaltados en rojo";
            avisoSolicitud.style.display = 'block';
        }
        // Subimos hasta el aviso (está arriba del formulario) y dejamos el cursor en el primer campo
        (faltan.length > 0 && avisoSolicitud ? avisoSolicitud : errores[0]).scrollIntoView({ behavior: 'smooth', block: 'center' });
        errores[0].focus({ preventScroll: true });
        return;
    }

    // =======================================================
    // 7. COMPROBACIÓN EN SUPABASE Y SUBIDA DE DATOS
    // =======================================================
    const textoOriginalBoton = elemento.innerText;
    elemento.innerText = "Creando cuenta...";
    elemento.disabled = true;

    try {
        const nombreIngresado = usuario.value.trim();
        const passIngresada = pass1.value.trim();

        // La cuenta se crea con el correo REAL: Supabase le manda un código para confirmarlo
        const emailReal = contacto.value.trim().toLowerCase();
        const fechaActual = new Date().toISOString();

        // Datos del perfil (sin contraseña: esa la guarda Supabase Auth cifrada).
        // Se guardan dentro de la cuenta (Authentication → Users → metadata).
        const perfil = {
            nombre: nombreIngresado,
            contacto: emailReal,
            relacion: perfilSeleccionadoSolicitud,
            fundacion: fundacion ? fundacion.value.trim() : '',
            fecha_envio: fechaActual
        };

        // 👇 REGISTRAR EN SUPABASE AUTH (envía el correo con el código) 👇
        const { data: dataAuth, error: errorAuth } = await window.supabase.auth.signUp({
            email: emailReal,
            password: passIngresada,
            options: { data: perfil }
        });

        if (errorAuth) throw errorAuth;

        // Si el correo ya tenía cuenta confirmada, Supabase no da error (para no
        // revelar qué correos existen) pero devuelve el usuario sin identidades
        if (dataAuth.user && Array.isArray(dataAuth.user.identities) && dataAuth.user.identities.length === 0) {
            throw { code: 'user_already_exists' };
        }

        // Lo guardamos para la pantalla del código (verificarCodigoCorreo)
        registroPendiente = { email: emailReal, perfil };

        // --- LIMPIEZA FINAL ---
        usuario.value = "";
        pass1.value = "";
        pass2.value = "";
        contacto.value = "";
        fundacion.value = "";
        vistaActual.querySelectorAll('.btn-rela').forEach(btn => btn.classList.remove('activ-cate'));
        perfilSeleccionadoSolicitud = null;

        // Pasamos a la pantalla donde se escribe el código del correo
        abrirVerificacionCorreo(emailReal);

    } catch (error) {
        console.error("Error al crear cuenta:", error);

        // Ese correo ya tiene una cuenta
        if (error.code === 'user_already_exists' || /already registered/i.test(error.message || '')) {
            marcarCorreoEnUso(contacto);
        } else if (avisoSolicitud) {
            if (error.code === 'weak_password') {
                avisoSolicitud.innerText = "La contraseña es demasiado débil: usa al menos 6 caracteres.";
            } else if (error.code === 'over_email_send_rate_limit' || error.status === 429) {
                avisoSolicitud.innerText = "Se han enviado demasiados correos. Espera un rato y vuelve a intentarlo.";
            } else if (/sending confirmation email/i.test(error.message || '')) {
                // Supabase no ha podido mandar el correo (SMTP mal configurado)
                avisoSolicitud.innerText = "No hemos podido enviar el correo con el código. Inténtalo más tarde.";
            } else if (error.code === 'email_address_not_authorized') {
                // El envío de correos de serie de Supabase solo manda a los miembros del proyecto
                avisoSolicitud.innerText = "Ahora mismo no podemos enviar correos a esta dirección. Prueba con otro correo.";
            } else {
                avisoSolicitud.innerText = "No se ha podido crear la cuenta. Inténtalo de nuevo.";
            }
            avisoSolicitud.style.display = 'block';
            avisoSolicitud.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } finally {
        elemento.innerText = textoOriginalBoton;
        elemento.disabled = false;
    }
}



// =========================================================================
// REGISTRARSE: CORREO YA EN USO
// El campo se marca en rojo y debajo se avisa (sin mensajes que tapen la pantalla)
// =========================================================================
// Pregunta a Supabase si el correo ya tiene una cuenta confirmada (función
// correo_registrado, ver supabase/usuarios_trigger.sql). Si no se puede
// comprobar, se deja pasar: signUp lo detecta igualmente al crear la cuenta.
async function correoYaRegistrado(correo) {
    try {
        const { data, error } = await window.supabase.rpc('correo_registrado', { correo: correo.trim() });
        if (error) throw error;
        return data === true;
    } catch (error) {
        console.warn("No se pudo comprobar si el correo ya existe:", error);
        return false;
    }
}

function marcarCorreoEnUso(campoCorreo) {
    campoCorreo.classList.add('campo-error');
    const aviso = document.getElementById('error-texto-correo');
    if (aviso) {
        aviso.innerText = "Ese correo ya tiene una cuenta. Inicia sesión o usa otro correo.";
        aviso.style.display = 'block';
    }
    campoCorreo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    campoCorreo.focus({ preventScroll: true });
}

// =========================================================================
// VERIFICAR EL CORREO CON EL CÓDIGO QUE ENVÍA SUPABASE
// =========================================================================
let registroPendiente = null; // { email, perfil } de la cuenta que falta confirmar

function abrirVerificacionCorreo(email) {
    document.getElementById('verificar-correo-email').innerText = email;
    const campoCodigo = document.getElementById('verificar-correo-codigo');
    campoCodigo.value = '';
    campoCodigo.classList.remove('campo-error');
    document.getElementById('error-texto-codigo').style.display = 'none';
    document.getElementById('texto-codigo-reenviado').style.display = 'none';

    vistaObjetivoSeleccionada = 'vista-verificar-correo';
    realizarBusqueda();
    campoCodigo.focus();

    // Acabamos de mandar un código: Supabase no deja pedir otro hasta pasado un minuto
    esperarParaReenviar(60);
}

// marcarCampo = false cuando el fallo no es del código escrito (p. ej. al reenviar)
function mostrarErrorCodigo(texto, marcarCampo = true) {
    const campoCodigo = document.getElementById('verificar-correo-codigo');
    const aviso = document.getElementById('error-texto-codigo');
    if (marcarCampo) campoCodigo.classList.add('campo-error');
    aviso.innerText = texto;
    aviso.style.display = 'block';
    document.getElementById('texto-codigo-reenviado').style.display = 'none';
    if (marcarCampo) campoCodigo.focus();
}

// Deja el botón "Reenviar código" desactivado con una cuenta atrás
let temporizadorReenvio = null;
function esperarParaReenviar(segundos) {
    const boton = document.getElementById('btn-reenviar-codigo');
    if (!boton) return;
    const textoOriginal = "Reenviar código";

    clearInterval(temporizadorReenvio);
    boton.disabled = true;
    boton.innerText = `Reenviar en ${segundos} s`;

    temporizadorReenvio = setInterval(() => {
        segundos--;
        if (segundos > 0) {
            boton.innerText = `Reenviar en ${segundos} s`;
        } else {
            clearInterval(temporizadorReenvio);
            boton.disabled = false;
            boton.innerText = textoOriginal;
        }
    }, 1000);
}

async function verificarCodigoCorreo(boton) {
    const campoCodigo = document.getElementById('verificar-correo-codigo');
    const codigo = campoCodigo.value.replace(/\s+/g, '');
    document.getElementById('error-texto-codigo').style.display = 'none';

    if (!registroPendiente) {
        mostrarErrorCodigo("Vuelve a registrarte para recibir un código.");
        return;
    }
    if (!/^\d{6,10}$/.test(codigo)) {
        mostrarErrorCodigo("Escribe el código de números que te hemos enviado al correo.");
        return;
    }

    const textoOriginal = boton.innerText;
    boton.innerText = "Comprobando...";
    boton.disabled = true;

    try {
        const { error } = await window.supabase.auth.verifyOtp({
            email: registroPendiente.email,
            token: codigo,
            type: 'signup'
        });
        if (error) throw error;

        // La copia del perfil en la tabla 'usuarios' la hace Supabase al
        // confirmarse la cuenta (trigger copiar_usuario_confirmado)

        // La sesión queda iniciada
        sessionStorage.setItem('sesionIniciada', '1');
        sessionStorage.setItem('nombreUsuario', registroPendiente.perfil.nombre);
        if (typeof pintarBotonLogin === 'function') pintarBotonLogin();

        registroPendiente = null;
        vistaObjetivoSeleccionada = 'vista-publicado-solicitud';
        realizarBusqueda();

    } catch (error) {
        console.error("Error al verificar el código:", error);
        mostrarErrorCodigo(/expired/i.test(error.message || '')
            ? "El código ha caducado. Pulsa \"Reenviar código\" para recibir otro."
            : "El código no es correcto. Revísalo e inténtalo de nuevo.");
    } finally {
        boton.innerText = textoOriginal;
        boton.disabled = false;
    }
}

async function reenviarCodigoCorreo(boton) {
    if (!registroPendiente) {
        mostrarErrorCodigo("Vuelve a registrarte para recibir un código.");
        return;
    }

    boton.disabled = true;
    try {
        const { error } = await window.supabase.auth.resend({ type: 'signup', email: registroPendiente.email });
        if (error) throw error;
        document.getElementById('error-texto-codigo').style.display = 'none';
        document.getElementById('verificar-correo-codigo').classList.remove('campo-error');
        document.getElementById('texto-codigo-reenviado').style.display = 'block';
        esperarParaReenviar(60);
    } catch (error) {
        console.error("Error al reenviar el código:", error);

        // Supabase dice cuántos segundos faltan: "...you can only request this after 42 seconds"
        const faltan = /after (\d+) seconds?/i.exec(error.message || '');
        if (faltan) {
            mostrarErrorCodigo(`Ya te hemos enviado un código hace poco. Podrás pedir otro en ${faltan[1]} segundos.`, false);
            esperarParaReenviar(parseInt(faltan[1], 10));
        } else if (error.code === 'over_email_send_rate_limit' || error.status === 429) {
            mostrarErrorCodigo("Se han enviado demasiados correos. Espera un rato y vuelve a intentarlo.", false);
            boton.disabled = false;
        } else if (/sending confirmation email/i.test(error.message || '')) {
            mostrarErrorCodigo("No hemos podido enviar el correo con el código. Inténtalo más tarde.", false);
            boton.disabled = false;
        } else {
            mostrarErrorCodigo("No se ha podido reenviar el código. Inténtalo de nuevo en un rato.", false);
            boton.disabled = false;
        }
    }
}
