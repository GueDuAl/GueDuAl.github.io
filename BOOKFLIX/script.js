// ==========================================
// 1. TU CATÁLOGO DE LIBROS (Con soporte multi-idioma)
// ==========================================
// Configura los nombres de archivo en tu carpeta "libros/" para cada idioma.
// Si solo tienes un idioma, pon ese único idioma (ej. "ES").
const catalogoArchivos = [
    {
        id: "elantris",
        archivos: {
            "ES": "elantris.pdf",
            "EN": "elantris_en.pdf" // Puedes quitarlo si no tienes el archivo inglés
        }
    },
    {
        id: "El Imperio Final",
        archivos: {
            "ES": "El Imperio Final.pdf",
            "EN": "El Imperio Final_en.pdf"
        }
    },
    {
        id: "El Hobbit",
        archivos: {
            "ES": "El Hobbit.pdf",
            "EN": "El Hobbit_en.pdf"
        }
    },
    {
        id: "El Rithmatista",
        archivos: {
            "ES": "El Rithmatista.pdf",
            "EN": "El Rithmatista_en.pdf"
        }
    },
    {
        id: "El Iniciado",
        archivos: {
            "ES": "El Iniciado.pdf",
            "EN": "El Iniciado_en.pdf"
        }
    }
];

// Diccionario de nombres de idioma para mostrar en el selector
const nombresIdiomas = {
    "ES": "Español",
    "EN": "Inglés",
    "FR": "Francés",
    "IT": "Italiano",
    "DE": "Alemán",
    "PT": "Portugués"
};

// ==========================================
// 2. LÓGICA PRINCIPAL
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    const heroSection = document.getElementById('hero-section');
    const bookRow = document.getElementById('book-row');
    const searchInput = document.getElementById('search-input');

    // Función para actualizar el Libro Destacado y su selector de idiomas
    const actualizarHero = (titulo, coverUrl, libroObj) => {
        heroSection.style.backgroundImage = `
            linear-gradient(to right, rgba(20,20,20,1) 25%, rgba(20,20,20,0.6) 100%), 
            url('${coverUrl}')
        `;
        
        // Obtener la lista de idiomas disponibles para este libro
        const idiomasDisponibles = Object.keys(libroObj.archivos);
        const idiomaInicial = idiomasDisponibles[0];
        const archivoInicial = libroObj.archivos[idiomaInicial];

        // Construir opciones del <select> de idioma
        let opcionesHTML = "";
        if (idiomasDisponibles.length > 1) {
            opcionesHTML = `<select id="hero-language-select" class="lang-select">`;
            idiomasDisponibles.forEach(lang => {
                const nombreLang = nombresIdiomas[lang] || lang;
                opcionesHTML += `<option value="${lang}">${nombreLang}</option>`;
            });
            opcionesHTML += `</select>`;
        } else {
            // Si solo tiene 1 idioma, mostramos una etiqueta simple en lugar de un desplegable
            const nombreLang = nombresIdiomas[idiomaInicial] || idiomaInicial;
            opcionesHTML = `<span class="lang-badge"><i class="fas fa-globe"></i> ${nombreLang}</span>`;
        }

        heroSection.innerHTML = `
            <div class="hero-content">
                <h2 class="hero-title">${titulo}</h2>
                <div class="hero-actions">
                    <div class="hero-buttons">
                        <a id="btn-read" href="libros/${archivoInicial}" target="_blank" class="btn btn-play">
                            <i class="fas fa-book-open"></i> Leer Ahora
                        </a>
                        <a id="btn-download" href="libros/${archivoInicial}" download class="btn btn-download">
                            <i class="fas fa-download"></i> Descargar
                        </a>
                    </div>
                    <div class="hero-language">
                        ${opcionesHTML}
                    </div>
                </div>
            </div>
        `;

        // Si existe un selector de idioma, actualizamos las URLs de los botones al cambiar la opción
        const selectElement = document.getElementById('hero-language-select');
        if (selectElement) {
            selectElement.addEventListener('change', (e) => {
                const idiomaSeleccionado = e.target.value;
                const nuevoArchivo = libroObj.archivos[idiomaSeleccionado];
                
                const btnRead = document.getElementById('btn-read');
                const btnDownload = document.getElementById('btn-download');

                if (btnRead && btnDownload && nuevoArchivo) {
                    btnRead.href = `libros/${nuevoArchivo}`;
                    btnDownload.href = `libros/${nuevoArchivo}`;
                }
            });
        }
    };

    // Recorremos la lista de archivos para cargar las portadas
    for (let i = 0; i < catalogoArchivos.length; i++) {
        const libroObj = catalogoArchivos[i];
        const nombreBase = libroObj.id;
        let tituloBusqueda = nombreBase.replace(/[_-]/g, " ");

        // Definimos la ruta de la carátula local
        const coverUrl = `caratulas/${nombreBase}.jpg`;

        try {
            // Consulta de API (sólo para formatear y enriquecer el título oficial)
            const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(tituloBusqueda)}&maxResults=1`;
            const response = await fetch(url);
            const data = await response.json();

            let tituloReal = tituloBusqueda.toUpperCase();

            if (data.items && data.items.length > 0) {
                const bookInfo = data.items[0].volumeInfo;
                tituloReal = bookInfo.title || tituloReal;
            }

            // A) EL PRIMER LIBRO SE COLOCA POR DEFECTO EN EL HERO
            if (i === 0) {
                actualizarHero(tituloReal, coverUrl, libroObj);
            }

            // B) CREAMOS EL PÓSTER EN LA FILA "TUS LIBROS"
            const imgElement = document.createElement('img');
            imgElement.src = coverUrl;
            imgElement.alt = tituloReal;
            imgElement.className = 'row-poster';
            imgElement.title = `${tituloReal} (Doble clic para leer el PDF)`;
            // Guardamos el título en un atributo de datos para que el buscador lo encuentre fácilmente
            imgElement.setAttribute('data-title', tituloReal.toLowerCase());
            
            imgElement.onerror = () => {
                imgElement.src = "https://via.placeholder.com/160x240/333333/ffffff?text=Sin+Portada";
            };
            
            // C-1) UN CLIC -> CAMBIAR EL LIBRO DESTACADO DEL FONDO
            imgElement.addEventListener('click', () => {
                actualizarHero(tituloReal, coverUrl, libroObj);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            // C-2) DOBLE CLIC -> ABRIR DIRECTAMENTE EL PDF (en su primer idioma disponible)
            imgElement.addEventListener('dblclick', () => {
                const primerIdioma = Object.keys(libroObj.archivos)[0];
                window.open(`libros/${libroObj.archivos[primerIdioma]}`, '_blank');
            });

            bookRow.appendChild(imgElement);

        } catch (error) {
            console.error("Error cargando el libro:", tituloBusqueda, error);
        }
    }

    // ==========================================
    // 3. BUSCADOR EN TIEMPO REAL
    // ==========================================
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termino = e.target.value.toLowerCase().trim();
            const posters = document.querySelectorAll('.row-poster');

            posters.forEach(poster => {
                const titulo = poster.getAttribute('data-title') || "";
                if (titulo.includes(termino)) {
                    poster.style.display = "inline-block";
                } else {
                    poster.style.display = "none";
                }
            });
        });
    }
});
