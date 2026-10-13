const SUPABASE_URL = 'https://wdjpqqhxyzrhdbvrumav.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Nps0kXuyPJZlCJ1IPWsalQ_tBLNFgkG';

async function abrirCatalogoprobarProductos(boton) {
    // 1. Obtenemos datos del botón pulsado
    const tituloCategoria = boton.querySelector('.btn-cate-txt').innerText.trim();
    const imagenCategoria = boton.querySelector('img').getAttribute('src');

    // 2. Actualizamos los elementos de la interfaz de la vista
    document.getElementById('titulo-dinamico').innerText = tituloCategoria;
    document.getElementById('miga-dinamica').innerText = "Catálogo de Pruebas";
    document.getElementById('icono-dinamico').src = imagenCategoria;

    const contenedorProductos = document.getElementById('contenedor-productos-dinamico');
    
    // 3. Estado de carga visual
    contenedorProductos.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
            <h2 style="color: #666;">Cargando productos de prueba... ⏳</h2>
        </div>
    `;
    
    try {
        // Llamada a tu tabla específica 'productoprobar'
        const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/productoprobar?categoria=ilike.${encodeURIComponent(tituloCategoria)}`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!respuesta.ok) throw new Error("Error en la consulta");

        const productos = await respuesta.json(); 

        // 4. Limpiamos y renderizamos
        contenedorProductos.innerHTML = ""; 

        if (productos && productos.length > 0) {
            productos.forEach(p => {
                // Generamos las tarjetas con los campos de tu CSV
                const tarjetaHTML = `
                    <button class="btn-producto">
                      <span class="prod-titulo">${p['nombre-producto']}</span>
                      <img src="svg/subir/comprar.png" class="prod-img" alt="Producto">
                      <div class="prod-etiquetas">
                        <span class="etiqueta-badge">
                           <img src="svg/filtro/dona.svg" alt="Precio"> ${p.precio}€
                        </span>
                        <span class="etiqueta-badge">
                           <img src="svg/filtro/difi.svg" alt="Fabricante"> ${p.fabricante}
                        </span>
                        <span class="etiqueta-badge">
                           <img src="svg/filtro/tiempo.svg" alt="Categoría"> ${p.categoria}
                        </span>
                      </div>
                    </button>
                `;
                contenedorProductos.innerHTML += tarjetaHTML;
            });
        } else {
            contenedorProductos.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <h2>No hay productos de prueba en ${tituloCategoria}</h2>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error:", error);
        contenedorProductos.innerHTML = `<h2 style="color:red; text-align:center;">Error al cargar datos.</h2>`;
    }

    // 5. Navegación final
    vistaObjetivoSeleccionada = 'vista-productos-final';
    if (typeof realizarBusqueda === 'function') realizarBusqueda();
}