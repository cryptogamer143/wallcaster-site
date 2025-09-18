export function detectAdblock(callback) {
  const bait = document.createElement("div");
  bait.className = "adsbox"; // common class name blocked by adblockers
  bait.style.position = "absolute";
  bait.style.left = "-9999px";
  document.body.appendChild(bait);

  setTimeout(() => {
    const adBlocked = window.getComputedStyle(bait).display === "none" ||
                      bait.offsetParent === null ||
                      bait.offsetHeight === 0;
    document.body.removeChild(bait);
    callback(adBlocked);
  }, 100);
}
