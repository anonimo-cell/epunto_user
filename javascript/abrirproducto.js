// =========================================================================
// 1. CONFIGURACIÓN DE SUPABASE (LA LLAVE Y LA DIRECCIÓN)
// =========================================================================
// 👇 ¡Pega aquí tus datos de Supabase entre las comillas simples! 👇
const SUPABASE_URL = 'https://wdjpqqhxyzrhdbvrumav.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Nps0kXuyPJZlCJ1IPWsalQ_tBLNFgkG';

// NUEVAS VARIABLES PARA EL FILTRO DE PRODUCTOS
let productosGlobales = []; // Aquí guardaremos los productos que nos manda Supabase
let tipoFiltroGlobal = 1;   // 1 = Comercializado, 0 = Bajo coste

// Para las tarjetas del catálogo solo pedimos estas columnas. Lo pesado
// (pasos con sus fotos, materiales, textos largos) se pide al abrir la ficha.
const COLUMNAS_TARJETA = 'id,titulo,imagen_url,producto,precio,dificultad,tiempo,fecha,usuario,categoria,categoria1,categoria2';
const COLUMNAS_DETALLE = 'descripcion,conclusiones,materiales,pasos,enlace';

// Catálogos ya descargados (por dirección de consulta): volver a una
// categoría ya abierta es instantáneo. Se vacía al subir un producto nuevo.
const cacheCatalogo = new Map();

async function cargarProductos(consulta) {
    const url = `${SUPABASE_URL}/rest/v1/verproductos?select=${COLUMNAS_TARJETA}&${consulta}`;
    if (cacheCatalogo.has(url)) return cacheCatalogo.get(url);

    const respuesta = await fetch(url, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    });
    if (!respuesta.ok) throw new Error("No se pudo conectar con Supabase");

    const productos = await respuesta.json();
    cacheCatalogo.set(url, productos);
    return productos;
}

