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
let isMouseDown = false;

var instance = panzoom(panzoomEl, {
  zoomDoubleClickSpeed: 1,
  smoothScroll: false,
  maxZoom: 1,
  minZoom: 1,
  beforeWheel: function (e) {
    // allow wheel-zoom only if altKey is down. Otherwise - ignore
    var shouldIgnore = true;
    return shouldIgnore;
  },
  beforeMouseDown: function (e) {
    // allow wheel-zoom only if altKey is down. Otherwise - ignore
    var shouldIgnore = !e.ctrlKey;
    return shouldIgnore;
  },
  filterKey: function (/* e, dx, dy, dz */) {
    // don't let panzoom handle this event:
    return true;
  },
});

const offSetCanvas = 1024 - window.innerWidth + 32;
const maxPanX = offSetCanvas < 0 ? 0 : offSetCanvas * -1;

instance.on("pan", function (e) {
  const { x, y } = e.getTransform();
  if (x < maxPanX) {
    e.moveTo(maxPanX, y);
  } else if (x > 5) {
    e.moveTo(5, y);
  }

  if (y < -555) {
    e.moveTo(x, -555);
  } else if (y > 5) {
    e.moveTo(x, 5);
  }
});

let layers = [
  // bg-layer
  [],
  // blockchain layer
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
  // Selected user layer
  [],
];

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

window.addEventListener("keydown", (e) => {
  if (e.shiftKey) ctx.strokeStyle = "#ef233c";

  if (e.ctrlKey) canvas.style.cursor = "grab";
});
window.addEventListener("keyup", (e) => {
  if (!e.shiftKey) ctx.strokeStyle = "#16db65";
  if (!e.ctrlKey) canvas.style.cursor = "default";
});

canvas.addEventListener("mousedown", (e) => {
  if (!e.ctrlKey) {
    addTile(e);
    isMouseDown = true;
  }
  if (e.ctrlKey) canvas.style.cursor = "grabbing";
});
canvas.addEventListener("mouseup", (e) => {
  isMouseDown = false;
  if (e.ctrlKey) canvas.style.cursor = "grab";
});
canvas.addEventListener("mouseleave", () => (isMouseDown = false));
canvas.addEventListener("mousemove", (e) => {
  if (isMouseDown) {
    currentLayer = 0;

    addTile(e);
  }

  hover(e);
});

function hover(e) {
  const coord = getCoords(e);

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
