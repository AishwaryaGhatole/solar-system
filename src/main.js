// Import styles and dependencies
import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Import texture assets
import starBg from "./stars.jpg";
import earthBg from "./earth.jpg";
import jupiterBg from "./jupiter.jpg";
import marsBg from "./mars.jpg";
import mercuryBg from "./mercury.jpg";
import neptuneBg from "./neptune.jpg";
import plutoBg from "./pluto.jpg";
import saturnBg from "./saturn.jpg";
import sunBg from "./sun.jpg";
import moonBg from "./moon.jpg";
import uranusBg from "./uranus.jpg";
import venusBg from "./venus.jpg";
import saturnRingBg from "./saturn-ring.png";
import uranusRingBg from "./uranus-ring.png";
import white from "./white.jpg";

// =================== Scene, Camera & Renderer Setup ====================

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
const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(-90, 140, 140);
orbit.update();

// =================== Lights and Background ====================

scene.add(new THREE.AmbientLight(0x333333));

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
  starBg,
  starBg,
  starBg,
  starBg,
  starBg,
  starBg,
]);

// =================== Global Variables ====================

let isRotationActive = true;
const toggleBtn = document.getElementById("toggleRotation");
toggleBtn.addEventListener("click", () => {
  isRotationActive = !isRotationActive;
  toggleBtn.textContent = isRotationActive
    ? "Pause Rotation"
    : "Resume Rotation";
});

let isLabelActive = false;
const toggleControls = document.getElementById("toggleControls");
const controls = document.getElementById("controlContainer");

toggleControls.addEventListener("click", () => {
  isLabelActive = !isLabelActive;
  toggleControls.textContent = !isLabelActive
    ? "Hide Controls"
    : "Show Controls";
  controls.style.display = !isLabelActive ? "block" : "none";
  controls.style.background = !isLabelActive
    ? "rgba(25, 25, 25, 0.764)"
    : "rgba(25, 25, 25, 0)";
});

// =================== Planet & Sun Setup ====================

const loadingManager = new THREE.LoadingManager(() => {
  document.getElementById("preloader").style.display = "none";
});

const textureLoader = new THREE.TextureLoader(loadingManager);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let mouseX = 0;
let mouseY = 0;
const clickableObjects = [];

// Create Sun
const sunMap = textureLoader.load(sunBg);
sunMap.colorSpace = THREE.SRGBColorSpace;
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(16, 30, 30),
  new THREE.MeshBasicMaterial({ map: sunMap })
);
sun.name = "Sun";
scene.add(sun);
clickableObjects.push(sun);

// Planet creation helper
function createPlanet(size, texture, position, ring, name) {
  const planetMap = textureLoader.load(texture);
  planetMap.colorSpace = THREE.SRGBColorSpace;

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(size, 30, 30),
    new THREE.MeshStandardMaterial({ map: planetMap })
  );
  mesh.name = name;
  clickableObjects.push(mesh);

  const obj = new THREE.Object3D();
  obj.add(mesh);
  mesh.position.x = position;

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
    ringMesh.position.x = position;
    ringMesh.rotation.x = -0.5 * Math.PI;
    obj.add(ringMesh);
  }

  const orbitMap = textureLoader.load(white);
  orbitMap.colorSpace = THREE.SRGBColorSpace;
  const orbitMesh = new THREE.Mesh(
    new THREE.RingGeometry(position - 0.3, position + 0.3, 64),
    new THREE.MeshBasicMaterial({ map: orbitMap, side: THREE.DoubleSide })
  );
  orbitMesh.rotation.x = -0.5 * Math.PI;
  scene.add(orbitMesh);

  scene.add(obj);
  return { mesh, obj };
}

// Create Planets
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

// Create Moon orbiting Earth
const moonMap = textureLoader.load(moonBg);
moonMap.colorSpace = THREE.SRGBColorSpace;
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(1.5, 30, 30),
  new THREE.MeshStandardMaterial({ map: moonMap })
);
moon.name = "Moon";
moon.position.x = 10;
earth.mesh.add(moon);
clickableObjects.push(moon);

// =================== Setup Speeds for Orbit Controls ====================

// Default orbital speeds for each planet
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

// Add event listeners to speed sliders
Object.keys(defaultSpeeds).forEach((planet) => {
  document.getElementById(`${planet}Speed`).addEventListener("input", (e) => {
    speeds[planet] = parseFloat(e.target.value);
  });
});

// =================== Lighting ====================

scene.add(new THREE.PointLight(0xffffff, 40000, 300));

// =================== Mouse Tracking for Hover Labels ====================

const label = document.getElementById("label");

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  mouseX = event.clientX;
  mouseY = event.clientY;
});

// =================== Reset Speed Button ====================

document.getElementById("resetSpeed").addEventListener("click", () => {
  speeds = { ...defaultSpeeds };
  Object.keys(defaultSpeeds).forEach((planet) => {
    document.getElementById(`${planet}Speed`).value = defaultSpeeds[planet];
  });
});

// =================== Animation Loop ====================

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

// =================== Window Resize Handling ====================

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
