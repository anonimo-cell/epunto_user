// 5. MODALES (<dialog>)
// ==========================================
//para informacion
function abrirModalInfo() {
    const modal = document.getElementById("modal-info");
    if (modal) {
        modal.showModal(); // Abre el diálogo de forma nativa y accesible
        console.log("Modal de información abierto.");
    } else {
        console.error("No se encontró el elemento HTML con el id 'modal-info'.");
    }
}

function cerrarModalInfo() {
    const modal = document.getElementById("modal-info");
    if (modal) {
        modal.close(); // Cierra el diálogo nativo
        console.log("Modal de información cerrado.");
    }
}



function cerrarModal(boton) {
    // Busca el <dialog> más cercano al botón que se ha pulsado
    const modal = boton.closest('dialog');
    if (modal) {
        modal.close();
    }
}

function cerrarModalLogin() {
    const modal = document.getElementById('modal-login');
    if (modal) {
        modal.close();
    }
}
//para agradecimientos
function abrirModalAgradecimientos() {
    const modal = document.getElementById("modal-agradecimientos");
    if (modal) {
        modal.showModal(); // Abre el diálogo de forma nativa y accesible
    } else {
        console.error("No se encontró el elemento HTML con el id 'modal-agradecimientos'.");
    }
}

//para donar
function abrirModalDona() {
    const modal = document.getElementById("modal-dona");
    if (modal) {
        modal.showModal(); // Abre el diálogo de forma nativa y accesible
        console.log("Modal de información abierto.");
    } else {
        console.error("No se encontró el elemento HTML con el id 'modal-ayuda'.");
    }
}

function cerrarModalDona() {
    const modal = document.getElementById("modal-dona");
    if (modal) {
        modal.close(); // Cierra el diálogo nativo
        console.log("Modal de información cerrado.");
    }
}


function abrirModalContacto() {
    const modal = document.getElementById("modal-contacto");
    if (modal) {
        modal.showModal(); // Abre el diálogo de forma nativa y accesible
        console.log("Modal de contacto abierto.");
    } else {
        console.error("No se encontró el elemento HTML con el id 'modal-contacto'.");
    }
}

function cerrarModalContacto() {
    const modal = document.getElementById("modal-contacto");
    if (modal) {
        modal.close(); // Cierra el diálogo nativo
        console.log("Modal de información cerrado.");
    }
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


