const pan = window.Panzoom;

console.log(pan);
const canvas = document.querySelector("canvas");
const tileSetContainer = document.querySelector(".tileset-container");
const tileSetImg = document.querySelector("#tileset-img");
const tileSetSelection = document.querySelector(".tile-selecting");
const ctx = canvas.getContext("2d");

let selection = [0, 0];

canvas.width = window.innerWidth - 40;
ctx.height = 400;
ctx.lineWidth = 2;
ctx.lineJoin = "round";
let currentLayer = 0;

const padding = 2;
const tileSize = 32;

let layers = [
  [Math.floor(canvas.width / 32), Math.floor(canvas.height / 32)],
  [{}],
];

tileSetImg.src =
  "https://assets.codepen.io/21542/TileEditorSpritesheet.2x_2.png";

tileSetImg.onload = () => {
  draw();
};

// const panzoom = Panzoom(canvas, {
//   maxScale: 1,
// });
// panzoom.pan(10, 10);
// panzoom.zoom(2, { animate: true });

function generateBackground() {
  for (let i = 0; i < canvas.width / tileSize; i++) {
    for (let j = 0; j < canvas.width / tileSize; j++) {
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

function paintTile(props) {
  const { x = 0, px = 0, y = 0, py = 0, wx = padding, hy = padding } = props;
  return ctx.fillRect(
    x * tileSize - px,
    y * tileSize - py,
    tileSize - wx,
    tileSize - hy
  );
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

function getCoords(e) {
  const { x, y } = e.target.getBoundingClientRect();
  const mouseX = e.clientX - x;
  const mouseY = e.clientY - y;

  return [Math.floor(mouseX / tileSize), Math.floor(mouseY / tileSize)];
}

tileSetContainer.addEventListener("mousedown", (e) => {
  selection = getCoords(e);
  tileSetSelection.style.left = selection[0] * tileSize + "px";
  tileSetSelection.style.top = selection[1] * tileSize + "px";
});

let isMouseDown = false;

canvas.addEventListener("mousedown", () => (isMouseDown = true));
canvas.addEventListener("mouseup", () => (isMouseDown = false));
canvas.addEventListener("mouseleave", () => (isMouseDown = false));

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth - 40;
  draw();
});

canvas.addEventListener("mousedown", addTile);
canvas.addEventListener("mousemove", (e) => {
  if (isMouseDown) {
    currentLayer = 0;

    addTile(e);
  }

  hover(e);
});

function hover(e) {
  const hover = getCoords(e);
  const x = hover[0];
  const y = hover[1];
  draw();
  ctx.strokeStyle = "#414040";
  ctx.fillStyle = "rgba(226, 224, 224, 0.2)";
  ctx.strokeRect(
    x * tileSize,
    y * tileSize,
    tileSize - padding,
    tileSize - padding
  );
  ctx.fillRect(
    x * tileSize + padding,
    y * tileSize + padding,
    tileSize - 2 * padding,
    tileSize - 2 * padding
  );
}

function addTile(e) {
  var [x, y] = getCoords(e);

  if (e.shiftKey) {
    const index = layers[1]?.findIndex((tile) => tile.x === x && tile.y === y);
    index !== -1 && layers[1]?.splice(index, 1);
  } else {
    if (!layers[1].some((tile) => tile.x === x && tile.y === y)) {
      layers[1].push({ x, y, color: "green" });
    }
  }

  draw();
}
