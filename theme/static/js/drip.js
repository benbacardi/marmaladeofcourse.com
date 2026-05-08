const liquidBox = document.getElementById("liquid-box");

function spawnDrip(el) {
  const rect = el.getBoundingClientRect();

  const randomBound = el.dataset.dripCount ? parseInt(el.dataset.dripCount) : 2;

  const count = Math.floor(Math.random() * randomBound) + 1;
  const scrollX = window.scrollX || document.documentElement.scrollLeft;
  const containerOffset = Math.abs(
    parseFloat(
      getComputedStyle(document.querySelector(".liquid-container")).left
      )
    );

  for (let i = 0; i < count; i++) {
    const drip = document.createElement("div");
    drip.classList.add("drip");

    const size = Math.random() * 8 + 22;
// Adjusting X position to account for the container's negative left offset
    const x =
    rect.left +
    scrollX +
    Math.random() * (rect.width * 0.4) +
    rect.width * 0.3 +
    containerOffset;
    const dist = Math.random() * 5 + 12;

    drip.style.width = `${size}px`;
    drip.style.height = `${size}px`;
    drip.style.left = `${x}px`;
    drip.style.setProperty("--dist", `${dist}px`);

    drip.dataset.owner = el.innerText;
    liquidBox.appendChild(drip);
  }
}

function killDrip(el) {
  console.log("Killing drips");
  const drips = liquidBox.querySelectorAll(".drip");
  drips.forEach((d) => {
    if (d.dataset.owner === el.innerText) {
      d.classList.add("retracting");
      setTimeout(() => d.remove(), 250);
    }
  });
}
