// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBOWVuEmRJGCNLRj9WHNrb4w8NrG4NA5wQ",
    authDomain: "berbxr-tienda.firebaseapp.com",
    databaseURL: "https://berbxr-tienda-default-rtdb.firebaseio.com",
    projectId: "berbxr-tienda",
    storageBucket: "berbxr-tienda.appspot.com",
    messagingSenderId: "501799385398",
    appId: "1:501799385398:web:ae9fd84053617f799ddb97",
    measurementId: "G-X6JGCWW7G9"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar servicios de Firebase
const auth = firebase.auth();
const db = firebase.firestore();

// Inicio de sesión
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log("Usuario autenticado:", userCredential.user);
            // Aquí puedes redirigir al usuario o mostrar su información
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
            console.log("Cuenta creada:", userCredential.user);
            // Aquí puedes almacenar datos adicionales del usuario si es necesario
        })
        .catch(error => {
            console.error("Error al crear cuenta:", error.message);
        });
});

// Guardar producto favorito en Firestore
function guardarProductoFavorito(userId, producto) {
    db.collection("usuarios").doc(userId).collection("favoritos").add(producto)
        .then(() => {
            console.log("Producto favorito guardado.");
        })
        .catch(error => {
            console.error("Error al guardar producto:", error.message);
        });
}

// Obtener productos favoritos
function obtenerProductosFavoritos(userId) {
    db.collection("usuarios").doc(userId).collection("favoritos").get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                console.log("Producto favorito:", doc.data());
                // Aquí podrías mostrar los productos favoritos en la interfaz
            });
        })
        .catch(error => {
            console.error("Error al obtener productos favoritos:", error.message);
        });
}

// Verificar estado de autenticación
auth.onAuthStateChanged(user => {
    if (user) {
        obtenerProductosFavoritos(user.uid); // Obtener favoritos al iniciar sesión
    }
});

// Lista de juegos con su precio
const juegos = [
    { id: 1, nombre: "Dragon Ball Sparking Zero", precio: 1000 },
    { id: 2, nombre: "Grand Theft Auto 5", precio: 650 },
    { id: 3, nombre: "Grand Theft Auto 6", precio: 1800 }
];

// Variables para manejar el carrito
let carrito = [];
let totalPagar = 0;
let totalJuegos = 0;

// Seleccionar elementos del DOM
const listaCarrito = document.getElementById('lista-carrito');
const totalElement = document.getElementById('total');
const totalJuegosElement = document.getElementById('total-juegos');
const botonesAgregar = document.querySelectorAll('.agregar');
const botonVaciar = document.getElementById('vaciar-carrito');

// Función para actualizar el carrito en la interfaz
function actualizarCarrito() {
    listaCarrito.innerHTML = '';

    carrito.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.textContent = `${item.nombre} - Cantidad: ${item.cantidad} - Subtotal: $${item.precio * item.cantidad}`;
        listaCarrito.appendChild(li);
    });

    // Actualizar el total a pagar
    totalElement.textContent = `Total a pagar: $${totalPagar}`;
    totalJuegosElement.textContent = `(${totalJuegos})`;
}

// Función para agregar un juego al carrito
function agregarAlCarrito(id) {
    const juegoSeleccionado = juegos.find(juego => juego.id === id);
    const juegoEnCarrito = carrito.find(item => item.id === id);

    if (juegoEnCarrito) {
        juegoEnCarrito.cantidad++;
    } else {
        carrito.push({ ...juegoSeleccionado, cantidad: 1 });
    }

    totalPagar += juegoSeleccionado.precio;
    totalJuegos++;
    actualizarCarrito();
}

// Función para vaciar el carrito
function vaciarCarrito() {
    carrito = [];
    totalPagar = 0;
    totalJuegos = 0;
    actualizarCarrito();
}

// Eventos para agregar juegos al carrito
botonesAgregar.forEach(boton => {
    boton.addEventListener('click', function() {
        const idJuego = parseInt(this.getAttribute('data-id'));
        agregarAlCarrito(idJuego);
    });
});

// Evento para vaciar el carrito
botonVaciar.addEventListener('click', vaciarCarrito);
