function mostrarProductosTicket(venta) {
  let itemsContainer = document.querySelector(".ventaItemContainer");
  let totalContainer = document.querySelector(".totalVenta");
  let titulo = document.querySelector(".title");
  if (!venta || venta.items.length === 0) {
    console.log("No hay productos disponibles.");
    itemsContainer.innerHTML = "<p>No hay productos disponibles.</p>";
    return;
  }
  let htmlItems = "";
  venta.items.forEach((item) => {
    htmlItems += `<div class="itemsContainer">
        <span>- ${item.productName}</span>
        <span> ${item.quantity} un.</span>
        <span> $ ${item.productPrice} x un. </span>
        <span>Subtotal $${item.quantity * item.productPrice} </span>
      </div>`;
  });
  itemsContainer.innerHTML = htmlItems;
  totalContainer.innerHTML = `Total: $${venta.total}`;
  titulo.innerHTML = `Ticket #${venta.id}`;
}

async function obtenerDatosVenta(id) {
  try {
    let respuesta = await fetch(`http://localhost:3000/api/sales/${id}`);
    if (!respuesta.ok) {
      throw new Error("Error al obtener los productos de la venta");
    }
    let datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error("Error: ", error);
  }
}

function obtenerIdDeURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function main() {
  const loginData = sessionStorage.getItem("buyerName");
  if (!loginData) return (window.location.href = "/login.html");

  let userNameContainer = document.querySelector("#userName");
  userNameContainer.innerHTML = JSON.parse(loginData);

  let itemsContainer = document.querySelector(".ventaItemContainer");
  itemsContainer.innerHTML = "<p>Cargando productos de ticket...</p>";

  const id = obtenerIdDeURL();
  const venta = await obtenerDatosVenta(id);

  mostrarProductosTicket(venta);
}

main();
