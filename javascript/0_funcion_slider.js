// Variable global única para recordar el ID de la vista seleccionada por el usuario
let vistaObjetivoSeleccionada = null;

// ==========================================
// 1. GESTIÓN DE PESTAÑAS PRINCIPALES
// ==========================================
// ==========================================
// 1. GESTIÓN DE PESTAÑAS PRINCIPALES
// ==========================================
// ==========================================
// 1. GESTIÓN DE PESTAÑAS PRINCIPALES
// ==========================================

// ==========================================
// 1. GESTIÓN DE PESTAÑAS PRINCIPALES (Y BOTÓN SOLICITUD)
// ==========================================
// ==========================================
// 1. GESTIÓN DE PESTAÑAS PRINCIPALES
// ==========================================
// ==========================================
// 1. GESTIÓN DE PESTAÑAS PRINCIPALES
// ==========================================
function cambiarEstadoslider(elemento) {
    const idVistaDestino = elemento ? elemento.getAttribute('data-vista') : null;

    // === GUARDAR LA VISTA ACTUAL EN TU HISTORIAL ===
    if (idVistaDestino === 'vista-login') {
        const vistasAbiertas = document.querySelectorAll('.subvista-contenido');
        vistasAbiertas.forEach(vista => {
            if (vista.style.display === 'flex' || vista.style.display === 'block') {
                if (typeof historialVistas !== 'undefined') {
                    historialVistas.push(vista.id);
                }
            }
        });
    }

    // ==========================================
    // 1. APAGAR ABSOLUTAMENTE TODOS LOS BOTONES
    // ==========================================
    // Apagamos los 4 botones del menú inferior
    document.querySelectorAll('.multi-slider .btn-menu').forEach(btn => {
        btn.classList.remove('active');
    });

    // Apagamos los botones de la cabecera (Empresa, Solicitar cuenta, Iniciar sesión)
    document.querySelectorAll('.btn-login-header').forEach(btn => {
        btn.classList.remove('active');
    });

    // 🌟 GESTIÓN INTELIGENTE DE BOTONES ACTIVOS 🌟
    if (elemento) {
        const esFormularioEmpresa = idVistaDestino === 'vista-form-ideas' || idVistaDestino === 'vista-form-validar';
        const esBotonInterno = elemento.closest('.slider-subir') || 
                               elemento.classList.contains('btn-subir') || 
                               idVistaDestino === 'vista-formulario-problema';

        // Si pulsamos directamente un menú principal o cabecera, lo encendemos
        if (!esBotonInterno && !esFormularioEmpresa) {
            elemento.classList.add('active'); 
        } 
        // Si navegamos por un submenú, buscamos a su padre y lo encendemos
        else {
            let vistaMenuPadre = 'vista-ver';
            
            if (esFormularioEmpresa) {
                vistaMenuPadre = 'vista-empresa';
            } else if (elemento.closest('#vista-subir') || (idVistaDestino && idVistaDestino.includes('prod-'))) {
                vistaMenuPadre = 'vista-subir';
            } else if (elemento.closest('#vista-problema') || idVistaDestino === 'vista-formulario-problema') {
                vistaMenuPadre = 'vista-problema';
            } else if (elemento.closest('#vista-probar')) {
                vistaMenuPadre = 'vista-probar';
            }
            
            // Encendemos el padre correcto
            let botonMenuPadre = document.querySelector(`.multi-slider .btn-menu[data-vista="${vistaMenuPadre}"]`);
            if (!botonMenuPadre && vistaMenuPadre === 'vista-empresa') {
                botonMenuPadre = document.querySelector(`.btn-login-header[data-vista="vista-empresa"]`);
            }
            if (botonMenuPadre) botonMenuPadre.classList.add('active');
        }
    }

    // ==========================================
    // 2. GESTIÓN DE VISTAS (Mostrar/Ocultar)
    // ==========================================
    const idVistasPrincipales = [
        'vista-ver', 'vista-subir', 'vista-problema', 'vista-probar',
        'vista-autonomia', 'vista-ocio', 'vista-productividad', 'vista-otros',
        'vista-movilidad', 'vista-comunica', 'vista-higiene', 'vista-vestir',
        'vista-prod-baj', 'vista-publicado', 'vista-publicado-dificultad', 'vista-prod-com', 
        'vista-login', 'vista-solicitud', 'vista-productos-final', 'vista-productos-probar',
        'vista-formulario-problema', 'vista-detalle-producto', 'vista-detalle-verproducto', 
        'vista-detalle-verproductocom', 'vista-catalogo-productosprobar', 'vista-detalle-productosprobar',
        'vista-form-ideas', 'vista-form-validar', 'vista-empresa', 'vista-publicado-empresa',
        'vista-publicado-solicitud'
    ];

    idVistasPrincipales.forEach(id => {
        const vista = document.getElementById(id);
        if (vista) vista.style.display = 'none';
    });

    if (idVistaDestino) {
        const vistaMostrar = document.getElementById(idVistaDestino);
        if (vistaMostrar) {
            vistaMostrar.style.display = 'flex';
        }
    }

    if (typeof reiniciarCategorias === 'function') reiniciarCategorias();
    window.vistaObjetivoSeleccionada = null;
    if (typeof opcionSubirSeleccionada !== 'undefined') window.opcionSubirSeleccionada = null;
}


// ==========================================
// 2. SELECCIÓN DE CATEGORÍA / SUBCATEGORÍA
// ==========================================
/**
 * Guarda el ID de la vista destino directamente desde el atributo data-vista del HTML.
 * @param {HTMLElement} elemento - El botón que recibió el clic.
 */
