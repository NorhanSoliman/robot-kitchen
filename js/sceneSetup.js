// =============================================================================
// js/sceneSetup.js
// =============================================================================
// To avoid writting the same setup again repeatedly,
// this script was created to be imported by every exercise.
//
// What it provides:
//   scene, camera, renderer, controls, gui
//   ambientLight, spotLight, fillLight
//   counterTopMat  (so later exercises can add GUI controls for it)
//   COUNTER_Y      (the Y coordinate of the counter surface – handy constant)
//
// Usage in an exercise HTML file:
//
//   import { scene, camera, renderer, controls, gui, COUNTER_Y }
//     from './js/sceneSetup.js';
//
//   // ← exercise-specific objects go here, added to `scene`
//
//   function animate() {
//     renderer.setAnimationLoop(animate);
//     controls.update();
//     renderer.render(scene, camera);
//   }
//   animate();
// =============================================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';

// ─────────────────────────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────────────────────────

/** Shorthand: create a MeshStandardMaterial with sensible defaults. */
export function makeMat(color, roughness = 0.8, metalness = 0.0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE
// ─────────────────────────────────────────────────────────────────────────────

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog        = new THREE.Fog(0x87ceeb, 10, 30);

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA
// ─────────────────────────────────────────────────────────────────────────────

export const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 2.5, 5);

// ─────────────────────────────────────────────────────────────────────────────
// RENDERER
// ─────────────────────────────────────────────────────────────────────────────

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
// XR will be enabled per-exercise (only Exercise 5 needs it)
document.body.appendChild(renderer.domElement);

// Resize handler – must live here because it references camera + renderer
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─────────────────────────────────────────────────────────────────────────────
// ORBIT CONTROLS
// ─────────────────────────────────────────────────────────────────────────────

export const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;

// ─────────────────────────────────────────────────────────────────────────────
// GUI  (each exercise can add its own folders)
// ─────────────────────────────────────────────────────────────────────────────

export const gui = new GUI({ title: 'Scene controls' });

// ─────────────────────────────────────────────────────────────────────────────
// ROOM  – floor, back wall, left wall
// ─────────────────────────────────────────────────────────────────────────────

const floorMat = makeMat(0xd6cfc7, 0.9, 0.0);
const floor    = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), floorMat);
floor.rotation.x  = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const wallMat  = makeMat(0xf5f0ea, 0.95, 0.0);

const backWall = new THREE.Mesh(new THREE.BoxGeometry(12, 5, 0.2), wallMat);
backWall.position.set(0, 2.5, -3.5);
backWall.receiveShadow = true;
scene.add(backWall);

const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 12), wallMat);
leftWall.position.set(-6, 2.5, 0);
leftWall.receiveShadow = true;
scene.add(leftWall);

// ─────────────────────────────────────────────────────────────────────────────
// KITCHEN COUNTER
// ─────────────────────────────────────────────────────────────────────────────

const counterBodyMat = makeMat(0x5c3d2e, 0.85, 0.0);
const counterBody    = new THREE.Mesh(
  new THREE.BoxGeometry(5, 0.85, 1.2),
  counterBodyMat
);
counterBody.position.set(0, 0.425, -2);
counterBody.castShadow = counterBody.receiveShadow = true;
scene.add(counterBody);

export const counterTopMat = makeMat(0xe8e0d5, 0.3, 0.1);
const counterTop = new THREE.Mesh(
  new THREE.BoxGeometry(5.1, 0.06, 1.3),
  counterTopMat
);
counterTop.position.set(0, 0.88, -2);
counterTop.castShadow = counterTop.receiveShadow = true;
scene.add(counterTop);

/** Y position of the counter work surface – use this to place objects on it. */
export const COUNTER_Y = 0.91;

// ─────────────────────────────────────────────────────────────────────────────
// OBJECTS ON THE COUNTER  (cup, plate, cutting board)
// ─────────────────────────────────────────────────────────────────────────────

// Cup
const cupMat = makeMat(0x3a86ff, 0.6, 0.1);
const cup    = new THREE.Mesh(
  new THREE.CylinderGeometry(0.09, 0.07, 0.18, 24), cupMat
);
cup.position.set(-0.8, COUNTER_Y + 0.09, -2);
cup.castShadow = true;
scene.add(cup);

const cupHandle = new THREE.Mesh(
  new THREE.TorusGeometry(0.055, 0.012, 8, 20, Math.PI),
  makeMat(0x3a86ff, 0.6, 0.1)
);
cupHandle.position.set(-0.72, COUNTER_Y + 0.09, -2);
cupHandle.rotation.y = Math.PI / 2;
cupHandle.castShadow = true;
scene.add(cupHandle);

// Plate
const plate = new THREE.Mesh(
  new THREE.CylinderGeometry(0.2, 0.19, 0.025, 40),
  makeMat(0xfff1e6, 0.4, 0.05)
);
plate.position.set(0.5, COUNTER_Y + 0.0125, -2);
plate.castShadow = plate.receiveShadow = true;
scene.add(plate);

// Bread roll
const roll = new THREE.Mesh(
  new THREE.SphereGeometry(0.15, 16, 10),
  makeMat(0xd4a56a, 0.9, 0.0)
);
roll.scale.y = 0.70;
roll.position.set(0, COUNTER_Y + 0.07, -2.25); // put bread on the cutting board
roll.castShadow = true;
scene.add(roll);

// Cutting board
const board = new THREE.Mesh(
  new THREE.BoxGeometry(0.45, 0.018, 0.3),
  makeMat(0x9c6b3c, 0.95, 0.0)
);
board.position.set(0, COUNTER_Y + 0.009, -2.25);
board.castShadow = board.receiveShadow = true;
scene.add(board);

// ─────────────────────────────────────────────────────────────────────────────
// LIGHTING
// ─────────────────────────────────────────────────────────────────────────────

export const ambientLight = new THREE.AmbientLight(0xfff5e4, 0.5);
scene.add(ambientLight);

export const spotLight = new THREE.SpotLight(0xfff8e7, 60);
spotLight.position.set(0, 4.5, -1.5);
spotLight.target.position.set(0, 0, -2);
scene.add(spotLight, spotLight.target);
spotLight.castShadow            = true;
spotLight.shadow.mapSize.width  = 2048;
spotLight.shadow.mapSize.height = 2048;
spotLight.shadow.bias           = -0.001;
spotLight.angle                 = Math.PI / 5;
spotLight.penumbra              = 0.35;

// Lamp fitting mesh
const lampMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.12, 0.2, 0.18, 16),
  makeMat(0xffffff, 0.3, 0.8)
);
lampMesh.position.set(0, 4.4, -1.5);
scene.add(lampMesh);

export const fillLight = new THREE.DirectionalLight(0xadd8e6, 0.4);
fillLight.position.set(-5, 3, 2);
scene.add(fillLight);

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT GUI FOLDERS  (lighting + counter material)
// exercises can open additional folders on top of these
// ─────────────────────────────────────────────────────────────────────────────

const lightFolder = gui.addFolder('Lighting');
lightFolder.add(ambientLight, 'intensity', 0, 2,   0.01).name('Ambient intensity');
lightFolder.add(spotLight,    'intensity', 0, 150,  1  ).name('Spot intensity');
lightFolder.add(spotLight,    'penumbra',  0, 1,    0.01).name('Spot penumbra');
lightFolder.open();

const matFolder = gui.addFolder('Counter top material');
matFolder.add(counterTopMat, 'roughness', 0, 1, 0.01).name('Roughness');
matFolder.add(counterTopMat, 'metalness', 0, 1, 0.01).name('Metalness');
matFolder.open();
