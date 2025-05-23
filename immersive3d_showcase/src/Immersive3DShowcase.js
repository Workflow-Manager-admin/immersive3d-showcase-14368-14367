import React, { useEffect, useRef } from 'react';
// PUBLIC_INTERFACE
/**
 * The main container for the Immersive 3D Showcase using Three.js. Renders a fullscreen, scroll-reactive 3D experience
 * for company services, projects, and contact info, with animated transitions and engaging visuals.
 */
function Immersive3DShowcase() {
  const mountRef = useRef(null);
  const requestRef = useRef();
  const scrollTargetY = useRef(0);
  const cameraRef = useRef();

  useEffect(() => {
    let THREE;
    let renderer, scene, camera;
    let cube, textMesh, servicesSphere, projectsTorus, contactIcosahedron;
    let animationMixers = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    let lastScrollY = window.scrollY;

    let sections = [
      { title: "Services", position: { x: 0, y: 0, z: 0 } },
      { title: "Projects", position: { x: 0, y: -30, z: 20 } },
      { title: "Contact", position: { x: 0, y: -60, z: 0 } }
    ];

    async function loadThree() {
      // Dynamically import Three.js for code-splitting benefits
      THREE = await import('three');
      // Setup renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setClearColor(0x181818, 1);

      // Setup scene and camera
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
      camera.position.set(0, 0, 20);
      cameraRef.current = camera;

      // Ambient lighting
      const ambient = new THREE.AmbientLight(0xffffff, 1.5);
      scene.add(ambient);
      const dirLight = new THREE.DirectionalLight(0xffac6b, 0.8);
      dirLight.position.set(5, 10, 12);
      scene.add(dirLight);

      // Animated cube for logo/intro
      cube = new THREE.Mesh(
        new THREE.BoxGeometry(4, 4, 4),
        new THREE.MeshStandardMaterial({ color: 0xE87A41, metalness: .4, roughness: .3 })
      );
      cube.position.set(0, 0, 0);
      scene.add(cube);

      // "Services" scene element
      servicesSphere = new THREE.Mesh(
        new THREE.SphereGeometry(3, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x36c1e6, wireframe: true, opacity: 0.3, transparent: true })
      );
      servicesSphere.position.set(0, -30, 20);
      scene.add(servicesSphere);

      // "Projects" scene element
      projectsTorus = new THREE.Mesh(
        new THREE.TorusKnotGeometry(2, 0.5, 100, 16),
        new THREE.MeshStandardMaterial({ color: 0xff9f43, metalness: .7, roughness: .1 })
      );
      projectsTorus.position.set(0, -60, 0);
      scene.add(projectsTorus);

      // "Contact" scene element
      contactIcosahedron = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.7, 1),
        new THREE.MeshStandardMaterial({ color: 0x8affc1, wireframe: true })
      );
      contactIcosahedron.position.set(0, -90, -8);
      scene.add(contactIcosahedron);

      // Add HTML overlays for titles (optional: for accessibility/SEO)
      // For simplicity, this example uses only 3D objects, but overlays can be positioned using CSS.

      mountRef.current.appendChild(renderer.domElement);
      window.addEventListener('resize', handleResize, false);
      window.addEventListener('scroll', handleScroll, { passive: true });

      animate();
    }

    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    // Compute the scroll progress as a ratio (0.0 - 1.0).
    // Each "section" is viewport height
    function getScrollSection() {
      const total = sections.length;
      // Height per section
      const vh = window.innerHeight;
      const scroll = window.scrollY;
      let index = Math.min(
        Math.floor(scroll / vh),
        total - 1
      );
      let frac = (scroll % vh) / vh;
      return { index, frac };
    }

    // Easing function (for smooth camera transition)
    function lerp(a, b, t) {
      return a * (1 - t) + b * t;
    }

    function handleScroll() {
      scrollTargetY.current = window.scrollY;
    }

    // Animation loop
    function animate() {
      // Animate cube (logo)
      cube.rotation.x += 0.007;
      cube.rotation.y += 0.018;

      // Animate services sphere (pulsating wireframe)
      servicesSphere.scale.setScalar(1 + 0.15 * Math.sin(Date.now() * 0.001));

      // Animate torus ("projects" moving)
      projectsTorus.rotation.x += 0.012;
      projectsTorus.rotation.z += 0.017;

      // Animate contact ("icosahedron" breathing)
      const contactScale = 1 + 0.08 * Math.cos(Date.now() * 0.002);
      contactIcosahedron.scale.set(contactScale, contactScale, contactScale);

      // Camera scroll animation - transition between sections
      const vh = window.innerHeight;
      const { index, frac } = getScrollSection();
      // For current and next section, blend camera positions
      const cur = sections[index];
      const next = sections[index + 1] || sections[index];

      // Smooth transition with easing
      camera.position.x = lerp(cur.position.x, next.position.x, frac);
      camera.position.y = lerp(cur.position.y, next.position.y, frac);
      camera.position.z = lerp(cur.position.z, next.position.z, frac);

      camera.lookAt(0, camera.position.y, 0);

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    }

    // create enough scrollable area for each section
    function createScrollSections() {
      if (!document.getElementById('immersive3d-scroll-area')) {
        const scrollDiv = document.createElement('div');
        scrollDiv.style.position = 'absolute';
        scrollDiv.style.top = '0';
        scrollDiv.style.width = '100vw';
        scrollDiv.style.left = '0';
        scrollDiv.style.height = `${sections.length * 100}vh`;
        scrollDiv.style.pointerEvents = 'none';
        scrollDiv.id = 'immersive3d-scroll-area';
        document.body.appendChild(scrollDiv);
      }
    }

    // Setup
    loadThree();
    createScrollSections();

    // Cleanup
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      while (mountRef.current && mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
      // Remove scroll area
      const scrollDiv = document.getElementById('immersive3d-scroll-area');
      if (scrollDiv) document.body.removeChild(scrollDiv);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 0,
      background: 'linear-gradient(180deg, #181818 60%, #282828 100%)'
    }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} aria-label="Immersive 3D Showcase" />
      {/* Decorative floating section titles for accessibility */}
      <SectionTitles />
    </div>
  );
}

// PUBLIC_INTERFACE
/** Floating Titles displayed at top left for accessibility & orientation in 3D content */
function SectionTitles() {
  const titles = [
    { label: "Services", top: '5vh' },
    { label: "Projects", top: '38vh' },
    { label: "Contact", top: '73vh' }
  ];
  return (
    <div style={{
      position: 'fixed',
      left: '4vw',
      top: 0,
      zIndex: 2,
      pointerEvents: 'none'
    }}>
      {titles.map((t, i) => (
        <div
          key={t.label}
          style={{
            position: 'absolute',
            top: t.top,
            left: 0,
            color: 'var(--kavia-orange)',
            fontWeight: 600,
            fontSize: '2rem',
            opacity: 0.64,
            letterSpacing: '1px',
            textShadow: '1px 2px 16px #1a1a1a',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          {t.label}
        </div>
      ))}
    </div>
  );
}

export default Immersive3DShowcase;
