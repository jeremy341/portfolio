// The article outline: a rail beside the text on a wide window, folded to one line above the text
// on a small one (the list is open until this file runs, so it also works without it). The marker
// and the glide to a section are outline.ts.
import "./outline";

const fold = document.querySelector<HTMLDetailsElement>(".outline-fold");
const rail = matchMedia("(min-width: 1400px)");
if (fold) {
  const sync = () => {
    fold.open = rail.matches;
  };
  sync();
  rail.addEventListener("change", sync);
}
