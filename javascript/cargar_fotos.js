// Encoge una imagen para que su lado más largo mida como mucho `ladoMax`
// y la devuelve como JPEG (data URL). Las imágenes pequeñas no se agrandan.
function reducirImagen(file, ladoMax = 1200, calidad = 0.8) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            const escala = Math.min(1, ladoMax / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * escala);
            canvas.height = Math.round(img.height * escala);

            const ctx = canvas.getContext('2d');
            // Fondo blanco: el JPEG no tiene transparencia (si no, los PNG salen en negro)
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/jpeg', calidad));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('No se pudo leer la imagen'));
        };
        img.src = url;
    });
}

// Solo dejamos la función genérica, nada de document.getElementById arriba
function inicializarImagenPaso(contenedor) {
    const fileInput = contenedor.querySelector('input[type="file"]');
    const btnSubir = contenedor.querySelector('.btn-subir-imagen-paso');
    const previewContainer = contenedor.querySelector('.preview-container');
    const imgPreview = contenedor.querySelector('.img-preview');
    const btnEliminar = contenedor.querySelector('.btn-eliminar-foto');

    btnSubir.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.value = '';
            return;
        }

        // Reducimos la foto antes de guardarla: una foto de móvil pasa de
        // varios MB a unos 150 KB, y el catálogo carga mucho más rápido
        reducirImagen(file)
            .then(dataUrl => {
                imgPreview.src = dataUrl;

                // Apaga el botón y enciende la vista previa (con flex para centrar)
                btnSubir.style.display = 'none';
                previewContainer.style.display = 'flex';
            })
            .catch(() => {
                this.value = '';
            });
    });

    btnEliminar.addEventListener('click', () => {
        fileInput.value = '';
        
        // Apaga la vista previa y enciende el botón (con flex para mantener el tamaño)
        previewContainer.style.display = 'none';
        btnSubir.style.display = 'flex'; 
    });
}