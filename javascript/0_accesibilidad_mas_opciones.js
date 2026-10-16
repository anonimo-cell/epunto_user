// =========================================================================
// MÁS OPCIONES DE ACCESIBILIDAD (dialog #modal-acce-mas)
// Cada opción se activa/desactiva con una clase en <html> y se guarda
// en el navegador para que se mantenga en la próxima visita.
// =========================================================================

const CLAVE_ACCE_MAS = 'epunto-accesibilidad-mas';

const OPCIONES_ACCE_MAS = {
    'contraste': 'alto-contraste',
    'cursor': 'acc-cursor-grande',
    'enlaces': 'acc-resaltar-enlaces',
    'espaciado': 'acc-espaciado'
};

// Marca como pulsados los botones de las opciones activas y guarda el estado
function actualizarOpcionesAcceMas() {
    const activas = {};

    document.querySelectorAll('[data-acc-opcion]').forEach(boton => {
        const opcion = boton.dataset.accOpcion;
        const activa = document.documentElement.classList.contains(OPCIONES_ACCE_MAS[opcion]);
        boton.setAttribute('aria-pressed', activa ? 'true' : 'false');
        activas[opcion] = activa;
    });

    try {
        localStorage.setItem(CLAVE_ACCE_MAS, JSON.stringify(activas));
    } catch (e) { /* el navegador no permite guardar: no pasa nada */ }
}

// Restablecer: quita todas las opciones y vuelve al tamaño de letra original
function restablecerOpcionesAcceMas() {
    Object.values(OPCIONES_ACCE_MAS).forEach(clase => {
        document.documentElement.classList.remove(clase);
    });
    if (typeof cambiarTamanoFuente === 'function') {
        cambiarTamanoFuente(100);
    }
    actualizarOpcionesAcceMas();
}

// 1. Activar / desactivar cada opción
document.querySelectorAll('[data-acc-opcion]').forEach(boton => {
    boton.addEventListener('click', () => {
        document.documentElement.classList.toggle(OPCIONES_ACCE_MAS[boton.dataset.accOpcion]);
        actualizarOpcionesAcceMas();
    });
});

// 2. Restablecer desde el dialog de más opciones
document.querySelectorAll('[data-acc-accion="restablecer-mas"]').forEach(boton => {
    boton.addEventListener('click', () => {
        restablecerOpcionesAcceMas();
    });
});

// 3. Recuperar las opciones guardadas al cargar la página
(function cargarOpcionesAcceMas() {
    let guardadas = null;
    try {
        guardadas = JSON.parse(localStorage.getItem(CLAVE_ACCE_MAS));
    } catch (e) { /* sin datos guardados */ }

    if (guardadas) {
        Object.keys(OPCIONES_ACCE_MAS).forEach(opcion => {
            document.documentElement.classList.toggle(OPCIONES_ACCE_MAS[opcion], !!guardadas[opcion]);
        });
    }
    actualizarOpcionesAcceMas();
})();
