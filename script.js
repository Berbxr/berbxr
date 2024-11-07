// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBOWVuEmRJGCNLRj9WHNrb4w8NrG4NA5wQ",
    authDomain: "berbxr-tienda.firebaseapp.com",
    projectId: "berbxr-tienda",
    storageBucket: "berbxr-tienda.appspot.com",
    messagingSenderId: "501799385398",
    appId: "1:501799385398:web:ae9fd84053617f799ddb97"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar servicios de Firebase
const auth = firebase.auth();
const db = firebase.firestore();

// Función para mostrar alertas de éxito
function mostrarAlerta(mensaje) {
    const alertBox = document.getElementById("alert-success");
    const alertMessage = document.getElementById("alert-message");
    alertMessage.textContent = mensaje;
    alertBox.classList.remove("d-none");
}

function cerrarAlerta() {
    document.getElementById("alert-success").classList.add("d-none");
}

// Inicio de sesión
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            mostrarAlerta("Has iniciado sesión con éxito");
            cargarFavoritos(userCredential.user.uid);
        })
        .catch(error => {
            console.error("Error de autenticación:", error.message);
        });
});

// Registro de usuario
document.getElementById('registerBtn').addEventListener('click', function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            mostrarAlerta("Has creado tu cuenta con éxito");
        })
        .catch(error => {
            console.error("Error al crear cuenta:", error.message);
        });
});

// Cargar juegos en las secciones correspondientes
function cargarJuegos() {
    db.collection("productos").limit(25).get().then(snapshot => {
        snapshot.forEach(doc => {
            const producto = doc.data();
            // Cargar el juego en el catálogo principal
            agregarJuegoACatalogo(producto, doc.id, "catalogo-juegos");

            // Agregar a secciones específicas según los atributos
            if (producto.Descuento) agregarJuegoACatalogo(producto, doc.id, "descuentos");
            if (producto.Nuevo) agregarJuegoACatalogo(producto, doc.id, "nuevos-juegos");
            if (producto.masVendido) agregarJuegoACatalogo(producto, doc.id, "mas-vendidos-juegos");
        });
    }).catch(error => {
        console.error("Error al cargar productos:", error);
    });
}

function agregarJuegoACatalogo(producto, id, seccionId) {
    const seccion = document.getElementById(seccionId);
    const card = document.createElement("div");
    card.classList.add("col-md-4", "card");
    card.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${producto.Nombre}</h5>
            <img src="${producto.imagen}" alt="${producto.Nombre}" class="img-fluid">
            <p class="card-text">Precio: $${producto.Precio}</p>
            <button class="btn btn-primary agregar" onclick="agregarAFavoritos('${id}')">Agregar a Favoritos</button>
        </div>
    `;
    seccion.appendChild(card);
}

// Agregar y cargar juegos favoritos
function agregarAFavoritos(idProducto) {
    const user = auth.currentUser;
    if (user) {
        db.collection("usuarios").doc(user.uid).collection("favoritos").doc(idProducto).set({})
            .then(() => mostrarAlerta("Juego agregado a favoritos"))
            .catch(error => console.error("Error al agregar a favoritos:", error));
    } else {
        mostrarAlerta("Inicia sesión para agregar a favoritos");
    }
}

function cargarFavoritos(userId) {
    const favoritosSeccion = document.getElementById("juegos-favoritos");
    favoritosSeccion.innerHTML = ""; // Limpiar favoritos actuales
    db.collection("usuarios").doc(userId).collection("favoritos").get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const idProducto = doc.id;
                db.collection("productos").doc(idProducto).get()
                    .then(productoDoc => {
                        if (productoDoc.exists) {
                            agregarJuegoACatalogo(productoDoc.data(), idProducto, "juegos-favoritos");
                        }
                    });
            });
        })
        .catch(error => console.error("Error al cargar favoritos:", error));
}

// Llamar a la función para cargar juegos al cargar la página
cargarJuegos();
