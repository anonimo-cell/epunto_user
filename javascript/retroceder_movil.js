// =========================================================================
// =========================================================================
// NAVEGACIÓN NATIVA: BOTÓN ATRÁS (MÓVIL Y NAVEGADOR)
// Archivo: retroceder_movil.js
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Estado inicial al cargar la página
    history.replaceState({ vista: 'vista-ver' }, document.title, window.location.href);

    // 2. Interceptar el evento 'popstate' (Se dispara al pulsar "Atrás")
    window.addEventListener('popstate', (event) => {
        
        // A) MODALES: Si hay una foto ampliada, la cierra
        const modalesAbiertos = document.querySelectorAll('dialog[open], #modal-imagen-grande[style*="display: flex"]');
        if (modalesAbiertos.length > 0) {
            modalesAbiertos.forEach(modal => {
                if (modal.tagName === 'DIALOG') modal.close();
                else modal.style.display = 'none'; 
            });
            const vistaActual = event.state ? event.state.vista : 'vista-ver';
            history.pushState({ vista: vistaActual }, '');
            return;
        }

        // B) VISTAS (Navegación entre categorías como higiene, autonomía, etc.)
        if (event.state && event.state.vista) {
            
            if (event.state.vista === 'menu-raiz') {
                if (typeof window.regresarvolverOriginal === 'function') window.regresarvolverOriginal(1);
                else if (typeof window.regresarvolver === 'function') window.regresarvolver(1);
                return;
            }

            ejecutarRegresoVisual(event.state.vista);
        } else {
            if (typeof window.regresarvolverOriginal === 'function') window.regresarvolverOriginal(1);
            else if (typeof window.regresarvolver === 'function') window.regresarvolver(1);
        }
    });

    // =====================================================================
    // 3. SINCRONIZAR TUS BOTONES "VOLVER" FÍSICOS DE LA INTERFAZ
    // =====================================================================
    if (typeof window.regresarAnterior === 'function') {
        window.regresarAnteriorOriginal = window.regresarAnterior;
        window.regresarAnterior = function() {
            history.back(); 
        };
    }

    if (typeof window.regresarvolver === 'function') {
        window.regresarvolverOriginal = window.regresarvolver;
        window.regresarvolver = function(opcion) {
            window.regresarvolverOriginal(opcion); 
            history.pushState({ vista: 'menu-raiz' }, ''); 
        };
    }

    // =====================================================================
    // 4. 🌟 NUEVO: REGISTRAR AVANCES LEYENDO DIRECTAMENTE EL HTML 🌟
    // =====================================================================
    const registrarAvance = (idVista) => {
        if (idVista && idVista !== 'vista-login') {
            history.pushState({ vista: idVista }, '');
        }
    };

    // Al ejecutar una búsqueda o entrar a una categoría (Autonomía, Higiene...)
    if (typeof window.realizarBusqueda === 'function') {
        const busquedaOrg = window.realizarBusqueda;
        window.realizarBusqueda = function() {
            // Primero ejecutamos tu código original que cambia la pantalla
            busquedaOrg.apply(this, arguments);
            
            // Inmediatamente después, miramos qué pantalla se ha encendido en el HTML
            const vistaActiva = obtenerVistaVisible();
            
            if (vistaActiva) {
                const currentState = history.state ? history.state.vista : null;
                // Si la pantalla encendida es distinta a la que hay guardada, la registramos
                if (currentState !== vistaActiva.id) {
                    registrarAvance(vistaActiva.id);
                }
            }
        };
    }

    // Al abrir el detalle final de un producto
    if (typeof window.abrirDetalleVerProducto === 'function') {
        const detalleOrg = window.abrirDetalleVerProducto;
        window.abrirDetalleVerProducto = function() {
            registrarAvance('vista-detalle-verproducto');
            detalleOrg.apply(this, arguments);
        };
    }

    // Al pulsar botones del menú inferior o superior
    if (typeof window.cambiarEstadoslider === 'function') {
        const sliderOrg = window.cambiarEstadoslider;
        window.cambiarEstadoslider = function(elemento) {
            const destino = elemento ? elemento.getAttribute('data-vista') : null;
            const currentState = history.state ? history.state.vista : null;
            if (destino && currentState !== destino) {
                registrarAvance(destino);
            }
            sliderOrg.apply(this, arguments);
        };
    }
});

// =========================================================================
// 5. LÓGICA INTERNA VISUAL (Encender la vista anterior)
// =========================================================================
function ejecutarRegresoVisual(vistaAnteriorId) {
    if (!vistaAnteriorId) return;

    // 1. Apagamos todas las vistas y encendemos la que toca recuperar del historial (Ej: vista-autonomia)
    mostrarVista(vistaAnteriorId);

    // 2. Sincronizar los botones del menú principal inferior
    apagarBotonesMenu();

    let vistaMenuPadre = 'vista-ver'; 
    if (vistaAnteriorId === 'vista-subir' || vistaAnteriorId.includes('prod-')) {
        vistaMenuPadre = 'vista-subir';
    } else if (vistaAnteriorId.includes('solicitud')) {
        vistaMenuPadre = 'vista-solicitud';
    }

    let botonMenuPadre = document.querySelector(`.multi-slider .btn-menu[data-vista="${vistaMenuPadre}"]`);
    if (!botonMenuPadre) botonMenuPadre = document.querySelector(`.btn-login-header[data-vista="${vistaMenuPadre}"]`);
    if (botonMenuPadre) botonMenuPadre.classList.add('active');
}