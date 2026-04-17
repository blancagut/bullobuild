export interface ProfessionConfig {
  slug: string;
  label: string;
  title: string;
  description: string;
  href: string;
  heroImage: string;
  specialties: string[];
  searchTerms: string[];
  categorySlugs: string[];
}

export const professionConfigs: ProfessionConfig[] = [
  {
    slug: "mechanic",
    label: "Auto",
    title: "Mechanics",
    description: "Sockets, ratchets, and hand tools built for daily bay work.",
    href: "/search?profession=mechanic",
    heroImage: "/hero/slide-4.jpg",
    specialties: ["Ratchets", "Sockets", "Wrenches"],
    searchTerms: ["wrench", "socket", "ratchet", "mechanic"],
    categorySlugs: ["wrenches-sockets"],
  },
  {
    slug: "carpenter",
    label: "Wood",
    title: "Carpenters",
    description: "Saws, blades, and jobsite stands for framing and finish work.",
    href: "/search?profession=carpenter",
    heroImage: "/hero/slide-1.jpg",
    specialties: ["Miter saws", "Circular saws", "Stands"],
    searchTerms: ["saw", "miter", "circular", "nailer", "carpenter"],
    categorySlugs: ["saws", "drills-drivers"],
  },
  {
    slug: "electrician",
    label: "Install",
    title: "Electricians",
    description: "Compact drivers, tape, and install-ready bags for service calls.",
    href: "/search?profession=electrician",
    heroImage: "/hero/slide-2.jpg",
    specialties: ["Drivers", "Tape measures", "Bags"],
    searchTerms: ["driver", "impact", "electrician", "utility", "tape"],
    categorySlugs: ["drills-drivers", "impact-drivers"],
  },
  {
    slug: "plumber",
    label: "Pipe",
    title: "Plumbers",
    description: "Band saws, angle drills, and tight-access gear for rough-in and repair.",
    href: "/search?profession=plumber",
    heroImage: "/hero/slide-3.jpg",
    specialties: ["Pipe work", "Band saws", "Angle drills"],
    searchTerms: ["pipe", "drill", "band saw", "plumber", "drain"],
    categorySlugs: ["drills-drivers", "saws"],
  },
];

export const professionConfigBySlug = Object.fromEntries(
  professionConfigs.map((profession) => [profession.slug, profession])
) as Record<string, ProfessionConfig>;
