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
            alert("Error: Solo se permiten archivos de imagen.");
            this.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            imgPreview.src = e.target.result;
            
            // Apaga el botón y enciende la vista previa (con flex para centrar)
            btnSubir.style.display = 'none';
            previewContainer.style.display = 'flex'; 
        };
        reader.readAsDataURL(file);
    });

    btnEliminar.addEventListener('click', () => {
        fileInput.value = '';
        
        // Apaga la vista previa y enciende el botón (con flex para mantener el tamaño)
        previewContainer.style.display = 'none';
        btnSubir.style.display = 'flex'; 
    });
}