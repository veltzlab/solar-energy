import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, SunDim } from "@phosphor-icons/react";

interface ServiceCity {
  id: number;
  cidade: string;
  estado: string;
  lat: number;
  lng: number;
  projetos: number;
  principal?: boolean;
}

const CIDADES: ServiceCity[] = [
  { id: 1, cidade: "Governador Valadares", estado: "MG", lat: -18.8545, lng: -41.9495, projetos: 284, principal: true },
  { id: 2, cidade: "Ipatinga", estado: "MG", lat: -19.4683, lng: -42.5366, projetos: 132 },
  { id: 3, cidade: "Coronel Fabriciano", estado: "MG", lat: -19.5186, lng: -42.6286, projetos: 78 },
  { id: 4, cidade: "Caratinga", estado: "MG", lat: -19.7898, lng: -42.1383, projetos: 65 },
  { id: 5, cidade: "Teófilo Otoni", estado: "MG", lat: -17.8588, lng: -41.5052, projetos: 58 },
  { id: 6, cidade: "Resplendor", estado: "MG", lat: -19.3208, lng: -41.2486, projetos: 34 },
  { id: 7, cidade: "Aimorés", estado: "MG", lat: -19.4953, lng: -41.0661, projetos: 29 },
];

// Ícone customizado em formato de pino dourado com o logo da marca.
// A cidade principal (sede) recebe um pino maior com anel de destaque.
function createBrandIcon(principal = false) {
  const size = principal ? 46 : 32;
  const dotSize = principal ? 18 : 13;
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        background: #e8b208;
        border: ${principal ? 4 : 3}px solid #09090b;
        border-radius: 9999px 9999px 9999px 2px;
        transform: rotate(45deg);
        box-shadow: 0 4px 14px rgba(0,0,0,0.4)${principal ? ', 0 0 0 6px rgba(232,178,8,0.25)' : ''};
        display: flex; align-items: center; justify-content: center;
      ">
        <div style="transform: rotate(-45deg); width: ${dotSize}px; height: ${dotSize}px; border-radius: 9999px; background: #09090b;"></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size - 4],
    popupAnchor: [0, -size + 6],
  });
}

export function ServiceMap() {
  const icon = useMemo(() => createBrandIcon(false), []);
  const principalIcon = useMemo(() => createBrandIcon(true), []);
  const totalProjetos = CIDADES.reduce((acc, c) => acc + c.projetos, 0);
  const principal = CIDADES.find((c) => c.principal);

  return (
    <section className="py-24 bg-zinc-50 relative overflow-hidden" id="onde-atendemos">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-950 mb-4">
            Onde a <span className="text-[var(--color-accent)]">Solar Energy</span> atende
          </h2>
          <p className="text-zinc-600 text-lg max-w-2xl mx-auto">
            Já realizamos mais de {totalProjetos} instalações em diversas cidades. Veja se a sua região já está no nosso mapa de atuação.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Mapa */}
          <div className="rounded-[2rem] overflow-hidden border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.06)] h-[480px] relative">
            <MapContainer
              center={principal ? [principal.lat, principal.lng] : [-19, -42]}
              zoom={9}
              scrollWheelZoom={false}
              className="w-full h-full z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              {CIDADES.map((c) => (
                <Marker key={c.id} position={[c.lat, c.lng]} icon={c.principal ? principalIcon : icon}>
                  <Popup>
                    <div className="text-center font-sans">
                      {c.principal && (
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-dark)] m-0 mb-1">Sede</p>
                      )}
                      <p className="font-bold text-zinc-900 m-0">{c.cidade} — {c.estado}</p>
                      <p className="text-xs text-zinc-500 m-0 mt-1">{c.projetos} projetos instalados</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Lista de cidades */}
          <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <SunDim size={20} weight="fill" className="text-[var(--color-accent)]" />
              <h3 className="font-bold text-zinc-900">Cidades atendidas</h3>
            </div>
            <div className="space-y-1 overflow-y-auto max-h-[380px] pr-1">
              {CIDADES
                .slice()
                .sort((a, b) => (b.principal ? 1 : 0) - (a.principal ? 1 : 0) || b.projetos - a.projetos)
                .map((c) => (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl transition-colors ${
                      c.principal ? 'bg-[var(--color-accent)]/10' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin size={14} weight="fill" className="text-[var(--color-accent)] shrink-0" />
                      <span className="text-sm font-semibold text-zinc-800 truncate">
                        {c.cidade}, {c.estado}
                        {c.principal && <span className="ml-1.5 text-[9px] font-bold uppercase text-[var(--color-accent-dark)]">Sede</span>}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-zinc-400 shrink-0">{c.projetos}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
