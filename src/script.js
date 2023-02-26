import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { generateSpheres } from "./utils/generateSpheres";
import { generateDonut } from "./utils/generateDonut";

const gui = new GUI();
const clock = new THREE.Clock();

const Opts = {
  Speed: 0.5,
  Length: 10,
  StartupDelay: 1,
  CollisionDelay: 3,
  Count: 500,
  DogeGrowthMultiplier: 1.05,
  DonutShrinkMultiplier: 0.99,
};

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const canvas = document.querySelector("canvas.webgl");

const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();
const dogeTexture = textureLoader.load("/textures/doge.png");

let { spheres, offsets } = generateSpheres(Opts.Count, dogeTexture);
const sphereCollisionDisabled = {};

let donut = generateDonut();

const reloadScene = (count) => {
  scene.clear();
  const newSpheres = generateSpheres(count, dogeTexture);
  spheres = newSpheres.spheres;
  offsets = newSpheres.offsets;
  donut = generateDonut();
  scene.add(...spheres, donut);
  clock.start();
};

document.querySelector("button.reset").addEventListener("click", () => {
  reloadScene(Opts.Count); // If Control has been used it uses its last value
});

scene.add(...spheres, donut);

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.01,
  25
);
camera.position.x = 1;
camera.position.y = 0;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const elapsedAfterStartup = elapsedTime - Opts.StartupDelay;
  const elapsedAfterCollisionsOn = elapsedAfterStartup - Opts.CollisionDelay;

  // Do not start immediately
  if (elapsedAfterStartup > 0) {
    const donutBoundingBox = new THREE.Box3().setFromObject(donut);

    spheres.forEach((sphere, i) => {
      if (elapsedAfterCollisionsOn > 0) {
        const sphereBox = new THREE.Box3().setFromObject(sphere);

        if (
          sphereBox.intersectsBox(donutBoundingBox) &&
          !sphereCollisionDisabled[i]
        ) {
          donut.scale.set(
            donut.scale.x * Opts.DonutShrinkMultiplier,
            donut.scale.y * Opts.DonutShrinkMultiplier,
            donut.scale.z * Opts.DonutShrinkMultiplier
          );

          sphere.scale.set(
            sphere.scale.x * Opts.DogeGrowthMultiplier,
            sphere.scale.y * Opts.DogeGrowthMultiplier,
            sphere.scale.z * Opts.DogeGrowthMultiplier
          );
          sphereCollisionDisabled[i] = true;
          sphere.material.color.setHex(0xff0000);

          setTimeout(() => {
            sphere.material.color.setHex(0xffffff);
            sphereCollisionDisabled[i] = false;
          }, 1000);
        }
      }

      sphere.position.set(
        Math.sin(elapsedAfterStartup * offsets[i][0] * Opts.Speed) *
          Opts.Length,
        Math.sin(elapsedAfterStartup * offsets[i][1] * Opts.Speed) *
          Opts.Length,
        Math.sin(elapsedAfterStartup * offsets[i][2] * Opts.Speed) * Opts.Length
      );
    });
  }

  donut.rotateY(Math.cos(elapsedTime) * 0.1);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

/**
 * Debug Controls
 */
const sphereFolder = gui.addFolder("Doge");
const donutFolder = gui.addFolder("Donut");
const delayFolder = gui.addFolder("Delays");
const cameraFolder = gui.addFolder("Camera");

sphereFolder.add(Opts, "Speed").min(0.05).max(2);
sphereFolder.add(Opts, "Length").min(1).max(100);
sphereFolder.add(Opts, "DogeGrowthMultiplier").min(1.01).max(3);
sphereFolder
  .add(Opts, "Count")
  .min(50)
  .max(10000)
  .onChange((value) => {
    Opts.Count = value;
  })
  .onFinishChange(() => reloadScene(Opts.Count));

donutFolder.add(Opts, "DonutShrinkMultiplier").min(0.1).max(0.99);

delayFolder
  .add(Opts, "StartupDelay")
  .min(0)
  .max(5)
  .onFinishChange(() => reloadScene(Opts.Count));
delayFolder
  .add(Opts, "CollisionDelay")
  .min(0)
  .max(5)
  .onFinishChange(() => reloadScene(Opts.Count));

cameraFolder
  .add(camera, "near")
  .min(0.0001)
  .max(1)
  .onFinishChange(() => camera.updateProjectionMatrix());
cameraFolder
  .add(camera, "far")
  .min(1)
  .max(10000)
  .onFinishChange(() => camera.updateProjectionMatrix());
