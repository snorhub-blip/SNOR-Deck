let port;
let writer;
let draggedName = "";

function drag(ev) {
  draggedName = ev.target.dataset.name;
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drop(ev) {
  ev.preventDefault();
  ev.target.innerText = draggedName;
}

async function connectDevice() {
  port = await navigator.serial.requestPort();
  await port.open({ baudRate: 115200 });
  writer = port.writable.getWriter();
  document.getElementById("status").innerText = "Connected";
}

async function saveToDevice() {
  if (!writer) {
    alert("Connect device first");
    return;
  }

  let slots = document.querySelectorAll(".slot");
  let data = [];

  slots.forEach((slot, index) => {
    data.push({
      slot: index,
      name: slot.innerText.trim()
    });
  });

  let json = JSON.stringify({
    type: "apps",
    apps: data
  });

  await writer.write(new TextEncoder().encode(json + "\n"));

  document.getElementById("status").innerText = "Saved";
}