// Guardamos el tamaño inicial (100%)
let tamanoActual = 100;
document.addEventListener('mousedown', function() {
    document.body.classList.remove('navegacion-teclado');
});

// Si el usuario pulsa la tecla Tabulador, activamos el estilo azul gigante
document.addEventListener('keydown', function(evento) {
    if (evento.key === 'Tab') {
        document.body.classList.add('navegacion-teclado');
    }
});

// Función auxiliar para aplicar el tamaño de fuente
function cambiarTamanoFuente(nuevoTamano) {
    tamanoActual = nuevoTamano;
    document.documentElement.style.setProperty('--tamano-fuente-base', `${tamanoActual}%`);
}

// 1. Aumentar letra (afecta tanto al lateral como al modal)
document.querySelectorAll('#btn-aumentar').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (tamanoActual < 130) {
            cambiarTamanoFuente(tamanoActual + 10);
        }
        e.currentTarget.blur();
    });
});

// 2. Reducir letra (afecta tanto al lateral como al modal)
document.querySelectorAll('#btn-reducir').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (tamanoActual > 80) {
            cambiarTamanoFuente(tamanoActual - 10);
        }
        e.currentTarget.blur();
    });
});

// 3. Alto Contraste / Blanco y negro (afecta tanto al lateral como al modal)
document.querySelectorAll('#btn-contraste').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.documentElement.classList.toggle('alto-contraste');
        e.currentTarget.blur();
    });
});

// 4. Restablecer tamaño y contraste (afecta tanto al lateral como al modal)
document.querySelectorAll('#btn-restablecer').forEach(btn => {
    btn.addEventListener('click', (e) => {
        cambiarTamanoFuente(100);
        document.documentElement.classList.remove('alto-contraste');
        e.currentTarget.blur();
    });
});

// =========================================================================
// ACCESIBILIDAD POR TECLADO
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            const elementoActivo = document.activeElement;
            if (elementoActivo && elementoActivo.getAttribute("role") === "button") {
                event.preventDefault(); 
                elementoActivo.click(); 
            }
        }
    });
});