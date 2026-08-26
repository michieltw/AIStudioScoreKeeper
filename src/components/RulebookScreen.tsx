import { useState } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  ShieldAlert, 
  Users, 
  Scale, 
  Calendar, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Info, 
  Search,
  ExternalLink
} from 'lucide-react';

interface RulebookScreenProps {
  onBack: () => void;
}

export default function RulebookScreen({ onBack }: RulebookScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'algemeen',
      number: '1',
      title: 'Algemene Bepalingen & Doelstelling',
      icon: BookOpen,
      content: (
        <div className="space-y-4 text-sm text-gray-300">
          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
            <h3 className="font-mono text-xs font-bold text-tertiary uppercase tracking-wider mb-2">Doelstelling</h3>
            <p className="leading-relaxed text-gray-300">
              De House League is in 2022 opgericht om de ijshockeysport in de regio Groningen te stimuleren en toegankelijker te maken. Het biedt een open, prettige en gezellige omgeving met een vleugje competitie voor beginners, lerende spelers en ervaren spelers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
              <h3 className="font-mono text-xs font-bold text-tertiary uppercase tracking-wider mb-1">Leeftijd</h3>
              <p className="text-gray-300">Deelname aan de House League is uitsluitend voor spelers van <strong>18 jaar en ouder</strong>.</p>
            </div>
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
              <h3 className="font-mono text-xs font-bold text-tertiary uppercase tracking-wider mb-1">Doelgroep</h3>
              <p className="text-gray-300">Open voor diverse achtergronden, waaronder voormalig jeugdspelers, ouders van jeugdspelers, U23/GIJS-spelers, oud-hockeyers en absolute beginners.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'divisies',
      number: '2',
      title: 'Divisies en Teamindeling',
      icon: Users,
      content: (
        <div className="space-y-4 text-sm text-gray-300">
          <p className="leading-relaxed">
            De competitie bestaat uit in totaal <strong>6 teams</strong>, verdeeld over <strong>2 divisies</strong> (3 teams per divisie):
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Divisie A */}
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-base text-white">Divisie A</span>
                  <span className="bg-tertiary/10 text-tertiary border border-tertiary/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">Gevorderd tot gemiddeld</span>
                </div>
                <ul className="space-y-2 text-xs text-gray-300 list-disc list-inside">
                  <li>Bedoeld voor spelers met ervaring (bijv. binnen GIJS of eerdere hockey-ervaring) die op een sneller en competitief niveau willen spelen.</li>
                  <li>Bevat ook spelers die in de House League zijn gestart, maar volgens de trainers voldoende zijn ontwikkeld om op een hoger niveau te spelen.</li>
                </ul>
              </div>
            </div>

            {/* Divisie B */}
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-base text-white">Divisie B</span>
                  <span className="bg-white/10 text-gray-300 border border-white/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">Beginnend tot gemiddeld</span>
                </div>
                <ul className="space-y-2 text-xs text-gray-300 list-disc list-inside">
                  <li>Bedoeld voor spelers die net beginnen met ijshockey of in hun 2e of 3e seizoen zitten en zich nog ontwikkelen.</li>
                  <li>Bevat tevens ervaren spelers die bewust kiezen voor een rustiger speltempo maar wel competitief willen blijven.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-high/40 border border-[#2A2A2A] rounded-lg p-4">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-tertiary" />
              Wisselen tussen divisies (Regels voor spelers met gemiddeld niveau)
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-300 list-disc list-inside">
              <li>Wisselen tussen Divisie A en B is toegestaan als invaller of als nieuwe teamaanvulling, mits een teamcaptain hierom vraagt.</li>
              <li>Spelers met een gemiddeld niveau uit Divisie B hebben vooraf toestemming van de trainers nodig voordat zij in Divisie A mogen meespelen.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'basisregels',
      number: '3',
      title: 'De 9 House League Basisregels',
      icon: Scale,
      content: (
        <div className="space-y-3 text-sm text-gray-300">
          <p className="text-xs text-gray-400 mb-2">Tijdens alle activiteiten gelden de volgende 9 kernregels:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { num: '1', name: 'Gebalanceerde teams', desc: 'Teams moeten in evenwicht zijn.' },
              { num: '2', name: 'Gelijke ijstijd', desc: 'Er geldt gelijke ijstijd voor iedere speler.' },
              { num: '3', name: 'Geen ICING', desc: 'De icing-regel is niet van toepassing.' },
              { num: '4', name: 'Geen BODYCHECKING', desc: 'Bodychecking is ten strengste verboden.' },
              { num: '5', name: 'Lichamelijk contact', desc: 'Beperkt fysiek contact onder strikte voorwaarden (zie sectie 4).' },
              { num: '6', name: 'Wedstrijdorganisatie', desc: 'Niet-spelend team levert verplicht scheidsrechter & scoreklok.' },
              { num: '7', name: 'Leiderschap', desc: 'Elk team heeft een teamcaptain of coach.' },
              { num: '8', name: 'Fair Play', desc: 'Respect voor elkaar en voor de scheidsrechters is verplicht.' },
              { num: '9', name: 'Plezier', desc: 'Plezier staat altijd voorop.' }
            ].map(rule => (
              <div key={rule.num} className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-3 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded bg-tertiary text-black font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {rule.num}
                  </span>
                  <span className="font-mono text-xs font-bold text-white">{rule.name}</span>
                </div>
                <p className="text-xs text-gray-400 pl-7">{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'fysiek-contact',
      number: '4',
      title: 'Reglement Fysiek Contact',
      icon: ShieldAlert,
      content: (
        <div className="space-y-3 text-sm text-gray-300">
          <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg text-xs text-red-200">
            <strong>Belangrijk:</strong> Hoewel bodychecking verboden is, is lichamelijk contact alléén toegestaan onder de volgende strikte voorwaarden:
          </div>
          <ul className="space-y-2 text-xs text-gray-300">
            <li className="flex items-start gap-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-3">
              <CheckCircle2 className="w-4 h-4 text-tertiary flex-shrink-0 mt-0.5" />
              <span>De primaire intentie is om de puck te spelen; fysiek contact is hierbij slechts een gevolg.</span>
            </li>
            <li className="flex items-start gap-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-3">
              <CheckCircle2 className="w-4 h-4 text-tertiary flex-shrink-0 mt-0.5" />
              <span>Als twee spelers in dezelfde richting schaatsen, mag er weinig tot geen intentie zijn om op het lichaam te spelen. Eventueel contact is hierbij puur een bijkomend resultaat.</span>
            </li>
            <li className="flex items-start gap-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-3">
              <CheckCircle2 className="w-4 h-4 text-tertiary flex-shrink-0 mt-0.5" />
              <span>Tegen een tegenstander aanleunen is toegestaan.</span>
            </li>
            <li className="flex items-start gap-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-3">
              <CheckCircle2 className="w-4 h-4 text-tertiary flex-shrink-0 mt-0.5" />
              <span>Minimaal contact tegen de boarding is toegestaan.</span>
            </li>
            <li className="flex items-start gap-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-3">
              <CheckCircle2 className="w-4 h-4 text-tertiary flex-shrink-0 mt-0.5" />
              <span>Een speler heeft te allen tijde het recht om zijn/haar eigen positie op het ijs te behouden.</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'wedstrijdorganisatie',
      number: '5',
      title: 'Wedstrijdorganisatie (Zondag)',
      icon: Calendar,
      content: (
        <div className="space-y-4 text-sm text-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
              <h3 className="font-mono text-xs font-bold text-tertiary uppercase tracking-wider mb-1">Speeldag</h3>
              <p className="text-gray-300">Elke zondagavond.</p>
            </div>
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
              <h3 className="font-mono text-xs font-bold text-tertiary uppercase tracking-wider mb-1">Format</h3>
              <p className="text-gray-300">Er worden twee wedstrijden gespeeld: één tussen twee A-teams en één tussen twee B-teams.</p>
            </div>
          </div>
          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-2">Taken niet-spelende teams</h3>
            <p className="text-xs text-gray-400 mb-2">De teams die op dat moment niet op het ijs staan, verzorgen de volledige wedstrijdorganisatie. Dit omvat:</p>
            <ul className="space-y-1.5 text-xs text-gray-300 list-disc list-inside">
              <li>Het bedienen van de scoreklok.</li>
              <li>Het leveren van scheidsrechters.</li>
              <li>Het openen en sluiten van de deurtjes (indien nodig).</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'trainingen',
      number: '6',
      title: 'Trainingen en Instroom',
      icon: Users,
      content: (
        <div className="space-y-3 text-sm text-gray-300">
          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
            <h3 className="font-mono text-xs font-bold text-tertiary uppercase tracking-wider mb-1">Trainingsdagen</h3>
            <p className="text-gray-300">Elke woensdag- en vrijdagavond. De dagen wisselen per week en per divisie (volgens het actuele House League schema).</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-1">Beginners</h3>
              <p className="text-xs text-gray-300">Nieuwe spelers die nog geen wedstrijden spelen (beginners), trainen mee bij Divisie B of stromen in via de vrijdagtrainingen.</p>
            </div>
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-1">Doorstroming</h3>
              <p className="text-xs text-gray-300">Zodra een trainer beoordeelt dat een speler voldoende vaardigheid heeft, mag deze doorstromen naar het spelen van wedstrijden op zondag in Divisie B.</p>
            </div>
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-1">Gevorderde instromers</h3>
              <p className="text-xs text-gray-300">Nieuwe gevorderde spelers worden door een trainer in een A- of B-training geplaatst ter observatie. Daarna bepaalt de trainer de definitieve plek in de House League.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'lidmaatschap',
      number: '7',
      title: 'Proeflessen, Lidmaatschap & Contributie',
      icon: Award,
      content: (
        <div className="space-y-4 text-sm text-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
              <h3 className="font-mono text-xs font-bold text-tertiary uppercase tracking-wider mb-1">Proeflessen</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Geïnteresseerden (18+) kunnen <strong>2 proeflessen</strong> volgen. Aanmelden verloopt via het formulier op de website of via <a href="mailto:houseleague@gijsgroningen.nl" className="text-tertiary underline underline-offset-2">houseleague@gijsgroningen.nl</a>.
              </p>
            </div>
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
              <h3 className="font-mono text-xs font-bold text-tertiary uppercase tracking-wider mb-1">Lidmaatschap</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Na de 2 proeflessen moet men zich inschrijven als lid bij GIJS Groningen om definitief te spelen.
              </p>
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-2">Tarieven (per seizoen)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="p-3 bg-surface-container-high/40 border border-[#2A2A2A] rounded-lg flex items-center justify-between">
                <span className="text-xs text-gray-300 font-sans">Reguliere deelname (alléén House League)</span>
                <span className="font-mono font-bold text-sm text-tertiary">€ 400,-</span>
              </div>
              <div className="p-3 bg-surface-container-high/40 border border-[#2A2A2A] rounded-lg flex items-center justify-between">
                <span className="text-xs text-gray-300 font-sans">Extra deelname (bijv. in GIJS 3)</span>
                <span className="font-mono font-bold text-sm text-tertiary">+ € 150,-</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'uitrusting',
      number: '8',
      title: 'Uitrusting en Kledingvoorschriften',
      icon: Sparkles,
      content: (
        <div className="space-y-4 text-sm text-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
              <h3 className="font-mono text-xs font-bold text-tertiary uppercase tracking-wider mb-1">Tijdens proeflessen</h3>
              <p className="text-xs text-gray-300">Materiaal kan geleend worden van de club.</p>
            </div>
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
              <h3 className="font-mono text-xs font-bold text-tertiary uppercase tracking-wider mb-1">Na proeflessen</h3>
              <p className="text-xs text-gray-300">Spelers dienen eigen materiaal aan te schaffen of te leasen (verwezen wordt naar de winkel in Kardinge).</p>
            </div>
          </div>

          <div className="p-3 bg-surface-container-high/40 border border-[#2A2A2A] rounded-lg">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-1">Onderkleding (verplicht)</h3>
            <p className="text-xs text-gray-300">
              Onder de gear moet een zweetpak, thermo-ondergoed, of een legging met een strak shirt gedragen worden. Dit is verplicht omdat het warmer is en het materiaal dan niet op de blote huid schuurt.
            </p>
          </div>

          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-3">Verplichte uitrusting op het ijs:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {[
                'Zweetpak / onderkleding',
                'Toque',
                'Nekband',
                'Body (schouderbescherming)',
                'Elleboogbeschermers',
                'Scheenbeschermers',
                'Broek met bretels',
                'Helm',
                'Handschoenen',
                'Sokken',
                'Shirt',
                'Schaatsen',
                'Stick'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-surface-container-high/20 border border-[#2A2A2A] rounded text-xs text-gray-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-tertiary flex-shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-high/40 border border-[#2A2A2A] rounded-lg p-3 text-xs text-gray-300">
            <strong>Overig verplicht/geadviseerd:</strong> Een grote tas voor vervoer, een bidon met water voor tijdens de training en een set droge kleding voor na afloop. Douches zijn beschikbaar.
          </div>
        </div>
      )
    },
    {
      id: 'sponsormogelijkheden',
      number: '9',
      title: 'Sponsormogelijkheden',
      icon: Award,
      content: (
        <div className="space-y-4 text-sm text-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kleding */}
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-3">Kleding</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-surface-container-high/30 border border-[#2A2A2A] rounded text-xs">
                  <span>Voorkant shirt groot</span>
                  <span className="font-mono font-bold text-tertiary">€ 1500,-</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-surface-container-high/30 border border-[#2A2A2A] rounded text-xs">
                  <span>Achterkant shirt kleiner</span>
                  <span className="font-mono font-bold text-tertiary">€ 750,-</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-surface-container-high/30 border border-[#2A2A2A] rounded text-xs">
                  <span>Linker- of rechtermouw klein</span>
                  <span className="font-mono font-bold text-tertiary">€ 250,- / mouw</span>
                </div>
              </div>
            </div>

            {/* Online / Social Media */}
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-4">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-3">Online / Social Media</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-surface-container-high/30 border border-[#2A2A2A] rounded text-xs">
                  <span>Nieuwsbrief voor een heel seizoen</span>
                  <span className="font-mono font-bold text-tertiary">€ 100,-</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-surface-container-high/30 border border-[#2A2A2A] rounded text-xs">
                  <span>Homepage vermelding seizoen</span>
                  <span className="font-mono font-bold text-tertiary">€ 100,-</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-surface-container-high/30 border border-[#2A2A2A] rounded text-xs">
                  <span>Alle social media seizoen</span>
                  <span className="font-mono font-bold text-tertiary">€ 250,-</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-surface-container-high/30 border border-[#2A2A2A] rounded text-xs">
                  <span>Losse promotie Instagram/Facebook</span>
                  <span className="font-mono font-bold text-tertiary">€ 15,- / bericht</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = searchQuery.trim() === ''
    ? sections
    : sections.filter(sec => 
        sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.number.includes(searchQuery)
      );

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-surface-container-low/50 backdrop-blur-md border-b border-[#2A2A2A] sticky top-0 z-50">
        <button
          onClick={onBack}
          className="text-on-surface-variant hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/5"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-tertiary" />
          <h1 className="font-display text-[17px] sm:text-[18px] font-bold text-white uppercase tracking-wider">
            Reglementenboek
          </h1>
        </div>
        <div className="w-9" />
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full flex flex-col gap-6 pt-6 pb-16">
        
        {/* Title Header */}
        <div className="bg-[#050505] border border-[#2A2A2A] rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-wide">
              Reglementenboek GIJS Groningen House League
            </h2>
            <a
              href="https://gijsgroningen.nl/house-league/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-surface-container text-xs font-mono font-bold text-gray-300 hover:text-tertiary px-3 py-2 rounded-lg border border-[#2A2A2A] hover:border-tertiary/40 transition-colors whitespace-nowrap"
            >
              <span>Bron</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick Search */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Zoek in regels (bijv. contact, divisie, uitrusting, tarieven)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0E0E0E] text-white text-xs font-mono pl-9 pr-4 py-2.5 rounded-lg border border-[#2A2A2A] focus:border-tertiary focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-500 hover:text-white"
              >
                Wis
              </button>
            )}
          </div>
        </div>

        {/* Section List */}
        <div className="space-y-4">
          {filteredSections.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-mono text-xs">
              Geen secties gevonden voor &quot;{searchQuery}&quot;.
            </div>
          ) : (
            filteredSections.map((section) => {
              const Icon = section.icon;
              return (
                <div 
                  key={section.id} 
                  id={section.id}
                  className="bg-surface-container-low border border-[#2A2A2A] rounded-xl p-5 shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3 border-b border-[#2A2A2A]/80 pb-3 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-tertiary/10 border border-tertiary/30 text-tertiary font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {section.number}
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <h3 className="font-display text-base font-bold text-white tracking-wide">
                        {section.number}. {section.title}
                      </h3>
                    </div>
                  </div>
                  {section.content}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
