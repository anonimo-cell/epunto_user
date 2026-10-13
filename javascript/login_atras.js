// =========================================================================
// SISTEMA DEFINITIVO DEL BOTÓN DE CABECERA (LOGIN / LOGOUT) Y SESIÓN TEMPORAL
// =========================================================================

let vistaIntencion = null;

// =========================================================================
// MOSTRAR / OCULTAR CONTRASEÑA INDEPENDIENTE
// =========================================================================
function toggleMostrarPassword(inputId, btnId) {
    const inputPass = document.getElementById(inputId);
    const btnPass = document.getElementById(btnId);

    if (inputPass && inputPass.type === "password") {
        inputPass.type = "text";
        if (btnPass) btnPass.innerText = "Ocultar";
    } else if (inputPass) {
        inputPass.type = "password";
        if (btnPass) btnPass.innerText = "Mostrar";
    }
}
// 1. Qué pasa cuando haces clic en el botón de la cabecera
async function gestionarClickLogin(boton) {
    const estadoSesion = sessionStorage.getItem('sesionIniciada');

    if (estadoSesion === '1') {
        try {
            if (typeof window.supabase !== 'undefined') {
                await window.supabase.auth.signOut();
            }
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }

        sessionStorage.removeItem('sesionIniciada');

        // 1. Mostramos el mensaje con el fondo desenfocado
        mostrarMensajeEstado("Has cerrado sesión");

        // 2. Esperamos 3.5 segundos (lo que dura el mensaje) antes de recargar la página
        setTimeout(() => {
            window.location.reload();
        }, 3500);

    } else {
        abrirModal('modal-login');
    }
}
// 2. Pintar el botón según el estado
function pintarBotonLogin() {
    const boton = document.getElementById('mi-boton-login');
    if (!boton) return;

    const estadoSesion = sessionStorage.getItem('sesionIniciada');

    if (estadoSesion === '1') {
        const estadoSesion = sessionStorage.getItem('sesionIniciada');
        const botonLogin = document.getElementById('mi-boton-login'); // Asegúrate de que este sea el id de tu botón de sesión

        if (estadoSesion === '1' && botonLogin) {
            // Añadimos la clase CSS para el fondo rojo y texto blanco
            botonLogin.classList.add('btn-sesion-activa');

            // Cambiamos el texto del botón
            botonLogin.innerText = "Salir de mi cuenta";
        }
    } else {
        // --- AQUÍ CAMBIAS EL ASPECTO CUANDO NO HAY SESIÓN ---

        // Restauramos los colores por defecto quitando los estilos que pusimos arriba
        boton.style.backgroundColor = "";
        boton.style.color = "";
        boton.style.border = "";

        boton.innerText = "Iniciar sesión";
    }
}

// 3. Que se pinte automáticamente al cargar la página
document.addEventListener('DOMContentLoaded', pintarBotonLogin);

// =========================================================================
// SELECCIÓN DE PERFILES
// =========================================================================
let perfilSeleccionadoSolicitud = null;
function seleccionarPerfilFormulario(botonPulsado) {
    const contenedor = botonPulsado.closest('.guia-card');
    if (contenedor) {
        contenedor.querySelectorAll('.btn-rela').forEach(btn => {
            btn.classList.remove('activ-cate');
        });
    }
    botonPulsado.classList.add('activ-cate');
    perfilSeleccionadoSolicitud = botonPulsado.getAttribute('data-perfil');
}