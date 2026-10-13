// =========================================================================
// SISTEMA DEFINITIVO DEL BOTÓN DE CABECERA (LOGIN / LOGOUT) Y SESIÓN TEMPORAL
// =========================================================================

let vistaAntesDelLogin = 'vista-ver'; 
let vistaIntencion = null; 

document.addEventListener('click', function(event) {
    const botonIrALogin = event.target.closest('[data-vista="vista-login"]');
    if (botonIrALogin) {
        const vistasAbiertas = document.querySelectorAll('.subvista-contenido');
        vistasAbiertas.forEach(vista => {
            if (window.getComputedStyle(vista).display !== 'none') {
                vistaAntesDelLogin = vista.id;
            }
        });
    }
}, true);

function toggleMostrarPassword() {
    const inputPass = document.getElementById('login-password');
    const btnToggle = document.getElementById('btn-toggle-pass');
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
        alert("Has cerrado sesión correctamente.");
        window.location.reload(); 
    } else {
        const modalLogin = document.getElementById('modal-login');
        if (modalLogin) {
            modalLogin.showModal();
        }
    }
}

// 2. Pintar el botón según el estado
function pintarBotonLogin() {
    const boton = document.getElementById('mi-boton-login');
    if (!boton) return;

    const estadoSesion = sessionStorage.getItem('sesionIniciada');

    if (estadoSesion === '1') {
        // --- AQUÍ CAMBIAS EL COLOR Y EL TEXTO CUANDO ESTÁS LOGUEADO ---
        
        // 1. Para el color: Puedes quitar/poner tus clases CSS (active, activ-cate) 
        // o forzar un color exacto así:
        boton.style.backgroundColor = "#d93025"; // Cambia este código de color al que prefieras
        boton.style.color = "white"; // Color de la letra
        boton.style.border = "none"; // Quita el borde si lo necesitas
        
        // 2. Para el texto:
        boton.innerText = "Salir de mi cuenta"; // Escribe aquí el texto que quieras
        
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
    console.log("Has seleccionado el perfil: " + perfilSeleccionadoSolicitud);
}