// Descarga (una sola vez) las columnas de la ficha de un producto
async function completarProducto(prod) {
    if (prod.completo) return;

    const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/verproductos?select=${COLUMNAS_DETALLE}&id=eq.${prod.id}`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    });
    if (!respuesta.ok) throw new Error("No se pudo cargar el producto");

    const [detalle] = await respuesta.json();
    Object.assign(prod, detalle, { completo: true });
}

// =========================================================================
// 2. SISTEMA DINÁMICO DE CARGA DESDE LA BASE DE DATOS
// =========================================================================
// Le ponemos "async" a la función para decirle al navegador que tenga 
// paciencia mientras los datos viajan por Internet.
async function abrirCatalogoProductos(boton) {
    // 1. Extraemos el título y la imagen del botón pulsado
    const tituloCategoria = boton.querySelector('.btn-cate-txt').innerText.trim();
    const imagenCategoria = boton.querySelector('img').getAttribute('src');

    // 2. Cambiamos el letrero principal y el icono del molde
    const tituloMolde = document.getElementById('titulo-dinamico');
    const iconoMolde = document.getElementById('icono-dinamico');

    if (tituloMolde) tituloMolde.innerText = tituloCategoria;
    if (iconoMolde) iconoMolde.src = imagenCategoria;

    // 3. ACTUALIZACIÓN DINÁMICA DE MIGAS DE PAN
    const navMigasCatalogo = document.querySelector('#vista-productos-final .migas-pan');
    if (navMigasCatalogo) {
        const vistaOrigen = boton.closest('.subvista-contenido') || obtenerVistaVisible();

        let migasArray = [
            `<span class="miga-enlace" onclick="regresarvolver(1)">Ver Productos</span>`
        ];

        if (vistaOrigen) {
            const migasPrevias = vistaOrigen.querySelectorAll('.migas-pan .miga-enlace, .migas-pan .miga-actual');
            migasPrevias.forEach(miga => {
                const texto = miga.innerText.trim();
                // "Ver Productos" ya es la primera miga: no la repetimos
                if (texto && texto.toLowerCase() !== 'ver productos') {
                    migasArray.push(`<span class="miga-enlace" onclick="regresarAnterior()">${texto}</span>`);
                }
            });
        }

        migasArray.push(`<span class="miga-actual" id="miga-dinamica">${tituloCategoria}</span>`);
        navMigasCatalogo.innerHTML = migasArray.join('<span class="miga-separador">&rarr;</span>');
    }

    // 4. Encendemos el botón seleccionado y navegamos YA, sin esperar a la base de datos
    //    (la vista muestra "Cargando..." mientras llegan los productos)
    boton.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('activ-cate'));
    boton.classList.add('activ-cate');

    cerrarModal(boton);

    vistaObjetivoSeleccionada = 'vista-productos-final';
    realizarBusqueda();

    // 5. CARGAMOS DESDE SUPABASE
    const contenedorProductos = document.getElementById('contenedor-productos-dinamico');

    if (contenedorProductos) {
        contenedorProductos.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p class="mensaje-catalogo">Cargando productos de ${tituloCategoria}...<span aria-hidden="true"> ⏳</span></p>
            </div>
        `;

        try {
            productosGlobales = await cargarProductos(`categoria=ilike.${encodeURIComponent(tituloCategoria)}&order=fecha.desc`);

            const btnComercializado = document.getElementById('btn-opcion-2');
            const btnBajoCoste = document.getElementById('btn-opcion-1');

            if (btnComercializado && btnBajoCoste) {
                btnComercializado.classList.remove('active-filtro');
                btnBajoCoste.classList.add('active-filtro');
            }

            tipoFiltroGlobal = 0;
            renderizarProductosFiltrados();

        } catch (error) {
            console.error("Error al cargar la base de datos:", error);
            contenedorProductos.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <p class="mensaje-catalogo mensaje-catalogo-error">Hubo un error al cargar el catálogo de productos.</p>
                </div>
            `;
        }
    }
}
// Ficha de un producto: "Subido por ... el ..." a la izquierda y las
// etiquetas (precio, dificultad, tiempo) a la derecha, en la misma fila.
// Se monta una sola vez por vista; las siguientes veces ya está colocado.
function ponerAutorYEtiquetasEnFila(vista, infoAutor) {
    const etiquetas = vista.querySelector('.detalle-card .prod-etiquetas');
    if (!etiquetas || infoAutor.parentElement.classList.contains('detalle-fila-autor')) return;

    const fila = document.createElement('div');
    fila.className = 'detalle-fila-autor';
    etiquetas.parentNode.insertBefore(fila, etiquetas);
    fila.appendChild(infoAutor);
    fila.appendChild(etiquetas);

    // Quitamos los estilos en línea que los centraban por separado
    infoAutor.removeAttribute('style');
    etiquetas.removeAttribute('style');
}

// =========================================================================
async function abrirDetalleVerProducto(indiceProducto) {
    // 1. Recuperamos el producto de la lista ya descargada (la tarjeta solo pasa su posición)
    const prod = productosGlobales[indiceProducto];
    if (!prod) return;

    // La lista solo trae lo de la tarjeta: pedimos ahora el resto de la ficha
    try {
        await completarProducto(prod);
    } catch (error) {
        console.error("Error al cargar el producto:", error);
        return;
    }

    // Guardamos el ID global para las valoraciones en Supabase
    window.productoActualId = prod.id;

    // 2. Ocultamos todas las vistas primero
    ocultarTodasLasVistas();

    if (typeof historialVistas !== 'undefined') {
        historialVistas.push('vista-productos-final');
    }

    // =========================================================================
    // GENERADOR DINÁMICO DE MIGAS
    // =========================================================================
    // =========================================================================
    // GENERADOR DINÁMICO DE MIGAS FUNCIONALES
    // =========================================================================
    function generarMigasDePan(producto) {
        // El botón de inicio siempre vuelve al inicio general o al catálogo principal
        let migasHTML = `<span class="miga-enlace" onclick="regresarvolver(1)">Ver Productos</span>`;

        let cat1 = producto.categoria1 && producto.categoria1 !== "Sin categoría" && producto.categoria1 !== "No seleccionada" ? producto.categoria1 : null;
        let cat2 = producto.categoria2 && producto.categoria2 !== "Sin categoría" && producto.categoria2 !== "No seleccionada" ? producto.categoria2 : null;
        let cat3 = producto.categoria && producto.categoria !== "Sin categoría" && producto.categoria !== "No seleccionada" ? producto.categoria : null;

        // Si existe Nivel 1, permitimos que haga clic para volver a esa categoría
        if (cat1) {
            migasHTML += `<span class="miga-separador">&rarr;</span><span class="miga-enlace" onclick="regresarAnterior()">${cat1}</span>`;
        }

        // Si existe Nivel 2 y es diferente al Nivel 1
        if (cat2 && cat2 !== cat1) {
            migasHTML += `<span class="miga-separador">&rarr;</span><span class="miga-enlace" onclick="regresarAnterior()">${cat2}</span>`;
        }

        // Condición de Nivel 3 (Solo para Vestirse o Higiene)
        if (cat2) {
            let cat2Lower = cat2.toLowerCase();
            if ((cat2Lower.includes("vestir") || cat2Lower.includes("higiene")) && cat3 && cat3 !== cat2) {
                migasHTML += `<span class="miga-separador">&rarr;</span><span class="miga-enlace" onclick="regresarAnterior()">${cat3}</span>`;
            }
        }

        // Título final del producto (como texto actual, sin enlace)
        migasHTML += `<span class="miga-separador">&rarr;</span><span class="miga-actual" id="miga-ver-titulo">${producto.titulo || 'Producto'}</span>`;

        return migasHTML;
    }

    // 3. DIFERENCIAMOS SEGÚN EL TIPO DE PRODUCTO (1 = Comercial, 0 = Bajo coste)
    if (prod.producto === 1) {
        // --- VISTA PRODUCTO COMERCIAL ---
        const vistaCom = document.getElementById('vista-detalle-verproductocom');
        if (vistaCom) vistaCom.style.display = 'block';

        const navMigasCom = vistaCom.querySelector('.migas-pan');
        if (navMigasCom) navMigasCom.innerHTML = generarMigasDePan(prod);

        const cabeceraTitulo = vistaCom.querySelector('#cabecera-ver-titulo');
        if (cabeceraTitulo) cabeceraTitulo.innerText = prod.titulo || 'Producto comercial';

        // Imagen comercial optimizada para móvil y PC (Ancho fluido, contención de altura)
        const imgCom = vistaCom.querySelector('#detalle-ver-imagen');
        if (imgCom) {
            imgCom.src = prod.imagen_url || 'svg/subir/comprar.png';
            imgCom.alt = prod.titulo ? `Foto de ${prod.titulo}` : "Foto del producto";
            imgCom.style.cursor = 'pointer';
            imgCom.setAttribute('onclick', `abrirImagenGrande('${prod.imagen_url || 'svg/subir/comprar.png'}')`);
            // width: auto para que la caja (y su recuadro al pulsarla) mida lo que la foto
            imgCom.style.cssText = "width: auto; max-width: 100%; max-height: 250px; height: auto; border-radius: 10px; object-fit: contain; cursor: pointer; display: block; margin: 0 auto;";
        }

        let contenedorInfoExtraCom = document.getElementById('detalle-com-info-extra');
        if (!contenedorInfoExtraCom && imgCom) {
            contenedorInfoExtraCom = document.createElement('div');
            contenedorInfoExtraCom.id = 'detalle-com-info-extra';
            contenedorInfoExtraCom.style.cssText = "text-align: center; margin: 15px 0; color: #555; font-size: 0.95rem; word-break: break-word;";
            imgCom.parentNode.insertBefore(contenedorInfoExtraCom, imgCom.nextSibling);
        }

        let fechaFormateadaCom = prod.fecha ? new Date(prod.fecha).toLocaleDateString() : "Fecha no disponible";
        let usuarioSubidaCom = prod.usuario ? prod.usuario : "Anónimo";
        if (contenedorInfoExtraCom) {
            ponerAutorYEtiquetasEnFila(vistaCom, contenedorInfoExtraCom);
            contenedorInfoExtraCom.innerHTML = `Subido por <strong>${usuarioSubidaCom}</strong> el ${fechaFormateadaCom}`;
        }

        const precioCom = vistaCom.querySelector('#detalle-ver-precio');
        if (precioCom) precioCom.innerText = prod.precio ? `Precio: ${prod.precio}` : '-';

        const descCom = vistaCom.querySelector('#detalle-ver-descripcion');
        if (descCom) descCom.innerText = prod.descripcion || "No se ha proporcionado una descripción.";

        const conclusionesCom = vistaCom.querySelector('#detalle-ver-conclusiones');
        if (conclusionesCom) {
            conclusionesCom.innerText = prod.enlace || "No se ha proporcionado una forma de compra.";
        }
        
        pintarValoracion(vistaCom, prod);

    } else {
        // --- VISTA DE BAJO COSTE ---
        const vistaBaj = document.getElementById('vista-detalle-verproducto');
        if (vistaBaj) vistaBaj.style.display = 'block';

        const navMigasBaj = vistaBaj.querySelector('.migas-pan');
        if (navMigasBaj) navMigasBaj.innerHTML = generarMigasDePan(prod);

        const cabeceraTitulo = vistaBaj.querySelector('#cabecera-ver-titulo');
        if (cabeceraTitulo) cabeceraTitulo.innerText = prod.titulo || 'Producto';

        // Imagen principal de bajo coste adaptada (max-height reducido para que no ocupe todo el móvil)
        const imgBaj = vistaBaj.querySelector('#detalle-ver-imagen');
        if (imgBaj) {
            imgBaj.src = prod.imagen_url || 'svg/subir/comprar.png';
            imgBaj.alt = prod.titulo ? `Foto de ${prod.titulo}` : "Foto del producto";
            imgBaj.style.cursor = 'pointer';
            imgBaj.setAttribute('onclick', `abrirImagenGrande('${prod.imagen_url || 'svg/subir/comprar.png'}')`);
            // width: auto para que la caja (y su recuadro al pulsarla) mida lo que la foto
            imgBaj.style.cssText = "width: auto; max-width: 100%; max-height: 250px; height: auto; border-radius: 10px; object-fit: contain; display: block; margin: 0 auto; cursor: pointer;";
        }

        const elPrecio = vistaBaj.querySelector('#detalle-ver-precio');
        if (elPrecio) elPrecio.innerHTML = `<img src="svg/filtro/dona.svg" alt="Precio" style="width:16px;"> ${prod.precio || '-'}`;

        const elDificultad = vistaBaj.querySelector('#detalle-ver-dificultad');
        if (elDificultad) elDificultad.innerHTML = `<img src="svg/filtro/difi.svg" alt="Dificultad" style="width:16px;"> ${prod.dificultad || '-'}`;

        const elTiempo = vistaBaj.querySelector('#detalle-ver-tiempo');
        if (elTiempo) elTiempo.innerHTML = `<img src="svg/filtro/tiempo.svg" alt="Tiempo" style="width:16px;"> ${prod.tiempo || '-'}`;

        let contenedorInfoExtra = document.getElementById('detalle-ver-info-extra');
        if (!contenedorInfoExtra) {
            const etiquetasDiv = vistaBaj.querySelector('.prod-etiquetas');
            contenedorInfoExtra = document.createElement('div');
            contenedorInfoExtra.id = 'detalle-ver-info-extra';
            contenedorInfoExtra.style.cssText = "text-align: center; margin-bottom: 20px; color: #555; font-size: 0.95rem; word-break: break-word;";
            if (etiquetasDiv && etiquetasDiv.parentNode) {
                etiquetasDiv.parentNode.insertBefore(contenedorInfoExtra, etiquetasDiv.nextSibling);
            }
        }

        let fechaFormateada = prod.fecha ? new Date(prod.fecha).toLocaleDateString() : "Fecha no disponible";
        let usuarioSubida = prod.usuario ? prod.usuario : "Anónimo";
        if (contenedorInfoExtra) {
            ponerAutorYEtiquetasEnFila(vistaBaj, contenedorInfoExtra);
            contenedorInfoExtra.innerHTML = `Subido por <strong>${usuarioSubida}</strong> el ${fechaFormateada}`;
        }

        const descBaj = vistaBaj.querySelector('#detalle-ver-descripcion');
        if (descBaj) descBaj.innerText = prod.descripcion || "No se ha proporcionado una descripción.";

        const concBaj = vistaBaj.querySelector('#detalle-ver-conclusiones');
        if (concBaj) concBaj.innerText = prod.conclusiones || "No hay conclusiones añadidas.";

        // Materiales
        const contenedorMateriales = vistaBaj.querySelector('#detalle-ver-materiales');
        if (contenedorMateriales) {
            contenedorMateriales.innerHTML = "";
            let listaMats = [];

            if (prod.materiales) {
                if (Array.isArray(prod.materiales)) {
                    listaMats = prod.materiales;
                } else if (typeof prod.materiales === 'string') {
                    try { listaMats = JSON.parse(prod.materiales); } catch (e) { listaMats = [prod.materiales]; }
                }
            }

            if (listaMats.length > 0) {
                let ulHTML = "<ul style='margin: 0; padding-left: 20px; word-break: break-word;'>";
                listaMats.forEach(mat => {
                    ulHTML += `<li style="margin-bottom: 5px;">${mat}</li>`;
                });
                ulHTML += "</ul>";
                contenedorMateriales.innerHTML = ulHTML;
            } else {
                contenedorMateriales.innerText = "No se han especificado materiales.";
            }
        }

        // Motor de Pasos adaptado para móviles
        const contenedorPasos = vistaBaj.querySelector('#detalle-ver-pasos');
        if (contenedorPasos) {
            contenedorPasos.innerHTML = "";

            if (prod.pasos) {
                let listaPasos = [];

                if (typeof prod.pasos === 'string') {
                    try { listaPasos = JSON.parse(prod.pasos); } catch (e) { console.error("Error al leer formato de pasos"); }
                } else if (Array.isArray(prod.pasos)) {
                    listaPasos = prod.pasos;
                }

                if (listaPasos.length > 0) {
                    const pasosPermitidos = listaPasos.slice(0, 10);

                    contenedorPasos.innerHTML = pasosPermitidos.map((paso, index) => {
                        let pasoHTML = `
                            <div style="margin-bottom: 25px; width: 100%; box-sizing: border-box;">
                                <h4 style="color: #024389; margin-bottom: 8px; font-weight: bold; font-size: 1.2rem;">
                                    Paso ${index + 1}
                                </h4>
                        `;

                        if (paso.texto && paso.texto.trim() !== "") {
                            pasoHTML += `<p style="margin-bottom: 12px; line-height: 1.5; word-break: break-word;">${paso.texto.replace(/\n/g, '<br>')}</p>`;
                        }

                        // Imágenes de los pasos 100% responsivas para que no desborden
                        if (paso.imagen && paso.imagen.trim() !== "") {
                            pasoHTML += `
                                <div style="text-align: center; margin-bottom: 12px; width: 100%;">
                                    <img src="${paso.imagen}" alt="Imagen del paso ${index + 1}" onclick="abrirImagenGrande('${paso.imagen}')" style="width: 100%; max-width: 300px;  min-width: 200px; height: auto; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer; object-fit: contain;" title="Haz clic para ver en grande">
                                </div>
                            `;
                        }
                        pasoHTML += `</div>`;
                        return pasoHTML;
                    }).join('');
                } else {
                    contenedorPasos.innerHTML = "<p>No hay pasos especificados para este producto.</p>";
                }
            } else {
                contenedorPasos.innerHTML = "<p>No hay pasos especificados para este producto.</p>";
            }
        }

        pintarValoracion(vistaBaj, prod);
    }
}

// =========================================================================
// SISTEMA DE FILTRADO (SLIDER: COMERCIALIZADO VS BAJO COSTE)
// =========================================================================

// Función 1: Se ejecuta al hacer clic en los botones del slider


function cambiarOpcionCatalogo(botonPulsado, opcionElegida) {
    const contenedor = botonPulsado.closest('.contenedor-slider-filtros');
    const botones = contenedor.querySelectorAll('button');

    // Apagamos los dos botones
    botones.forEach(btn => btn.classList.remove('active-filtro'));

    // Encendemos solo el que hemos pulsado
    botonPulsado.classList.add('active-filtro');

    // Decidimos qué número buscar en Supabase (1 o 0)
    if (opcionElegida === 'comercializado') {
        tipoFiltroGlobal = 1;
    } else {
        tipoFiltroGlobal = 0;
    }

    // Volvemos a pintar las tarjetas al instante
    renderizarProductosFiltrados();
}

// Función 2: Filtra la lista de Supabase y crea el HTML
function renderizarProductosFiltrados() {
    const contenedorProductos = document.getElementById('contenedor-productos-dinamico');
    const productosFiltrados = productosGlobales.filter(prod => prod.producto == tipoFiltroGlobal);

    if (productosFiltrados && productosFiltrados.length > 0) {
        // Si hay productos con ese número, los pintamos (todo el HTML de golpe, una sola escritura en el DOM)
        contenedorProductos.innerHTML = productosFiltrados.map(prod => {
            const indiceProducto = productosGlobales.indexOf(prod);

            // Comprobamos si es comercializado (1) para ocultar dificultad y tiempo
            const esComercializado = prod.producto == 1;

            const etiquetasHTML = esComercializado
                ? `
                    <span class="etiqueta-badge"><img src="svg/filtro/dona.svg" alt="Precio"> ${prod.precio || '-'}</span>
                  `
                : `
                    <span class="etiqueta-badge"><img src="svg/filtro/dona.svg" alt="Precio"> ${prod.precio || '-'}</span>
                    <span class="etiqueta-badge"><img src="svg/filtro/difi.svg" alt="Dificultad"> ${prod.dificultad || '-'}</span>
                    <span class="etiqueta-badge"><img src="svg/filtro/tiempo.svg" alt="Tiempo"> ${prod.tiempo || '-'}</span>
                  `;

            const tarjetaHTML = `
                <button class="btn-producto" onclick="abrirDetalleVerProducto(${indiceProducto})">
                  <span class="prod-titulo">${prod.titulo}</span>
                  <img src="${prod.imagen_url || 'svg/subir/comprar.png'}" class="prod-img" alt="" loading="lazy" decoding="async">
                  <div class="prod-etiquetas${esComercializado ? ' prod-etiquetas-solo-precio' : ''}">
                    ${etiquetasHTML}
                  </div>
                </button>
            `;
            return tarjetaHTML;
        }).join('');
    } else {
        // Si no hay ninguno, mostramos este mensaje
        contenedorProductos.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p class="mensaje-catalogo">No hay productos de este tipo actualmente.</p>
            </div>
        `;
    }
}
// Elemento que tenía el foco antes de abrir la imagen (para devolverlo al cerrar)
let focoAntesDeImagenGrande = null;

