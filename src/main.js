// Import styles and dependencies
import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Imported maps of each planet
import starBg from "../public/stars.jpg";
import earthBg from "../public/earth.jpg";
import jupiterBg from "../public/jupiter.jpg";
import marsBg from "../public/mars.jpg";
import mercuryBg from "../public/mercury.jpg";
import neptuneBg from "../public/neptune.jpg";
import plutoBg from "../public/pluto.jpg";
import saturnBg from "../public/saturn.jpg";
import sunBg from "../public/sun.jpg";
import moonBg from "../public/moon.jpg";
import uranusBg from "../public/uranus.jpg";
import venusBg from "../public/venus.jpg";
import saturnRingBg from "../public/saturn-ring.png";
import uranusRingBg from "../public/uranus-ring.png";
import white from "../public/white.jpg";

// inputs of each planet speed range labels
document
  .getElementById("mercurySpeed")
  .addEventListener(
    "input",
    (e) => (speeds.mercury = parseFloat(e.target.value))
  );
document
  .getElementById("venusSpeed")
  .addEventListener(
    "input",
    (e) => (speeds.venus = parseFloat(e.target.value))
  );
document
  .getElementById("earthSpeed")
  .addEventListener(
    "input",
    (e) => (speeds.earth = parseFloat(e.target.value))
  );
document
  .getElementById("marsSpeed")
  .addEventListener("input", (e) => (speeds.mars = parseFloat(e.target.value)));
document
  .getElementById("jupiterSpeed")
  .addEventListener(
    "input",
    (e) => (speeds.jupiter = parseFloat(e.target.value))
  );
document
  .getElementById("saturnSpeed")
  .addEventListener(
    "input",
    (e) => (speeds.saturn = parseFloat(e.target.value))
  );
document
  .getElementById("uranusSpeed")
  .addEventListener(
    "input",
    (e) => (speeds.uranus = parseFloat(e.target.value))
  );
document
  .getElementById("neptuneSpeed")
  .addEventListener(
    "input",
    (e) => (speeds.neptune = parseFloat(e.target.value))
  );
document
  .getElementById("plutoSpeed")
  .addEventListener(
    "input",
    (e) => (speeds.pluto = parseFloat(e.target.value))
  );

// Scene setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// orbit controls for camera position (for each element rendering)
const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(-90, 140, 140);
orbit.update();

//code for global light for entire 3D scene
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

//code for star background cube
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
  starBg,
  starBg,
  starBg,
  starBg,
  starBg,
  starBg,
]);

//setup code to pause/resume the motion of planets
let isRotationActive = true;
const toggleBtn = document.getElementById("toggleRotation");
toggleBtn.addEventListener("click", () => {
  isRotationActive = !isRotationActive;
  toggleBtn.textContent = isRotationActive
    ? "Pause Rotation"
    : "Resume Rotation";
});

// code to toggle the input range labels
let isLabelActive = false;
const toggleControls = document.getElementById("toggleControls");
const controls = document.getElementById("controlContainer");
toggleControls.addEventListener("click", () => {
  isLabelActive = !isLabelActive;
  toggleControls.textContent = !isLabelActive
    ? "Hide Controls"
    : "Show Controls";
  controls.style.display = !isLabelActive ? "block" : "none";
});

//setup code for visibility of the names of each planet name
const textureLoader = new THREE.TextureLoader();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let mouseX = 0;
let mouseY = 0;
const clickableObjects = [];

const label = document.getElementById("label");

//code to create Sun
const sunMap = textureLoader.load(sunBg);
sunMap.colorSpace = THREE.SRGBColorSpace;
const sunGeo = new THREE.SphereGeometry(16, 30, 30);
const sunMat = new THREE.MeshBasicMaterial({ map: sunMap });
const sun = new THREE.Mesh(sunGeo, sunMat);
sun.name = "Sun";
scene.add(sun);
clickableObjects.push(sun);

