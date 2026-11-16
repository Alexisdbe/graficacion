import * as THREE from 'three';

const scene = new THREE.Scene();
// Color de fondo tipo cielo despejado
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
camera.position.z = 7;

// Función auxiliar para crear polígonos personalizados desde vértices
function crearPoligono(vertices, material) {
  const shape = new THREE.Shape();
  shape.moveTo(vertices[0].x, vertices[0].y);
  for (let i = 1; i < vertices.length; i++) {
    shape.lineTo(vertices[i].x, vertices[i].y);
  }
  const geometry = new THREE.ShapeGeometry(shape);
  return new THREE.Mesh(geometry, material);
}

// --- CARGA DE TEXTURAS ---
const textureLoader = new THREE.TextureLoader();

// Textura de madera (asegúrate de que wood.jpg también esté dentro de public/ o cambia la ruta)
const textureWood = textureLoader.load("/wood.jpg");
textureWood.colorSpace = THREE.SRGBColorSpace;
textureWood.wrapS = THREE.RepeatWrapping;
textureWood.wrapT = THREE.RepeatWrapping;

// --- MATERIALES ---
const matMadera = new THREE.MeshBasicMaterial({ map: textureWood, side: THREE.DoubleSide });
const matPasto = new THREE.MeshBasicMaterial({ color: 0x2e8b57, side: THREE.DoubleSide });
const matTecho = new THREE.MeshBasicMaterial({ color: 0xb22222, side: THREE.DoubleSide });
const matPuerta = new THREE.MeshBasicMaterial({ color: 0x4a2e1b, side: THREE.DoubleSide });
const matSol = new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide });
const matHojas = new THREE.MeshBasicMaterial({ color: 0x228b22, side: THREE.DoubleSide });
const matAspas = new THREE.MeshBasicMaterial({ color: 0xf5f5dc, side: THREE.DoubleSide });

// ==========================================
// ELEMENTOS DE LA ESCENA (8 figuras en total)
// ==========================================

// 1. SUELO / PASTO
const verticesSuelo = [
  new THREE.Vector2(-10, -5),
  new THREE.Vector2(10, -5),
  new THREE.Vector2(10, -2),
  new THREE.Vector2(-10, -2)
];
const suelo = crearPoligono(verticesSuelo, matPasto);
scene.add(suelo);

// 2. PARED DE LA CASA
const verticesCasa = [
  new THREE.Vector2(-3, -2),
  new THREE.Vector2(0, -2),
  new THREE.Vector2(0, 0.5),
  new THREE.Vector2(-3, 0.5)
];
const casa = crearPoligono(verticesCasa, matMadera);
scene.add(casa);

// 3. TECHO DE LA CASA
const verticesTecho = [
  new THREE.Vector2(-3.4, 0.5),
  new THREE.Vector2(0.4, 0.5),
  new THREE.Vector2(-1.5, 2.2)
];
const techo = crearPoligono(verticesTecho, matTecho);
scene.add(techo);

// 4. PUERTA DE LA CASA
const verticesPuerta = [
  new THREE.Vector2(-1.9, -2),
  new THREE.Vector2(-1.1, -2),
  new THREE.Vector2(-1.1, -0.6),
  new THREE.Vector2(-1.9, -0.6)
];
const puerta = crearPoligono(verticesPuerta, matPuerta);
scene.add(puerta);

// 5. SOL
const geoSol = new THREE.CircleGeometry(0.8, 32);
const sol = new THREE.Mesh(geoSol, matSol);
sol.position.set(-4.5, 3.2, -1);
scene.add(sol);

// 6. TRONCO DEL ÁRBOL
const verticesTronco = [
  new THREE.Vector2(-5.2, -2),
  new THREE.Vector2(-4.6, -2),
  new THREE.Vector2(-4.6, 0),
  new THREE.Vector2(-5.2, 0)
];
const tronco = crearPoligono(verticesTronco, matMadera);
scene.add(tronco);

