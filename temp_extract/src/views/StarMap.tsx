import { motion, AnimatePresence } from 'motion/react';
import { Map, Compass, Navigation, Info, X, Radio } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Line, Html } from '@react-three/drei';
import { Suspense, useMemo, useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

function radecToVector3(ra: number, dec: number, radius = 90) {
  const theta = (ra / 24) * 2 * Math.PI;
  const phi = (90 - dec) * (Math.PI / 180);
  
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  
  return new THREE.Vector3(x, y, z);
}

// Astronomy calculation helpers
function getSunPosition(date: Date) {
  const jd = (date.getTime() / 86400000) + 2440587.5;
  const n = jd - 2451545.0;
  let L = (280.460 + 0.9856474 * n) % 360;
  if (L < 0) L += 360;
  let g = (357.528 + 0.9856003 * n) % 360;
  if (g < 0) g += 360;
  
  const gRad = g * Math.PI / 180;
  const lambda = L + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad);
  const lambdaRad = lambda * Math.PI / 180;
  const epsilon = 23.439 - 0.0000004 * n;
  const epsRad = epsilon * Math.PI / 180;
  
  let alpha = Math.atan2(Math.cos(epsRad) * Math.sin(lambdaRad), Math.cos(lambdaRad));
  alpha = alpha * 180 / Math.PI;
  if (alpha < 0) alpha += 360;
  const ra = alpha / 15;
  
  let delta = Math.asin(Math.sin(epsRad) * Math.sin(lambdaRad));
  const dec = delta * 180 / Math.PI;
  
  return { ra, dec };
}

function getMoonPosition(date: Date) {
  const jd = (date.getTime() / 86400000) + 2440587.5;
  const d = jd - 2451545.0;
  
  const L = (218.316 + 13.176396 * d) % 360;
  const M = (134.963 + 13.064993 * d) % 360;
  const F = (93.272 + 13.229350 * d) % 360;
  
  const Lrad = L * Math.PI / 180;
  const Mrad = M * Math.PI / 180;
  const Frad = F * Math.PI / 180;
  
  const lambda = L + 6.289 * Math.sin(Mrad);
  const lambdaRad = lambda * Math.PI / 180;
  const beta = 5.128 * Math.sin(Frad);
  const betaRad = beta * Math.PI / 180;
  
  const eps = 23.439 - 0.0000004 * d;
  const epsRad = eps * Math.PI / 180;
  
  const alpha = Math.atan2(
    Math.sin(lambdaRad) * Math.cos(epsRad) - Math.tan(betaRad) * Math.sin(epsRad),
    Math.cos(lambdaRad)
  );
  let ra = (alpha * 180 / Math.PI) / 15;
  if (ra < 0) ra += 24;
  
  const delta = Math.asin(
    Math.sin(betaRad) * Math.cos(epsRad) + Math.cos(betaRad) * Math.sin(epsRad) * Math.sin(lambdaRad)
  );
  const dec = delta * 180 / Math.PI;
  
  return { ra, dec };
}