function abrirImagenGrande(urlImagen) {
    const modal = document.getElementById('modal-imagen-grande');
    const imgAmpliada = document.getElementById('imagen-ampliada-src');

    if (modal && imgAmpliada) {
        focoAntesDeImagenGrande = document.activeElement;

        // La imagen ampliada lleva la misma descripción que la miniatura pulsada
        const miniatura = focoAntesDeImagenGrande && focoAntesDeImagenGrande.tagName === 'IMG' ? focoAntesDeImagenGrande : null;
        imgAmpliada.alt = miniatura && miniatura.alt ? miniatura.alt : 'Imagen ampliada';

        imgAmpliada.src = urlImagen;
        modal.style.display = 'flex'; // Muestra el modal centrado

        const botonCerrar = document.getElementById('btn-cerrar-imagen-grande');
        if (botonCerrar) botonCerrar.focus();
    }
}

function cerrarImagenGrande() {
    const modal = document.getElementById('modal-imagen-grande');
    if (modal && modal.style.display !== 'none') {
        modal.style.display = 'none'; // Oculta el modal al hacer clic

        if (focoAntesDeImagenGrande && focoAntesDeImagenGrande.isConnected) focoAntesDeImagenGrande.focus();
        focoAntesDeImagenGrande = null;
    }
}

