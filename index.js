const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const colors = document.querySelectorAll("input");
const formColor = document.querySelector("ul");
const el = document.querySelector("#ele");
const panzoomEl = document.querySelector(".panzoom");

colors[0].checked = true;
let selectedColor = colors[0].id;

formColor.addEventListener("click", handleSetColor);

function handleSetColor(e) {
  e?.stopPropagation();
  colors.forEach((color) => {
    if (color.checked) {
      selectedColor = color.id;
      color.parentElement.style.opacity = 1;
      color.parentElement.style.border = "2px solid #eeee";
    } else {
      color.parentElement.style.opacity = 0.5;
      color.parentElement.style.border = "none";
    }
  });
}

handleSetColor();
let selection = [0, 0];

canvas.width = 1024;
canvas.height = 1024;
ctx.lineJoin = "round";
ctx.lineWidth = 4;
ctx.strokeStyle = "#16db65";

let currentLayer = 0;

const padding = 2;
const tileSize = 32;

let layers = [
  [Math.floor(canvas.width / 32), Math.floor(canvas.height / 32)],
  [
    {
      x: 1,
      y: 1,
      color: "red",
    },
    {
      x: 32,
      y: 32,
      color: "red",
    },
  ],
];
var panzoom = Panzoom(panzoomEl, {
  cursor: "default",
  noBind: true,
  setTransform: (canvas, { scale, x, y, noBind }) => {
    panzoom.setStyle("transform", `translate(${x}px, ${y}px)`);
  },
});

function generateBackground() {
  for (let i = 1; i <= 33; i++) {
    for (let j = 1; j <= 33; j++) {
      const tileNumber = (i - 1) * 33 + j;
      if (tileNumber <= 1000) {
        ctx.fillStyle = "#cccccc";
        ctx.fillRect(
          i * tileSize,
          j * tileSize,
          tileSize - padding,
          tileSize - padding
        );
      }
    }
  }
}

function paintTile(props) {
  const { x = 0, px = 0, y = 0, py = 0, wx = padding, hy = padding } = props;
  ctx.beginPath();
  ctx.fillRect(
    x * tileSize - px,
    y * tileSize - py,
    tileSize - wx,
    tileSize - hy
  );
  ctx.closePath();
}

function generateTiles(layer) {
  layer.forEach(({ x, y, color }) => {
    const hasSibilingX = layer?.some(
      (tile) => tile.x === x - 1 && tile.y === y
    );
    const hasSibilingY = layer?.some(
      (tile) => tile.y === y - 1 && tile.x === x
    );
    ctx.fillStyle = color;
    if (hasSibilingX && hasSibilingY) {
      paintTile({ x, px: 2, y, py: 2, wx: 0, hy: 0 });
    } else if (hasSibilingX) {
      paintTile({ x, px: 2, y, wx: 0 });
    } else if (hasSibilingY) {
      paintTile({ x, y, py: 2, hy: 0 });
    } else {
      paintTile({ x, y });
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  layers.forEach((layer, index) => {
    if (index === 0) {
      generateBackground();
    } else {
      generateTiles(layer);
    }
  });
}
draw();

function getCoords(e) {
  const { x, y } = e.target.getBoundingClientRect();
  const mouseX = e.clientX - x;
  const mouseY = e.clientY - y;
  const xCoord = Math.floor(mouseX / tileSize);
  const yCoord = Math.floor(mouseY / tileSize);

  return xCoord <= 0 || yCoord <= 0 || (yCoord > 10 && xCoord >= 31)
    ? null
    : [xCoord, yCoord];
}

let isMouseDown = false;

window.addEventListener("keydown", (e) => {
  if (e.shiftKey) ctx.strokeStyle = "#ef233c";
  if (e.ctrlKey) {
    panzoom.bind();
    panzoomEl.style.cursor = "grab";
  }
});
window.addEventListener("keyup", (e) => {
  if (!e.shiftKey) ctx.strokeStyle = "#16db65";
  if (!e.ctrlKey) {
    panzoom.destroy();
    panzoomEl.style.cursor = "default";
  }
});

canvas.addEventListener("mousedown", (e) => {
  isMouseDown = true;
});
canvas.addEventListener("mouseup", () => {
  isMouseDown = false;
});
canvas.addEventListener("mouseleave", () => (isMouseDown = false));

canvas.addEventListener("mousedown", addTile);

canvas.addEventListener("mousemove", (e) => {
  if (isMouseDown) {
    currentLayer = 0;

    addTile(e);
  }

  hover(e);
});

function hover(e) {
  const coord = getCoords(e);

  console.log(coord);
  if (!!coord) {
    const [x, y] = coord;
    draw();

    ctx.fillStyle = "rgba(226, 224, 224, 0.2)";
    ctx.beginPath();
    ctx.rect(
      x * tileSize,
      y * tileSize,
      tileSize - padding,
      tileSize - padding
    );
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  }
}

function addTile(e) {
  var coord = getCoords(e);
  if (!!coord) {
    const [x, y] = coord;

    if (e.shiftKey) {
      const index = layers[1]?.findIndex(
        (tile) => tile.x === x && tile.y === y
      );
      index !== -1 && layers[1]?.splice(index, 1);
    } else {
      if (!layers[1].some((tile) => tile.x === x && tile.y === y)) {
        layers[1].push({ x, y, color: selectedColor });
      }
    }
    draw();
  }
}
