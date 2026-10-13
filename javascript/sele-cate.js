// ==========================================
// CARGA INICIAL: RESETEO TOTAL AL RECARGAR
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    // Borramos todo de memoria (tanto bajo coste como comercializado)
    localStorage.removeItem('categoriaGuardadaNombre');
    localStorage.removeItem('subcategoriaGuardada');
    localStorage.removeItem('subcategoriaNivel3Guardada');
    localStorage.removeItem('categoriaGuardadaNombre-com');
    localStorage.removeItem('subcategoriaGuardada-com');
    localStorage.removeItem('subcategoriaNivel3Guardada-com');

    // Reseteamos Bajo Coste
    resetearFormularioDOM('');
    // Reseteamos Comercializado
    resetearFormularioDOM('-com');
});

function resetearFormularioDOM(sufijo) {
    const btnN1 = document.getElementById(`valor-n1${sufijo}`);
    const btnN2 = document.getElementById(`valor-n2${sufijo}`);
    const btnN3 = document.getElementById(`valor-n3${sufijo}`);
    const imgN1 = document.getElementById(`icono-elegido-n1${sufijo}`);
    const imgN2 = document.getElementById(`icono-elegido-n2${sufijo}`);
    const imgN3 = document.getElementById(`icono-elegido-n3${sufijo}`);

    if (btnN1) btnN1.innerText = "No seleccionada";
    if (btnN2) btnN2.innerText = "No seleccionada";
    if (btnN3) btnN3.innerText = "No seleccionada";
    
    if (imgN1) { imgN1.src = ""; imgN1.style.display = "none"; }
    if (imgN2) { imgN2.src = ""; imgN2.style.display = "none"; }
    if (imgN3) { imgN3.src = ""; imgN3.style.display = "none"; }
}

// ==========================================
// FUNCIONES DE APERTURA Y CIERRE (CON SUFIJO)
// ==========================================
function abrirModalCate1(sufijo = '') {
    // Guardamos temporalmente en qué formulario estamos trabajando mediante un atributo global o dataset
    window.formularioActivoActual = sufijo;
    const modal1 = document.getElementById("modal-categorias1");
    if (modal1) modal1.showModal();
}

function cerrarModalCate1() {
    const modal1 = document.getElementById("modal-categorias1");
    if (modal1) modal1.close();
}

function cerrarModalCate2(event) {
    const dialog = event.target.closest('dialog');
    if (dialog) dialog.close();
}

function cerrarModalCate3(event) {
    const dialog = event.target.closest('dialog');
    if (dialog) dialog.close();
}

function abrirModalNivel2() {
    const sufijo = window.formularioActivoActual || '';
    const cat1 = localStorage.getItem(`categoriaGuardadaNombre${sufijo}`);

    if (!cat1 || cat1 === "No seleccionada") {
        mostrarMensajeEstado("Primero selecciona una categoría de Nivel 1.");
        return;
    }

    const mapa = {
        "Autonomía y cuidado": "modal-autonomia",
        "Ocio": "modal-ocio",
        "Movilidad": "modal-movilidad",
        "Comunicación": "modal-comunica",
        "Tareas cotidianas": "modal-productividad"
    };

    const idModal = mapa[cat1.trim()];

    if (idModal) {
        const modal2 = document.getElementById(idModal);
        if (modal2) modal2.showModal();
    } else {
        mostrarMensajeEstado("Categoría no reconocida: " + cat1);
    }
}

function abrirModalNivel3() {
    const sufijo = window.formularioActivoActual || '';
    const cat2 = localStorage.getItem(`subcategoriaGuardada${sufijo}`);

    if (!cat2 || cat2 === "No seleccionada") {
        mostrarMensajeEstado("Primero selecciona una categoría de Nivel 2.");
        return;
    }

    // Solo se abre si el Nivel 2 es Higiene
    if (cat2.trim() === "Higiene") {
        const modal3 = document.getElementById('modal-n3-higiene');
        if (modal3) modal3.showModal();
    }
}

// ==========================================
// LÓGICA DE SELECCIÓN Y CASCADA
// ==========================================

