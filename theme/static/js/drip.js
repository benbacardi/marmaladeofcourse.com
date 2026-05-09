const liquidBox = document.getElementById("liquid-box");

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnDrip(el) {
  const rect = el.getBoundingClientRect();

  const randomBound = el.dataset.dripCount ? parseInt(el.dataset.dripCount) : 2;

  const count = Math.floor(Math.random() * randomBound) + 1;

  for (let i = 0; i < count; i++) {
    const drip = document.createElement("div");
    drip.classList.add("drip");

    const size = Math.random() * 8 + 22;
    const x = getRandomArbitrary(rect.left, rect.right - size);
    const dist = Math.random() * 5 + 12;

    drip.style.width = `calc(${size}px * var(--drip-size))`;
    drip.style.height = `calc(${size}px * var(--drip-size))`;
    drip.style.left = `${x}px`;
    drip.style.setProperty("--dist", `${dist}px`);

    drip.dataset.owner = el.innerText;
    liquidBox.appendChild(drip);
  }
}

function killDrip(el) {
  const drips = liquidBox.querySelectorAll(".drip");
  drips.forEach((d) => {
    if (d.dataset.owner === el.innerText) {
      d.classList.add("retracting");
      setTimeout(() => d.remove(), 250);
    }
  });
}
