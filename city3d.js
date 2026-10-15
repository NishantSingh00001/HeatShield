(() => {
  const PLACES = [
    { id: 'thane-west', name: 'Thane West', lat: 19.1972, lon: 72.9637 },
    { id: 'majiwada', name: 'Majiwada', lat: 19.2183, lon: 72.9781 },
    { id: 'naupada', name: 'Naupada', lat: 19.1945, lon: 72.9631 },
    { id: 'wagle-estate', name: 'Wagle Estate', lat: 19.2106, lon: 72.9618 },
    { id: 'kalwa', name: 'Kalwa', lat: 19.1900, lon: 72.9992 },
    { id: 'kasarvadavali', name: 'Kasarvadavali', lat: 19.2670, lon: 72.9713 },
    { id: 'ghodbunder', name: 'Ghodbunder Road', lat: 19.2580, lon: 72.9780 }
  ];
  const $ = (s, r = document) => r.querySelector(s);
  const colorFor = value => value >= 38 ? '#c94e38' : value >= 34 ? '#e17b45' : value >= 30 ? '#e7ae62' : '#7cae9f';
  const positionFor = place => ({
    x: -7.6 + ((place.lon - 72.94) / .07) * 15.2,
    z: 5.8 - ((place.lat - 19.18) / .10) * 11.6
  });

  window.initHeatCity3D = (root, suppliedPlaces = PLACES) => {
    if (!root || !window.THREE) {
      if (root) root.innerHTML = '<div class="city3d-unavailable">3D view could not load. Choose Satellite above.</div>';
      return;
    }
    const T = window.THREE;
    const width = Math.max(1, root.clientWidth);
    const height = Math.max(1, root.clientHeight);
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
    renderer.setSize(width, height);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setClearColor('#171a16', 1);
    root.querySelector('.city3d-loading')?.remove();
    renderer.domElement.className = 'city3d-canvas';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    root.prepend(renderer.domElement);

    const scene = new T.Scene();
    scene.background = new T.Color('#171a16');
    scene.fog = new T.Fog('#171a16', 29, 58);
    const camera = new T.PerspectiveCamera(34, width / height, .1, 100);
    let yaw = .56, pitch = .64, distance = Math.max(27, 15.5 / (2 * Math.tan(34 * Math.PI / 360) * Math.min(1, width / height))), targetDistance = distance, userZoomed = false;
    const target = new T.Vector3(0, .15, 0), desired = target.clone();

    scene.add(new T.HemisphereLight('#e3dbc9', '#303a30', 2.3));
    const sun = new T.DirectionalLight('#ffe1b4', 3.1);
    sun.position.set(-9, 17, 12);
    scene.add(sun);
    const coolFill = new T.DirectionalLight('#aec5bd', 1.05);
    coolFill.position.set(10, 8, -12);
    scene.add(coolFill);

    const mat = (color, roughness = .8, metalness = .02) => new T.MeshStandardMaterial({ color, roughness, metalness });
    const groundMat = mat('#374038');
    const ground = new T.Mesh(new T.BoxGeometry(17.4, .55, 13.4), mat('#343a31'));
    ground.position.set(0, -.29, 0);
    scene.add(ground);
    const top = new T.Mesh(new T.BoxGeometry(17.08, .12, 13.08), groundMat);
    top.position.set(0, .045, 0);
    scene.add(top);

    const streetMat = mat('#242a25', .96);
    for (let x = -7.5; x <= 7.6; x += 3.1) {
      const road = new T.Mesh(new T.BoxGeometry(.2, .025, 12.6), streetMat);
      road.position.set(x, .12, 0); scene.add(road);
    }
    for (let z = -5.5; z <= 5.6; z += 2.65) {
      const road = new T.Mesh(new T.BoxGeometry(16.5, .026, .19), streetMat);
      road.position.set(0, .125, z); scene.add(road);
    }
    const avenueCurve = new T.CatmullRomCurve3([
      new T.Vector3(-8, .15, 4.9), new T.Vector3(-4.5, .15, 2.3), new T.Vector3(-.2, .15, 1.5), new T.Vector3(3.8, .15, -.3), new T.Vector3(8.4, .15, -3.2)
    ]);
    scene.add(new T.Mesh(new T.TubeGeometry(avenueCurve, 80, .075, 5, false), mat('#8d7458', .66)));

    const creekCurve = new T.CatmullRomCurve3([
      new T.Vector3(6.6, .19, -7), new T.Vector3(5.55, .19, -4.6), new T.Vector3(6.35, .19, -2.1),
      new T.Vector3(5.15, .19, .7), new T.Vector3(6.2, .19, 3.2), new T.Vector3(5.2, .19, 6.8)
    ]);
    const creek = new T.Mesh(new T.TubeGeometry(creekCurve, 100, .53, 12, false), new T.MeshStandardMaterial({ color: '#567c79', roughness: .32, metalness: .14 }));
    scene.add(creek);
    const waterline = new T.Mesh(new T.TubeGeometry(creekCurve, 100, .08, 8, false), new T.MeshBasicMaterial({ color: '#b0c1a5', transparent: true, opacity: .28 }));
    scene.add(waterline);

    // A restrained grid of buildings, with taller clusters around the central growth corridor.
    let seed = 451;
    const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const buildingMats = ['#858879', '#aba58f', '#6d7971', '#b5a68d', '#8e9787', '#746e61'].map(c => mat(c, .86));
    const roofMat = mat('#c8b89b', .82);
    const windowMat = new T.MeshStandardMaterial({ color: '#d8b18a', roughness: .36, emissive: '#805b42', emissiveIntensity: .12 });
    const blocks = [];
    for (let row = 0; row < 12; row++) {
      for (let col = 0; col < 16; col++) {
        if (col % 3 === 0 || row % 3 === 0) continue;
        const x = -7.65 + col * 1.02 + (rand() - .5) * .16;
        const z = -5.75 + row * 1.02 + (rand() - .5) * .16;
        const nearCentre = Math.max(0, 1 - Math.hypot(x - .2, z + .4) / 8);
        const tower = rand() < .12 + nearCentre * .2;
        const h = tower ? 1.35 + rand() * 1.55 : .36 + rand() * .75;
        const w = tower ? .52 + rand() * .22 : .58 + rand() * .23;
        const d = tower ? .5 + rand() * .24 : .56 + rand() * .2;
        const body = new T.Mesh(new T.BoxGeometry(w, h, d), buildingMats[Math.floor(rand() * buildingMats.length)]);
        body.position.set(x, .14 + h / 2, z);
        scene.add(body); blocks.push(body);
        const roof = new T.Mesh(new T.BoxGeometry(w * .88, .035, d * .88), roofMat);
        roof.position.set(x, .14 + h + .018, z); scene.add(roof);
        if (tower && rand() > .38) {
          const cap = new T.Mesh(new T.BoxGeometry(w * .32, .12, d * .32), windowMat);
          cap.position.set(x + w * .12, .14 + h + .09, z - d * .1); scene.add(cap);
        }
      }
    }

    // Green pockets and small tree groups break up the built fabric.
    const parkMat = mat('#586d4f');
    const trunkMat = mat('#715a43');
    const canopyMats = ['#82916b', '#6c8262', '#9a9a70'].map(c => mat(c, .92));
    const trees = [];
    for (const [px, pz, sx, sz] of [[-6.1, 4.1, 1.35, 1.15], [-4.8, -3.8, 1.15, 1.3], [.7, 4.5, 1.45, .9], [3.5, -4.8, 1.35, .9], [2.4, 3.7, .9, 1.1]]) {
      const lawn = new T.Mesh(new T.BoxGeometry(sx, .06, sz), parkMat);
      lawn.position.set(px, .15, pz); scene.add(lawn);
      for (let i = 0; i < 7; i++) {
        const tx = px + (rand() - .5) * sx * .82, tz = pz + (rand() - .5) * sz * .82;
        const trunk = new T.Mesh(new T.CylinderGeometry(.045, .06, .36, 5), trunkMat);
        trunk.position.set(tx, .36, tz); scene.add(trunk);
        const crown = new T.Mesh(new T.IcosahedronGeometry(.2 + rand() * .1, 1), canopyMats[Math.floor(rand() * canopyMats.length)]);
        crown.position.set(tx, .64 + rand() * .12, tz); scene.add(crown); trees.push(crown);
      }
    }
    // A low forested ridge hints at the green hills west of the city.
    for (let i = 0; i < 16; i++) {
      const hill = new T.Mesh(new T.ConeGeometry(.75 + rand() * .8, 1.7 + rand() * 1.4, 7), canopyMats[i % canopyMats.length]);
      hill.position.set(-8 + rand() * 5, .5 + rand() * .28, -5.5 + rand() * 1.2);
      scene.add(hill);
    }

    // Atmospheric heat plumes use live apparent-temperature values, not building-level observations.
    const glowCanvas = document.createElement('canvas'); glowCanvas.width = glowCanvas.height = 256;
    const gctx = glowCanvas.getContext('2d');
    const gradient = gctx.createRadialGradient(128, 128, 5, 128, 128, 126);
    gradient.addColorStop(0, 'rgba(255,255,255,1)'); gradient.addColorStop(.15, 'rgba(255,255,255,.82)');
    gradient.addColorStop(.48, 'rgba(255,255,255,.32)'); gradient.addColorStop(1, 'rgba(255,255,255,0)');
    gctx.fillStyle = gradient; gctx.fillRect(0, 0, 256, 256);
    const glowTexture = new T.CanvasTexture(glowCanvas);
    const glowSprites = [], pins = [], labels = [];
    const labelsRoot = document.createElement('div'); labelsRoot.className = 'city3d-labels'; root.appendChild(labelsRoot);
    suppliedPlaces.forEach((place, i) => {
      const pos = positionFor(place);
      const glow = new T.Sprite(new T.SpriteMaterial({ map: glowTexture, color: '#d78359', transparent: true, opacity: .48, blending: T.AdditiveBlending, depthWrite: false }));
      glow.position.set(pos.x, 1.55, pos.z); glow.scale.set(5.2, 4.3, 1); scene.add(glow); glowSprites.push(glow);
      const marker = new T.Mesh(new T.SphereGeometry(.105, 14, 10), new T.MeshBasicMaterial({ color: '#f2c391' }));
      marker.position.set(pos.x, 2.5, pos.z); scene.add(marker); pins.push(marker);
      const label = document.createElement('button'); label.className = 'city3d-label'; label.type = 'button';
      label.innerHTML = `<span>${place.name}</span><b data-city3d-temp="${place.id}">—°</b>`;
      label.addEventListener('click', () => window.focusHeatCity?.(place.id)); labelsRoot.appendChild(label);
      labels.push({ node: label, marker, place });
    });

    const selection = new T.Mesh(new T.RingGeometry(.47, .53, 48), new T.MeshBasicMaterial({ color: '#e1a278', transparent: true, opacity: .85, side: T.DoubleSide }));
    selection.rotation.x = -Math.PI / 2; selection.position.y = .205; scene.add(selection);
    const updateSelection = id => { const place = suppliedPlaces.find(p => p.id === id) || suppliedPlaces[1]; if (place) { const pos = positionFor(place); selection.position.x = pos.x; selection.position.z = pos.z; } };
    updateSelection('majiwada');

    let mode = 'city3d', dragging = false, pointerX = 0, pointerY = 0;
    renderer.domElement.addEventListener('pointerdown', e => { dragging = true; pointerX = e.clientX; pointerY = e.clientY; renderer.domElement.setPointerCapture(e.pointerId); });
    renderer.domElement.addEventListener('pointermove', e => {
      if (dragging) { const dx = e.clientX - pointerX, dy = e.clientY - pointerY; yaw -= dx * .004; pitch = Math.min(1.04, Math.max(.35, pitch + dy * .0026)); pointerX = e.clientX; pointerY = e.clientY; }
    });
    renderer.domElement.addEventListener('pointerup', () => { dragging = false; });
    renderer.domElement.addEventListener('pointercancel', () => { dragging = false; });
    renderer.domElement.addEventListener('wheel', e => { e.preventDefault(); userZoomed = true; targetDistance = Math.min(58, Math.max(9.5, targetDistance + Math.sign(e.deltaY) * 1.3)); }, { passive: false });

    const resize = () => { const w = Math.max(1, root.clientWidth), h = Math.max(1, root.clientHeight); renderer.setSize(w, h); camera.aspect = w / h; if (!userZoomed) distance = targetDistance = Math.max(27, 15.5 / (2 * Math.tan(34 * Math.PI / 360) * Math.min(1, w / h))); camera.updateProjectionMatrix(); };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(root);
    window.setHeatCityMode = next => { mode = next; root.style.visibility = next === 'city3d' ? 'visible' : 'hidden'; };
    window.focusHeatCity = id => {
      const place = suppliedPlaces.find(p => p.id === id); if (!place) return;
      const pos = positionFor(place); desired.set(pos.x, .28, pos.z); targetDistance = 13.2; userZoomed = true; updateSelection(id);
      labels.forEach(item => item.node.classList.toggle('is-current', item.place.id === id));
    };
    window.updateHeatCity3D = readings => {
      readings.forEach((r, i) => {
        const glow = glowSprites[i], marker = pins[i], color = colorFor(Number(r.apparent_temperature));
        if (glow) glow.material.color.set(color);
        if (marker) marker.material.color.set(color);
        const label = $(`[data-city3d-temp="${r.id}"]`, labelsRoot); if (label) label.textContent = `${Math.round(r.apparent_temperature)}°`;
      });
    };
    window.setHeatCityTheme = theme => {
      const bg = theme === 'light' ? '#e9e3d3' : '#171a16'; scene.background = new T.Color(bg); scene.fog.color.set(bg); renderer.setClearColor(bg, 1);
    };

    const clock = new T.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      if (mode === 'city3d') {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!dragging && !reduceMotion) yaw += .00026;
        target.lerp(desired, .035); distance += (targetDistance - distance) * .035;
        const horizontal = Math.cos(pitch) * distance;
        camera.position.set(target.x + Math.sin(yaw) * horizontal, target.y + Math.sin(pitch) * distance, target.z + Math.cos(yaw) * horizontal);
        camera.lookAt(target);
        if (!reduceMotion) { glowSprites.forEach((sprite, i) => { const s = 1 + Math.sin(elapsed * .7 + i * .8) * .055; sprite.scale.set(4.6 * s, 3.8 * s, 1); }); selection.scale.setScalar(1 + Math.sin(elapsed * 2.2) * .13); trees.forEach((tree, i) => { tree.rotation.z = Math.sin(elapsed * .65 + i) * .025; }); }
        const rect = root.getBoundingClientRect();
        labels.forEach(({ node, marker }) => {
          const projected = marker.position.clone().project(camera);
          const x = (projected.x * .5 + .5) * rect.width, y = (-projected.y * .5 + .5) * rect.height;
          const visible = projected.z > -1 && projected.z < 1 && x > 0 && x < rect.width && y > 0 && y < rect.height;
          node.style.opacity = visible ? '.94' : '0'; node.style.left = `${x}px`; node.style.top = `${y}px`;
        });
      }
      renderer.render(scene, camera);
    };
    window.setHeatCityTheme(document.documentElement.dataset.theme || 'dark');
    labels.forEach(item => item.node.classList.toggle('is-current', item.place.id === 'majiwada'));
    animate();
  };
})();
