export interface ProfessionConfig {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  heroImage: string;
  accent: string;
  brand: string;
  productName: string;
  productImage: string;
  specialties: string[];
  searchTerms: string[];
  categorySlugs: string[];
}

export const professionConfigs: ProfessionConfig[] = [
  {
    slug: "mechanic",
    title: "Mechanics",
    subtitle: "Socket sets, ratchets, service essentials, and daily bay tools.",
    description:
      "Start with wrench-and-socket depth, then branch into fastening, measuring, and shop-floor essentials for automotive work.",
    href: "/search?profession=mechanic",
    heroImage: "/hero/slide-4.jpg",
    accent: "from-[#0f172acc] via-[#111827b3] to-[#f2b70533]",
    brand: "Stanley",
    productName: "13 pc Professional Grade Combination Wrench Set SAE",
    productImage:
      "https://www.stanleytools.com/NAG/PRODUCT/IMAGES/HIRES/Ecomm_Large-87-244_1.jpg",
    specialties: ["Ratchets", "Sockets", "Adjustable wrenches"],
    searchTerms: ["wrench", "socket", "ratchet", "mechanic"],
    categorySlugs: ["wrenches-sockets"],
  },
  {
    slug: "carpenter",
    title: "Carpenters",
    subtitle: "Saw systems, cutting accessories, fastening, and trim-site flow.",
    description:
      "Open directly into cutting-heavy inventory for framing, finish carpentry, site setups, and portable saw support gear.",
    href: "/search?profession=carpenter",
    heroImage: "/hero/slide-1.jpg",
    accent: "from-[#1f2937cc] via-[#111827b3] to-[#f2b70533]",
    brand: "DeWalt",
    productName: "Rolling Miter Saw Stand",
    productImage:
      "https://assets.dewalt.com/NAG/PRODUCT/IMAGES/HIRES/WHITEBG/DWX726_1_1680.webp",
    specialties: ["Miter saws", "Circular saws", "Jobsite stands"],
    searchTerms: ["saw", "miter", "circular", "nailer", "carpenter"],
    categorySlugs: ["saws", "drills-drivers"],
  },
  {
    slug: "electrician",
    title: "Electricians",
    subtitle: "Cordless drivers, measurement tools, bags, and install-ready kits.",
    description:
      "Route into compact drilling, fastening, layout, and carry solutions that fit service calls, install work, and daily punch lists.",
    href: "/search?profession=electrician",
    heroImage: "/hero/slide-2.jpg",
    accent: "from-[#0b1324cc] via-[#172033b3] to-[#d9770633]",
    brand: "Milwaukee",
    productName: "Utility Bucket Bag w/ Pockets",
    productImage:
      "https://www.milwaukeetool.com/--/web-images/sc/54b7ea6c0b594ecb86fa9bfb0d75b03d?hash=f333a583ccb57e2adf1155172e6effe7&lang=en",
    specialties: ["Drivers", "Tape measures", "Bucket bags"],
    searchTerms: ["driver", "impact", "electrician", "utility", "tape"],
    categorySlugs: ["drills-drivers", "impact-drivers"],
  },
  {
    slug: "plumber",
    title: "Plumbers",
    subtitle: "Compact band saws, angle drills, and service-truck fit-out tools.",
    description:
      "Send plumbers into pipe-cutting, rough-in, repair, and tight-access drilling gear without making them browse the whole catalog first.",
    href: "/search?profession=plumber",
    heroImage: "/hero/slide-3.jpg",
    accent: "from-[#102a43cc] via-[#0f172ab3] to-[#0891b233]",
    brand: "Makita",
    productName: "18V LXT Cordless Compact Band Saw",
    productImage:
      "https://cdn.makitatools.com/apps/cms/img/xbp/dc677594-8cbd-41fe-a063-72a85f89ccf1_xbp03z_p_1500px.png",
    specialties: ["Pipe work", "Band saws", "Angle drills"],
    searchTerms: ["pipe", "drill", "band saw", "plumber", "drain"],
    categorySlugs: ["drills-drivers", "saws"],
  },
];

export const professionConfigBySlug = Object.fromEntries(
  professionConfigs.map((profession) => [profession.slug, profession])
) as Record<string, ProfessionConfig>;