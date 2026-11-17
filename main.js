
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

camera.position.z = 12;

function crearPoligono(vertices, material) {
    const shape = new THREE.Shape();

    shape.moveTo(vertices[0].x, vertices[0].y);

    for (let i = 1; i < vertices.length; i++) {
        shape.lineTo(vertices[i].x, vertices[i].y);
    }

    const geometry = new THREE.ShapeGeometry(shape);
    return new THREE.Mesh(geometry, material);
}

const textureLoader = new THREE.TextureLoader();

const textureWood = textureLoader.load("/wood.jpg");
textureWood.colorSpace = THREE.SRGBColorSpace;
textureWood.wrapS = THREE.RepeatWrapping;
textureWood.wrapT = THREE.RepeatWrapping;

const matMadera = new THREE.MeshBasicMaterial({
    map: textureWood,
    side: THREE.DoubleSide
});

const matPasto = new THREE.MeshBasicMaterial({
    color: 0x2e8b57,
    side: THREE.DoubleSide
});

const matTecho = new THREE.MeshBasicMaterial({
    color: 0xb22222,
    side: THREE.DoubleSide
});

const matPuerta = new THREE.MeshBasicMaterial({
    color: 0x4a2e1b,
    side: THREE.DoubleSide
});

const matSol = new THREE.MeshBasicMaterial({
    color: 0xffd700,
    side: THREE.DoubleSide
});

const matHojas = new THREE.MeshBasicMaterial({
    color: 0x228b22,
    side: THREE.DoubleSide
});

const matAspas = new THREE.MeshBasicMaterial({
    color: 0xf5f5dc,
    side: THREE.DoubleSide
});

const suelo = crearPoligono([
    new THREE.Vector2(-10, -5),
    new THREE.Vector2(10, -5),
    new THREE.Vector2(10, -2),
    new THREE.Vector2(-10, -2)
], matPasto);

scene.add(suelo);

const casa = crearPoligono([
    new THREE.Vector2(-3, -2),
    new THREE.Vector2(0, -2),
    new THREE.Vector2(0, 0.5),
    new THREE.Vector2(-3, 0.5)
], matMadera);

scene.add(casa);

const techo = crearPoligono([
    new THREE.Vector2(-3.4, 0.5),
    new THREE.Vector2(0.4, 0.5),
    new THREE.Vector2(-1.5, 2.2)
], matTecho);

scene.add(techo);

const puerta = crearPoligono([
    new THREE.Vector2(-1.9, -2),
    new THREE.Vector2(-1.1, -2),
    new THREE.Vector2(-1.1, -0.6),
    new THREE.Vector2(-1.9, -0.6)
], matPuerta);

scene.add(puerta);

const geoSol = new THREE.CircleGeometry(0.8, 32);
const sol = new THREE.Mesh(geoSol, matSol);

sol.position.set(-4.5, 3.2, -1);
scene.add(sol);

const tronco = crearPoligono([
    new THREE.Vector2(-5.2, -2),
    new THREE.Vector2(-4.6, -2),
    new THREE.Vector2(-4.6, 0),
    new THREE.Vector2(-5.2, 0)
], matMadera);

scene.add(tronco);

const geoCopa = new THREE.CircleGeometry(1.2, 16);
const copa = new THREE.Mesh(geoCopa, matHojas);

copa.position.set(-4.9, 0.8, 0.1);
scene.add(copa);

const torreMolino = crearPoligono([
    new THREE.Vector2(2.2, -2),
    new THREE.Vector2(3.4, -2),
    new THREE.Vector2(3.1, 1.2),
    new THREE.Vector2(2.5, 1.2)
], matMadera);

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

const tilesHor = 9;
const tilesVer = 5;

function crearPersonaje(rutaImagen, posX, posY, posZ, tileInicial = 36, invertirX = false) {

    const map = textureLoader.load(rutaImagen);

    map.colorSpace = THREE.SRGBColorSpace;
    map.magFilter = THREE.NearestFilter;

    map.repeat.set(
        (invertirX ? -1 : 1) / tilesHor,
        1 / tilesVer
    );

    const mat = new THREE.SpriteMaterial({
        map: map,
        transparent: true
    });

    const sprite = new THREE.Sprite(mat);

    sprite.scale.set(1.2, 1.5, 1);
    sprite.position.set(posX, posY, posZ);

    scene.add(sprite);

    return {
        sprite,
        map,
        invertirX,
        currentTile: tileInicial
    };
}

const robot = crearPersonaje(
    "/Robot/Tilesheet/character_robot_sheet.png",
    0.7, -1.35, 0.2
);

const aventurera = crearPersonaje(
    "/Female adventurer/Tilesheet/character_femaleAdventurer_sheet.png",
    -0.5, -1.35, 0.3
);

const zombie = crearPersonaje(
    "/Zombie/Tilesheet/character_zombie_sheet.png",
    4.2, -1.35, 0.2, 36, true
);

function actualizarFrame(personaje, frameIndex) {

    const col = frameIndex % tilesHor;
    const row = Math.floor(frameIndex / tilesHor);

    personaje.map.offset.x = personaje.invertirX
        ? (col + 1) / tilesHor
        : col / tilesHor;

    personaje.map.offset.y = (tilesVer - row - 1) / tilesVer;
}

const framesCaminar = [36, 37, 38, 39, 40, 41, 42, 43];

let ultimoCambio = 0;
let indiceFrame = 0;

const robotXInicial = robot.sprite.position.x;
const aventureraYInicial = aventurera.sprite.position.y;

function animate(time) {

    const t = time * 0.001;

    pivotMolino.rotation.z -= 0.025;

    copa.rotation.z = Math.sin(t) * 0.04;

    const escalaSol = 1 + Math.sin(t * 2) * 0.12;

    sol.scale.set(
        escalaSol,
        escalaSol,
        1
    );

    robot.sprite.position.x =
        robotXInicial + Math.sin(t * 1.5) * 0.7;

    robot.sprite.position.y =
        -1.35 + Math.abs(Math.sin(t * 3)) * 0.2;

    aventurera.sprite.position.y =
        aventureraYInicial + Math.sin(t * 3) * 0.15;

    const escalaAventurera = 1 + Math.sin(t * 3) * 0.04;

    aventurera.sprite.scale.set(
        1.2 * escalaAventurera,
        1.5 * escalaAventurera,
        1
    );

    zombie.sprite.position.x -= 0.018;

    if (zombie.sprite.position.x < 1.3) {
        zombie.sprite.position.x = 5.5;
    }

    if (time - ultimoCambio > 100) {

        indiceFrame = (indiceFrame + 1) % framesCaminar.length;

        const tileActual = framesCaminar[indiceFrame];

        actualizarFrame(robot, tileActual);
        actualizarFrame(aventurera, tileActual);
        actualizarFrame(zombie, tileActual);

        ultimoCambio = time;
    }

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", () => {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});
