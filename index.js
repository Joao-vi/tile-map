const canvas = document.querySelector("canvas");
const tileSetContainer = document.querySelector(".tileset-container");
const tileSetImg = document.querySelector("#tileset-img");
const tileSetSelection = document.querySelector(".tile-selecting");

let selection = [0, 0];
const ctx = canvas.getContext("2d");

ctx.width = window.innerWidth;
ctx.height = 400;
ctx.lineWidth = 2;
let currentLayer = 0;

let layers = [{ "0-0": [0, 0] }, {}];

tileSetImg.src =
  "https://assets.codepen.io/21542/TileEditorSpritesheet.2x_2.png";

tileSetImg.onload = () => {
  draw();
};

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  var sizeOfCrop = 32;

  layers.forEach((layer) => {
    Object.keys(layer).forEach((key) => {
      const positionX = Number(key.split("-")[0]);
      const positionY = Number(key.split("-")[1]);

      const [tilesheetX, tilesheetY] = layer[key];

      ctx.drawImage(
        tileSetImg,
        tilesheetX * 32, // tilesheet x,y (top left corner of the grab)
        tilesheetY * 32, // tilesheet x,y (top left corner of the grab)
        sizeOfCrop, // how big of a grab
        sizeOfCrop, // how big of a grab
        positionX * 32, // where you want the crop to be placed
        positionY * 32, // where you want the crop to be placed
        sizeOfCrop, // size of placement of what was grabbed
        sizeOfCrop // size of placement of what was grabbed
      );
    });
  });
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

let prevHover = "";
canvas.addEventListener("mousedown", addTile);
canvas.addEventListener("mousemove", (e) => {
  layers[1] = {};

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
  ctx.strokeRect(x * 32, y * 32, 32, 32);
}

function addTile(e) {
  var clicked = getCoords(e);
  var key = clicked[0] + "-" + clicked[1];
  prevHover = key;

  if (e.shiftKey) {
    delete layers[currentLayer][key];
  } else {
    if (!layers[currentLayer][key]) {
      layers[currentLayer][key] = [selection[0], selection[1]];
    }
  }

  draw();
}
