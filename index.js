const canvas = document.querySelector("canvas");
const tileSetContainer = document.querySelector(".tileset-container");
const tileSetImg = document.querySelector("#tileset-img");
const tileSetSelection = document.querySelector(".tile-selecting");

let selection = [0, 0];
const ctx = canvas.getContext("2d");

ctx.width = window.innerWidth;
ctx.height = 400;
ctx.lineWidth = 2;
ctx.lineJoin = "round";
let currentLayer = 0;

// let layers = [{ "0-0": [0, 0] }, {}];

let layers = [[Math.floor(ctx.width / 32), Math.floor(ctx.height / 32)], []];
tileSetImg.src =
  "https://assets.codepen.io/21542/TileEditorSpritesheet.2x_2.png";

tileSetImg.onload = () => {
  draw();
};

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  var sizeOfCrop = 32;

  layers.forEach((layer, index) => {
    if (index === 0) {
      for (let i = 0; i < layer[0]; i++) {
        for (let j = 0; j < layer[0]; j++) {
          ctx.fillStyle = "#cccccc";
          ctx.fillRect(i * 32, j * 32, 30, 30);
        }
      }
    } else {
      layer.forEach(({ x, y, color }) => {
        // const hasLeft = layer?.some((tile) => tile.x === x - 1);
        // const hasRight = layer?.some((tile) => tile.x === x + 1);
        // if (hasLeft) {
        //   ctx.fillRect(x * 32 - 2, y * 32, 32, 30);
        // } else {
        // }
        ctx.fillStyle = color;
        ctx.fillRect(x * 32, y * 32, 30, 30);
      });
    }
  });

  // layers.forEach((layer) => {
  //   Object.keys(layer).forEach((key) => {
  //     const positionX = Number(key.split("-")[0]);
  //     const positionY = Number(key.split("-")[1]);

  //     const [tilesheetX, tilesheetY] = layer[key];
  //     ctx.drawImage(
  //       tileSetImg,
  //       tilesheetX * 32, // tilesheet x,y (top left corner of the grab)
  //       tilesheetY * 32, // tilesheet x,y (top left corner of the grab)
  //       sizeOfCrop, // how big of a grab
  //       sizeOfCrop, // how big of a grab
  //       positionX * 32, // where you want the crop to be placed
  //       positionY * 32, // where you want the crop to be placed
  //       sizeOfCrop, // size of placement of what was grabbed
  //       sizeOfCrop // size of placement of what was grabbed
  //     );
  //   });
  // });
}

function getCoords(e) {
  const { x, y } = e.target.getBoundingClientRect();
  const mouseX = e.clientX - x;
  const mouseY = e.clientY - y;

  return [Math.floor(mouseX / 32), Math.floor(mouseY / 32)];
}

tileSetContainer.addEventListener("mousedown", (e) => {
  selection = getCoords(e);
  tileSetSelection.style.left = selection[0] * 32 + "px";
  tileSetSelection.style.top = selection[1] * 32 + "px";
});

let isMouseDown = false;

canvas.addEventListener("mousedown", () => (isMouseDown = true));
canvas.addEventListener("mouseup", () => (isMouseDown = false));
canvas.addEventListener("mouseleave", () => (isMouseDown = false));

// window.addEventListener("resize", () => {
//   canvas.width = window.innerWidth;
//   draw();
// });

canvas.addEventListener("mousedown", addTile);
canvas.addEventListener("mousemove", (e) => {
  // layers[1] = {};

  if (isMouseDown) {
    currentLayer = 0;

    addTile(e);
  }
  // currentLayer = 1;
  // addTile(e);

  hover(e);
});

function hover(e) {
  const hover = getCoords(e);
  const x = hover[0];
  const y = hover[1];
  draw();
  ctx.strokeStyle = "#414040";
  ctx.fillStyle = "rgba(226, 224, 224, 0.2)";
  ctx.strokeRect(x * 32, y * 32, 30, 30);
  ctx.fillRect(x * 32 + 2, y * 32 + 2, 26, 26);
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
