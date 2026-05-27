let port;
let writer;

let draggedName = "";
let currentSlot = null;

function drag(ev) {
  draggedName = ev.target.dataset.name;
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drop(ev) {

  ev.preventDefault();

  currentSlot = ev.currentTarget;

  currentSlot.querySelector("span").innerText = draggedName;

  document.getElementById("imagePicker").click();
}

document.getElementById("imagePicker").addEventListener("change", (e) => {

  if (!currentSlot) return;

  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(event) {

    const img = currentSlot.querySelector("img");

    img.src = event.target.result;

    img.style.display = "block";
  };

  reader.readAsDataURL(file);
});

async function connectDevice() {

  port = await navigator.serial.requestPort();

  await port.open({
    baudRate: 115200
  });

  writer = port.writable.getWriter();

  document.getElementById("status").innerText = "CONNECTED";
}

async function saveToDevice() {

  if (!writer) {
    alert("CONNECT DEVICE");
    return;
  }

  let slots = document.querySelectorAll(".slot");

  let data = [];

  slots.forEach((slot, index) => {

    let img = slot.querySelector("img");

    data.push({
      slot: index,
      name: slot.querySelector("span").innerText,
      image: img.src || ""
    });
  });

  let json = JSON.stringify({
    type: "apps",
    apps: data
  });

  await writer.write(
    new TextEncoder().encode(json + "\n")
  );

  document.getElementById("status").innerText = "SAVED";
}
