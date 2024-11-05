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
