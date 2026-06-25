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
}

const CIDADES: ServiceCity[] = [
  { id: 1, cidade: "São Paulo", estado: "SP", lat: -23.5505, lng: -46.6333, projetos: 312 },
  { id: 2, cidade: "Campinas", estado: "SP", lat: -22.9099, lng: -47.0626, projetos: 148 },
  { id: 3, cidade: "Ribeirão Preto", estado: "SP", lat: -21.1775, lng: -47.8208, projetos: 96 },
  { id: 4, cidade: "Sorocaba", estado: "SP", lat: -23.5015, lng: -47.4526, projetos: 74 },
  { id: 5, cidade: "Uberlândia", estado: "MG", lat: -18.9186, lng: -48.2772, projetos: 61 },
  { id: 6, cidade: "Belo Horizonte", estado: "MG", lat: -19.9167, lng: -43.9345, projetos: 130 },
  { id: 7, cidade: "Rio de Janeiro", estado: "RJ", lat: -22.9068, lng: -43.1729, projetos: 187 },
  { id: 8, cidade: "Curitiba", estado: "PR", lat: -25.4284, lng: -49.2733, projetos: 88 },
];

// Ícone customizado em formato de pino dourado com o logo da marca
function createBrandIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 34px; height: 34px;
        background: #e8b208;
        border: 3px solid #09090b;
        border-radius: 9999px 9999px 9999px 2px;
        transform: rotate(45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        display: flex; align-items: center; justify-content: center;
      ">
        <div style="transform: rotate(-45deg); width: 14px; height: 14px; border-radius: 9999px; background: #09090b;"></div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 30],
    popupAnchor: [0, -28],
  });
}

export function ServiceMap() {
  const icon = useMemo(() => createBrandIcon(), []);
  const totalProjetos = CIDADES.reduce((acc, c) => acc + c.projetos, 0);

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
              center={[-22.5, -46.5]}
              zoom={6}
              scrollWheelZoom={false}
              className="w-full h-full z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              {CIDADES.map((c) => (
                <Marker key={c.id} position={[c.lat, c.lng]} icon={icon}>
                  <Popup>
                    <div className="text-center font-sans">
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
                .sort((a, b) => b.projetos - a.projetos)
                .map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin size={14} weight="fill" className="text-[var(--color-accent)] shrink-0" />
                      <span className="text-sm font-semibold text-zinc-800 truncate">{c.cidade}, {c.estado}</span>
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
