window.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // LIMPIAR FILTROS (PRECIO, DIFICULTAD Y TIEMPO)
    // ==========================================

    // 1. Precio
    localStorage.removeItem('precioGuardado');
    const btnPrecio = document.getElementById('valor-precio');
    const iconPrecio = document.getElementById('icono-elegido-precio');
    if (btnPrecio) btnPrecio.innerText = "No seleccionada";
    if (iconPrecio) {
        iconPrecio.src = "";
        iconPrecio.style.display = "none";
    }

    // 2. Dificultad
    localStorage.removeItem('dificultadGuardada');
    const btnDif = document.getElementById('valor-dificultad');
    const iconDif = document.getElementById('icono-elegido-dificultad');
    if (btnDif) btnDif.innerText = "No seleccionada";
    if (iconDif) {
        iconDif.src = "";
        iconDif.style.display = "none";
    }

    // 3. Tiempo de fabricación
    localStorage.removeItem('tiempoGuardado');
    const btnTie = document.getElementById('valor-tiempo');
    const iconTie = document.getElementById('icono-elegido-tiempo');
    if (btnTie) btnTie.innerText = "No seleccionada";
    if (iconTie) {
        iconTie.src = "";
        iconTie.style.display = "none";
    }
});

// ==========================================
// CIERRE GENÉRICO PARA NUEVOS MODALES
// ==========================================
function cerrarModalGeneral(event) {
    const dialog = event.target.closest('dialog');
    if (dialog) dialog.close();
}

// ==========================================
// LÓGICA DE APERTURA Y SELECCIÓN DE PRECIO
// ==========================================
function abrirModalPrecio() {
    const modal = document.getElementById('modal-precio');
    if (modal) modal.showModal();
}

function seleccionarPrecio(boton) {
    // 1. Extraemos el texto del botón pulsado
    const texto = boton.querySelector('.txt-filtro').innerText.trim();

    // 2. Guardamos en localStorage
    localStorage.setItem('precioGuardado', texto);

    // 3. Actualizamos la interfaz principal
    const btnVista = document.getElementById('valor-precio');
    if (btnVista) btnVista.innerText = texto;

    // 4. MAGIA DE LA IMAGEN (Busca el src del <img>)
    const imgElement = boton.querySelector('img');
    const iconSrc = imgElement ? imgElement.getAttribute('src') : null;
    const imgDestino = document.getElementById('icono-elegido-precio');
    
    if (imgDestino) {
        if (iconSrc) {
            imgDestino.src = iconSrc;
            imgDestino.style.display = 'inline-block';
        } else {
            imgDestino.src = '';
            imgDestino.style.display = 'none';
        }
    }

    // 5. Cerramos el diálogo actual
    const modal = boton.closest('dialog');
    if (modal) modal.close();
}

// ==========================================
// LÓGICA DE APERTURA Y SELECCIÓN: DIFICULTAD
// ==========================================
function abrirModalDificultad() {
    const modal = document.getElementById('modal-dificultad');
    if (modal) modal.showModal();
}

function seleccionarDificultad(boton) {
    const texto = boton.querySelector('.txt-filtro').innerText.trim();
    localStorage.setItem('dificultadGuardada', texto);

    const btnVista = document.getElementById('valor-dificultad');
    if (btnVista) btnVista.innerText = texto;

    // MAGIA DE LA IMAGEN (Busca el src del <img>)
    const imgElement = boton.querySelector('img');
    const iconSrc = imgElement ? imgElement.getAttribute('src') : null;
    const imgDestino = document.getElementById('icono-elegido-dificultad');

    if (imgDestino) {
        if (iconSrc) {
            imgDestino.src = iconSrc;
            imgDestino.style.display = 'inline-block';
        } else {
            imgDestino.src = '';
            imgDestino.style.display = 'none';
        }
    }

    const modal = boton.closest('dialog');
    if (modal) modal.close();
}

// ==========================================
// LÓGICA DE APERTURA Y SELECCIÓN: TIEMPO
// ==========================================
function abrirModalTiempo() {
    const modal = document.getElementById('modal-tiempo');
    if (modal) modal.showModal();
}

function seleccionarTiempo(boton) {
    const texto = boton.querySelector('.txt-filtro').innerText.trim();
    localStorage.setItem('tiempoGuardado', texto);

    const btnVista = document.getElementById('valor-tiempo');
    if (btnVista) btnVista.innerText = texto;

    // MAGIA DE LA IMAGEN (Busca el src del <img>)
    const imgElement = boton.querySelector('img');
    const iconSrc = imgElement ? imgElement.getAttribute('src') : null;
    const imgDestino = document.getElementById('icono-elegido-tiempo');
    
    if (imgDestino) {
        if (iconSrc) {
            imgDestino.src = iconSrc;
            imgDestino.style.display = 'inline-block';
        } else {
            imgDestino.src = '';
            imgDestino.style.display = 'none';
        }
    }

    const modal = boton.closest('dialog');
    if (modal) modal.close();
}