// Teclado en la imagen ampliada: Escape cierra y el foco no se escapa detrás
document.addEventListener('keydown', (evento) => {
    const modal = document.getElementById('modal-imagen-grande');
    if (!modal || modal.style.display === 'none') return;

    if (evento.key === 'Escape') {
        cerrarImagenGrande();
    } else if (evento.key === 'Tab') {
        evento.preventDefault(); // El único control es el botón de cerrar
        const botonCerrar = document.getElementById('btn-cerrar-imagen-grande');
        if (botonCerrar) botonCerrar.focus();
    }
});



// =========================================================================
// VALORACIONES: "ME GUSTA" / "NO ME GUSTA"
// Solo votan los usuarios con sesión iniciada. El voto se guarda en la tabla
// "valoraciones" (uno por usuario y producto) y la función votar_producto
// recalcula las columnas me_gusta y no_gusta de verproductos.
// (SQL en sql/valoraciones.sql)
// =========================================================================
const TEXTOS_VOTO = { me_gusta: 'Me gusta', no_gusta: 'No me gusta' };

// Pulgar arriba / abajo. Usan el color del texto del botón (currentColor),
// así se adaptan al contraste alto y al botón activo. Son decorativos:
// el lector de pantalla lee solo el texto.
const PULGAR_ARRIBA = '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>';
const ICONOS_VOTO = {
    me_gusta: `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="1.3em" height="1.3em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -0.25em; margin-right: 6px; flex-shrink: 0;">${PULGAR_ARRIBA}</svg>`,
    no_gusta: `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="1.3em" height="1.3em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -0.25em; margin-right: 6px; flex-shrink: 0; transform: rotate(180deg);">${PULGAR_ARRIBA}</svg>`
};

