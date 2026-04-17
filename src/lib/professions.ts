export interface ProfessionConfig {
  slug: string;
  label: string;
  title: string;
  description: string;
  href: string;
  /** lucide-react icon name rendered by ProfessionsSection */
  icon: "wrench" | "hammer" | "zap" | "droplet" | "trees" | "truck";
  /** tailwind gradient classes for the card background */
  gradient: string;
  /** tailwind color class for icon + accent */
  accent: string;
  specialties: string[];
  /** category slugs that belong to this profession — used to filter /search */
  categorySlugs: string[];
}

export const professionConfigs: ProfessionConfig[] = [
  {
    slug: "mechanic",
    label: "Mechanic",
    title: "Mechanics",
    description:
      "Ratchets, sockets, impact wrenches and hand tools for the automotive bay.",
    href: "/search?profession=mechanic",
    icon: "wrench",
    gradient: "from-[#1a1a1a] via-[#262626] to-[#404040]",
    accent: "text-[#f2b705]",
    specialties: ["Ratchets", "Sockets", "Impact Wrenches"],
    categorySlugs: [
      "wrenches-sockets",
      "socket-sets",
      "ratchets",
      "impact-wrenches",
      "nut-drivers",
      "hex-keys",
    ],
  },
  {
    slug: "carpenter",
    label: "Carpenter",
    title: "Carpenters",
    description:
      "Circular saws, miter saws, nailers and blades for framing and finish work.",
    href: "/search?profession=carpenter",
    icon: "hammer",
    gradient: "from-[#3a2414] via-[#4a2f1a] to-[#6b4423]",
    accent: "text-[#e8a76b]",
    specialties: ["Saws", "Nailers", "Blades"],
    categorySlugs: [
      "saws",
      "circular-saws",
      "jig-saws",
      "routers-planers",
      "nailers-staplers",
      "saw-blades",
    ],
  },
  {
    slug: "electrician",
    label: "Electrician",
    title: "Electricians",
    description:
      "Drills, impact drivers, screwdrivers and pliers for service and install work.",
    href: "/search?profession=electrician",
    icon: "zap",
    gradient: "from-[#1a1f2e] via-[#1f2940] to-[#2d3958]",
    accent: "text-[#f2b705]",
    specialties: ["Drills", "Drivers", "Pliers"],
    categorySlugs: [
      "drills-drivers",
      "impact-drivers",
      "screwdrivers",
      "screwdriver-sets",
      "pliers-cutters",
      "tape-measures",
    ],
  },
  {
    slug: "plumber",
    label: "Plumber",
    title: "Plumbers",
    description:
      "PEX tools, pliers, reciprocating saws and compact drivers for rough-in and repair.",
    href: "/search?profession=plumber",
    icon: "droplet",
    gradient: "from-[#0d2b3e] via-[#0f3d5a] to-[#1a5478]",
    accent: "text-[#4cc9f0]",
    specialties: ["PEX & Pipe", "Recip Saws", "Pliers"],
    categorySlugs: [
      "pex-plumbing",
      "pliers-cutters",
      "reciprocating-saws",
      "impact-drivers",
    ],
  },
  {
    slug: "landscaper",
    label: "Landscaper",
    title: "Landscapers",
    description:
      "Mowers, trimmers, hedge trimmers and outdoor accessories for lawn and garden crews.",
    href: "/search?profession=landscaper",
    icon: "trees",
    gradient: "from-[#14291a] via-[#1a3d24] to-[#255c36]",
    accent: "text-[#86efac]",
    specialties: ["Mowers", "Trimmers", "Hedge Tools"],
    categorySlugs: [
      "outdoor-lawn",
      "lawn-mowers",
      "hedge-trimmers",
      "string-trimmers",
      "outdoor-accessories",
    ],
  },
  {
    slug: "heavy-operator",
    label: "Heavy Equipment",
    title: "Heavy Operators",
    description:
      "Skid steers, excavators, compact loaders and tractors for jobsite earthwork.",
    href: "/search?profession=heavy-operator",
    icon: "truck",
    gradient: "from-[#2a1a0a] via-[#3d2814] to-[#5c3a1f]",
    accent: "text-[#f2b705]",
    specialties: ["Skid Steers", "Excavators", "Loaders"],
    categorySlugs: [
      "heavy-equipment",
      "skid-steers",
      "excavators",
      "compact-loaders",
      "compact-tractors",
      "telescopic-handlers",
    ],
  },
];

export const professionConfigBySlug = Object.fromEntries(
  professionConfigs.map((profession) => [profession.slug, profession])
) as Record<string, ProfessionConfig>;
