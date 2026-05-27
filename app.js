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

  document.getElementById("imagePicker").value = "";
  document.getElementById("imagePicker").click();
}

function imageToMonoHex(img) {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 32, 32);
  ctx.drawImage(img, 0, 0, 32, 32);

  const data = ctx.getImageData(0, 0, 32, 32).data;

  let bits = "";

  for (let i = 0; i < 1024; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const a = data[i * 4 + 3];

    const brightness = (r + g + b) / 3;

    bits += (a > 40 && brightness > 70) ? "1" : "0";
  }

  let hex = "";

  for (let i = 0; i < bits.length; i += 4) {
    hex += parseInt(bits.substring(i, i + 4), 2)
      .toString(16)
      .toUpperCase();
  }

  return hex;
}

document.getElementById("imagePicker").addEventListener("change", (e) => {
  if (!currentSlot) return;

  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(event) {
    const image = new Image();

    image.onload = function() {
      const iconHex = imageToMonoHex(image);

      currentSlot.dataset.icon = iconHex;

      const preview = currentSlot.querySelector("img");
      preview.src = event.target.result;
      preview.style.display = "block";
    };

    image.src = event.target.result;
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
    data.push({
      slot: index,
      name: slot.querySelector("span").innerText.trim(),
      icon: slot.dataset.icon || ""
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