//code to create planets
function createPlanet(size, texture, position, ring, name) {
  const planetMap = textureLoader.load(texture);
  planetMap.colorSpace = THREE.SRGBColorSpace;
  const Geo = new THREE.SphereGeometry(size, 30, 30);
  const Mat = new THREE.MeshStandardMaterial({ map: planetMap });

  const mesh = new THREE.Mesh(Geo, Mat);
  mesh.name = name;
  clickableObjects.push(mesh);

  const obj = new THREE.Object3D();
  obj.add(mesh);

  if (ring) {
    const ringGeo = new THREE.RingGeometry(
      ring.innerRadius,
      ring.outerRadius,
      32
    );
    const ringMat = new THREE.MeshBasicMaterial({
      map: textureLoader.load(ring.ringBg),
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    obj.add(ringMesh);
    ringMesh.position.x = position;
    ringMesh.rotation.x = -0.5 * Math.PI;
  }

  //code for the orbits of each planet
  const orbitMap = textureLoader.load(white);
  orbitMap.colorSpace = THREE.SRGBColorSpace;
  const orbitGeo = new THREE.RingGeometry(position - 0.3, position + 0.3, 64);
  const orbitMat = new THREE.MeshBasicMaterial({
    map: orbitMap,
    side: THREE.DoubleSide,
  });
  const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);
  scene.add(orbitMesh);
  orbitMesh.rotation.x = -0.5 * Math.PI;

  scene.add(obj);
  mesh.position.x = position;

  return { mesh, obj };
}

// Create all planets
const mercury = createPlanet(3.2, mercuryBg, 28, null, "Mercury");
const venus = createPlanet(5.8, venusBg, 44, null, "Venus");
const earth = createPlanet(6, earthBg, 62, null, "Earth");
const mars = createPlanet(4, marsBg, 78, null, "Mars");
const jupiter = createPlanet(12, jupiterBg, 100, null, "Jupiter");
const saturn = createPlanet(
  10,
  saturnBg,
  138,
  { innerRadius: 10, outerRadius: 20, ringBg: saturnRingBg },
  "Saturn"
);
const uranus = createPlanet(
  7,
  uranusBg,
  176,
  { innerRadius: 7, outerRadius: 12, ringBg: uranusRingBg },
  "Uranus"
);
const neptune = createPlanet(7, neptuneBg, 200, null, "Neptune");
const pluto = createPlanet(2.8, plutoBg, 216, null, "Pluto");

// Create Moon
const moonMap = textureLoader.load(moonBg);
moonMap.colorSpace = THREE.SRGBColorSpace;
const moonGeo = new THREE.SphereGeometry(1.5, 30, 30);
const moonMat = new THREE.MeshStandardMaterial({ map: moonMap });
const moon = new THREE.Mesh(moonGeo, moonMat);
moon.name = "Moon";
earth.mesh.add(moon);
moon.position.x = 10;
clickableObjects.push(moon);

//orbit speed of each planet
const defaultSpeeds = {
  mercury: 0.04,
  venus: 0.015,
  earth: 0.01,
  mars: 0.008,
  jupiter: 0.002,
  saturn: 0.0009,
  uranus: 0.0004,
  neptune: 0.0001,
  pluto: 0.0007,
};

let speeds = { ...defaultSpeeds };

const resetBtn = document.getElementById("resetSpeed");
resetBtn.addEventListener("click", () => {
  speeds = { ...defaultSpeeds };
  document.getElementById("mercurySpeed").value = defaultSpeeds.mercury;
  document.getElementById("venusSpeed").value = defaultSpeeds.venus;
  document.getElementById("earthSpeed").value = defaultSpeeds.earth;
  document.getElementById("marsSpeed").value = defaultSpeeds.mars;
  document.getElementById("jupiterSpeed").value = defaultSpeeds.jupiter;
  document.getElementById("saturnSpeed").value = defaultSpeeds.saturn;
  document.getElementById("uranusSpeed").value = defaultSpeeds.uranus;
  document.getElementById("neptuneSpeed").value = defaultSpeeds.neptune;
  document.getElementById("plutoSpeed").value = defaultSpeeds.pluto;
});

// Lighting
const pointLight = new THREE.PointLight(0xffffff, 40000, 300);
scene.add(pointLight);

//code to track mouse position
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  mouseX = event.clientX;
  mouseY = event.clientY;
});

// Animation loop
function animate() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableObjects, true);

  if (intersects.length > 0) {
    label.style.display = "block";
    label.textContent = intersects[0].object.name;
    label.style.left = `${mouseX + 10}px`;
    label.style.top = `${mouseY + 10}px`;
  } else {
    label.style.display = "none";
  }

  if (isRotationActive) {
    sun.rotateY(0.004);
    mercury.mesh.rotateY(0.004);
    venus.mesh.rotateY(0.002);
    earth.mesh.rotateY(0.02);
    mars.mesh.rotateY(0.018);
    jupiter.mesh.rotateY(0.04);
    saturn.mesh.rotateY(0.038);
    uranus.mesh.rotateY(0.03);
    neptune.mesh.rotateY(0.032);
    pluto.mesh.rotateY(0.008);

    mercury.obj.rotateY(speeds.mercury);
    venus.obj.rotateY(speeds.venus);
    earth.obj.rotateY(speeds.earth);
    mars.obj.rotateY(speeds.mars);
    jupiter.obj.rotateY(speeds.jupiter);
    saturn.obj.rotateY(speeds.saturn);
    uranus.obj.rotateY(speeds.uranus);
    neptune.obj.rotateY(speeds.neptune);
    pluto.obj.rotateY(speeds.pluto);
  }

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
