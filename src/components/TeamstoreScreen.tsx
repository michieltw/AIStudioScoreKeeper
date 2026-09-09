import { ArrowLeft, ShoppingBag, ExternalLink, ArrowRight } from 'lucide-react';

interface TeamstoreScreenProps {
  onBack: () => void;
}

export default function TeamstoreScreen({ onBack }: TeamstoreScreenProps) {
  const shopUrl = "https://www.blackouthockey.nl";

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-tertiary/10 via-background to-background" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex-none p-4 md:p-6 pb-4 flex flex-col gap-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Ga terug"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-on-surface to-on-surface-variant flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-tertiary" /> Teamstore
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 p-4 md:p-6 pt-0 overflow-y-auto max-w-7xl mx-auto w-full custom-scrollbar">
        <div className="flex flex-col gap-8 h-full">

          {/* Main Hero Banner */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-primary/20 shadow-2xl group flex-shrink-0" style={{ minHeight: '300px' }}>
            {/* Banner Background Image (Placeholder) */}
            <div className="absolute inset-0 bg-surface-container-lowest">
               <img
                 src="https://images.unsplash.com/photo-1515523110800-9415d13b84a8?q=80&w=2400&auto=format&fit=crop"
                 alt="Hockey Equipment"
                 className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
               />
               {/* Gradient Overlay */}
               <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
               <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
            </div>

            {/* Banner Content */}
            <div className="relative h-full flex flex-col justify-end p-8 md:p-12 max-w-2xl">
              <span className="inline-block px-3 py-1 bg-tertiary/20 text-tertiary border border-tertiary/30 rounded-full text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                Official Merchandise
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-on-surface mb-4 drop-shadow-md">
                Gameday Ready.
              </h2>
              <p className="text-on-surface-variant text-lg mb-8 max-w-xl">
                Get the latest official gear, jerseys, and fan merchandise directly from our Shopify store. Show your colors on and off the ice.
              </p>

              <a
                href={shopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-tertiary text-black font-display font-bold text-lg px-8 py-4 rounded-xl hover:bg-tertiary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-tertiary/20 w-fit group/btn"
              >
                Shop Nu
                <ExternalLink className="w-5 h-5 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
              </a>
            </div>
          </div>

          {/* Featured Collections / Placeholder Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">

            {/* Card 1 */}
            <a
              href={shopUrl} target="_blank" rel="noopener noreferrer"
              className="bg-surface-container-low border border-primary/20 rounded-xl overflow-hidden metallic-surface hover:border-tertiary/50 transition-colors group/card flex flex-col h-full"
            >
              <div className="h-48 overflow-hidden bg-surface-container-lowest relative">
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent z-10" />
                <img
                  src="https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?q=80&w=800&auto=format&fit=crop"
                  alt="Jerseys"
                  className="w-full h-full object-cover opacity-80 group-hover/card:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2">Team Jerseys</h3>
                <p className="text-sm text-on-surface-variant mb-4 flex-1">Authentic on-ice jerseys. Customize with your name and number.</p>
                <div className="flex items-center text-tertiary font-bold text-sm uppercase tracking-wider group-hover/card:underline">
                  Bekijk Collectie <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </a>

            {/* Card 2 */}
            <a
              href={shopUrl} target="_blank" rel="noopener noreferrer"
              className="bg-surface-container-low border border-primary/20 rounded-xl overflow-hidden metallic-surface hover:border-tertiary/50 transition-colors group/card flex flex-col h-full"
            >
              <div className="h-48 overflow-hidden bg-surface-container-lowest relative">
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent z-10" />
                <img
                  src="https://images.unsplash.com/photo-1521412644187-c49fa049e84d?q=80&w=800&auto=format&fit=crop"
                  alt="Apparel"
                  className="w-full h-full object-cover opacity-80 group-hover/card:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2">Lifestyle & Apparel</h3>
                <p className="text-sm text-on-surface-variant mb-4 flex-1">Hoodies, tees, and caps to represent your team everywhere you go.</p>
                <div className="flex items-center text-tertiary font-bold text-sm uppercase tracking-wider group-hover/card:underline">
                  Bekijk Collectie <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </a>

            {/* Card 3 */}
            <a
              href={shopUrl} target="_blank" rel="noopener noreferrer"
              className="bg-surface-container-low border border-primary/20 rounded-xl overflow-hidden metallic-surface hover:border-tertiary/50 transition-colors group/card flex flex-col h-full md:col-span-2 lg:col-span-1"
            >
              <div className="h-48 overflow-hidden bg-surface-container-lowest relative flex items-center justify-center p-8">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 to-surface-container-low z-10 opacity-50" />
                <ShoppingBag className="w-16 h-16 text-tertiary/40 relative z-20 group-hover/card:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2">Accessoires</h3>
                <p className="text-sm text-on-surface-variant mb-4 flex-1">Pucks, tape, bidons en andere essentiële hockey benodigdheden.</p>
                <div className="flex items-center text-tertiary font-bold text-sm uppercase tracking-wider group-hover/card:underline">
                  Bekijk Collectie <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </a>

          </div>
        </div>
      </div>
    </div>
  );
}
