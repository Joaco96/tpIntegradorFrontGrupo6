const guardarNombreEnSession = () => {
  const name = document.getElementById('nameInput').value;
  if(name){
    sessionStorage.setItem("buyerName", JSON.stringify(name));
    window.location.href = '/';
  }
}

document.getElementById('loginForm').addEventListener('submit', function (event) {
  event.preventDefault();
  guardarNombreEnSession();
});