// =========================================================================
// MEJORAS DE ACCESIBILIDAD (WCAG 2.2) PARA TODA LA WEB
// Como gran parte del contenido se genera con JavaScript (migas de pan,
// catálogo, detalle de producto...), estas mejoras se aplican al cargar
// y cada vez que la página cambia.
// =========================================================================

// -------------------------------------------------------------------------
// 1. AVISOS PARA LECTORES DE PANTALLA (WCAG 4.1.3)
// -------------------------------------------------------------------------
function anunciar(texto) {
    const region = document.getElementById('anuncio-accesible');
    if (!region) return;
    // Vaciamos primero para que el lector repita el aviso aunque el texto sea igual
    region.textContent = '';
    setTimeout(() => { region.textContent = texto; }, 100);
}

// -------------------------------------------------------------------------
// 2. MIGAS DE PAN: navegables con teclado y con la página actual marcada
// -------------------------------------------------------------------------
function mejorarMigasDePan() {
    document.querySelectorAll('.migas-pan').forEach(nav => {
        if (!nav.hasAttribute('aria-label')) nav.setAttribute('aria-label', 'Ruta de navegación');

        nav.querySelectorAll('.miga-separador').forEach(sep => sep.setAttribute('aria-hidden', 'true'));

        nav.querySelectorAll('.miga-enlace[onclick]').forEach(miga => {
            miga.setAttribute('role', 'link');
            miga.setAttribute('tabindex', '0');
        });

        const actuales = nav.querySelectorAll('.miga-actual');
        actuales.forEach(miga => miga.removeAttribute('aria-current'));
        if (actuales.length) actuales[actuales.length - 1].setAttribute('aria-current', 'page');
    });
}

// -------------------------------------------------------------------------
// 3. IMÁGENES QUE SE PUEDEN AMPLIAR: accesibles con teclado
// -------------------------------------------------------------------------
function mejorarImagenesAmpliables() {
    document.querySelectorAll('img[onclick]').forEach(img => {
        img.setAttribute('role', 'button');
        img.setAttribute('tabindex', '0');
        const descripcion = img.getAttribute('alt');
        img.setAttribute('aria-label', descripcion ? `Ampliar imagen: ${descripcion}` : 'Ampliar imagen');
    });
}

// -------------------------------------------------------------------------
// 4. ESTADO DE LOS BOTONES (seleccionado / página actual) (WCAG 4.1.2)
// -------------------------------------------------------------------------
const BOTONES_CON_ESTADO = [
    { selector: '.btn-filtro, .btn-valoracion-independiente', claseActiva: 'active-filtro' },
    { selector: '.btn-rela', claseActiva: 'activ-cate' }
];

function sincronizarEstados() {
    BOTONES_CON_ESTADO.forEach(({ selector, claseActiva }) => {
        document.querySelectorAll(selector).forEach(boton => {
            boton.setAttribute('aria-pressed', boton.classList.contains(claseActiva) ? 'true' : 'false');
        });
    });

    // Menú principal y botones de cabecera: indican la sección en la que estamos
    document.querySelectorAll('.multi-slider .btn-menu, .btn-login-header[data-vista]').forEach(boton => {
        if (boton.classList.contains('active')) boton.setAttribute('aria-current', 'page');
        else boton.removeAttribute('aria-current');
    });

    // Campos con error de validación (WCAG 3.3.1)
    document.querySelectorAll('input, textarea, select').forEach(campo => {
        if (campo.classList.contains('campo-error')) campo.setAttribute('aria-invalid', 'true');
        else campo.removeAttribute('aria-invalid');
    });
}

// -------------------------------------------------------------------------
// 5. DIÁLOGOS CON NOMBRE (el lector anuncia su título al abrirse)
// -------------------------------------------------------------------------
function nombrarDialogos() {
    document.querySelectorAll('dialog').forEach(dialogo => {
        if (dialogo.hasAttribute('aria-labelledby') || dialogo.hasAttribute('aria-label')) return;
        const titulo = dialogo.querySelector('.btn-titulo-dialog, .titulo-menu-acce');
        if (!titulo) return;
        if (!titulo.id) titulo.id = `titulo-${dialogo.id || Math.random().toString(36).slice(2)}`;
        dialogo.setAttribute('aria-labelledby', titulo.id);
    });
}

// -------------------------------------------------------------------------
// 6. CAMBIO DE VISTA: título de la pestaña y foco en el encabezado
//    (WCAG 2.4.2 Titulado de páginas y 2.4.3 Orden del foco)
// -------------------------------------------------------------------------
let idVistaAnterior = null;
let usuarioHaInteractuado = false;
['pointerdown', 'keydown'].forEach(tipo => {
    document.addEventListener(tipo, () => { usuarioHaInteractuado = true; }, { capture: true });
});

function revisarVistaVisible() {
    const vista = Array.from(document.querySelectorAll('.subvista-contenido'))
        .find(v => v.style.display === 'flex' || v.style.display === 'block');
    if (!vista) return;

    const encabezado = vista.querySelector('h1');
    const textoEncabezado = encabezado ? encabezado.textContent.trim() : '';
    const nuevoTitulo = textoEncabezado ? `${textoEncabezado} · EPunto` : 'EPunto';
    if (document.title !== nuevoTitulo) document.title = nuevoTitulo;

    if (vista.id === idVistaAnterior) return;
    const habiaVistaAntes = idVistaAnterior !== null;
    idVistaAnterior = vista.id;

    // Llevamos el foco al título de la nueva vista para que el usuario de teclado
    // o de lector de pantalla empiece a leer desde arriba (no en la carga inicial)
    if (habiaVistaAntes && usuarioHaInteractuado && encabezado && !document.querySelector('dialog[open]')) {
        encabezado.setAttribute('tabindex', '-1');
        encabezado.focus();
    }
}

// -------------------------------------------------------------------------
// 7. ANUNCIAR RESULTADOS DEL CATÁLOGO
// -------------------------------------------------------------------------
function envolverRenderizadoCatalogo() {
    if (typeof renderizarProductosFiltrados !== 'function') return;
    const original = renderizarProductosFiltrados;
    window.renderizarProductosFiltrados = function (...argumentos) {
        const resultado = original.apply(this, argumentos);
        const total = document.querySelectorAll('#contenedor-productos-dinamico .btn-producto').length;
        anunciar(total === 0
            ? 'No se han encontrado productos.'
            : `Se ${total === 1 ? 'ha' : 'han'} encontrado ${total} producto${total === 1 ? '' : 's'}.`);
        return resultado;
    };
}

// -------------------------------------------------------------------------
// APLICAR TODO (al cargar y cada vez que la página cambia)
// -------------------------------------------------------------------------
function aplicarMejorasAccesibilidad() {
    mejorarMigasDePan();
    mejorarImagenesAmpliables();
    sincronizarEstados();
    nombrarDialogos();
    revisarVistaVisible();
}

let mejoraPendiente = false;
function programarMejoras() {
    if (mejoraPendiente) return;
    mejoraPendiente = true;
    requestAnimationFrame(() => {
        mejoraPendiente = false;
        aplicarMejorasAccesibilidad();
    });
}

document.addEventListener('DOMContentLoaded', () => {

    envolverRenderizadoCatalogo();
    aplicarMejorasAccesibilidad();

    // Solo observamos cambios de contenido, clase y estilo; los atributos aria
    // que ponemos aquí no disparan el observador (no hay bucles)
    new MutationObserver(programarMejoras).observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['class', 'style']
    });
});
