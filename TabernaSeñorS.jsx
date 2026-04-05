import React, { useState, useMemo } from 'react';
import { ChefHat, Gamepad2, Users, Search, UtensilsCrossed, Star } from 'lucide-react';

// ============================================================================
// 🍔 LA DESPENSA DE JUEGOS (¡EDITA ESTO PARA AÑADIR MÁS PLATOS EN EL FUTURO!) 🍔
// ============================================================================
// Para añadir un juego, copia un bloque {} y cambia los datos.
const GAMES_DB = [
  // --- PLATOS TRADICIONALES: WII ---
  {
    id: 1,
    title: "Juegos en Familia",
    platform: "Wii",
    theme: "Fiesta y Minijuegos",
    players: "1-4",
    maxPlayers: 4,
    description: "Surtido de aperitivos ligeros para que la abuela y el primo pequeño jueguen sin romperse nada. Sabor a domingo por la tarde."
  },
  {
    id: 2,
    title: "Mario Kart Wii",
    platform: "Wii",
    theme: "Carreras Temerarias",
    players: "1-4",
    maxPlayers: 4,
    description: "El rompe-amistades de la casa. Servido con una generosa guarnición de Caparazones Azules. No nos hacemos cargo de mandos estampados."
  },
  {
    id: 3,
    title: "Mario Strikers Charged Football",
    platform: "Wii",
    theme: "Deportes Extremos",
    players: "1-4",
    maxPlayers: 4,
    description: "Fútbol, pero si las faltas estuvieran permitidas y el balón te pudiera electrocutar. Muy picante."
  },
  {
    id: 4,
    title: "Super Smash Bros. Brawl",
    platform: "Wii",
    theme: "Peleas Callejeras",
    players: "1-4",
    maxPlayers: 4,
    description: "Ideal para resolver disputas familiares por la herencia de forma civilizada... a guantazos virtuales. Incluye tropezones al azar (gracias, Sakurai)."
  },
  {
    id: 5,
    title: "Trivial Pursuit",
    platform: "Wii",
    theme: "Cerebritos",
    players: "1-4",
    maxPlayers: 4,
    description: "El plato perfecto para demostrarle a tu cuñado que no sabe tanto como cree. Se sirve frío."
  },
  {
    id: 6,
    title: "Wii Sports",
    platform: "Wii",
    theme: "Deportes y Sudor",
    players: "1-4",
    maxPlayers: 4,
    description: "El clásico de la casa. Cuidado con no lanzar el mando a la tele al jugar a los bolos (historia real de este restaurante)."
  },
  {
    id: 7,
    title: "Wii Sports Resort",
    platform: "Wii",
    theme: "Deportes y Sudor",
    players: "1-4",
    maxPlayers: 4,
    description: "Como el anterior, pero con sabor tropical. Cortar frutas con la espada es un excelente ejercicio de digestión."
  },
  {
    id: 8,
    title: "Zumba Fitness 2",
    platform: "Wii",
    theme: "Baile y Tortura",
    players: "1-4",
    maxPlayers: 4,
    description: "El especial quema-calorías de la abuela. Sudarás más que intentando pasarte un nivel de agua."
  },

  // --- PLATOS INCOMPRENDIDOS: WII U ---
  {
    id: 9,
    title: "New Super Mario Bros. U + New Super Luigi U",
    platform: "Wii U",
    theme: "Plataformas Clásicas",
    players: "1-4",
    maxPlayers: 4,
    description: "Un plato doble y contundente. Si alguien te agarra en pleno salto y te tira al vacío, estás en tu derecho de no hablarle durante la cena."
  },
  {
    id: 10,
    title: "Nintendo Land",
    platform: "Wii U",
    theme: "Fiesta y Minijuegos",
    players: "1-5",
    maxPlayers: 5,
    description: "Tapas variadas asimétricas. El que tiene el mando con pantalla se cree el jefe del restaurante, pero los demás pueden cazarle."
  },
  {
    id: 11,
    title: "Super Mario 3D World",
    platform: "Wii U",
    theme: "Plataformas Clásicas",
    players: "1-4",
    maxPlayers: 4,
    description: "Sabe a gloria bendita. Todos disfrazados de gatos robándose las coronas entre sí. Alta cocina Nintendera."
  },
  {
    id: 12,
    title: "Super Smash Bros. For Wii U",
    platform: "Wii U",
    theme: "Peleas Callejeras",
    players: "1-8",
    maxPlayers: 8,
    description: "Ocho personas pegándose a la vez en una pantalla. Es menos una comida y más una guerra de comida de colegio."
  },

  // --- PLATOS ESTRELLA (MICHELIN): SWITCH ---
  {
    id: 13,
    title: "ARMS",
    platform: "Switch",
    theme: "Peleas Callejeras",
    players: "1-4",
    maxPlayers: 4,
    description: "Boxeo con muelles. Ideal para desestresarse después de un mal día estirando los brazos como si fueras un fideo."
  },
  {
    id: 14,
    title: "FIFA",
    platform: "Switch",
    theme: "Deportes y Sudor",
    players: "1-4",
    maxPlayers: 4,
    description: "El típico plato de comida rápida que a todo el mundo le gusta aunque se quejen de que sabe igual todos los años."
  },
  {
    id: 15,
    title: "Go Vacation",
    platform: "Switch",
    theme: "Fiesta y Minijuegos",
    players: "1-4",
    maxPlayers: 4,
    description: "Buffet libre de minijuegos. Te puedes tirar en paracaídas o patinar, perfecto para cuando tienes pereza de irte de vacaciones de verdad."
  },
  {
    id: 16,
    title: "Jump Force",
    platform: "Switch",
    theme: "Peleas Callejeras",
    players: "1-2",
    maxPlayers: 2,
    description: "Macedonia de anime. Goku y Naruto dándose palizas. Visualmente un poco crudo en Switch, pero sabe a nostalgia otaku."
  },
  {
    id: 17,
    title: "Kirby's Return to Dream Land Deluxe",
    platform: "Switch",
    theme: "Plataformas Clásicas",
    players: "1-4",
    maxPlayers: 4,
    description: "Un postre rosa y dulce. Kirby se lo come todo, igual que tú cuando llegas con hambre a las 3 de la mañana."
  },
  {
    id: 18,
    title: "Mario kart 8 Deluxe",
    platform: "Switch",
    theme: "Carreras Temerarias",
    players: "1-4 (Local) / 8+ (Online)",
    maxPlayers: 8,
    description: "El plato más vendido de nuestra historia. Si te tiran un rayo justo antes de la meta, pide el libro de reclamaciones."
  },
  {
    id: 19,
    title: "Mario Strikers: Battle League Football",
    platform: "Switch",
    theme: "Deportes Extremos",
    players: "1-8",
    maxPlayers: 8,
    description: "Aún más violento que su predecesor. El árbitro está comprado o simplemente está mirando a otro lado."
  },
  {
    id: 20,
    title: "Nintendo Switch Sports",
    platform: "Switch",
    theme: "Deportes y Sudor",
    players: "1-4",
    maxPlayers: 4,
    description: "Un refrito moderno del clásico de Wii. Recuerda abrocharte la correa, no queremos repetir el 'Incidente de la Tele Rota de 2006'."
  },
  {
    id: 21,
    title: "Super Mario Bros. Wonder",
    platform: "Switch",
    theme: "Plataformas Clásicas",
    players: "1-4",
    maxPlayers: 4,
    description: "Un viaje psicodélico. Creemos que las Flores Maravilla llevaban un ingrediente especial. Totalmente alucinante."
  },
  {
    id: 22,
    title: "Super Smash Bros. Ultimate",
    platform: "Switch",
    theme: "Peleas Callejeras",
    players: "1-8",
    maxPlayers: 8,
    description: "¡ESTÁN TODOS! Literalmente el menú completo en un solo juego. Cuidado al jugar a 8 porque no sabrás ni dónde está tu personaje."
  },

  // --- MENÚ DEGUSTACIÓN DEL FUTURO: SWITCH 2 ---
  {
    id: 23,
    title: "Kirby Air Riders",
    platform: "Switch 2",
    theme: "Carreras Temerarias",
    players: "1-4",
    maxPlayers: 4,
    description: "Plato experimental importado desde el futuro con la máquina de Doc Brown. Estrellas voladoras y nostalgia de GameCube remasterizada. ¡Exclusivo!"
  }
];