// 7. COPA DEL ÁRBOL
const geoCopa = new THREE.CircleGeometry(1.2, 16);
const copa = new THREE.Mesh(geoCopa, matHojas);
copa.position.set(-4.9, 0.8, 0.1);
scene.add(copa);

// 8. MOLINO DE VIENTO CON PIVOTE DE ROTACIÓN
const verticesTorre = [
  new THREE.Vector2(2.2, -2),
  new THREE.Vector2(3.4, -2),
  new THREE.Vector2(3.1, 1.2),
  new THREE.Vector2(2.5, 1.2)
];
const torreMolino = crearPoligono(verticesTorre, matMadera);
scene.add(torreMolino);

const pivotMolino = new THREE.Group();
pivotMolino.position.set(2.8, 1.1, 0.1);
scene.add(pivotMolino);

const geoAspa1 = new THREE.PlaneGeometry(0.25, 2.4);
const aspa1 = new THREE.Mesh(geoAspa1, matAspas);

const geoAspa2 = new THREE.PlaneGeometry(2.4, 0.25);
const aspa2 = new THREE.Mesh(geoAspa2, matAspas);

pivotMolino.add(aspa1);
pivotMolino.add(aspa2);

// ==========================================
// PERSONAJES (TILESHEETS DE KENNEY: 9x5)
// ==========================================
const tilesHor = 9;
const tilesVer = 5;

function crearPersonaje(rutaImagen, posX, posY, posZ, tileInicial = 0, invertirX = false) {
  const map = textureLoader.load(rutaImagen);
  map.colorSpace = THREE.SRGBColorSpace;
  map.magFilter = THREE.NearestFilter;
  map.repeat.set((invertirX ? -1 : 1) / tilesHor, 1 / tilesVer);

  const mat = new THREE.SpriteMaterial({ map: map, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.2, 1.5, 1);
  sprite.position.set(posX, posY, posZ);
  scene.add(sprite);

  return { sprite, map, invertirX, currentTile: tileInicial };
}

// Rutas apuntando directo a tus carpetas dentro de public/
const robot = crearPersonaje("/Robot/Tilesheet/character_robot_sheet.png", 0.7, -1.35, 0.2, 36);
const aventurera = crearPersonaje("/Female adventurer/Tilesheet/character_femaleAdventurer_sheet.png", -0.5, -1.35, 0.3, 36);
const zombie = crearPersonaje("/Zombie/Tilesheet/character_zombie_sheet.png", 4.2, -1.35, 0.2, 36, true);

function actualizarFrame(personaje, frameIndex) {
  const col = frameIndex % tilesHor;
  const row = Math.floor(frameIndex / tilesHor);
  
  personaje.map.offset.x = personaje.invertirX 
    ? (col + 1) / tilesHor 
    : col / tilesHor;
  personaje.map.offset.y = (tilesVer - row - 1) / tilesVer;
}

// --- ANIMACIÓN ---
const framesCaminar = [36, 37, 38, 39, 40, 41, 42, 43];
let ultimoCambio = 0;
let indiceFrame = 0;

function animate(time) {
  // Rotación continua de las aspas del molino
  pivotMolino.rotation.z -= 0.015;

  // Cambiar cuadro de animación de los personajes cada 100 ms
  if (time - ultimoCambio > 100) {
    indiceFrame = (indiceFrame + 1) % framesCaminar.length;
    const tileActual = framesCaminar[indiceFrame];

    actualizarFrame(robot, tileActual);
    actualizarFrame(aventurera, tileActual);
    actualizarFrame(zombie, tileActual);

    ultimoCambio = time;
  }

  // Movimiento horizontal del zombie
  zombie.sprite.position.x -= 0.015;
  if (zombie.sprite.position.x < 1.3) {
    zombie.sprite.position.x = 5.5;
  }

  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);