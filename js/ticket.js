import {formatearNumero} from './utils/formatearNumero.js';

let venta = null;

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
        <span> $ ${formatearNumero(item.productPrice)} x un. </span>
        <span>Subtotal $${formatearNumero(item.quantity * item.productPrice)} </span>
      </div>`;
  });
  itemsContainer.innerHTML = htmlItems;
  totalContainer.innerHTML = `Total: $${formatearNumero(venta.total)}`;
  titulo.innerHTML = `Ticket #${venta.id} - ${new Date(venta.date).toLocaleDateString()}`;
}

async function obtenerDatosVenta(id) {
  try {
    let respuesta = await fetch(`https://tpintegradorbackgrupo6-production.up.railway.app/api/sales/${id}`);
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

async function exportarPedidoPDF(pedido) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const margenIzq = 15;
  const margenDer = 195;
  let y = 20;

  doc.setFontSize(12);

  doc.setFontSize(20);
  doc.text(`Orden N°${pedido.id}`, margenDer, y + 10, { align: "right" });

  doc.setFontSize(12);
  doc.text(`Fecha: ${new Date(pedido.date).toLocaleDateString()}`, margenIzq, y + 10, { align: "left" });
  y += 15;

  pedido.items.forEach((item) => {
    y += 10;
    doc.setFontSize(11);
    doc.text(
      `${item.quantity} x ${item.productName} - $${formatearNumero(item.productPrice)}`,
      margenIzq,
      y - 2
    );
  });

  y += 10;

  doc.setFontSize(12);
  doc.text("TOTAL", margenIzq, y);
  doc.line(margenIzq + 20, y + 2, margenDer, y + 2);
  doc.text(`$${formatearNumero(pedido.total)}`, margenDer, y, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(255, 0, 0);
  doc.text("Alumnos: Cortes Santiago, Cortes Joaquin", margenIzq, 280);

  doc.save(`TECH SHOP-pedido-${pedido.id}.pdf`);
}

const downloadTicketButton = document.querySelector(".downloadTicketButton");

downloadTicketButton.addEventListener("click", async function (event) {
  event.preventDefault();
  downloadTicketButton.disabled = true;
  downloadTicketButton.textContent = "Descargando...";
  await exportarPedidoPDF(venta);
  downloadTicketButton.disabled = false;
  downloadTicketButton.textContent = "Descargar comprobante";
});


async function main() {
  const loginData = sessionStorage.getItem("buyerName");
  if (!loginData) return (window.location.href = "/login.html");

  let userNameContainer = document.querySelector("#userName");
  userNameContainer.innerHTML = JSON.parse(loginData);

  let itemsContainer = document.querySelector(".ventaItemContainer");
  itemsContainer.innerHTML = "<p>Cargando productos de ticket...</p>";

  const id = obtenerIdDeURL();
  venta = await obtenerDatosVenta(id);
  mostrarProductosTicket(venta);
}

main();