function anunciarValoracion(texto) {
    const anuncio = document.getElementById('anuncio-accesible');
    if (anuncio) anuncio.innerText = texto;
}

// Usuario con sesión de Supabase (null si no ha iniciado sesión)
async function usuarioActual() {
    if (!window.supabase || !window.supabase.auth) return null;
    const { data } = await window.supabase.auth.getSession();
    return data && data.session ? data.session.user : null;
}

// Pinta los dos botones con sus contadores y marca el voto del usuario
function actualizarBotonesValoracion(contenedor, prod, votoUsuario) {
    contenedor.querySelectorAll('.btn-valoracion-independiente').forEach(btn => {
        const tipo = btn.dataset.voto;
        const activo = tipo === votoUsuario;
        btn.classList.toggle('active-filtro', activo);
        btn.setAttribute('aria-pressed', activo ? 'true' : 'false');
        // Los totales solo se guardan en la base de datos: en la web no se enseñan
        btn.innerHTML = `${ICONOS_VOTO[tipo]}<span>${TEXTOS_VOTO[tipo]}</span>`;
    });
}

async function pintarValoracion(vista, prod) {
    let contenedor = vista.querySelector('#detalle-ver-valoracion');
    if (!contenedor) {
        const detalleCard = vista.querySelector('.detalle-card');
        contenedor = document.createElement('div');
        contenedor.id = 'detalle-ver-valoracion';
        // Adaptación móvil: flex-wrap permite que caigan en otra línea si la pantalla es estrecha
        contenedor.style.cssText = "display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; width: 100%; box-sizing: border-box; margin-top: 25px; margin-bottom: 10px;";
        contenedor.innerHTML = `
            <button type="button" class="btn-val-g btn-valoracion-independiente" data-voto="me_gusta" onclick="alternarValoracion(this)" style="flex: 1 1 140px; min-width: 130px; box-sizing: border-box; padding: 10px 5px;"></button>
            <button type="button" class="btn-val-n btn-valoracion-independiente" data-voto="no_gusta" onclick="alternarValoracion(this)" style="flex: 1 1 140px; min-width: 130px; box-sizing: border-box; padding: 10px 5px;"></button>
        `;
        if (detalleCard) detalleCard.appendChild(contenedor);
    }

    // Los botones se reutilizan entre productos: primero los dejamos sin voto
    contenedor.dataset.productoId = prod.id;
    contenedor.dataset.votoUsuario = '';
    actualizarBotonesValoracion(contenedor, prod, null);

    // Si hay sesión, buscamos si este usuario ya votó este producto
    const usuario = await usuarioActual();
    if (!usuario) return;

    const { data, error } = await window.supabase
        .from('valoraciones')
        .select('voto')
        .eq('producto_id', prod.id)
        .eq('user_id', usuario.id)
        .maybeSingle();

    // Mientras llegaba la respuesta puede haber abierto otro producto
    if (error || contenedor.dataset.productoId != prod.id) return;

    const voto = data ? data.voto : '';
    contenedor.dataset.votoUsuario = voto;
    actualizarBotonesValoracion(contenedor, prod, voto || null);
}