// ==========================================
// 2. SELECCIÓN DE CATEGORÍA / SUBCATEGORÍA (NAVEGACIÓN DIRECTA)
// ==========================================

/**
 * Guarda el ID de la vista destino y navega inmediatamente (Nivel 1)
 * @param {HTMLElement} elemento - El botón que recibió el clic.
 */
function seleccionarCategoria1(elemento) {
    const botonesCategoria = elemento.parentElement.querySelectorAll('.btn-cate-1');
    const idVistaDestino = elemento.getAttribute('data-vista');

    //  SISTEMA DE BLOQUEO POR SESIÓN 
    if (idVistaDestino === 'vista-prod-baj' || idVistaDestino === 'vista-prod-com') {
        const estadoSesion = localStorage.getItem('sesionIniciada');
        if (estadoSesion !== '1') {
            alert("¡Hola! Para poder subir un producto, necesitas iniciar sesión primero.");

            // === ESTA ES LA LÍNEA MÁGICA NUEVA ===
            // Guardamos a dónde quería ir antes de mandarle al login
            if (typeof vistaIntencion !== 'undefined') {
                vistaIntencion = idVistaDestino;
            }

            const btnLogin = document.querySelector('[data-vista="vista-login"]');
            if (btnLogin) cambiarEstadoslider(btnLogin);
            return;
        }
    }
    // Quita la clase activa a los botones del mismo grupo
    botonesCategoria.forEach(btn => btn.classList.remove('activ-cate'));

    // Añade la clase activa al botón pulsado
    elemento.classList.add('activ-cate');

    // Leemos directamente el atributo "data-vista" del botón
    vistaObjetivoSeleccionada = elemento.getAttribute('data-vista');

    console.log("ID de vista destino guardado en memoria:", vistaObjetivoSeleccionada);

    // NAVEGACIÓN AUTOMÁTICA: Ejecuta la búsqueda de inmediato al hacer clic
    realizarBusqueda();
}

// Variable global para el segundo nivel de profundidad
let subVistaObjetivoSeleccionada = null;

/**
 * Guarda el ID de la subvista destino y navega inmediatamente (Nivel 2)
 */
function seleccionarCategoria2(elemento) {
    const botonesCategoria = elemento.parentElement.querySelectorAll('.btn-cate');

    // Quita la clase activa a los botones del mismo grupo interno
    botonesCategoria.forEach(btn => btn.classList.remove('activ-cate'));

    // Añade la clase activa al botón pulsado
    elemento.classList.add('activ-cate');

    // Guardamos el destino en nuestra variable de memoria
    vistaObjetivoSeleccionada = elemento.getAttribute('data-vista');

    console.log("ID de subvista destino (Nivel 2) guardado:", vistaObjetivoSeleccionada);

    // NAVEGACIÓN AUTOMÁTICA: Ejecuta la búsqueda de inmediato al hacer clic
    realizarBusqueda();
}
// ==========================================
// 3. EJECUCIÓN DE BÚSQUEDA / NAVEGACIÓN INTERNA (MEJORADA)
// ==========================================
// Debe estar fuera de las funciones para que no se borre al cambiar de pantalla
// 1. REGISTRO GLOBAL (Ponlo arriba del todo en tu archivo JS, fuera de cualquier función)
let historialVistas = [];


// 2. TU FUNCIÓN DE BUSCAR MODIFICADA (Reemplaza la que tenías antes por esta)
function realizarBusqueda() {
    if (!vistaObjetivoSeleccionada) {
        alert("Por favor, selecciona una opción antes de continuar.");
        return;
    }

    console.log("Cambiando a la vista en pantalla:", vistaObjetivoSeleccionada);

    const vistaDestino = document.getElementById(vistaObjetivoSeleccionada);

    if (vistaDestino) {

        try {
            if (typeof historialVistas === 'undefined') {
                window.historialVistas = [];
            }

            const todasLasVistas = [
                'vista-ver', 'vista-subir', 'vista-problema', 'vista-probar',
                //vistas de ver nivel 1
                'vista-autonomia', 'vista-ocio', 'vista-productividaductividad', 'vista-otros', 'vista-movilidad', 'vista-comunica',
                'vista-higiene', 'vista-vestir', 'vista-prod-baj', 'vista-publicado', 'vista-prod-com', 'vista-login', 'vista-solicitud'
                , 'vista-formulario-problema', 'vista-detalle-producto', 'vista-detalle-verproducto','vista-form-ideas','vista-empresa', 'vista-form-validar'
                //vistas de alimentacion a borrar

            ];

            const vistaActualId = todasLasVistas.find(id => {
                const el = document.getElementById(id);
                return el && el.style.display === 'flex';
            });

            if (vistaActualId && vistaActualId !== vistaObjetivoSeleccionada) {
                historialVistas.push(vistaActualId);
                console.log(`Historial guardado: Venimos de '${vistaActualId}' hacia '${vistaObjetivoSeleccionada}'`);
            }
        } catch (errorHistorial) {
            console.error("Error guardando el historial de navegación:", errorHistorial);
        }

        // Apagar vistas anteriores
        const todasLasVistas = [
            'vista-ver', 'vista-subir', 'vista-problema', 'vista-probar',
            //vistas de ver nivel 1
            'vista-autonomia', 'vista-ocio', 'vista-productividad', 'vista-otros',
            'vista-higiene', 'vista-movilidad', 'vista-vestir', , 'vista-prod-baj', 'vista-publicado', 'vista-prod-com', 'vista-login'
            , 'vista-solicitud', 'vista-productos-final', 'vista-formulario-problema', 'vista-detalle-producto', 'vista-detalle-verproducto',
            'vista-form-ideas','vista-empresa', 'vista-form-validar', 'vista-comunica'
            //vistas de alimentacion a borrar

        ];

        todasLasVistas.forEach(id => {
            const vistaAnterior = document.getElementById(id);
            if (vistaAnterior) {
                vistaAnterior.style.display = 'none';
            }
        });

        if (typeof SUBCATEGORIAS_NORMALIZADAS !== 'undefined') {
            ocultarElementosPorId(SUBCATEGORIAS_NORMALIZADAS);
        }

        // Mostrar nueva vista
        vistaDestino.style.display = 'flex';

    } else {
        console.warn(`El elemento HTML con ID '${vistaObjetivoSeleccionada}' no existe.`);
        alert("Esta sección aún no ha sido implementada en el HTML.");
    }
}


