// =========================================================================
// 1. CONFIGURACIÓN DE SUPABASE (LA LLAVE Y LA DIRECCIÓN)
// =========================================================================
// 👇 ¡Pega aquí tus datos de Supabase entre las comillas simples! 👇
const SUPABASE_URL = 'https://wdjpqqhxyzrhdbvrumav.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Nps0kXuyPJZlCJ1IPWsalQ_tBLNFgkG';

// NUEVAS VARIABLES PARA EL FILTRO DE PRODUCTOS
let productosGlobales = []; // Aquí guardaremos los productos que nos manda Supabase
let tipoFiltroGlobal = 1;   // 1 = Comercializado, 0 = Bajo coste

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
            `<span class="miga-enlace" onclick="regresarvolver(1)">Inicio Ver Productos</span>`
        ];

        if (vistaOrigen) {
            const migasPrevias = vistaOrigen.querySelectorAll('.migas-pan .miga-enlace, .migas-pan .miga-actual');
            migasPrevias.forEach(miga => {
                const texto = miga.innerText.trim();
                if (texto && texto.toLowerCase() !== 'inicio' && !texto.toLowerCase().includes('inicio ver')) {
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
                <h2 style="color: #666;">Cargando productos de ${tituloCategoria}... ⏳</h2>
            </div>
        `;

        try {
            const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/verproductos?categoria=ilike.${encodeURIComponent(tituloCategoria)}&order=fecha.desc`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            if (!respuesta.ok) throw new Error("No se pudo conectar con Supabase");

            const productos = await respuesta.json();
            productosGlobales = productos;

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
                    <h2 style="color: #d93025;">Hubo un error al cargar el catálogo de productos.</h2>
                </div>
            `;
        }
    }
}
// =========================================================================
function abrirDetalleVerProducto(indiceProducto) {
    // 1. Recuperamos el producto de la lista ya descargada (la tarjeta solo pasa su posición)
    const prod = productosGlobales[indiceProducto];
    if (!prod) return;

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
        let migasHTML = `<span class="miga-enlace" onclick="regresarvolver(1)">Inicio</span>`;

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
            imgCom.style.cursor = 'pointer';
            imgCom.setAttribute('onclick', `abrirImagenGrande('${prod.imagen_url || 'svg/subir/comprar.png'}')`);
            imgCom.style.cssText = "width: 100%; max-width: 100%; max-height: 250px; height: auto; border-radius: 10px; object-fit: contain; cursor: pointer; display: block; margin: 0 auto;";
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
        
        let contenedorValoracionCom = vistaCom.querySelector('#detalle-ver-valoracion');
        if (!contenedorValoracionCom) {
            const detalleCardCom = vistaCom.querySelector('.detalle-card');
            contenedorValoracionCom = document.createElement('div');
            contenedorValoracionCom.id = 'detalle-ver-valoracion';
            // Adaptación móvil: flex-wrap permite que caigan en otra línea si la pantalla es de 320px
            contenedorValoracionCom.style.cssText = "display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; width: 100%; box-sizing: border-box; margin-top: 25px; margin-bottom: 10px;";

            contenedorValoracionCom.innerHTML = `
                <button type="button" class="btn-val-g btn-valoracion-independiente" id="btn-mg-si" onclick="alternarValoracion(this, 'me-gusta')" style="flex: 1 1 140px; min-width: 130px; box-sizing: border-box; padding: 10px 5px;">
                     Me ha resultado útil
                </button>
                <button type="button" class="btn-val-n btn-valoracion-independiente" id="btn-mg-no" onclick="alternarValoracion(this, 'no-gusta')" style="flex: 1 1 140px; min-width: 130px; box-sizing: border-box; padding: 10px 5px;">
                     No me gusta
                </button>
            `;
            if (detalleCardCom) detalleCardCom.appendChild(contenedorValoracionCom);
        }

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
            imgBaj.style.cursor = 'pointer';
            imgBaj.setAttribute('onclick', `abrirImagenGrande('${prod.imagen_url || 'svg/subir/comprar.png'}')`);
            imgBaj.style.cssText = "width: 100%; max-width: 100%; max-height: 250px; height: auto; border-radius: 10px; object-fit: contain; display: block; margin: 0 auto; cursor: pointer;";
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
                                    <img src="${paso.imagen}" onclick="abrirImagenGrande('${paso.imagen}')" style="width: 100%; max-width: 300px;  min-width: 200px; height: auto; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer; object-fit: contain;" title="Haz clic para ver en grande">
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

        // SLIDER DE VALORACIÓN (BAJO COSTE) ADAPTADO A MÓVIL
        let contenedorValoracion = vistaBaj.querySelector('#detalle-ver-valoracion');
        if (!contenedorValoracion) {
            const detalleCardBaj = vistaBaj.querySelector('.detalle-card');
            contenedorValoracion = document.createElement('div');
            contenedorValoracion.id = 'detalle-ver-valoracion';
            // Adaptación móvil: flex-wrap permite que caigan en otra línea si la pantalla es estrecha
            contenedorValoracion.style.cssText = "display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; width: 100%; box-sizing: border-box; margin-top: 25px; margin-bottom: 10px;";

            contenedorValoracion.innerHTML = `
                <button type="button" class="btn-val-g btn-valoracion-independiente" id="btn-mg-si" onclick="alternarValoracion(this, 'me-gusta')" style="flex: 1 1 140px; min-width: 130px; box-sizing: border-box; padding: 10px 5px;">
                     Me ha resultado útil
                </button>
                <button type="button" class="btn-val-n btn-valoracion-independiente" id="btn-mg-no" onclick="alternarValoracion(this, 'no-gusta')" style="flex: 1 1 140px; min-width: 130px; box-sizing: border-box; padding: 10px 5px;">
                     No me gusta
                </button>
            `;
            if (detalleCardBaj) detalleCardBaj.appendChild(contenedorValoracion);
        }
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
                  <img src="${prod.imagen_url || 'svg/subir/comprar.png'}" class="prod-img" alt="${prod.titulo}" loading="lazy" decoding="async">
                  <div class="prod-etiquetas">
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
                <h2 style="color: #666;">No hay productos de este tipo actualmente.</h2>
            </div>
        `;
    }
}
function abrirImagenGrande(urlImagen) {
    const modal = document.getElementById('modal-imagen-grande');
    const imgAmpliada = document.getElementById('imagen-ampliada-src');

    if (modal && imgAmpliada) {
        imgAmpliada.src = urlImagen;
        modal.style.display = 'flex'; // Muestra el modal centrado
    }
}

function cerrarImagenGrande() {
    const modal = document.getElementById('modal-imagen-grande');
    if (modal) {
        modal.style.display = 'none'; // Oculta el modal al hacer clic
    }
}



function alternarValoracion(botonPulsado, opcion) {
    const contenedor = botonPulsado.closest('#detalle-ver-valoracion');
    const todosLosBotones = contenedor.querySelectorAll('.btn-valoracion-independiente');

    // Comprobamos si el botón que acaba de pulsar ya estaba activo
    const yaEstabaActivo = botonPulsado.classList.contains('active-filtro');

    // 1. Apagamos y reseteamos el texto original de ambos botones
    todosLosBotones.forEach(btn => {
        btn.classList.remove('active-filtro');
        if (btn.id === 'btn-mg-si') btn.innerText = "Me ha resultado útil";
        if (btn.id === 'btn-mg-no') btn.innerText = "No me ha resultado útil";
    });

    // 2. Si NO estaba activo, lo encendemos y le asignamos su texto personalizado
    if (!yaEstabaActivo) {
        botonPulsado.classList.add('active-filtro');

        // Textos personalizados al activarse cada botón:
        if (opcion === 'me-gusta') {
            botonPulsado.innerText = "Le has dado a útil"; // Texto cuando está activo "Me gusta"
        } else if (opcion === 'no-gusta') {
            botonPulsado.innerText = "Le has dado a no útil"; // Texto cuando está activo "No me gusta"
        }

    }
}
// =========================================================================
// VALIDACIÓN PARA LOS BOTONES DE SUBIDA DE PRODUCTO
// =========================================================================
function comprobarSesionYAbrirSubida(elemento) {
    const estadoSesion = sessionStorage.getItem('sesionIniciada');

    if (estadoSesion !== '1') {
        abrirModal('modal-login');
        return;
    }
    if (typeof cambiarEstadoslider === 'function') {
        cambiarEstadoslider(elemento);
    }
}


// =========================================================================
// INICIO DE SESIÓN EN EL MODAL FLOTANTE
// =========================================================================
async function simularInicioSesionModal() {
    const usuarioInput = document.getElementById('login-usuario-modal').value.trim();
    const pass = document.getElementById('login-password-modal').value.trim();
    const mensajeError = document.getElementById('mensaje-error-login-modal');

    if (!usuarioInput || !pass) {
        mostrarMensajeEstado("Rellena ambos campos");
        return;
    }

    const email = usuarioInput.toLowerCase() + "@epunto.com";

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: pass
        });

        if (error) {
            throw error;
        }

        // GUARDAMOS EN SESSION (se borra al cerrar el navegador)
        sessionStorage.setItem('sesionIniciada', '1');

        // ⬇️ ¡AQUÍ ESTÁ LA CLAVE! GUARDAMOS EL NOMBRE DEL USUARIO ⬇️
        sessionStorage.setItem('nombreUsuario', usuarioInput);

        // PINTAMOS EL BOTÓN AL INSTANTE
        if (typeof pintarBotonLogin === 'function') {
            pintarBotonLogin();
        }

        if (mensajeError) {
            mensajeError.style.display = 'none';
        }

        mostrarMensajeEstado("Sesión iniciada");

        cerrarModal('modal-login');

        if (typeof vistaIntencionSubida !== 'undefined' && vistaIntencionSubida) {
            mostrarVista(vistaIntencionSubida);
            vistaIntencionSubida = null;
        }

    } catch (e) {
        console.error("Error de inicio de sesión:", e.message);
        if (mensajeError) {
            mensajeError.style.display = 'block';
            mensajeError.innerText = "Usuario o contraseña incorrectos";
        }
    }
}
