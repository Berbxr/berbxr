// document.addEventListener('DOMContentLoaded', function () {
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

// Función para crear una tarjeta de producto en el catálogo
function agregarJuegoACatalogo(producto, id, seccionId) {
    const seccion = document.getElementById(seccionId);
    const card = document.createElement("div");
    card.classList.add("col-md-4", "card");
    card.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${producto.Nombre}</h5>
            <img src="${producto.imagen}" alt="${producto.Nombre}" class="img-fluid">
            <p class="card-text">Precio: $${producto.Precio}</p>
            <button class="btn btn-primary" onclick="agregarAFavoritos('${id}')">Agregar a Favoritos</button>
            <button class="btn btn-success mt-2" onclick="agregarAlCarrito('${id}')">Agregar al Carrito</button>
        </div>
    `;
    seccion.appendChild(card);
}

// Agregar un producto a favoritos
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

// Cargar juegos favoritos
function cargarFavoritos(userId) {
    const favoritosSeccion = document.getElementById("juegos-favoritos");
    favoritosSeccion.innerHTML = ""; 
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
// Carrito
let carrito = [];

function agregarAlCarrito(idProducto) {
    const productoEnCarrito = carrito.find(item => item.id === idProducto);
    if (productoEnCarrito) {
        productoEnCarrito.cantidad += 1;
    } else {
        carrito.push({ id: idProducto, cantidad: 1 });
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarCarrito();
}
function actualizarCarrito() {
    const totalJuegosElement = document.getElementById("total-juegos");
    const totalJuegos = carrito.reduce((total, item) => total + item.cantidad, 0);
    totalJuegosElement.textContent = `(${totalJuegos})`;

    const listaCarrito = document.getElementById("listaCarrito");
    listaCarrito.innerHTML = ""; 

    let totalPagar = 0; 

    carrito.forEach(item => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

        // Obtener detalles del producto
        db.collection("productos").doc(item.id).get().then(doc => {
            if (doc.exists) {
                const producto = doc.data();
                const subtotal = producto.Precio * item.cantidad; 
                totalPagar += subtotal;

                listItem.innerHTML = `
                    ${producto.Nombre} - Cantidad: ${item.cantidad}
                    <span class="badge bg-primary rounded-pill">$${subtotal}</span>
                `;
                listaCarrito.appendChild(listItem);
                document.getElementById("totalPagar").textContent = `Total a pagar: $${totalPagar}`;
            }
        });
    });
}

function vaciarCarrito() {
    carrito = [];
    localStorage.removeItem("carrito"); // Eliminar del localStorage
    actualizarCarrito();
     document.getElementById("totalPagar").textContent = "Total a pagar: $0"; 
}

document.addEventListener('DOMContentLoaded', () => {
    const carritoGuardado = JSON.parse(localStorage.getItem("carrito"));
    if (carritoGuardado) {
        carrito = carritoGuardado;
        actualizarCarrito();
    }
});






// Llamar a la función para cargar juegos al cargar la página
cargarJuegos();

//});
