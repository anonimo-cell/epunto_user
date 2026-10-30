// 5. MODALES (<dialog>)
// ==========================================
// Abre cualquier diálogo por su id
function abrirModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.showModal(); // Abre el diálogo de forma nativa y accesible
    } else {
        console.error(`No se encontró el elemento HTML con el id '${idModal}'.`);
    }
}

// Cierra un diálogo: recibe su id o cualquier elemento que esté dentro de él (p. ej. el botón ×)
function cerrarModal(origen) {
    const modal = typeof origen === 'string'
        ? document.getElementById(origen)
        : origen && origen.closest('dialog');
    if (modal) modal.close();
}


function toggleMostrarPasswordModal() {
    const inputPass = document.getElementById('login-password-modal');
    const btnToggle = document.getElementById('btn-toggle-pass-modal');

    if (inputPass && btnToggle) {
        if (inputPass.type === 'password') {
            inputPass.type = 'text'; 
            btnToggle.innerHTML = 'Ocultar<span class="sr-only"> contraseña</span>'; 
        } else {
            inputPass.type = 'password'; 
            btnToggle.innerHTML = 'Mostrar<span class="sr-only"> contraseña</span>'; 
        }
    }
}



// El menú de accesibilidad funciona como un desplegable: se cierra al pulsar
// fuera de él. Al pulsar en el fondo, el clic llega al propio <dialog>.
const menuAccesibilidad = document.getElementById('modal-acce-mas');
if (menuAccesibilidad) {
    menuAccesibilidad.addEventListener('click', (evento) => {
        if (evento.target !== menuAccesibilidad) return;
        const caja = menuAccesibilidad.getBoundingClientRect();
        const fuera = evento.clientX < caja.left || evento.clientX > caja.right ||
            evento.clientY < caja.top || evento.clientY > caja.bottom;
        if (fuera) menuAccesibilidad.close();
    });
}
