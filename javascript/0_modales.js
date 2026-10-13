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
            btnToggle.innerText = 'Ocultar'; 
        } else {
            inputPass.type = 'password'; 
            btnToggle.innerText = 'Mostrar'; 
        }
    }
}