// 3. TU FUNCIÓN PARA EL BOTÓN "VOLVER" (Añádela aquí abajo si no la tenías ya)
function regresarAnterior() {
    console.log("Ejecutando retorno a la vista anterior...");

    if (!historialVistas || historialVistas.length === 0) {
        console.log("No hay historial previo. Volviendo al inicio por defecto.");
        regresarvolver(); // Llama a tu función de inicio si no hay historial
        return;
    }

    const vistaAnteriorId = historialVistas.pop();

    const todasLasVistas = [
        'vista-ver', 'vista-subir', 'vista-problema', 'vista-probar',
        //vistas de ver nivel 1
        'vista-autonomia', 'vista-ocio', 'vista-productividad', 'vista-otros', 'vista-movilidad', 'vista-comunica',
        'vista-higiene', 'vista-vestir', 'vista-prod-baj', 'vista-publicado', 'vista-prod-com', 'vista-login'
        , 'vista-solicitud', 'vista-productos-final', 'vista-formulario-problema', 'vista-detalle-producto', , 'vista-detalle-verproducto',
        'vista-detalle-productosprobar', 'vista-form-ideas','vista-empresa', 'vista-form-validar'
        //vistas de alimentacion a borrar

    ];

    todasLasVistas.forEach(id => {
        const vista = document.getElementById(id);
        if (vista) vista.style.display = 'none';
    });

    if (typeof SUBCATEGORIAS_NORMALIZADAS !== 'undefined' && Array.isArray(SUBCATEGORIAS_NORMALIZADAS)) {
        ocultarElementosPorId(SUBCATEGORIAS_NORMALIZADAS);
    }

    const vistaDestino = document.getElementById(vistaAnteriorId);
    if (vistaDestino) {
        vistaDestino.style.display = 'flex';
        console.log(`Regresó con éxito a: ${vistaAnteriorId}`);
    }

    // =======================================================================
    // SOLUCIÓN: Limpieza de clases activas en botones nivel 1 y nivel 2 al ir atrás
    // =======================================================================
    document.querySelectorAll('.btn-cate-1, .btn-cate').forEach(btn => {
        btn.classList.remove('activ-cate');
    });
}

// Mantener compatibilidad de nombres por si tus botones antiguos de formularios aún llaman a estas funciones:



// ==========================================
// 4. LIMPIEZA Y RETORNO (VOLVER)
// ==========================================
/**
 * Restaura el estado visual y regresa al menú o cuadrícula inicial.
 */
// ==========================================
// 4. LIMPIEZA Y RETORNO (VOLVER) - VERSIÓN ULTRA ROBUSTA
// ==========================================
/**
 * Restaura el estado visual y regresa al menú o cuadrícula inicial de forma segura.
 */
// ==========================================
// 4. LIMPIEZA Y RETORNO (VOLVER FORZADO A 'VER')
// ==========================================
// ==========================================
// 4. LIMPIEZA Y RETORNO UNIFICADO CON PARÁMETROS (1 AL 4)
// ==========================================
// ==========================================
// 4. LIMPIEZA Y RETORNO UNIFICADO CON PARÁMETROS (1 AL 4)
// ==========================================
function regresarvolver(opcion) {
    console.log("Ejecutando retorno dinámico al menú con opción:", opcion);

    // 1. Ocultamos explícitamente todas las subvistas
    const subvistasCategorias = [
        'vista-ver', 'vista-subir', 'vista-problema', 'vista-probar',
        'vista-autonomia', 'vista-ocio', 'vista-productividad', 'vista-otros',
        'vista-movilidad', 'vista-comunica', 'vista-higiene', 'vista-vestir',
        'vista-prod-baj', 'vista-publicado', 'vista-prod-com', 'vista-login',
        'vista-solicitud', 'vista-productos-final', 'vista-formulario-problema', 
        'vista-detalle-producto', 'vista-detalle-verproducto', 'vista-catalogo-productosprobar', 'vista-detalle-productosprobar',
        'vista-form-ideas','vista-empresa', 'vista-form-validar','vista-publicado-empresa', 'vista-publicado-solicitud'
    ];

    subvistasCategorias.forEach(id => {
        const vista = document.getElementById(id);
        if (vista) vista.style.display = 'none';
    });

    if (typeof SUBCATEGORIAS_NORMALIZADAS !== 'undefined' && Array.isArray(SUBCATEGORIAS_NORMALIZADAS)) {
        ocultarElementosPorId(SUBCATEGORIAS_NORMALIZADAS);
    }
    if (typeof ocultarElementosPorId === 'function') {
        ocultarElementosPorId(['sub_comercializado', 'sub_bajocoste', 'vista-sub_comercializado', 'vista-sub_bajocoste']);
    }

    // 3. Diccionario/Switch para decidir el destino
    let idDestino = '';
    switch(opcion) {
        case 1: idDestino = 'vista-ver'; break;
        case 2: idDestino = 'vista-subir'; break;
        case 3: idDestino = 'vista-problema'; break;
        case 4: idDestino = 'vista-probar'; break;
        case 5: idDestino = 'vista-empresa'; break;
        default: idDestino = 'vista-ver'; break;
    }

    // 4. Mostramos la vista elegida
    const vistaDestino = document.getElementById(idDestino);
    if (vistaDestino) {
        vistaDestino.style.display = 'flex';
    }

    // 5. APAGAR TODOS LOS BOTONES (Abajo y arriba)
    document.querySelectorAll('.multi-slider .btn-menu').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.btn-login-header').forEach(btn => btn.classList.remove('active'));

    // 6. ENCENDER SOLO EL CORRECTO
    if (idDestino === 'vista-empresa') {
        const btnEmpresa = document.querySelector(`.btn-login-header[data-vista="vista-empresa"]`);
        if (btnEmpresa) btnEmpresa.classList.add('active');
    } else {
        const btnInferior = document.querySelector(`.multi-slider .btn-menu[data-vista="${idDestino}"]`);
        if (btnInferior) btnInferior.classList.add('active');
    }

    // 7. Limpieza absoluta de estados en memoria
    if (typeof reiniciarCategorias === 'function') reiniciarCategorias();
    window.vistaObjetivoSeleccionada = null;
    if (typeof opcionSubirSeleccionada !== 'undefined') window.opcionSubirSeleccionada = null;

    document.querySelectorAll('.btn-cate-1, .btn-cate').forEach(btn => {
        btn.classList.remove('activ-cate');
    });
}