// ==========================================
// LÓGICA DE SELECCIÓN: CATEGORÍA NIVEL 1
// ==========================================
// ==========================================
// LÓGICA DE SELECCIÓN: CATEGORÍA NIVEL 1
// ==========================================
function seleccionarCatenivel1(boton) {
    const sufijo = window.formularioActivoActual || '';
    const nuevoTexto = boton.querySelector('.btn-cate-txt').innerText.trim();
    const textoAnterior = localStorage.getItem(`categoriaGuardadaNombre${sufijo}`);

    // Si la categoría cambia, borramos los Niveles 2 y 3 del formulario correspondiente
    if (nuevoTexto !== textoAnterior) {
        localStorage.removeItem(`subcategoriaGuardada${sufijo}`);
        localStorage.removeItem(`subcategoriaNivel3Guardada${sufijo}`);

        // Limpiamos textos
        const btnN2 = document.getElementById(`valor-n2${sufijo}`);
        const btnN3 = document.getElementById(`valor-n3${sufijo}`);
        if (btnN2) btnN2.innerText = "No seleccionada";
        if (btnN3) btnN3.innerText = "No seleccionada";

        // Limpiamos imágenes
        const imgN2 = document.getElementById(`icono-elegido-n2${sufijo}`);
        const imgN3 = document.getElementById(`icono-elegido-n3${sufijo}`);
        if (imgN2) { imgN2.src = ""; imgN2.style.display = "none"; }
        if (imgN3) { imgN3.src = ""; imgN3.style.display = "none"; }
    }

    // Guardamos y actualizamos Nivel 1
    localStorage.setItem(`categoriaGuardadaNombre${sufijo}`, nuevoTexto);
    const btnN1 = document.getElementById(`valor-n1${sufijo}`);
    if (btnN1) btnN1.innerText = nuevoTexto;

    // MAGIA DE LA IMAGEN (Nivel 1)
    const imgElement = boton.querySelector('img');
    const iconSrc = imgElement ? imgElement.getAttribute('src') : null;
    const imgDestino = document.getElementById(`icono-elegido-n1${sufijo}`);

    if (imgDestino) {
        if (iconSrc) {
            imgDestino.src = iconSrc;
            imgDestino.style.display = 'block';
        } else {
            imgDestino.src = '';
            imgDestino.style.display = 'none';
        }
    }

    // --- MAGIA: SI EL NIVEL 1 ES "OTROS", AUTOCOMPLETAR NIVEL 2 Y 3 ---
    if (nuevoTexto.toLowerCase() === 'otros') {
        
        // Forzar Nivel 2 a "Otros"
        localStorage.setItem(`subcategoriaGuardada${sufijo}`, 'Otros');
        const btnN2 = document.getElementById(`valor-n2${sufijo}`);
        if (btnN2) btnN2.innerText = 'Otros';
        
        const imgDestinoN2 = document.getElementById(`icono-elegido-n2${sufijo}`);
        if (imgDestinoN2) {
            if (iconSrc) {
                imgDestinoN2.src = iconSrc;
                imgDestinoN2.style.display = 'block';
            } else {
                imgDestinoN2.src = '';
                imgDestinoN2.style.display = 'none';
            }
        }

        // Forzar Nivel 3 a "Otros"
        localStorage.setItem(`subcategoriaNivel3Guardada${sufijo}`, 'Otros');
        const btnN3 = document.getElementById(`valor-n3${sufijo}`);
        if (btnN3) btnN3.innerText = 'Otros';
        
        const imgDestinoN3 = document.getElementById(`icono-elegido-n3${sufijo}`);
        if (imgDestinoN3) {
            if (iconSrc) {
                imgDestinoN3.src = iconSrc;
                imgDestinoN3.style.display = 'block';
            } else {
                imgDestinoN3.src = '';
                imgDestinoN3.style.display = 'none';
            }
        }
    }

    cerrarModalCate1();
}

// ==========================================
// LÓGICA DE SELECCIÓN: CATEGORÍA NIVEL 2
// ==========================================
function seleccionarCategoria2(boton) {
    const sufijo = window.formularioActivoActual || '';
    const nuevoTexto = boton.querySelector('.btn-cate-txt').innerText.trim();
    const textoAnterior = localStorage.getItem(`subcategoriaGuardada${sufijo}`);

    // Guardamos y actualizamos Nivel 2
    localStorage.setItem(`subcategoriaGuardada${sufijo}`, nuevoTexto);
    const btnN2 = document.getElementById(`valor-n2${sufijo}`);
    if (btnN2) btnN2.innerText = nuevoTexto;

    // MAGIA DE LA IMAGEN (Nivel 2)
    const imgElement = boton.querySelector('img');
    const iconSrc = imgElement ? imgElement.getAttribute('src') : null;
    const imgDestinoN2 = document.getElementById(`icono-elegido-n2${sufijo}`);

    if (imgDestinoN2) {
        if (iconSrc) {
            imgDestinoN2.src = iconSrc;
            imgDestinoN2.style.display = 'block';
        } else {
            imgDestinoN2.src = '';
            imgDestinoN2.style.display = 'none';
        }
    }

    // Lógica Automática del Nivel 3
    const btnN3 = document.getElementById(`valor-n3${sufijo}`);
    const imgDestinoN3 = document.getElementById(`icono-elegido-n3${sufijo}`);

    if (nuevoTexto === "Higiene") {
        if (nuevoTexto !== textoAnterior) {
            localStorage.removeItem(`subcategoriaNivel3Guardada${sufijo}`);
            if (btnN3) btnN3.innerText = "No seleccionada";
            if (imgDestinoN3) { imgDestinoN3.src = ""; imgDestinoN3.style.display = "none"; }
        }
    } else {
        localStorage.setItem(`subcategoriaNivel3Guardada${sufijo}`, nuevoTexto);
        if (btnN3) btnN3.innerText = nuevoTexto;
        
        if (imgDestinoN3) {
            if (iconSrc) {
                imgDestinoN3.src = iconSrc;
                imgDestinoN3.style.display = 'block';
            } else {
                imgDestinoN3.src = '';
                imgDestinoN3.style.display = 'none';
            }
        }
    }

    const modal = boton.closest('dialog');
    if (modal) modal.close();
}

// ==========================================
// LÓGICA DE SELECCIÓN: CATEGORÍA NIVEL 3
// ==========================================
function seleccionarCategoria3(boton) {
    const sufijo = window.formularioActivoActual || '';
    const texto = boton.querySelector('.btn-cate-txt').innerText.trim();

    // Guardamos y actualizamos Nivel 3
    localStorage.setItem(`subcategoriaNivel3Guardada${sufijo}`, texto);
    const btnN3 = document.getElementById(`valor-n3${sufijo}`);
    if (btnN3) btnN3.innerText = texto;

    // MAGIA DE LA IMAGEN (Nivel 3)
    const imgElement = boton.querySelector('img');
    const iconSrc = imgElement ? imgElement.getAttribute('src') : null;
    const imgDestino = document.getElementById(`icono-elegido-n3${sufijo}`);

    if (imgDestino) {
        if (iconSrc) {
            imgDestino.src = iconSrc;
            imgDestino.style.display = 'block';
        } else {
            imgDestino.src = '';
            imgDestino.style.display = 'none';
        }
    }

    const modal = boton.closest('dialog');
    if (modal) modal.close();
}