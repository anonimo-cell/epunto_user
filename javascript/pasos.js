document.addEventListener('DOMContentLoaded', () => {
    // Buscamos TODOS los contenedores de carga estáticos que haya en el HTML original
    const contenedoresIniciales = document.querySelectorAll('.area-carga-imagen');

    // Los activamos uno por uno
    contenedoresIniciales.forEach(contenedor => {
        inicializarImagenPaso(contenedor);
    });
});
document.getElementById('btn-agregar-paso').addEventListener('click', function () {
    const listaPasos = document.getElementById('lista-pasos');

    if (listaPasos.children.length >= 7) {
        alert("Has alcanzado el límite máximo de 7 pasos.");
        return;
    }

    const nuevoNumero = listaPasos.children.length + 1;

    // Crear el contenedor del paso
    const nuevoPaso = document.createElement('div');
    nuevoPaso.className = 'paso-item';
    nuevoPaso.id = `paso-${nuevoNumero}`;

    // Estructura HTML (añadido el botón eliminar)
   // Estructura HTML con las clases adaptadas para igualar alturas
    nuevoPaso.innerHTML = `
        <div class="paso-fila-interna">
            
            <!-- Columna Izquierda (Texto) -->
            <div class="paso-columna-texto">
                <label class="paso-label" style="font-weight: bold; margin-bottom: 5px;">Paso ${nuevoNumero}</label>
                <div class="form-row" style="flex: 1; display: flex; flex-direction: column;">
                    <textarea placeholder="Descripción del paso ${nuevoNumero}" maxlength="300" rows="4" style="flex: 1; width: 100%; resize: none;"></textarea>
                </div>
                <button type="button" class="btn-eliminar-paso" style="background-color: #d93025; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-top: 10px; width: fit-content;">✕ Eliminar Paso</button>
            </div>
            <!-- Columna Derecha (Imagen) -->
            <div class="paso-columna-imagen">
                <label class="titulo-form" style="font-size: 0.85rem; margin-bottom: 5px;">Imagen del Proyecto:</label>
                <div class="area-carga-imagen">
                    <input type="file" class="file-input" accept="image/*" style="display:none;">
                    <button type="button" class="btn-subir-imagen-paso">Subir Imagen</button>
                    <div class="preview-container" style="display:none;">
                        <img class="img-preview" src="#" alt="Vista previa">
                        <button type="button" class="btn-eliminar-foto">✕ Eliminar</button>
                    </div>
                </div>
            </div>

        </div>
    `;

    // 1. Inicializar la lógica de imagen en este nuevo contenedor
    inicializarImagenPaso(nuevoPaso.querySelector('.area-carga-imagen'));

    // 2. Lógica para eliminar el paso
    nuevoPaso.querySelector('.btn-eliminar-paso').addEventListener('click', function () {
        nuevoPaso.remove();
        reordenarPasos();
    });

    listaPasos.appendChild(nuevoPaso);
    verificarLimite(); // Ocultar el botón si llega a 7
});

function reordenarPasos() {
    const pasos = document.querySelectorAll('.paso-item');
    pasos.forEach((paso, index) => {
        const nuevoNum = index + 1;
        paso.querySelector('.paso-label').innerText = `Paso ${nuevoNum}`;
        paso.querySelector('textarea').placeholder = `Descripción del paso ${nuevoNum}`;

        // Opcional: podrías ocultar/mostrar el botón eliminar si necesitas lógica extra
    });
}

// Añade esto dentro de la función de agregar y también en la de eliminar
function verificarLimite() {
    const btnAgregar = document.getElementById('btn-agregar-paso');
    const cantidadActual = document.getElementById('lista-pasos').children.length;

    if (cantidadActual >= 7) {
        btnAgregar.style.display = 'none';
    } else {
        btnAgregar.style.display = 'block';
    }
}
function siguienteSeccion(idSiguiente) {
    // 1. Localizamos el elemento por su ID
    const siguiente = document.getElementById(idSiguiente);

    if (siguiente) {
        // 2. Abrimos el acordeón (por si estaba cerrado)
        siguiente.open = true;

        // 3. Ejecutamos el scroll centrado
        // 'center' coloca el elemento en la mitad de la ventana del navegador
        siguiente.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}