// ==========================================
// INICIALIZACIÓN AUTOMÁTICA
// ==========================================
// ==========================================
// INICIALIZACIÓN AUTOMÁTICA POR DEFECTO (REPARADA)
// ==========================================
window.addEventListener("DOMContentLoaded", () => {
    // 1. Buscamos el contenedor que tiene el título "Ver" dentro del slider
    const botonVerPorDefecto = Array.from(document.querySelectorAll('.multi-slider div, .multi-slider button'))
        .find(btn => {
            const titulo = btn.querySelector('.btn-titulo');
            const textoCaja = titulo ? titulo.innerText : btn.innerText;
            return textoCaja.toLowerCase().trim() === 'ver';
        });

    // 2. ¡CORRECCIÓN! Ejecutamos la función moderna que entiende tus nuevos botones div
    if (botonVerPorDefecto) {
        cambiarEstadoslider(botonVerPorDefecto); // <-- Antes decía cambiarEstado
        console.log("Vista 'Ver' cargada por defecto correctamente a través del slider.");
    } else {
        // Plan B: Rescate directo si el HTML no estuviera listo
        const vistaVer = document.getElementById('vista-ver');
        if (vistaVer) vistaVer.style.display = 'flex';
    }
});


// La variable global sigue recordando cuál está activa
let categoriaSeleccionada_ali = null;


