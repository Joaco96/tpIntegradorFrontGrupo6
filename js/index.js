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
let filtros = {
  teclados: false,
  mouses: false
};
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

function aplicarFiltros() {
  let productosFiltrados = productos;
  const { teclados, mouses } = filtros;

  // Si se activa algún filtro, filtramos por categoría
  if (teclados || mouses) {
    productosFiltrados = productosFiltrados.filter((prod) => {
      const categoria = prod.category?.toLowerCase();
      return (
        (teclados && categoria === "teclados") ||
        (mouses && categoria === "mouses")
      );
    });
  }
  console.log(productosFiltrados);
  console.log(filtros);
  mostrarProductos(productosFiltrados);
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

document.addEventListener("DOMContentLoaded", () => {
  const botonesCategoria = document.querySelectorAll(".categoryFilterButton");

  botonesCategoria.forEach((boton) => {
    boton.addEventListener("click", (e) => {
      const texto = e.target.textContent.toLowerCase();
      const yaActivo = e.target.classList.contains("active");

      // Reiniciamos filtros y clases
      filtros = {
        teclados: false,
        mouses: false
      };
      botonesCategoria.forEach((b) => b.classList.remove("active"));

      // Si no estaba activo, lo activamos
      if (!yaActivo) {
        if (texto === "teclados") filtros.teclados = true;
        if (texto === "mouses") filtros.mouses = true;
        e.target.classList.add("active");
      }

      aplicarFiltros();
    });
  });
});

async function main() {
  const loginData = sessionStorage.getItem("buyerName");
  if(!loginData) return window.location.href = "/login.html";
  
  let userNameContainer = document.querySelector("#userName");
  userNameContainer.innerHTML = JSON.parse(loginData);

  let productosLista = document.querySelector(".productosContainer");
  productosLista.innerHTML = "<p>Cargando productos...</p>";
  productos = await obtenerDatosProductos();

  mostrarProductos(productos);
}

main();