async function alternarValoracion(botonPulsado) {
    const contenedor = botonPulsado.closest('#detalle-ver-valoracion');
    const prod = productosGlobales.find(p => p.id == contenedor.dataset.productoId);
    if (!prod) return;

    // Solo pueden votar los usuarios registrados
    const usuario = await usuarioActual();
    if (!usuario) {
        anunciarValoracion('Inicia sesión para valorar los productos');
        abrirModal('modal-login');
        return;
    }

    // Pulsar el voto que ya tenía lo quita; pulsar el otro lo cambia
    const votoAnterior = contenedor.dataset.votoUsuario || null;
    const votoNuevo = botonPulsado.dataset.voto === votoAnterior ? null : botonPulsado.dataset.voto;

    const botones = contenedor.querySelectorAll('.btn-valoracion-independiente');
    botones.forEach(btn => btn.disabled = true);

    try {
        const { error } = await window.supabase.rpc('votar_producto', {
            p_producto_id: prod.id,
            p_voto: votoNuevo
        });
        if (error) throw error;

        contenedor.dataset.votoUsuario = votoNuevo || '';
        actualizarBotonesValoracion(contenedor, prod, votoNuevo);

        anunciarValoracion(votoNuevo ? `Has votado: ${TEXTOS_VOTO[votoNuevo]}` : 'Has quitado tu voto');
    } catch (error) {
        console.error('Error al guardar la valoración:', error);
        anunciarValoracion('No se pudo guardar tu valoración. Inténtalo de nuevo.');
    } finally {
        botones.forEach(btn => btn.disabled = false);
    }
}
// =========================================================================
// VALIDACIÓN PARA LOS BOTONES DE SUBIDA DE PRODUCTO
// =========================================================================
// Botón de subida (bajo coste / comercializado) que el usuario pulsó sin haber
// iniciado sesión. Al iniciar sesión se abre directamente su formulario.
let subidaPendienteTrasLogin = null;