// =========================================================================
// VALIDACIÓN INTEGRAL EN BLOQUE (ALERTA ÚNICA Y SCROLL AL PRIMERO)

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
    // A.3) VALIDACIÓN: FORMULARIO DE PROBLEMA
    // ==========================================
   // ==========================================
    // A.3) VALIDACIÓN: FORMULARIO DE PROBLEMA
    // ==========================================
    if (vistaActual.id === 'vista-formulario-problema') {
        // 1. COMPROBAR SI ESTÁ REGISTRADO (SESIÓN)

        // 2. Validar Input (Dificultad)
        const inputDificultad = vistaActual.querySelector('.form-row input[type="text"]');
        if (!inputDificultad || inputDificultad.value.trim() === "") {
            registrarError(inputDificultad || vistaActual, ".guia-card");
        }

        // 3. Validar Categoría 1
        const txtN1Problema = document.getElementById('valor-n1-prob');
        if (!txtN1Problema || txtN1Problema.innerText.toLowerCase().includes("no seleccionada")) {
            registrarError(txtN1Problema ? txtN1Problema.closest('button') : vistaActual, ".guia-card");
        }

        // 4. Validar Categoría 2 (¡NUEVO!)
        const txtN2Problema = document.getElementById('valor-n2-prob');
        if (!txtN2Problema || txtN2Problema.innerText.toLowerCase().includes("no seleccionada")) {
            registrarError(txtN2Problema ? txtN2Problema.closest('button') : vistaActual, ".guia-card");
        }

        // 5. Validar Categoría 3 (¡NUEVO!)
        const txtN3Problema = document.getElementById('valor-n3-prob');
        if (!txtN3Problema || txtN3Problema.innerText.toLowerCase().includes("no seleccionada")) {
            registrarError(txtN3Problema ? txtN3Problema.closest('button') : vistaActual, ".guia-card");
        }

       
        // 1. Validar Categoría 1 (Problema)
            const txtN1Prob = document.getElementById('valor-n1-prob');
            if (!txtN1Prob || txtN1Prob.innerText.toLowerCase().includes("no seleccionada")) {
                registrarError(txtN1Prob ? txtN1Prob.closest('button') : vistaActual, ".guia-card");
            }

            // 2. Validar Categoría 2 (Problema)
            const txtN2Prob = document.getElementById('valor-n2-prob');
            if (!txtN2Prob || txtN2Prob.innerText.toLowerCase().includes("no seleccionada")) {
                registrarError(txtN2Prob ? txtN2Prob.closest('button') : vistaActual, ".guia-card");
            }

            // 3. Validar Categoría 3 (Problema)
            const txtN3Prob = document.getElementById('valor-n3-prob');
            if (!txtN3Prob || txtN3Prob.innerText.toLowerCase().includes("no seleccionada")) {
                registrarError(txtN3Prob ? txtN3Prob.closest('button') : vistaActual, ".guia-card");
            }
    }
    // ==========================================
    // B) GESTIÓN DE LA ALERTA ÚNICA Y EL SCROLL (FRENADO)
    // ==========================================
    if (errores.length > 0) {
        alert("Falta información por rellenar.");
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
        elemento.innerText = "Subiendo producto... ⏳";
        elemento.disabled = true;

        try {
           const { data: { user } } = await supabase.auth.getUser();
            const nombreUsuario = user ? user.email.split('@')[0] : "Anónimo";
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
            alert("Hubo un problema al subir el producto. Inténtalo de nuevo.");
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
        const enlaceInput = vistaActual.querySelector('.input-enlace');
        const enlaceFinal = enlaceInput ? enlaceInput.value.trim() : "";

        // Feedback visual en el botón
        const textoOriginalBoton = elemento.innerText;
        elemento.innerText = "Subiendo producto... ⏳";
        elemento.disabled = true;

        try {
            // 2. Enviamos a Supabase
          const { data: { user } } = await supabase.auth.getUser();
            const nombreUsuario = user ? user.email.split('@')[0] : "Anónimo";
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

            limpiarFormulariosCompletos();

            
            // ✨ Inyectamos todos los textos dinámicos para COMERCIALIZADO
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
            alert("Hubo un problema al subir el producto. Inténtalo de nuevo.");
        } finally {
            elemento.innerText = textoOriginalBoton;
            elemento.disabled = false;
        }
    }



    // ==========================================
        // C.3) SUBIDA A SUPABASE: FORMULARIO DE DIFICULTAD
        // ==========================================
        else if (vistaActual.id === 'vista-formulario-problema') {
            const dificultadFinal = vistaActual.querySelector('.form-row input[type="text"]').value.trim();
            const ideaFinal = vistaActual.querySelector('.form-row textarea').value.trim();
            
            const spanCat1 = document.getElementById('valor-n1-prob');
            const cat1Final = spanCat1 ? spanCat1.innerText.trim() : "Sin categoría";
            
            const spanCat2 = document.getElementById('valor-n2-prob');
            const cat2Final = spanCat2 ? spanCat2.innerText.trim() : "Sin categoría";
            
            const spanCat3 = document.getElementById('valor-n3-prob');
            const cat3Final = spanCat3 ? spanCat3.innerText.trim() : "Sin categoría";

            const textoOriginalBoton = elemento.innerText;
            elemento.innerText = "Enviando formulario...";
            elemento.disabled = true;

            try {
                // 1. Enviamos los datos EXACTOS a la tabla 'dificultad' de Supabase
                const { error } = await supabase
                    .from('dificultad-form') 
                    .insert([
                        {
                            dificultad: dificultadFinal,
                            categoria1: cat1Final,
                            categoria2: cat2Final,
                            categoria: cat3Final, // Tal y como la nombraste en tu base de datos
                            idea: ideaFinal
                        }
                    ]);

                if (error) throw error;

                // ==========================================
                // 2. LIMPIEZA TOTAL DEL FORMULARIO
                // ==========================================
                const inputDificultad = vistaActual.querySelector('.form-row input[type="text"]');
                if (inputDificultad) inputDificultad.value = "";
                
                const textareaIdea = vistaActual.querySelector('.form-row textarea');
                if (textareaIdea) textareaIdea.value = "";

                if (typeof resetearFormularioDOM === 'function') {
                    resetearFormularioDOM('-prob');
                }

                localStorage.removeItem('categoriaGuardadaNombre-prob');
                localStorage.removeItem('subcategoriaGuardada-prob');
                localStorage.removeItem('subcategoriaNivel3Guardada-prob');
                // ==========================================

                // 3. INYECTAMOS LOS TEXTOS DINÁMICOS DE ÉXITO
                const tituloExito = document.getElementById('texto-exito-publicado');
                if (tituloExito) tituloExito.innerText = "¡Dificultad reportada con éxito!";
                
                const btnExito = document.getElementById('btn-volver-publicado');
                if (btnExito) {
                    btnExito.innerText = "Volver a Problemas";
                    btnExito.onclick = function() { regresarvolver(3); };
                }

                const migaForm = document.getElementById('miga-tipo-formulario');
                if (migaForm) migaForm.innerText = "Formulario de dificultades";

                // 4. Cambiamos a la vista de éxito
                vistaObjetivoSeleccionada = elemento.getAttribute('data-vista');
                if (typeof realizarBusqueda === 'function') realizarBusqueda();

            } catch (error) {
                console.error("Error al enviar la dificultad a Supabase:", error);
                alert("Hubo un error al enviar los datos. Revisa tu conexión a internet.");
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
});

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

function cambiarOpcionCatalogo(botonPulsado, opcionElegida) {
    console.log("¡Botón pulsado!", opcionElegida); // Esto te dirá en la consola si la función reacciona

    const contenedor = botonPulsado.closest('.contenedor-slider-filtros');
    const botones = contenedor.querySelectorAll('button');

    // Apagamos todos
    botones.forEach(btn => {
        btn.classList.remove('active-filtro');
    });

    // Encendemos solo el pulsado
    botonPulsado.classList.add('active-filtro');

    // Aplicamos el valor (1 o 0)
    if (opcionElegida === 'comercializado') {
        tipoFiltroGlobal = 1;
    } else {
        tipoFiltroGlobal = 0;
    }

    // Filtrar tarjetas
    if (typeof renderizarProductosFiltrados === 'function') {
        renderizarProductosFiltrados();
    }
}

// A. Función para añadir filas (máximo 10)
// A. Función para añadir filas (máximo 10) con condición para el primer material
function agregarFilaMaterial() {
    const contenedor = document.getElementById('lista-materiales');
    const totalMateriales = contenedor.querySelectorAll('.material-item').length;

    if (totalMateriales >= 10) {
        alert("Solo puedes añadir un máximo de 10 materiales.");
        return;
    }

    const div = document.createElement('div');
    div.className = 'material-item';
    div.style.cssText = "display: flex; gap: 10px; align-items: center; margin-bottom: 10px;";

    // Si es el primer material (totalMateriales === 0), NO añadimos el botón "X"
    if (totalMateriales === 0) {
        div.innerHTML = `
            <input type="text" placeholder="Escribe qué material" maxlength="20" class="input-material" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 6px; width90%">
        `;
    } else {
        // A partir del segundo material, sí llevan el botón de eliminar
        div.innerHTML = `
            <input type="text" placeholder="Escribe qué material" maxlength="20" class="input-material" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 6px;">
            <button type="button" onclick="this.parentElement.remove()" style="background-color: #d93025; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer;">X</button>
        `;
    }

    contenedor.appendChild(div);
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
// BÚSQUEDA DE PRODUCTOS POR TEXTO (BARRA DE BÚSQUEDA)
// =========================================================================
// =========================================================================
// BÚSQUEDA DE PRODUCTOS POR TEXTO (INTELIGENTE / CONTEXTUAL)
// =========================================================================
async function ejecutarBusquedaTexto(event, inputElement) {
    if (event.key === 'Enter' || event.keyCode === 13) {
        
        const terminoBusqueda = inputElement.value.trim();
        
        if (terminoBusqueda === "") {
            alert("Por favor, escribe un nombre de producto para buscar.");
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

        let url = `${SUPABASE_URL}/rest/v1/verproductos?titulo=ilike.*${encodeURIComponent(terminoBusqueda)}*&order=fecha.desc`;
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
                <span class="miga-enlace" onclick="regresarvolver()">Inicio</span>
                <span class="miga-separador">&rarr;</span>
                <span class="miga-actual" id="miga-dinamica">${textoMiga}</span>
            `;
        }

        const contenedorProductos = document.getElementById('contenedor-productos-dinamico');
        if (contenedorProductos) {
            contenedorProductos.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <h2 style="color: #666;">Buscando "${terminoBusqueda}"... ⏳</h2>
                </div>
            `;
        }

        vistaObjetivoSeleccionada = 'vista-productos-final';
        if (typeof realizarBusqueda === 'function') realizarBusqueda();

        try {
            const respuesta = await fetch(url, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            if (!respuesta.ok) throw new Error("No se pudo realizar la búsqueda");

            const productosEncontrados = await respuesta.json();
            productosGlobales = productosEncontrados;

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
                        <h2 style="color: #d93025;">Hubo un problema al realizar la búsqueda.</h2>
                    </div>
                `;
            }
        }

        inputElement.value = "";
    }
}
// =========================================================================
// VALIDACIÓN GLOBAL: FORMULARIO "SOLICITAR CUENTA" (DISEÑO PLANO)
// =========================================================================

// =========================================================================
// VALIDACIÓN GLOBAL: FORMULARIO "SOLICITAR CUENTA" Y SUBIDA A SUPABASE
// =========================================================================
// =========================================================================
// VALIDACIÓN GLOBAL: FORMULARIO "SOLICITAR CUENTA" Y SUBIDA A SUPABASE
// =========================================================================
// =========================================================================
// VALIDACIÓN GLOBAL: CREAR CUENTA EN SUPABASE AUTH Y TABLA 'usuarios'
// =========================================================================
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

    let errores = [];

    // 2. Capturar campos
    const usuario = document.getElementById('solicitud-usuario');
    const pass1 = document.getElementById('psswd-1');
    const pass2 = document.getElementById('psswd-2');
    const contacto = document.getElementById('solicitud-contacto');
    const fundacion = document.getElementById('solicitud-fundacion');

    // 3. Validar textos
    if (!usuario || !usuario.value.trim()) errores.push(usuario);
    if (!contacto || !contacto.value.trim()) errores.push(contacto);
    if (!fundacion || !fundacion.value.trim()) errores.push(fundacion);

    // 4. Validar contraseñas
    if (!pass1 || !pass1.value.trim()) errores.push(pass1);
    if (!pass2 || !pass2.value.trim()) errores.push(pass2);
    
    if (pass1 && pass2 && pass1.value.trim() !== '' && pass1.value !== pass2.value) {
        errores.push(pass1);
        errores.push(pass2);
        if (textoErrorPass) textoErrorPass.style.display = 'block';
    }

    // 5. Validar selección de perfil
    if (!perfilSeleccionadoSolicitud) {
        vistaActual.querySelectorAll('.btn-rela').forEach(btn => btn.classList.add('campo-error'));
        errores.push(vistaActual.querySelector('.guia-card')); 
    }

    // 6. FRENAR SI HAY ERRORES BÁSICOS
    if (errores.length > 0) {
        alert("Por favor, rellena todos los campos y selecciona tu perfil.");
        errores.forEach(el => {
            if (el && el.classList) el.classList.add('campo-error');
        });
        errores[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // =======================================================
    // 7. COMPROBACIÓN EN SUPABASE Y SUBIDA DE DATOS
    // =======================================================
    const textoOriginalBoton = elemento.innerText;
    elemento.innerText = "Creando cuenta... ⏳";
    elemento.disabled = true;

    try {
        const nombreIngresado = usuario.value.trim();
        const passIngresada = pass1.value.trim();

        // 👇 PASO NUEVO: COMPROBAR SI EL USUARIO YA EXISTE 👇
        const { data: usuarioExistente, error: errorBusqueda } = await window.supabase
            .from('usuarios')
            .select('nombre')
            .ilike('nombre', nombreIngresado); // ilike ignora mayúsculas/minúsculas

        if (errorBusqueda) throw errorBusqueda;

        // Si encontramos a alguien con ese nombre, frenamos todo
        if (usuarioExistente && usuarioExistente.length > 0) {
            alert("Ese nombre de usuario ya está registrado. Por favor, elige uno distinto.");
            usuario.classList.add('campo-error');
            usuario.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Restauramos el botón y salimos
            elemento.innerText = textoOriginalBoton;
            elemento.disabled = false;
            return; 
        }
        
        // Generamos el correo interno para Auth (ej: nombre@epunto.com) sin espacios
        const emailGenerado = nombreIngresado.toLowerCase().replace(/\s+/g, '') + "@epunto.com";

        // 👇 REGISTRAR EN SUPABASE AUTH 👇
        const { data: dataAuth, error: errorAuth } = await window.supabase.auth.signUp({
            email: emailGenerado,
            password: passIngresada,
        });

        if (errorAuth) throw errorAuth; 

        // 👇 GUARDAR DATOS EN TU TABLA 'usuarios' 👇
        const fechaActual = new Date().toISOString();
        
        const { error: errorTabla } = await window.supabase
            .from('usuarios')
            .insert([
                {
                    nombre: nombreIngresado,
                    contrasena: passIngresada, 
                    contacto: contacto.value.trim(),
                    relacion: perfilSeleccionadoSolicitud, 
                    fundacion: fundacion.value.trim(),
                    fecha_envio: fechaActual 
                }
            ]);

        if (errorTabla) {
            console.warn("Fallo al guardar en tabla, pero el auth se creó:", errorTabla);
            throw errorTabla;
        }

        // --- LIMPIEZA FINAL ---
        usuario.value = "";
        pass1.value = "";
        pass2.value = "";
        contacto.value = "";
        fundacion.value = "";
        vistaActual.querySelectorAll('.btn-rela').forEach(btn => btn.classList.remove('activ-cate'));
        perfilSeleccionadoSolicitud = null;

        // Redirigir a la pantalla de éxito
        vistaObjetivoSeleccionada = elemento.getAttribute('data-vista');
        if (typeof realizarBusqueda === 'function') realizarBusqueda();

    } catch (error) {
        console.error("Error al crear cuenta:", error);
        alert("Hubo un problema al crear la cuenta: " + error.message);
    } finally {
        elemento.innerText = textoOriginalBoton;
        elemento.disabled = false;
    }
}



// =========================================================================
// VALIDACIÓN Y ENVÍO EXCLUSIVO: FORMULARIO EMPRESA SOLICITUD DE DATOS
// =========================================================================
async function validarYEnviarEmpresa(elemento) {
    const vistaActual = document.getElementById('vista-form-ideas');
    if (!vistaActual) return;

    vistaActual.querySelectorAll('.campo-error').forEach(el => el.classList.remove('campo-error'));
    let errores = [];

    const inputEmpresa = vistaActual.querySelector('input[type="text"]');
    const textareas = vistaActual.querySelectorAll('textarea');

    const descEmpresa = textareas[0];
    const enlaceEmpresa = textareas[1];
    const contactoEmpresa = textareas[2];
    const horarioEmpresa = textareas[3];

    if (!inputEmpresa || inputEmpresa.value.trim() === "") errores.push(inputEmpresa);
    if (!descEmpresa || descEmpresa.value.trim() === "") errores.push(descEmpresa);
    if (!enlaceEmpresa || enlaceEmpresa.value.trim() === "") errores.push(enlaceEmpresa);
    if (!contactoEmpresa || contactoEmpresa.value.trim() === "") errores.push(contactoEmpresa);
    if (!horarioEmpresa || horarioEmpresa.value.trim() === "") errores.push(horarioEmpresa);

    if (errores.length > 0) {
        alert("Por favor, rellena todos los campos obligatorios para poder enviar los datos.");
        errores[0].classList.add('campo-error');
        errores[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        errores[0].focus();
        return false;
    }

    const textoOriginalBoton = elemento.innerText;
    elemento.innerText = "Enviando datos... ⏳";
    elemento.disabled = true;

    try {
        const fechaActual = new Date().toISOString();

        const { error } = await window.supabase
            .from('ideas-empresa')
            .insert([
                {
                    "nombre-empresa": inputEmpresa.value.trim(),
                    "descripcion": descEmpresa.value.trim(),
                    "link": enlaceEmpresa.value.trim(),
                    "contacto": contactoEmpresa.value.trim(),
                    "horario": horarioEmpresa.value.trim(),
                    "fecha": fechaActual
                }
            ]);

        if (error) throw error;

        inputEmpresa.value = "";
        textareas.forEach(t => t.value = "");

        // Cambiar directamente a la nueva vista de éxito de empresa
        vistaObjetivoSeleccionada = 'vista-publicado-empresa';
        if (typeof realizarBusqueda === 'function') realizarBusqueda();

    } catch (error) {
        console.error("Error al enviar los datos de la empresa a Supabase:", error);
        alert("Error al enviar: " + (error.message || JSON.stringify(error)));
    } finally {
        elemento.innerText = textoOriginalBoton;
        elemento.disabled = false;
    }
}


// =========================================================================
// VALIDACIÓN Y ENVÍO EXCLUSIVO: FORMULARIO VALIDAR PRODUCTO EMPRESA
// =========================================================================
// =========================================================================
// VALIDACIÓN Y ENVÍO EXCLUSIVO: FORMULARIO VALIDAR PRODUCTO EMPRESA
// =========================================================================
async function validarYEnviarProductoEmpresa(elemento) {
    const vistaActual = document.getElementById('vista-form-validar');
    if (!vistaActual) return;

    // 1. Limpiar bordes rojos previos de errores
    vistaActual.querySelectorAll('.campo-error').forEach(el => {
        el.classList.remove('campo-error');
    });

    let errores = [];

    // 2. Capturar todos los campos de texto e inputs de la vista de forma segura
    const todosInputs = vistaActual.querySelectorAll('input[type="text"]');
    const todosTextareas = vistaActual.querySelectorAll('textarea');

    // Mapeo según el orden exacto en tu HTML:
    // --- Sección 1: Información del producto ---
    const nombreProducto = todosInputs[0];       // 1. Nombre del producto
    const descProducto = todosTextareas[0];      // 2. Descripción del producto
    const enlaceCompra = todosTextareas[1];      // 3. Enlace de compra
    const precioOriginal = todosTextareas[2];    // 4. Precio original

    // --- Sección 2: Información de la empresa ---
    const nombreEmpresa = todosInputs[1];        // 5. Nombre de la empresa
    const descEmpresa = todosTextareas[3];       // 6. Descripción de la empresa
    const enlaceEmpresa = todosTextareas[4];     // 7. Enlace a la empresa
    const contactoEmpresa = todosTextareas[5];   // 8. Contacto
    const horarioEmpresa = todosTextareas[6];    // 9. Horario de disponibilidad

    // Imagen del proyecto
    const imgPreview = vistaActual.querySelector('.img-preview');
    let urlImagenFinal = (imgPreview && imgPreview.src && imgPreview.src !== '#' && !imgPreview.src.endsWith('/#')) 
        ? imgPreview.src 
        : 'svg/subir/comprar.png';

    // 3. Comprobar que absolutamente todo esté relleno
    if (!nombreProducto || nombreProducto.value.trim() === "") errores.push(nombreProducto);
    if (!descProducto || descProducto.value.trim() === "") errores.push(descProducto);
    if (!enlaceCompra || enlaceCompra.value.trim() === "") errores.push(enlaceCompra);
    if (!precioOriginal || precioOriginal.value.trim() === "") errores.push(precioOriginal);

    if (!nombreEmpresa || nombreEmpresa.value.trim() === "") errores.push(nombreEmpresa);
    if (!descEmpresa || descEmpresa.value.trim() === "") errores.push(descEmpresa);
    if (!enlaceEmpresa || enlaceEmpresa.value.trim() === "") errores.push(enlaceEmpresa);
    if (!contactoEmpresa || contactoEmpresa.value.trim() === "") errores.push(contactoEmpresa);
    if (!horarioEmpresa || horarioEmpresa.value.trim() === "") errores.push(horarioEmpresa);

    // 4. Si hay errores, alertar y enfocar el primer campo vacío
    if (errores.length > 0) {
        alert("Por favor, rellena todos los campos obligatorios para poder enviar el producto.");
        errores[0].classList.add('campo-error');
        errores[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        errores[0].focus();
        return false;
    }

    // 5. Si todo está correcto, enviamos a Supabase
    const textoOriginalBoton = elemento.innerText;
    elemento.innerText = "Enviando producto... ⏳";
    elemento.disabled = true;

    try {
        const fechaActual = new Date().toISOString();

        const { error } = await window.supabase
            .from('producto-empresa')
            .insert([
                {
                    "fecha": fechaActual,
                    "nombre-empresa": nombreEmpresa.value.trim(),
                    "descripcion": descEmpresa.value.trim(),
                    "link": enlaceEmpresa.value.trim(),
                    "contacto": contactoEmpresa.value.trim(),
                    "horario": horarioEmpresa.value.trim(),
                    "nombre-producto": nombreProducto.value.trim(),
                    "descripcion-producto": descProducto.value.trim(),
                    "img-prod": urlImagenFinal,
                    "link-prod": enlaceCompra.value.trim(),
                    "precio-original": precioOriginal.value.trim()
                }
            ]);

        if (error) throw error;

        // Limpiar formulario
        todosInputs.forEach(i => i.value = "");
        todosTextareas.forEach(t => t.value = "");
        
        if (imgPreview) {
            imgPreview.src = "#";
            const previewCont = vistaActual.querySelector('.preview-container');
            if (previewCont) previewCont.style.display = 'none';
        }

        // Ir a la vista de éxito
        vistaObjetivoSeleccionada = elemento.getAttribute('data-vista');
        if (typeof realizarBusqueda === 'function') realizarBusqueda();

    } catch (error) {
        console.error("Error al enviar los datos a la tabla producto-empresa:", error);
        alert("Error al enviar: " + (error.message || JSON.stringify(error)));
    } finally {
        elemento.innerText = textoOriginalBoton;
        elemento.disabled = false;
    }
}