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

let productos;
let carrito = recuperarProductosCarritoSessionStorage() ?? [];

async function obtenerDatosProductos() {
  try {
    let respuesta = await fetch(`http://localhost:3000/api/products`);
    if (!respuesta.ok) {
      throw new Error("Error al obtener los productos");
    }
    let datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error("Error: ", error);
  }
}

function mostrarProductos(productos) {
  let productosLista = document.querySelector(".productosContainer");
  if (!productos || productos.length === 0) {
    console.log("No hay productos disponibles.");
    productosLista.innerHTML = "<p>No hay productos disponibles.</p>"
    return;
  }
  let htmlProductos = "";
  productos.forEach((producto) => {
    if (producto.is_active) {
      const actualmenteEnCarrito = carrito.find((prodCarrito) => {
        return producto.id === prodCarrito.id;
      });

      htmlProductos += `
              <li class="cardProductos">
                <div class="cardProductosImgContainer">
                  <img src=${producto.image} alt=${
        producto.name
      } class="cardProductosImg">
                </div>
                <div class="cardProductosInfo">
                  <p>
                    Id: ${producto.id}
                  </p>
                  <h4>
                    ${producto.name}
                  </h4>
                  <h6>
                    $${producto.price}
                  </h6>
                  <div class="cardProductosButtons">
                    ${
                      actualmenteEnCarrito
                        ? `<button disabled>Ya en carrito</button>`
                        : `<button onClick="${`agregarCarrito(${producto.id})`}">Agregar al carrito</button>`
                    }
                    
                  </div>
                </div>
              </li>
            `;
    }
  });
  productosLista.innerHTML = htmlProductos;
}

function agregarCarrito(id) {
  const productoAgregar = productos.find((producto) => producto.id === id);
  productoAgregar.cantidad = productoAgregar.cantidad
    ? productoAgregar.cantidad + 1
    : 1;
  const productoEnCarrito = carrito.find((producto) => producto.id === id);
  if (!productoEnCarrito) carrito.push(productoAgregar);
  mostrarProductos(productos);
  guardarProductosCarritoSessionStorage(carrito);
}

async function main() {
  const loginData = sessionStorage.getItem("buyerName");
  if(!loginData) return window.location.href = "/login.html";

  let productosLista = document.querySelector(".productosContainer");
  productosLista.innerHTML = "<p>Cargando productos...</p>";
  productos = await obtenerDatosProductos();

  mostrarProductos(productos);
}

main();
