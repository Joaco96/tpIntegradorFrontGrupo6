import { formatearNumero } from "./utils/formatearNumero.js";

function guardarProductosCarritoSessionStorage(carrito) {
  sessionStorage.setItem("carrito", JSON.stringify(carrito));
}

function recuperarProductosCarritoSessionStorage() {
  const productosGuardados = sessionStorage.getItem("carrito");
  try {
    return JSON.parse(productosGuardados);
  } catch {
    return null;
  }
}

let carrito = recuperarProductosCarritoSessionStorage() ?? [];

function mostrarCarrito(array) {
  let carritoLista = document.querySelector(".carritoContainer");
  let htmlCarrito = "";
  if (!carrito.length) htmlCarrito = "<p>No hay productos en el carrito</p>";
  for (let i = 0; i < array.length; i++) {
    htmlCarrito += `
              <li class="cardProductos">
                <div class="cardProductosImgContainer">
                  <img src=${array[i].image} alt=${
      array[i].name
    } class="cardProductosImg">
                </div>
                <div class="cardProductosInfo">
                  <div class="cardProductosId">
                    <p>
                      Id: ${array[i].id}
                    </p>
                                        
                  </div>
                  <div class="cardProductosName">
                    <h4>
                      ${array[i].name}
                    </h4>
                    <h6>
                      $${formatearNumero(array[i].price)}
                    </h6>                    
                  </div>
                  <div class="cardProductosName">
                    <div class="cardProductosButtons">
                      <div class="buttons-container">
                        <button id="botonEliminarCarrito" data-id="${
                          array[i].id
                        }">-</button>
                        <span class="cantidad"> ${array[i].cantidad}</span>
                        <button id="botonAgregarCarrito" data-id="${
                          array[i].id
                        }">+</button>
                      </div>                    
                    </div>
                    <h6 class="subtotal">
                      Subtotal $${formatearNumero(
                        array[i].price * array[i].cantidad
                      )}
                    </h6>
                    </div>
                </div>
              </li>
            `;
  }
  carritoLista.innerHTML = htmlCarrito;
  mostrarTotalesCarrito(array);
  guardarProductosCarritoSessionStorage(array);
}

function agregarCarrito(id) {
  const productoAgregar = carrito.find((prodCarrito) => prodCarrito.id == id);
  productoAgregar.cantidad = productoAgregar.cantidad
    ? productoAgregar.cantidad + 1
    : 1;
  if (!productoAgregar) carrito.push(productoAgregar);
  mostrarCarrito(carrito);
  mostrarTotalesCarrito(carrito);
}

function eliminarCarrito(id) {
  const productoEliminar = carrito.find((prodCarrito) => prodCarrito.id == id);
  productoEliminar.cantidad -= 1;
  if (productoEliminar.cantidad == 0) {
    carrito = carrito.filter((producto) => producto.id != id);
  }
  mostrarCarrito(carrito);
  mostrarTotalesCarrito(carrito);
}

function mostrarTotalesCarrito(array) {
  let contenedorTotalCarrito = document.querySelector("#precioTotal");
  let contadorCarrito = document.getElementById("contador-carrito");
  let totalCarrito = calcularTotal(array);
  contenedorTotalCarrito.innerHTML = `$ ${formatearNumero(totalCarrito)}`;
  contadorCarrito.innerHTML = array.length;
}

function calcularTotal(array) {
  let totalCarrito = 0;
  for (let i = 0; i < array.length; i++) {
    totalCarrito += array[i].price * array[i].cantidad;
  }
  return totalCarrito;
}

async function realizarCompra(body) {
  try {
    let respuesta = await fetch(
      `https://tpintegradorbackgrupo6-production.up.railway.app/api/sales`,
      {
        method: "post",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!respuesta.ok) {
      throw new Error("Error al crear la compra");
    }
    let datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error("Error: ", error);
  }
}

function imprimirTicket(id) {
  window.location.href = `/ticket.html?id=${id}`;
}

const guardarCompra = async () => {
  if (!carrito.length) return alert("Carrito sin productos");
  const buyerName = sessionStorage.getItem("buyerName");

  const body = {
    buyerName: JSON.parse(buyerName),
    total: calcularTotal(carrito),
    items: carrito.map((prodCarrito) => {
      return {
        productId: prodCarrito.id,
        productName: prodCarrito.name,
        quantity: prodCarrito.cantidad,
        productPrice: prodCarrito.price,
      };
    }),
  };

  const data = await realizarCompra(body);
  if (data) {
    alert("Compra realizada con éxito");
    vaciarCarrito(data);
    imprimirTicket(data.id);
  }
};

const vaciarCarrito = () => {
  guardarProductosCarritoSessionStorage([]);
  carrito = [];
  mostrarCarrito(carrito);
};

const botonConfirmarCompra = document.getElementById("botonConfirmarCompra");

botonConfirmarCompra.addEventListener("click", async function (event) {
  event.preventDefault();
  botonConfirmarCompra.disabled = true;
  botonConfirmarCompra.textContent = "Confirmando...";
  await guardarCompra();
  botonConfirmarCompra.disabled = false;
  botonConfirmarCompra.textContent = "Confirmar Compra";
});

const botonVaciarCarrito = document.getElementById("vaciarCarrito");

botonVaciarCarrito.addEventListener("click", function () {
  vaciarCarrito();
});

// Con este selector, lo que tuvimos que hacer fue capturar el contenedor y chequear si existe primero el boton
const carritoContainer = document.querySelector(".carritoContainer");

carritoContainer.addEventListener("click", (e) => {
  if (e.target.matches(`#botonAgregarCarrito`)) {
    agregarCarrito(e.target.dataset.id);
  } else if (e.target.matches(`#botonEliminarCarrito`)) {
    eliminarCarrito(e.target.dataset.id);
  }
});

function main() {
  const loginData = sessionStorage.getItem("buyerName");
  if (!loginData) return (window.location.href = "/login.html");

  let userNameContainer = document.querySelector("#userName");
  userNameContainer.innerHTML = JSON.parse(loginData);

  mostrarCarrito(carrito);
}

main();