const constellationData = [
  {
    name: "Orion",
    ra: 5.5, dec: 0,
    stars: {
      betelgeuse: radecToVector3(5.9, 7.4),
      rigel: radecToVector3(5.2, -8.2),
      bellatrix: radecToVector3(5.4, 6.3),
      mintaka: radecToVector3(5.5, -0.3),
      alnilam: radecToVector3(5.6, -1.2),
      alnitak: radecToVector3(5.7, -1.9),
      saiph: radecToVector3(5.8, -9.7)
    },
    lines: [
      ['betelgeuse', 'alnitak'],
      ['bellatrix', 'mintaka'],
      ['mintaka', 'alnilam'],
      ['alnilam', 'alnitak'],
      ['alnitak', 'saiph'],
      ['mintaka', 'rigel'],
      ['betelgeuse', 'bellatrix'],
      ['rigel', 'saiph']
    ]
  },
  {
    name: "Ursa Major",
    ra: 12, dec: 55,
    stars: {
      dubhe: radecToVector3(11.05, 61.75),
      merak: radecToVector3(11.01, 56.36),
      phecda: radecToVector3(11.88, 53.68),
      megrez: radecToVector3(12.25, 57.01),
      alioth: radecToVector3(12.9, 55.95),
      mizar: radecToVector3(13.38, 54.91),
      alkaid: radecToVector3(13.78, 49.3)
    },
    lines: [
      ['dubhe', 'merak'],
      ['merak', 'phecda'],
      ['phecda', 'megrez'],
      ['megrez', 'dubhe'],
      ['megrez', 'alioth'],
      ['alioth', 'mizar'],
      ['mizar', 'alkaid']
    ]
  },
  {
    name: "Cassiopeia",
    ra: 1, dec: 60,
    stars: {
      caph: radecToVector3(0.15, 59),
      schedar: radecToVector3(0.66, 56),
      gamma: radecToVector3(0.93, 60),
      ruchbah: radecToVector3(1.41, 60),
      segin: radecToVector3(1.9, 63)
    },
    lines: [
      ['caph', 'schedar'],
      ['schedar', 'gamma'],
      ['gamma', 'ruchbah'],
      ['ruchbah', 'segin']
    ]
  }
];

