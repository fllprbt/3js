import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Generate a random x,y,z offset from -1 to 1
const normalizedRand = () => (Math.random() - 0.5) * 2;

const Opts = {
  Speed: 0.5,
  Length: 10,
  StartupDelay: 1,
  CollisionDelay: 3,
};

const COUNT = 500;

const canvas = document.querySelector("canvas.webgl");

const textureLoader = new THREE.TextureLoader();

const dogeTexture = textureLoader.load("/textures/doge.png");

// Scene
const scene = new THREE.Scene();

const material = new THREE.MeshBasicMaterial();
const geometry = new THREE.SphereGeometry(0.2, 16, 16);

const { spheres, offsets } = Array.from({
  length: COUNT,
}).reduce(
  (acc) => {
    const sphere = new THREE.Mesh(geometry, material.clone());
    sphere.material.map = dogeTexture;
    acc.spheres.push(sphere);

    const sphereOffset = [normalizedRand(), normalizedRand(), normalizedRand()];
    acc.offsets.push(sphereOffset);
    return acc;
  },
  { spheres: [], offsets: [] }
);

const donut = new THREE.Mesh(
  new THREE.TorusGeometry(1, 0.4),
  new THREE.MeshNormalMaterial()
);

scene.add(...spheres, donut);

/**
 * Sizes
 */
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
const clock = new THREE.Clock();

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
          sphere.material.color.r === 1 // Not growing
        ) {
          donut.scale.set(
            donut.scale.x * 0.99,
            donut.scale.y * 0.99,
            donut.scale.z * 0.99
          );

          sphere.scale.set(
            sphere.scale.x * 1.01,
            sphere.scale.y * 1.01,
            sphere.scale.z * 1.01
          );
          sphere.material.color.setHex(0xff0000);
          setTimeout(() => sphere.material.color.setHex(0xffffff), 1000);
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
