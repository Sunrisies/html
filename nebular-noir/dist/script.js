// number of circles to render. Unique DOM elements so... don't make too many.
const NUM = 500;
const NOISE_DIV = document.getElementById("noise");
const SCALE = window.
getComputedStyle(document.body).
getPropertyValue("--svg-size").
replace("px", "");
const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;
const RADIUS = window.
getComputedStyle(document.body).
getPropertyValue("--highlight-radius").
replace("px", "");

const getTheme = () => {
  const rootStyles = window.getComputedStyle(document.documentElement);
  return Object.fromEntries(
  Array.from(document.styleSheets).
  flatMap(styleSheet => {
    try {
      return Array.from(styleSheet.cssRules);
    } catch (error) {
      return [];
    }
  }).
  filter(cssRule => cssRule instanceof CSSStyleRule).
  flatMap(cssRule => Array.from(cssRule.style)).
  filter(style => style.startsWith("--svg-fill")).
  map(variable => [variable, rootStyles.getPropertyValue(variable)]));

};

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
const fillOptions = Object.keys(getTheme());

const makeCircle = () => {
  const top = getRandomInt(HEIGHT);
  const left = getRandomInt(WIDTH);
  const fill = getRandomInt(fillOptions.length);
  const styles = `fill: hsla(var(${fillOptions[fill]}), 100%); top: ${top}%; left: ${left}%;`;
  return circle = { top, left, fill, styles };
};

// basic throttle function so we don't update classes constantly
const throttle = (func, delay) => {
  let prev = 0;
  return (...args) => {
    let now = new Date().getTime();
    if (now - prev > delay) {
      prev = now;
      return func(...args);
    }
  };
};

//
const isPointInCircle = (mouseX, mouseY, pointX, pointY, radius) => {
  // Calculate the distance between the mouse position and the point
  const distance = Math.sqrt(
  Math.pow(mouseX - pointX, 2) + Math.pow(mouseY - pointY, 2));

  // Check if the distance is less than or equal to the radius
  return distance <= radius;
};

const renderCircle = (circle, x, y) => {
  const { top, left, fill } = circle;
  const percentTop = top / HEIGHT * 100;
  const percentLeft = left / WIDTH * 100;

  const verticalOffset = top - y;
  const horizontalOffset = left - x;
  let active = false;
  if (
  verticalOffset < 100 &&
  verticalOffset > -100 &&
  horizontalOffset < 100 &&
  horizontalOffset > -100)
  {
    active = true;
  }
  const styles = `fill: hsla(var(${fillOptions[fill]}), 100%); top: ${percentTop}%; left: ${percentLeft}%;`;
  const classes = active ? "hovered" : "";

  return `<svg viewBox="0 0 ${SCALE} ${SCALE}" class="${classes}" style="${styles}" xmlns="http://www.w3.org/2000/svg"><circle cx="${
  SCALE / 2
  }" cy="${SCALE / 2}" r="${SCALE / 2}" /></svg>`;
};

let allCircles = [];
for (let i = 0; i < NUM; i++) {
  allCircles.push(makeCircle());
}

const allStrings = allCircles.map(circle => renderCircle(circle));

/* window.onresize */
const mouseMoved = e => {
  const x = e.pageX;
  const y = e.pageY;
  const height = window.innerHeight;
  const width = window.innerWidth;

  const xPercent = x / width * 100;
  const yPercent = y / height * 100;

  const allStringNodes = document.querySelectorAll("#noise svg");
  document.documentElement.style.setProperty("--highlight-start", `${xPercent}% ${yPercent}%`);

  allStringNodes.forEach((element, index) => {
    const top = element.style.top.replace("%", "") * height / 100;
    const left = element.style.left.replace("%", "") * width / 100;


    const isIn = isPointInCircle(x, y, left, top, RADIUS);

    if (isIn) {
      element.classList.add("hovered");
    } else {
      element.classList.remove("hovered");
    }
  });
};

const throttledMove = throttle(mouseMoved, 30);
window.addEventListener("mousemove", throttledMove);

// make the initial call
NOISE_DIV.innerHTML = allStrings.join("");