function comprobarSesionYAbrirSubida(elemento) {
    const estadoSesion = sessionStorage.getItem('sesionIniciada');

    if (estadoSesion !== '1') {
        subidaPendienteTrasLogin = elemento;
        abrirModal('modal-login');
        return;
    }
    if (typeof cambiarEstadoslider === 'function') {
        cambiarEstadoslider(elemento);
    }
}

// Si el usuario cierra el diálogo sin iniciar sesión, olvidamos el formulario
// pendiente (para que un inicio de sesión posterior no le lleve allí por sorpresa)
document.addEventListener('DOMContentLoaded', () => {
    const modalLogin = document.getElementById('modal-login');
    if (!modalLogin) return;
    modalLogin.addEventListener('close', () => {
        if (sessionStorage.getItem('sesionIniciada') !== '1') subidaPendienteTrasLogin = null;
        // Al volver a abrirlo no debe quedar nada en rojo
        modalLogin.querySelectorAll('.campo-error').forEach(campo => campo.classList.remove('campo-error'));
        const avisoLogin = document.getElementById('mensaje-error-login-modal');
        if (avisoLogin) avisoLogin.style.display = 'none';
    });
});


// =========================================================================
// INICIO DE SESIÓN EN EL MODAL FLOTANTE
// =========================================================================
async function simularInicioSesionModal() {
    const campoUsuario = document.getElementById('login-usuario-modal');
    const campoPass = document.getElementById('login-password-modal');
    const usuarioInput = campoUsuario.value.trim();
    const pass = campoPass.value.trim();
    const mensajeError = document.getElementById('mensaje-error-login-modal');

    // Campos vacíos: marcamos en rojo los que faltan y avisamos debajo,
    // sin cerrar el diálogo
    campoUsuario.classList.toggle('campo-error', !usuarioInput);
    campoPass.classList.toggle('campo-error', !pass);

    if (!usuarioInput || !pass) {
        if (mensajeError) {
            mensajeError.innerText = !usuarioInput && !pass
                ? "Falta rellenar el correo o usuario y la contraseña"
                : !usuarioInput
                    ? "Falta rellenar el correo o usuario"
                    : "Falta rellenar la contraseña";
            mensajeError.style.display = 'block';
        }
        (!usuarioInput ? campoUsuario : campoPass).focus();
        return;
    }

    if (mensajeError) mensajeError.style.display = 'none';

    try {
        // Se entra con el correo o con el nombre de usuario. Si no lleva "@"
        // es un nombre: Supabase nos da el correo de esa cuenta, pero solo si
        // la contraseña es correcta (función correo_de_usuario, ver
        // supabase/usuarios_login.sql). También sirve para las cuentas antiguas.
        let email = usuarioInput.toLowerCase();
        if (!usuarioInput.includes('@')) {
            const { data: correo, error: errorCorreo } = await supabase.rpc('correo_de_usuario', {
                nombre_usuario: usuarioInput,
                contrasena: pass
            });
            if (errorCorreo) throw errorCorreo;
            if (!correo) throw { code: 'invalid_credentials', message: 'Usuario o contraseña incorrectos' };
            email = correo;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: pass
        });

        if (error) {
            throw error;
        }

        // GUARDAMOS EN SESSION (se borra al cerrar el navegador)
        sessionStorage.setItem('sesionIniciada', '1');

        // Nombre visible del usuario: el que puso al registrarse
        sessionStorage.setItem('nombreUsuario', nombreVisibleDe(data.user) || usuarioInput);

        // PINTAMOS EL BOTÓN AL INSTANTE
        if (typeof pintarBotonLogin === 'function') {
            pintarBotonLogin();
        }

        if (mensajeError) {
            mensajeError.style.display = 'none';
        }

        cerrarModal('modal-login');

        // Si venía de pulsar "bajo coste" o "comercializado", abrimos ese formulario
        if (subidaPendienteTrasLogin) {
            const destino = subidaPendienteTrasLogin;
            subidaPendienteTrasLogin = null;
            cambiarEstadoslider(destino);
        }


    } catch (e) {
        console.error("Error de inicio de sesión:", e.message);
        if (mensajeError) {
            mensajeError.style.display = 'block';
            mensajeError.innerText = (e.code === 'email_not_confirmed' || /not confirmed/i.test(e.message || ''))
                ? "Todavía no has confirmado tu correo. Revisa tu bandeja de entrada."
                : usuarioInput.includes('@')
                    ? "Correo o contraseña incorrectos"
                    : "Usuario o contraseña incorrectos";
        }
    }
}

