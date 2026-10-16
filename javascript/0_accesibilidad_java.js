// Guardamos el tamaño inicial (100%)
let tamanoActual = 100;

// Función auxiliar para aplicar el tamaño de fuente
function cambiarTamanoFuente(nuevoTamano) {
    tamanoActual = nuevoTamano;
    document.documentElement.style.setProperty('--tamano-fuente-base', `${tamanoActual}%`);
    if (typeof anunciar === 'function') anunciar(`Tamaño de letra: ${tamanoActual}%`);
}

// 1. Aumentar letra (afecta tanto al lateral como al modal)
document.querySelectorAll('#btn-aumentar').forEach(btn => {
    btn.addEventListener('click', () => {
        if (tamanoActual < 130) {
            cambiarTamanoFuente(tamanoActual + 10);
        } else if (typeof anunciar === 'function') {
            anunciar('Ya está en el tamaño de letra máximo');
        }
    });
});

// 2. Reducir letra (afecta tanto al lateral como al modal)
document.querySelectorAll('#btn-reducir').forEach(btn => {
    btn.addEventListener('click', () => {
        if (tamanoActual > 80) {
            cambiarTamanoFuente(tamanoActual - 10);
        } else if (typeof anunciar === 'function') {
            anunciar('Ya está en el tamaño de letra mínimo');
        }
    });
});

// =========================================================================
// ACCESIBILIDAD POR TECLADO
// Los elementos con role="button" se activan con Enter o Espacio,
// y los que tienen role="link" (migas de pan) con Enter, como los reales.
// =========================================================================

document.addEventListener("keydown", (event) => {
    const elementoActivo = document.activeElement;
    if (!elementoActivo) return;
    const rol = elementoActivo.getAttribute("role");

    const activaBoton = rol === "button" && (event.key === "Enter" || event.key === " ");
    const activaEnlace = rol === "link" && event.key === "Enter";

    if (activaBoton || activaEnlace) {
        event.preventDefault();
        elementoActivo.click();
    }
});
