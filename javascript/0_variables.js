// ==========================================
// CONFIGURACIÓN GLOBAL Y MEMORIA
// ==========================================
let categoriaSeleccionada = null;
let ultimaPestanaUsuario = "ver";
let opcionSubirSeleccionada = null;

const LISTA_SUBCATEGORIAS = ['alimentación', 'higiene', 'ocio', 'cotidianas', 'movilidad', 'aprendizaje', 'ejercicios', 'organización', 'vestirse', 'comunicación', 'otros'];

// Guardamos las subcategorías normalizadas en un Set para búsquedas ultra rápidas
const SUBCATEGORIAS_NORMALIZADAS = LISTA_SUBCATEGORIAS.map(cat => `vista-${normalizarTexto(cat)}`);

// ==========================================
// FUNCIONES DE UTILIDAD (HELPERS)
// ==========================================
function normalizarTexto(texto) {
    return texto.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function ocultarElementosPorId(ids) {
    ids.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.style.display = 'none';
    });
}

function gestionarClasesActivas(elementoActivo, selectorHermanos) {
    const hermanos = elementoActivo.parentElement.querySelectorAll(selectorHermanos);
    hermanos.forEach(btn => btn.classList.remove('active'));
    elementoActivo.classList.add('active');
}

function reiniciarCategorias() {
    categoriaSeleccionada = null;
    document.querySelectorAll('.cap-btn').forEach(btn => btn.classList.remove('activ-cate'));
}