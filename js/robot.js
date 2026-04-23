// =============================================================================
// js/robot.js
// =============================================================================
// Builds the humanoid robot and adds it to the scene.
// Uses the robot implementation from exercise 2.
// 
// Usage:
//   import { buildRobot } from './js/robot.js';
//   const robot = buildRobot(scene);
//
//   // In render loop, we animate the joints:
//   const t = Date.now() * 0.001;
//   robot.leftArm.shoulderPivot.rotation.x  = Math.sin(t) * 0.5;
//   robot.rightArm.elbowPivot.rotation.x    = Math.sin(t) * 0.4;
//
// Returns:
//   {
//     root,       ← the Group containing the whole robot (we can move/rotate this)
//     leftArm:  { shoulderPivot, elbowPivot, handPivot },
//     rightArm: { shoulderPivot, elbowPivot, handPivot },
//   }
// =============================================================================

import * as THREE from 'three';
import { makeMat } from './sceneSetup.js';

// =============================================================================
// DIMENSIONS
// =============================================================================
const D = {
  legW: 0.18, legH: 0.55, legD: 0.18,
  hipsW: 0.52, hipsH: 0.18, hipsD: 0.22,
  torsoW: 0.58, torsoH: 0.65, torsoD: 0.28,
  headW: 0.32, headH: 0.32, headD: 0.28,
  uArmW: 0.13, uArmH: 0.38, uArmD: 0.13,
  fArmW: 0.11, fArmH: 0.34, fArmD: 0.11,
  handW: 0.14, handH: 0.12, handD: 0.08,
};

// =============================================================================
// MATERIALS
// =============================================================================
const robotMat  = makeMat(0x8ecae6, 0.4, 0.6);
const jointMat  = makeMat(0x219ebc, 0.3, 0.8);
const detailMat = makeMat(0x023047, 0.5, 0.3);
const eyeMat    = makeMat(0xffb703, 0.2, 0.0);

// =============================================================================
// HELPERS
// =============================================================================

/** Create a box Mesh with shadows enabled. */
function box(w, h, d, mat) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.castShadow    = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Build one arm and return its pivot groups.
 *  side: -1 = left arm, +1 = right arm
 *  torsoY: Y at the top of the torso (where shoulder sits)
 */
function buildArm(side, torsoY, parent) {
  const shoulderX = side * (D.torsoW / 2 + D.uArmW / 2 + 0.02);
  const shoulderY = torsoY + D.torsoH - 0.08;

  // ── Shoulder pivot ────────────────────────────────────────────────────────
  const shoulderPivot = new THREE.Group();
  shoulderPivot.position.set(shoulderX, shoulderY, 0);
  parent.add(shoulderPivot);

  const shoulderBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 12, 8), jointMat
  );
  shoulderBall.castShadow = true;
  shoulderPivot.add(shoulderBall);

  // ── Upper arm ─────────────────────────────────────────────────────────────
  // Top of upper arm is at Y=0 (the pivot), so we offset by -halfHeight
  const upperArm = box(D.uArmW, D.uArmH, D.uArmD, robotMat);
  upperArm.position.y = -D.uArmH / 2;
  shoulderPivot.add(upperArm);

  // ── Elbow pivot ───────────────────────────────────────────────────────────
  // Placed at the bottom of the upper arm, child of upperArm
  const elbowPivot = new THREE.Group();
  elbowPivot.position.y = -D.uArmH / 2;
  upperArm.add(elbowPivot);

  const elbowBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 12, 8), jointMat
  );
  elbowBall.castShadow = true;
  elbowPivot.add(elbowBall);

  // ── Forearm ───────────────────────────────────────────────────────────────
  const forearm = box(D.fArmW, D.fArmH, D.fArmD, robotMat);
  forearm.position.y = -D.fArmH / 2;
  elbowPivot.add(forearm);

  // ── Wrist / hand pivot ────────────────────────────────────────────────────
  const handPivot = new THREE.Group();
  handPivot.position.y = -D.fArmH / 2;
  forearm.add(handPivot);

  const wristBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 12, 8), jointMat
  );
  wristBall.castShadow = true;
  handPivot.add(wristBall);

  // ── Hand ──────────────────────────────────────────────────────────────────
  const hand = box(D.handW, D.handH, D.handD, detailMat);
  hand.position.y = -D.handH / 2;
  handPivot.add(hand);

  [-0.04, 0.04].forEach(fx => {
    const finger = box(0.03, 0.07, 0.03, jointMat);
    finger.position.set(fx, -D.handH / 2 - 0.035, 0);
    hand.add(finger);
  });

  // ── Axes helpers (visual debugging) ───────────────────────────────────────
  shoulderPivot.add(new THREE.AxesHelper(0.15));
  elbowPivot.add(new THREE.AxesHelper(0.12));
  handPivot.add(new THREE.AxesHelper(0.09));

  return { shoulderPivot, elbowPivot, handPivot };
}

// =============================================================================
// MAIN EXPORT
// =============================================================================
export function buildRobot(scene) {

  // ── Root group ─────────────────────────────────────────────────────────────
  const root = new THREE.Group();
  root.position.set(0, 0, -3.1); // behind the counter
  scene.add(root);

  // ── Legs ───────────────────────────────────────────────────────────────────
  const leftLeg  = box(D.legW, D.legH, D.legD, robotMat);
  const rightLeg = box(D.legW, D.legH, D.legD, robotMat);
  leftLeg.position.set(-0.17,  D.legH / 2, 0);
  rightLeg.position.set( 0.17, D.legH / 2, 0);
  root.add(leftLeg, rightLeg);

  [leftLeg, rightLeg].forEach(leg => {
    const knee = box(D.legW + 0.01, 0.06, D.legD + 0.01, jointMat);
    knee.position.y = 0.05;
    leg.add(knee);
  });

  // ── Hips ───────────────────────────────────────────────────────────────────
  const hipsY = D.legH;
  const hips  = box(D.hipsW, D.hipsH, D.hipsD, jointMat);
  hips.position.set(0, hipsY + D.hipsH / 2, 0);
  root.add(hips);

  // ── Torso ──────────────────────────────────────────────────────────────────
  const torsoY = hipsY + D.hipsH;
  const torso  = box(D.torsoW, D.torsoH, D.torsoD, robotMat);
  torso.position.set(0, torsoY + D.torsoH / 2, 0);
  root.add(torso);

  const chestPanel = box(0.28, 0.22, 0.02, detailMat);
  chestPanel.position.set(0, 0.05, D.torsoD / 2 + 0.01);
  torso.add(chestPanel);

  // ── Head ───────────────────────────────────────────────────────────────────
  const headY = torsoY + D.torsoH;
  const head  = box(D.headW, D.headH, D.headD, robotMat);
  head.position.set(0, headY + D.headH / 2 + 0.04, 0);
  root.add(head);

  const eyeL = box(0.07, 0.045, 0.02, eyeMat);
  const eyeR = box(0.07, 0.045, 0.02, eyeMat);
  eyeL.position.set(-0.08, 0.04, D.headD / 2 + 0.01);
  eyeR.position.set( 0.08, 0.04, D.headD / 2 + 0.01);
  head.add(eyeL, eyeR);

  const neck = box(0.14, 0.08, 0.14, jointMat);
  neck.position.set(0, headY + 0.04, 0);
  root.add(neck);

  // ── Arms ───────────────────────────────────────────────────────────────────
  const leftArm  = buildArm(-1, torsoY, root);
  const rightArm = buildArm( 1, torsoY, root);

  root.add(new THREE.AxesHelper(0.3));

  return { root, leftArm, rightArm };
}
