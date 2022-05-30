const pan = window.Panzoom;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const colors = document.querySelectorAll("input");
const formColor = document.querySelector("ul");
const el = document.querySelector("#ele");

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

canvas.width = 1000 - 40;
canvas.height = 1000;
ctx.lineJoin = "round";
ctx.lineWidth = 4;
ctx.strokeStyle = "#16db65";

let currentLayer = 0;

const padding = 2;
const tileSize = 32;

let layers = [
  [Math.floor(canvas.width / 32), Math.floor(canvas.height / 32)],
  [
    // {
    //   x: 1,
    //   y: 1,
    //   color: "red",
    // },
  ],
];

// let x = 0,
//   y = 0;
// const panzoom = Panzoom(canvas, {
//   setTransform: (canvas, { scale, x, y }) => {
//     console.log("X: ", x, " Y: ", y);
//     x = x;
//     panzoom.setStyle("transform", `translate(${x}px, ${y}px)`);
//   },
// });

function generateBackground() {
  for (let i = 1; i <= canvas.width / 32; i++) {
    for (let j = 1; j <= canvas.width / 32; j++) {
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

function getCoords(e) {
  const { x, y } = e.target.getBoundingClientRect();
  const mouseX = e.clientX - x;
  const mouseY = e.clientY - y;

  return [Math.floor(mouseX / tileSize), Math.floor(mouseY / tileSize)];
}

let isMouseDown = false;

window.addEventListener("keydown", (e) => {
  if (e.shiftKey) ctx.strokeStyle = "#ef233c";
});
window.addEventListener("keyup", (e) => {
  if (!e.shiftKey) ctx.strokeStyle = "#16db65";
});
canvas.addEventListener("mousedown", () => (isMouseDown = true));
canvas.addEventListener("mouseup", () => (isMouseDown = false));
canvas.addEventListener("mouseleave", () => (isMouseDown = false));

// window.addEventListener("resize", () => {
//   canvas.width = window.innerWidth - 40;
//   draw();
// });

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

  ctx.fillStyle = "rgba(226, 224, 224, 0.2)";
  ctx.beginPath();
  ctx.rect(x * tileSize, y * tileSize, tileSize - padding, tileSize - padding);
  ctx.stroke();
  ctx.fill();
  ctx.closePath();
}

function addTile(e) {
  var [x, y] = getCoords(e);

  if (e.shiftKey) {
    const index = layers[1]?.findIndex((tile) => tile.x === x && tile.y === y);
    index !== -1 && layers[1]?.splice(index, 1);
  } else {
    if (!layers[1].some((tile) => tile.x === x && tile.y === y)) {
      layers[1].push({ x, y, color: selectedColor });
    }
  }

  draw();
}