// Nombre que se muestra del usuario ("Subido por ..."): el nombre de usuario
// guardado al registrarse; en cuentas antiguas, la parte del correo antes de la @
function nombreVisibleDe(user) {
    if (!user) return '';
    return (user.user_metadata && user.user_metadata.nombre) || (user.email || '').split('@')[0];
}

// =========================================================================
// OCULTAR LAS CATEGORÍAS QUE NO TIENEN PRODUCTOS
// Al cargar la página pedimos solo las categorías de cada producto (muy
// ligero) y ocultamos en "Ver productos" los botones de categoría y
// subcategoría sin ningún producto dentro. Los diálogos para elegir
// categoría al subir un producto no se tocan.
// =========================================================================
const normalizarCategoria = texto => (texto || '').trim().toLowerCase();
const CATEGORIA_VACIA = ['', 'sin categoría', 'no seleccionada'];

// Ruta de cada producto: [nivel 1, nivel 2, nivel 3], sin huecos ni repetidos
// (p. ej. "Comer y beber" puede venir en el nivel 2 y en el 3)
function rutaDeProducto(prod) {
    const ruta = [];
    [prod.categoria1, prod.categoria2, prod.categoria].forEach(cat => {
        const c = normalizarCategoria(cat);
        if (!CATEGORIA_VACIA.includes(c) && ruta[ruta.length - 1] !== c) ruta.push(c);
    });
    return ruta;
}

async function actualizarCategoriasVisibles() {
    let productos;
    try {
        const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/verproductos?select=categoria1,categoria2,categoria`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        if (!respuesta.ok) throw new Error("No se pudieron cargar las categorías");
        productos = await respuesta.json();
    } catch (error) {
        // Si falla, mejor enseñar todas las categorías que ninguna
        console.error("Error al comprobar las categorías con productos:", error);
        return;
    }

    // Todas las rutas que tienen algún producto, y sus tramos iniciales
    // ("autonomía y cuidado", "autonomía y cuidado › higiene", ...)
    const rutasConProductos = new Set();
    productos.forEach(prod => {
        const ruta = rutaDeProducto(prod);
        for (let i = 1; i <= ruta.length; i++) rutasConProductos.add(ruta.slice(0, i).join(' › '));
    });

    // Recorremos las vistas desde "Ver productos" siguiendo los botones que
    // abren subcategorías (data-vista), para saber la ruta de cada botón
    const pendientes = [{ vista: document.getElementById('vista-ver'), ruta: [] }];
    const visitadas = new Set();

    while (pendientes.length > 0) {
        const { vista, ruta } = pendientes.shift();
        if (!vista || visitadas.has(vista.id)) continue;
        visitadas.add(vista.id);

        const botones = vista.querySelectorAll('.categorias .btn-cate, .categorias .btn-cate-4');
        botones.forEach(boton => {
            const texto = boton.querySelector('.btn-cate-txt');
            if (!texto) return;

            const rutaBoton = [...ruta, normalizarCategoria(texto.innerText)];
            const tieneProductos = rutasConProductos.has(rutaBoton.join(' › '));
            boton.style.display = tieneProductos ? '' : 'none';

            const subvista = boton.getAttribute('data-vista');
            if (subvista) pendientes.push({ vista: document.getElementById(subvista), ruta: rutaBoton });
        });

        // Si no queda ninguna categoría visible, lo decimos en lugar de dejar la pantalla vacía
        const rejilla = vista.querySelector('.categorias .grid-capsulas');
        if (rejilla) {
            let aviso = vista.querySelector('.aviso-sin-categorias');
            const hayVisibles = Array.from(botones).some(b => b.style.display !== 'none');
            if (!hayVisibles && !aviso) {
                aviso = document.createElement('p');
                aviso.className = 'mensaje-catalogo aviso-sin-categorias';
                aviso.innerText = 'Todavía no hay productos en esta categoría.';
                rejilla.after(aviso);
            }
            if (aviso) aviso.style.display = hayVisibles ? 'none' : '';
        }
    }
}

document.addEventListener('DOMContentLoaded', actualizarCategoriasVisibles);