// Extracción de filtros únicos para los menús
const platforms = ["Todas las Mesas", ...new Set(GAMES_DB.map(g => g.platform))];
const themes = ["Todos los Sabores", ...new Set(GAMES_DB.map(g => g.theme))];

export default function App() {
  const [selectedPlatform, setSelectedPlatform] = useState("Todas las Mesas");
  const [selectedTheme, setSelectedTheme] = useState("Todos los Sabores");
  const [selectedPlayers, setSelectedPlayers] = useState("Cualquier grupo");

  // Lógica de filtrado
  const filteredGames = useMemo(() => {
    return GAMES_DB.filter(game => {
      const matchPlatform = selectedPlatform === "Todas las Mesas" || game.platform === selectedPlatform;
      const matchTheme = selectedTheme === "Todos los Sabores" || game.theme === selectedTheme;
      
      let matchPlayers = true;
      if (selectedPlayers === "Lobo Solitario (1)") matchPlayers = game.maxPlayers >= 1;
      if (selectedPlayers === "Duelo romántico/mortal (2)") matchPlayers = game.maxPlayers >= 2;
      if (selectedPlayers === "El clásico trío (3)") matchPlayers = game.maxPlayers >= 3;
      if (selectedPlayers === "Fiesta moderada (4)") matchPlayers = game.maxPlayers >= 4;
      if (selectedPlayers === "Caos absoluto (5+)") matchPlayers = game.maxPlayers >= 5;

      return matchPlatform && matchTheme && matchPlayers;
    });
  }, [selectedPlatform, selectedTheme, selectedPlayers]);

  return (
    <div className="min-h-screen bg-[#fcf8f2] text-amber-950 font-sans p-4 md:p-8">
      
      {/* HEADER TIPO MENÚ */}
      <header className="max-w-5xl mx-auto text-center border-b-4 border-amber-900 pb-8 mb-8">
        <div className="flex justify-center mb-4 text-amber-800">
          <UtensilsCrossed size={48} />
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tighter uppercase mb-2">
          La Taberna Nintendera
        </h1>
        <h2 className="text-xl md:text-2xl font-serif italic text-amber-700">
          Especialidades de la Casa · Diversión a la Carta
        </h2>
        <p className="mt-4 text-sm max-w-2xl mx-auto text-amber-800/80">
          Bienvenido a nuestro restaurante gourmet. Por favor, utilice los filtros para encontrar el "plato" que mejor se adapte al nivel de estrés y número de invitados que tenga hoy en casa.
        </p>
      </header>

      <main className="max-w-5xl mx-auto">
        {/* SECCIÓN DE FILTROS (LOS CAMAREROS) */}
        <section className="bg-amber-100/50 p-6 rounded-xl border border-amber-200 mb-10 shadow-sm">
          <h3 className="flex items-center gap-2 text-xl font-bold font-serif mb-4 text-amber-900 border-b border-amber-300 pb-2">
            <Search size={20} /> ¿Qué le apetece degustar hoy?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Filtro Plataforma */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2 text-amber-800 flex items-center gap-2">
                <Gamepad2 size={16} /> Plataforma (La Mesa)
              </label>
              <select 
                className="w-full p-2 bg-white border-2 border-amber-300 rounded-md shadow-sm outline-none focus:border-amber-600 transition-colors cursor-pointer"
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
              >
                {platforms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Filtro Temática */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2 text-amber-800 flex items-center gap-2">
                <ChefHat size={16} /> Temática (El Sabor)
              </label>
              <select 
                className="w-full p-2 bg-white border-2 border-amber-300 rounded-md shadow-sm outline-none focus:border-amber-600 transition-colors cursor-pointer"
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
              >
                {themes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Filtro Jugadores */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2 text-amber-800 flex items-center gap-2">
                <Users size={16} /> Jugadores (Comensales)
              </label>
              <select 
                className="w-full p-2 bg-white border-2 border-amber-300 rounded-md shadow-sm outline-none focus:border-amber-600 transition-colors cursor-pointer"
                value={selectedPlayers}
                onChange={(e) => setSelectedPlayers(e.target.value)}
              >
                <option>Cualquier grupo</option>
                <option>Lobo Solitario (1)</option>
                <option>Duelo romántico/mortal (2)</option>
                <option>El clásico trío (3)</option>
                <option>Fiesta moderada (4)</option>
                <option>Caos absoluto (5+)</option>
              </select>
            </div>
          </div>
        </section>

        {/* CARTA DE PLATOS (RESULTADOS) */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b-2 border-amber-900 pb-2">
            <h3 className="text-2xl font-serif font-bold uppercase tracking-widest text-amber-900">
              Menú Disponible ({filteredGames.length})
            </h3>
          </div>

          {filteredGames.length === 0 ? (
            <div className="text-center py-16 bg-white border-2 border-dashed border-amber-300 rounded-xl">
              <p className="text-xl text-amber-700 italic font-serif">
                "Lo sentimos, el Chef no tiene ingredientes para este plato hoy. ¡Pruebe otra combinación!"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredGames.map((game) => (
                <article key={game.id} className="relative group">
                  {/* Borde decorativo tipo menú antiguo */}
                  <div className="absolute inset-0 border border-amber-300 rounded-lg transform translate-x-1 translate-y-1 bg-amber-100/30"></div>
                  
                  <div className="relative h-full bg-white border-2 border-amber-900 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    
                    {/* Título e Info superior */}
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h4 className="font-serif text-xl font-bold leading-tight text-amber-950">
                        {game.title}
                      </h4>
                      <span className="whitespace-nowrap font-bold text-sm bg-amber-900 text-[#fcf8f2] px-2 py-1 rounded">
                        {game.platform}
                      </span>
                    </div>

                    {/* Descripción Graciosa */}
                    <p className="text-amber-800/90 text-sm italic mb-4 flex-grow">
                      {game.description}
                    </p>

                    {/* Tags / Metadatos del "Plato" */}
                    <div className="pt-3 border-t border-dashed border-amber-300 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-sm border border-amber-200">
                        <Star size={12} /> {game.theme}
                      </span>
                      <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-sm border border-amber-200">
                        <Users size={12} /> Máx: {game.players}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="max-w-5xl mx-auto mt-16 text-center text-amber-700/60 text-sm pb-8">
        <p>🍽️ La Taberna Nintendera - Reservados todos los derechos (y todos los mandos rotos).</p>
        <p className="mt-1">Propina no incluida. No se admiten devoluciones por piques amistosos.</p>
      </footer>
    </div>
  );
}