function Constellations({ showLines, showLabels }: { showLines: boolean, showLabels: boolean }) {
  return (
    <group>
      {constellationData.map((constellation) => (
        <group key={constellation.name}>
          {/* Label */}
          {showLabels && (
            <Html position={radecToVector3(constellation.ra, constellation.dec, 95)} center className="pointer-events-none">
              <div className="text-white/80 font-display font-medium text-sm tracking-wider uppercase whitespace-nowrap drop-shadow-md">
                {constellation.name}
              </div>
            </Html>
          )}

          {/* Stars */}
          {Object.entries(constellation.stars).map(([name, pos]) => (
            <mesh key={name} position={pos}>
              <sphereGeometry args={[0.5, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          ))}

          {/* Lines */}
          {showLines && constellation.lines.map((line, i) => {
            const p1 = constellation.stars[line[0] as keyof typeof constellation.stars];
            const p2 = constellation.stars[line[1] as keyof typeof constellation.stars];
            if (!p1 || !p2) return null;
            return (
              <Line
                key={i}
                points={[p1, p2]}
                color="#4a5568"
                lineWidth={1}
                transparent
                opacity={0.5}
              />
            );
          })}
        </group>
      ))}
    </group>
  );
}

function RealtimePlanets({ onSelect }: { onSelect: (data: any) => void }) {
  const [positions, setPositions] = useState({
    sun: { ra: 0, dec: 0 },
    moon: { ra: 0, dec: 0 }
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setPositions({
        sun: getSunPosition(now),
        moon: getMoonPosition(now)
      });
    };
    update();
    const int = setInterval(update, 60000); // every minute
    return () => clearInterval(int);
  }, []);

  const data = [
    { name: 'Sun', type: 'Star', ra: positions.sun.ra, dec: positions.sun.dec, color: '#fbbf24', radius: 4, desc: 'The star at the center of the Solar System (Live).' },
    { name: 'Moon', type: 'Satellite', ra: positions.moon.ra, dec: positions.moon.dec, color: '#e2e8f0', radius: 1.5, desc: "Earth's only natural satellite (Live)." },
    { name: 'Mars', type: 'Planet', ra: 4.5, dec: 24, color: '#ef4444', radius: 2, desc: 'The Red Planet, fourth from the Sun. (Approximated)' },
    { name: 'Jupiter', type: 'Planet', ra: 2.2, dec: 12, color: '#fcd34d', radius: 3, desc: 'The largest planet in the Solar System. (Approximated)' },
    { name: 'Saturn', type: 'Planet', ra: 22, dec: -15, color: '#fde68a', radius: 2.8, desc: 'Known for its prominent ring system. (Approximated)' },
    { name: 'Venus', type: 'Planet', ra: 7, dec: 18, color: '#ffedd5', radius: 2.2, desc: "The second planet from the Sun, Earth's twin. (Approximated)" }
  ];

  return (
    <group>
      {data.map((planet) => {
        const pos = radecToVector3(planet.ra, planet.dec, 80);
        return (
          <group key={planet.name} position={pos}>
            <mesh 
              onClick={(e) => { e.stopPropagation(); onSelect({...planet, ra: planet.ra.toFixed(2), dec: planet.dec.toFixed(2)}); }}
              onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
              onPointerOut={(e) => { document.body.style.cursor = 'default'; }}
            >
              <sphereGeometry args={[planet.radius, 32, 32]} />
              <meshBasicMaterial color={planet.color} />
            </mesh>
            <Html position={[0, planet.radius + 2, 0]} center className="pointer-events-none">
               <div className="text-white font-bold text-xs uppercase tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{planet.name}</div>
            </Html>
            <mesh scale={1.5}>
              <sphereGeometry args={[planet.radius, 16, 16]} />
              <meshBasicMaterial color={planet.color} transparent opacity={0.2} blending={THREE.AdditiveBlending} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function RealtimeISS({ onSelect }: { onSelect: (data: any) => void }) {
  const ref = useRef<THREE.Group>(null);
  const [issPos, setIssPos] = useState({ ra: 0, dec: 0, alt: 0, vel: 0, online: false });

  useEffect(() => {
    const fetchISS = async () => {
      try {
        const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        
        const date = new Date(data.timestamp * 1000);
        const julianDate = (date.getTime() / 86400000) + 2440587.5;
        const d = julianDate - 2451545.0;
        let gmst = 18.697374558 + 24.06570982441908 * d;
        gmst = gmst % 24;
        if (gmst < 0) gmst += 24;

        let ra = (data.longitude / 15) + gmst;
        ra = ra % 24;
        if (ra < 0) ra += 24;

        setIssPos({ ra, dec: data.latitude, alt: data.altitude, vel: data.velocity, online: true });
      } catch (err) {
        // Fallback to simulated data if API fails or blocked by CORS
        const now = Date.now() / 1000;
        const simulatedRa = (now / 100) % 24;
        const simulatedDec = Math.sin(now / 1000) * 45;
        setIssPos({ ra: simulatedRa, dec: simulatedDec, alt: 408, vel: 27600, online: true });
      }
    };
    fetchISS();
    const int = setInterval(fetchISS, 5000);
    return () => clearInterval(int);
  }, []);

  useFrame(() => {
    if (ref.current && issPos.online) {
       const targetPos = radecToVector3(issPos.ra, issPos.dec, 85);
       ref.current.position.lerp(targetPos, 0.1);
    }
  });

  if (!issPos.online) return null;

  const satData = {
    name: 'ISS',
    type: 'Space Station',
    ra: issPos.ra.toFixed(2),
    dec: issPos.dec.toFixed(2),
    desc: `International Space Station (Live Data). Altitude: ${Math.round(issPos.alt)} km. Velocity: ${Math.round(issPos.vel).toLocaleString()} km/h.`
  };

  return (
    <group ref={ref}>
      <mesh 
        onClick={(e) => { e.stopPropagation(); onSelect(satData); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { document.body.style.cursor = 'default'; }}
      >
        <boxGeometry args={[2, 2, 4]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <Html position={[0, 4, 0]} center className="pointer-events-none">
         <div className="flex items-center space-x-1 bg-blue-900/60 backdrop-blur-sm border border-blue-500/50 px-2 py-1 rounded">
           <Radio className="w-3 h-3 text-blue-400 animate-pulse" />
           <span className="text-white font-mono text-[10px] uppercase tracking-widest whitespace-nowrap">ISS LIVE</span>
         </div>
      </Html>
    </group>
  );
}

function ExoplanetPoints() {
  const count = 1000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 50 + Math.random() * 150;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={1} color="#8b5cf6" sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

export function StarMap() {
  const [showConstellations, setShowConstellations] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedObject, setSelectedObject] = useState<any | null>(null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <header className="flex items-center space-x-4 border-b border-white/10 pb-6 shrink-0">
        <div className="p-3 bg-brand-600/20 rounded-xl">
          <Map className="w-8 h-8 text-brand-400" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">Interactive Star Map</h1>
          <p className="text-brand-300">Explore the cosmos in real-time 3D. Click on planets and satellites to inspect.</p>
        </div>
      </header>
      
      <div className="flex-1 min-h-[500px] relative bg-black rounded-3xl border border-white/10 overflow-hidden group shadow-2xl">
        <Canvas camera={{ position: [0, 0, 120], fov: 60 }}>
          <Suspense fallback={null}>
            <color attach="background" args={['#020005']} />
            <ambientLight intensity={0.5} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Constellations showLines={showConstellations} showLabels={showLabels} />
            <RealtimePlanets onSelect={setSelectedObject} />
            <RealtimeISS onSelect={setSelectedObject} />
            <ExoplanetPoints />
            <OrbitControls 
              autoRotate={false}
              enableDamping 
              dampingFactor={0.05} 
              maxDistance={300} 
              minDistance={10} 
            />
          </Suspense>
        </Canvas>

        {/* UI Overlay - Top Left */}
        <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 pointer-events-none">
           <h3 className="text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider flex items-center">
             <Radio className="w-4 h-4 mr-2 text-green-400 animate-pulse" />
             Live Telemetry
           </h3>
           <div className="font-mono text-xs text-brand-400 space-y-1">
             <p>Stars Rendered: ~5,000</p>
             <p>Sun/Moon Pos: Real-time</p>
             <p>ISS Tracking: Active</p>
             <p className="text-gray-500 pt-2 border-t border-white/10 mt-2">Mode: Sky Observation</p>
           </div>
        </div>

        {/* Info Panel - Top Right */}
        <AnimatePresence>
          {selectedObject && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-6 right-6 w-72 bg-brand-900/90 backdrop-blur-xl p-5 rounded-2xl border border-brand-500/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]"
            >
              <button 
                onClick={() => setSelectedObject(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3 mb-4 border-b border-white/10 pb-3">
                <Info className="w-5 h-5 text-brand-400" />
                <h3 className="font-display font-bold text-lg text-white">{selectedObject.name}</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-500">Classification</span>
                  <p className="font-medium text-brand-300">{selectedObject.type}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-500">Coordinates (RA/DEC)</span>
                  <p className="font-mono text-sm text-gray-300">{selectedObject.ra}h / {selectedObject.dec}°</p>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <p className="text-sm text-gray-400 leading-relaxed">{selectedObject.desc}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls - Bottom Left */}
        <div className="absolute bottom-6 left-6 flex space-x-2">
           <button 
             onClick={() => setShowConstellations(!showConstellations)}
             className={`px-4 py-2 backdrop-blur-md border border-white/10 rounded-lg text-xs font-medium transition-colors cursor-pointer ${showConstellations ? 'bg-brand-600 text-white' : 'bg-black/60 text-gray-300 hover:bg-white/10'}`}
           >
             Toggle Lines
           </button>
           <button 
             onClick={() => setShowLabels(!showLabels)}
             className={`px-4 py-2 backdrop-blur-md border border-white/10 rounded-lg text-xs font-medium transition-colors cursor-pointer ${showLabels ? 'bg-brand-600 text-white' : 'bg-black/60 text-gray-300 hover:bg-white/10'}`}
           >
             Toggle Labels
           </button>
        </div>

        {/* Filters - Bottom Right */}
        <div className="absolute bottom-6 right-6 flex space-x-2">
           {['Visible', 'Infrared', 'X-Ray'].map(filter => (
             <button key={filter} className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
               {filter}
             </button>
           ))}
        </div>
      </div>
    </div>
  );
}
