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
  for (let i = 0; i < array.length; i++) {
    htmlCarrito += `
              <li class="cardProductos">
                <div class="cardProductosImgContainer">
                  <img src=${array[i].image} alt=${
      array[i].name
    } class="cardProductosImg">
                </div>
                <div class="cardProductosInfo">
                  <p>
                    Id: ${array[i].id}
                  </p>
                  <h4>
                    ${array[i].name}
                  </h4>
                  <h6>
                    Subtotal $${array[i].price * array[i].cantidad}
                  </h6>
                  <div class="cardProductosButtons">
                    <div class="buttons-container">
                    <button onClick="${`eliminarCarrito(${array[i].id})`}">-</button>
                    <span>${array[i].cantidad}</span>
                    <button onClick="${`agregarCarrito(${array[i].id})`}">+</button>
                    </div>
                    
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
  const productoAgregar = carrito.find((prodCarrito) => prodCarrito.id === id);
  productoAgregar.cantidad = productoAgregar.cantidad
    ? productoAgregar.cantidad + 1
    : 1;
  if (!productoAgregar) carrito.push(productoAgregar);
  mostrarCarrito(carrito);
  mostrarTotalesCarrito(carrito);
}

function eliminarCarrito(id) {
  const productoEliminar = carrito.find((prodCarrito) => prodCarrito.id === id);
  productoEliminar.cantidad -= 1;
  if (productoEliminar.cantidad === 0) {
    carrito = carrito.filter((producto) => producto.id !== id);
  }
  mostrarCarrito(carrito);
  mostrarTotalesCarrito(carrito);
}

function mostrarTotalesCarrito(array) {
  let contenedorTotalCarrito = document.querySelector("#precio-total");
  let contadorCarrito = document.getElementById("contador-carrito");
  let totalCarrito = calcularTotal(array);
  contenedorTotalCarrito.innerHTML = `$ ${totalCarrito}`;
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
    let respuesta = await fetch(`http://localhost:3000/api/sales`, {
      method: "post",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!respuesta.ok) {
      throw new Error("Error al crear la compra");
    }
    let datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error("Error: ", error);
  }
}

function imprimirTicket() {
  console.log("Imprimiendo ticket");
}

const guardarCompra = async () => {
  if (!carrito.length) return alert("Carrito sin productos");
  const buyerName = sessionStorage.getItem("buyerName");
  console.log(buyerName);
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
  console.log(body);
  const data = await realizarCompra(body);
  if (data) {
    alert("Compra realizada con éxito");
    imprimirTicket(data);
    sessionStorage.clear();
    window.location.href = "/login.html";
  }
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

const botonVaciarCarrito = document.getElementById("vaciar-carrito");

botonVaciarCarrito.addEventListener("click", function () {
  guardarProductosCarritoSessionStorage([]);
  carrito = [];
  mostrarCarrito(carrito);
});

function main() {
  const loginData = sessionStorage.getItem("buyerName");
  if (!loginData) return (window.location.href = "/login.html");
  mostrarCarrito(carrito);
}

main();
