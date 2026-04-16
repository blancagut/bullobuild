#!/usr/bin/env node
/**
 * assign-categories.mjs
 * 1. Upserts a comprehensive professional category taxonomy into Supabase
 * 2. Reads every catalog JSON, maps raw product category → canonical slug
 * 3. Updates every product's category_id in Supabase by matching on model (SKU)
 *
 * Usage:
 *   node scripts/assign-categories.mjs
 *   node scripts/assign-categories.mjs --dry-run
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '../node_modules/@supabase/supabase-js/dist/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes('--dry-run');

const SUPABASE_URL = 'https://yxwqjrgcowcsovktmkzl.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4d3Fqcmdjb3djc292a3Rta3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI1NTAxMSwiZXhwIjoyMDkxODMxMDExfQ._QFQ8i4PKIpP-suSp6LbqD9V5NRGgzXZ-HTw6ovFzWs';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ── 1. FULL CATEGORY TAXONOMY ─────────────────────────────────────────────────
// Format: { slug, name, parent_slug | null }
const TAXONOMY = [
  // ── Top-level ──
  { slug: 'power-tools',           name: 'Power Tools',              parent: null },
  { slug: 'hand-tools',            name: 'Hand Tools',               parent: null },
  { slug: 'outdoor-lawn',          name: 'Outdoor & Lawn',           parent: null },
  { slug: 'storage',               name: 'Storage & Organization',   parent: null },
  { slug: 'safety-ppe',            name: 'Safety & PPE',             parent: null },
  { slug: 'accessories',           name: 'Accessories',              parent: null },
  { slug: 'batteries-chargers',    name: 'Batteries & Chargers',     parent: null },
  { slug: 'vacuums-cleaning',      name: 'Vacuums & Cleaning',       parent: null },
  { slug: 'lighting',              name: 'Lighting',                 parent: null },
  { slug: 'heavy-equipment',       name: 'Heavy Equipment',          parent: null },
  { slug: 'combo-kits',            name: 'Combo Kits',               parent: null },
  { slug: 'measuring',             name: 'Measuring & Layout',       parent: null },

  // ── Power Tools → children ──
  { slug: 'drills-drivers',        name: 'Drills & Drivers',         parent: 'power-tools' },
  { slug: 'impact-drivers',        name: 'Impact Drivers',           parent: 'power-tools' },
  { slug: 'impact-wrenches',       name: 'Impact Wrenches',          parent: 'power-tools' },
  { slug: 'grinders',              name: 'Grinders',                 parent: 'power-tools' },
  { slug: 'saws',                  name: 'Saws',                     parent: 'power-tools' },
  { slug: 'circular-saws',         name: 'Circular Saws',            parent: 'power-tools' },
  { slug: 'reciprocating-saws',    name: 'Reciprocating Saws',       parent: 'power-tools' },
  { slug: 'jig-saws',              name: 'Jig Saws',                 parent: 'power-tools' },
  { slug: 'oscillating-tools',     name: 'Oscillating Tools',        parent: 'power-tools' },
  { slug: 'nailers-staplers',      name: 'Nailers & Staplers',       parent: 'power-tools' },
  { slug: 'sanders',               name: 'Sanders',                  parent: 'power-tools' },
  { slug: 'rotary-hammers',        name: 'Rotary & Demo Hammers',    parent: 'power-tools' },
  { slug: 'air-tools',             name: 'Air Tools',                parent: 'power-tools' },
  { slug: 'routers-planers',       name: 'Routers & Planers',        parent: 'power-tools' },

  // ── Hand Tools → children ──
  { slug: 'wrenches-sockets',      name: 'Wrenches & Sockets',       parent: 'hand-tools' },
  { slug: 'socket-sets',           name: 'Socket Sets',              parent: 'hand-tools' },
  { slug: 'ratchets',              name: 'Ratchets',                 parent: 'hand-tools' },
  { slug: 'pliers-cutters',        name: 'Pliers & Cutters',         parent: 'hand-tools' },
  { slug: 'screwdrivers',          name: 'Screwdrivers',             parent: 'hand-tools' },
  { slug: 'screwdriver-sets',      name: 'Screwdriver Sets',         parent: 'hand-tools' },
  { slug: 'utility-knives',        name: 'Utility Knives',           parent: 'hand-tools' },
  { slug: 'chisels-punches',       name: 'Chisels & Punches',        parent: 'hand-tools' },
  { slug: 'hex-keys',              name: 'Hex Keys & Allen',         parent: 'hand-tools' },
  { slug: 'nut-drivers',           name: 'Nut Drivers',              parent: 'hand-tools' },
  { slug: 'taps-dies',             name: 'Taps & Dies',              parent: 'hand-tools' },
  { slug: 'pex-plumbing',          name: 'PEX & Plumbing Tools',     parent: 'hand-tools' },
  { slug: 'snips',                 name: 'Snips & Cutters',          parent: 'hand-tools' },
  { slug: 'drywall-tools',         name: 'Drywall Tools',            parent: 'hand-tools' },

  // ── Accessories → children ──
  { slug: 'drill-bits',            name: 'Drill & Driver Bits',      parent: 'accessories' },
  { slug: 'saw-blades',            name: 'Saw Blades',               parent: 'accessories' },
  { slug: 'hole-saws',             name: 'Hole Saws',                parent: 'accessories' },
  { slug: 'grinding-wheels',       name: 'Grinding Wheels',          parent: 'accessories' },
  { slug: 'fasteners-nails',       name: 'Fasteners & Nails',        parent: 'accessories' },
  { slug: 'oscillating-blades',    name: 'Oscillating Blades',       parent: 'accessories' },
  { slug: 'sanding-sheets',        name: 'Sanding Sheets & Discs',   parent: 'accessories' },

  // ── Storage → children ──
  { slug: 'tool-boxes',            name: 'Tool Boxes & Chests',      parent: 'storage' },
  { slug: 'bags-belts',            name: 'Bags & Work Belts',        parent: 'storage' },
  { slug: 'storage-accessories',   name: 'Storage Accessories',      parent: 'storage' },

  // ── Measuring → children ──
  { slug: 'tape-measures',         name: 'Tape Measures',            parent: 'measuring' },
  { slug: 'laser-levels',          name: 'Laser Levels',             parent: 'measuring' },
  { slug: 'levels',                name: 'Levels',                   parent: 'measuring' },

  // ── Outdoor → children ──
  { slug: 'lawn-mowers',           name: 'Lawn Mowers',              parent: 'outdoor-lawn' },
  { slug: 'string-trimmers',       name: 'String Trimmers',          parent: 'outdoor-lawn' },
  { slug: 'hedge-trimmers',        name: 'Hedge Trimmers',           parent: 'outdoor-lawn' },
  { slug: 'outdoor-accessories',   name: 'Outdoor Accessories',      parent: 'outdoor-lawn' },

  // ── Safety → children ──
  { slug: 'gloves',                name: 'Gloves',                   parent: 'safety-ppe' },
  { slug: 'workwear',              name: 'Workwear & Jackets',       parent: 'safety-ppe' },
  { slug: 'safety-lanyards',       name: 'Lanyards & Fall Safety',   parent: 'safety-ppe' },

  // ── Heavy Equipment → children ──
  { slug: 'compact-tractors',      name: 'Compact Tractors',         parent: 'heavy-equipment' },
  { slug: 'excavators',            name: 'Excavators',               parent: 'heavy-equipment' },
  { slug: 'skid-steers',           name: 'Skid Steers',              parent: 'heavy-equipment' },
  { slug: 'telescopic-handlers',   name: 'Telescopic Handlers',      parent: 'heavy-equipment' },
  { slug: 'compact-loaders',       name: 'Compact Loaders',          parent: 'heavy-equipment' },
];

// ── 2. RAW CATEGORY → CANONICAL SLUG MAP ──────────────────────────────────────
// Keys are lowercase raw strings from catalog data. Values are slugs from TAXONOMY.
const RAW_TO_SLUG = {
  // Generic / catch-all
  'products':                               'accessories',
  'uncategorized':                          'accessories',
  'other':                                  'accessories',
  'accessories':                            'accessories',

  // Power Tools top-level
  'power tools':                            'power-tools',
  'power tools combo kit':                  'combo-kits',
  'combo kits':                             'combo-kits',
  'combo kit':                              'combo-kits',
  'kits':                                   'combo-kits',

  // Drills
  'drill drivers':                          'drills-drivers',
  'drills & drivers':                       'drills-drivers',
  'drills':                                 'drills-drivers',
  'drill driver':                           'drills-drivers',
  'hammer drills':                          'rotary-hammers',
  'rotary & demolition hammer drills':      'rotary-hammers',
  'rotary hammers':                         'rotary-hammers',

  // Impact
  'impact drivers':                         'impact-drivers',
  'impact driver':                          'impact-drivers',
  'impact wrenches':                        'impact-wrenches',
  'impact wrench':                          'impact-wrenches',

  // Grinders
  'angle grinders':                         'grinders',
  'grinder':                                'grinders',
  'grinders':                               'grinders',
  'grinder attachments & accessories':      'grinding-wheels',
  'grinding':                               'grinding-wheels',

  // Saws
  'saws':                                   'saws',
  'circular saws':                          'circular-saws',
  'circular saw':                           'circular-saws',
  'reciprocating saws':                     'reciprocating-saws',
  'reciprocating saw':                      'reciprocating-saws',
  'jig saws':                               'jig-saws',
  'jig saw':                                'jig-saws',
  'hole saws':                              'hole-saws',
  'hole saw':                               'hole-saws',
  'saw blades':                             'saw-blades',
  'blades & accessories':                   'saw-blades',
  'handsaw blades':                         'saw-blades',
  'speciality hand saws':                   'saws',

  // Oscillating
  'oscillating tool accessories':           'oscillating-blades',
  'oscillating tools':                      'oscillating-tools',
  'oscillating':                            'oscillating-tools',

  // Nailers
  'nailers':                                'nailers-staplers',
  'nailers & staplers':                     'nailers-staplers',
  'staplers & tackers':                     'nailers-staplers',
  'nails & staples':                        'fasteners-nails',
  'fasteners':                              'fasteners-nails',

  // Sanders
  'sanders':                                'sanders',
  'sander attachments & accessories':       'sanding-sheets',
  'sanding sheets':                         'sanding-sheets',
  'sandpaper':                              'sanding-sheets',

  // Air Tools
  'air tools':                              'air-tools',
  'pneumatic':                              'air-tools',

  // Routers
  'routers':                                'routers-planers',
  'routers & planers':                      'routers-planers',
  'router':                                 'routers-planers',

  // Hand Tools
  'hand tools':                             'hand-tools',
  'screwdrivers':                           'screwdrivers',
  'screwdriver sets':                       'screwdriver-sets',
  'screwdriver set':                        'screwdriver-sets',
  'sockets':                                'socket-sets',
  'socket & ratchet sets':                  'socket-sets',
  'ratchet & socket sets':                  'socket-sets',
  'socket sets':                            'socket-sets',
  'ratchets':                               'ratchets',
  'ratchet':                                'ratchets',
  'ratcheting wrenches':                    'wrenches-sockets',
  'combination wrenches':                   'wrenches-sockets',
  'combination wrench':                     'wrenches-sockets',
  'wrench sets':                            'wrenches-sockets',
  'wrenches':                               'wrenches-sockets',
  'wrench':                                 'wrenches-sockets',
  'pliers':                                 'pliers-cutters',
  'plier':                                  'pliers-cutters',
  'snips':                                  'snips',
  'utility knives':                         'utility-knives',
  'utility knife':                          'utility-knives',
  'hex keys':                               'hex-keys',
  'hex key':                                'hex-keys',
  'nut drivers':                            'nut-drivers',
  'nut driver':                             'nut-drivers',
  'taps & dies':                            'taps-dies',
  'pex tools':                              'pex-plumbing',
  'pipe press tools':                       'pex-plumbing',
  'drywall tools':                          'drywall-tools',
  'drywall':                                'drywall-tools',
  'wood chisels':                           'chisels-punches',
  'chisels':                                'chisels-punches',
  'wrecking bars':                          'hand-tools',
  'riveters':                               'hand-tools',
  'framing hammers':                        'hand-tools',
  'files':                                  'hand-tools',
  'hammers':                                'hand-tools',
  'hammer':                                 'hand-tools',
  'squares':                                'measuring',
  'diagnostics & testing':                  'measuring',

  // Drill Bits & Accessories
  'drill & impact bits':                    'drill-bits',
  'drill bits':                             'drill-bits',
  'drill bit set':                          'drill-bits',
  'attachment':                             'accessories',

  // Measuring
  'tape measures':                          'tape-measures',
  'tape measure':                           'tape-measures',
  'lasers':                                 'laser-levels',
  'laser levels':                           'laser-levels',
  'laser level':                            'laser-levels',
  'levels':                                 'levels',
  'level':                                  'levels',
  'measuring tools':                        'measuring',

  // Storage
  'tool boxes':                             'tool-boxes',
  'toolboxes':                              'tool-boxes',
  'rolling tool cabinets':                  'tool-boxes',
  'workshop storage':                       'storage',
  'storage accessories':                    'storage-accessories',
  'storage':                                'storage',
  'buckets & totes':                        'bags-belts',
  'bags & belts':                           'bags-belts',

  // Batteries
  'batteries':                              'batteries-chargers',
  'battery':                                'batteries-chargers',
  'batteries & chargers':                   'batteries-chargers',
  'chargers':                               'batteries-chargers',
  'charger':                                'batteries-chargers',

  // Vacuums
  'handheld vacuum':                        'vacuums-cleaning',
  'stick vacuum':                           'vacuums-cleaning',
  'vacuums':                                'vacuums-cleaning',
  'wet & dry vacuums':                      'vacuums-cleaning',
  'wet & dry vacuum accessories':           'vacuums-cleaning',
  'vacuum filter':                          'vacuums-cleaning',

  // Lighting
  'lighting':                               'lighting',

  // Outdoor
  'lawn mower accessories & attachments':   'outdoor-accessories',
  'trimmer accessory':                      'outdoor-accessories',
  'leaf blowers':                           'outdoor-accessories',
  'string trimmers':                        'string-trimmers',
  'string trimmer':                         'string-trimmers',
  'hedge trimmer':                          'hedge-trimmers',
  'hedge trimmers':                         'hedge-trimmers',
  'mower':                                  'lawn-mowers',
  'lawn mower':                             'lawn-mowers',
  'turf equipment':                         'outdoor-lawn',

  // Safety
  'gloves':                                 'gloves',
  'glove':                                  'gloves',
  'jackets':                                'workwear',
  'jacket':                                 'workwear',
  'workwear':                               'workwear',
  'lanyards':                               'safety-lanyards',

  // Misc tool accessories
  'extension cords':                        'accessories',
  'power strips & adapters':                'accessories',
  'paint brushes':                          'accessories',

  // Heavy Equipment — Bobcat
  'compact tractor':                        'compact-tractors',
  'sub-compact tractor':                    'compact-tractors',
  'loader':                                 'compact-loaders',
  'tractor':                                'compact-tractors',
  'equipment':                              'heavy-equipment',
  'utility vehicle':                        'heavy-equipment',
  'telehandler':                            'telescopic-handlers',

  // Heavy Equipment — Case CE / JD / New Holland
  'compact excavator':                      'excavators',
  'excavators':                             'excavators',
  'compact dozer loader':                   'compact-loaders',
  'backhoe loader':                         'excavators',
  'skid-steer loader':                      'skid-steers',
  'skid steer loaders':                     'skid-steers',
  'compaction equipment':                   'heavy-equipment',
  'wheel loader':                           'compact-loaders',
  'compact wheel loader':                   'compact-loaders',
  'compact track loader':                   'compact-loaders',
  'compact track loaders':                  'compact-loaders',
  'light construction':                     'heavy-equipment',
  'telescopic handlers':                    'telescopic-handlers',
  'compact tractors':                       'compact-tractors',
  'platform / sub-compact tractors':        'compact-tractors',
  'tractors':                               'compact-tractors',
  'loaders':                                'compact-loaders',
  'skid steers':                            'skid-steers',
};

function rawToSlug(raw) {
  if (!raw) return null;
  const key = raw.toLowerCase().trim();
  const direct = RAW_TO_SLUG[key];
  if (direct) return direct;

  // Handle slash-separated breadcrumb categories (e.g. Makita: "Cordless / 18V / LXT / Drills / Lithium-Ion")
  if (key.includes('/')) {
    const parts = key.split('/').map(s => s.trim()).filter(Boolean);
    // Try each part from most-specific (last) to least-specific
    for (let i = parts.length - 1; i >= 0; i--) {
      const m = RAW_TO_SLUG[parts[i]];
      if (m) return m;
    }
    // Also try title-based on the whole string joined
    const joined = parts.join(' ');
    const t = titleToSlug(joined);
    if (t) return t;
  }

  return null;
}

// Title-based keyword detection — used as fallback for brands without proper category fields
const TITLE_RULES = [
  // Order matters: more specific patterns first
  [/rotary hammer|demolition hammer|rotohammer/i,     'rotary-hammers'],
  [/impact wrench/i,                                  'impact-wrenches'],
  [/impact driver/i,                                  'impact-drivers'],
  [/combo kit|kit combo|tool kit/i,                   'combo-kits'],
  [/circular saw/i,                                   'circular-saws'],
  [/reciprocating saw|recip saw|sawzall/i,            'reciprocating-saws'],
  [/jig\s*saw/i,                                      'jig-saws'],
  [/oscillating/i,                                    'oscillating-tools'],
  [/nailer|nail gun/i,                                'nailers-staplers'],
  [/stapler|tacker/i,                                 'nailers-staplers'],
  [/random orbit sander|belt sander|detail sander|palm sander|finishing sander/i, 'sanders'],
  [/sander/i,                                         'sanders'],
  [/sanding sheet|sanding disc|abrasive disc/i,       'sanding-sheets'],
  [/angle grinder|die grinder|bench grinder/i,        'grinders'],
  [/grinder/i,                                        'grinders'],
  [/router|wood shaper/i,                             'routers-planers'],
  [/planer|thickness planer/i,                        'routers-planers'],
  [/drill press/i,                                    'drills-drivers'],
  [/hammer drill/i,                                   'rotary-hammers'],
  [/drill/i,                                          'drills-drivers'],
  [/driver/i,                                         'impact-drivers'],
  [/hole saw/i,                                       'hole-saws'],
  [/saw blade|miter saw|table saw|track saw|band saw|mano saw/i, 'saw-blades'],
  [/saw/i,                                            'saws'],
  [/drill bit|twist bit|spade bit|auger bit|masonry bit|step bit|burr|carbide bit/i, 'drill-bits'],
  [/socket set/i,                                     'socket-sets'],
  [/socket/i,                                         'wrenches-sockets'],
  [/torque wrench|pipe wrench|adjustable wrench|combination wrench|ratcheting wrench/i, 'wrenches-sockets'],
  [/wrench/i,                                         'wrenches-sockets'],
  [/ratchet/i,                                        'ratchets'],
  [/screwdriver set/i,                                'screwdriver-sets'],
  [/screwdriver|bit driver/i,                         'screwdrivers'],
  [/plier|lineman|cutter|crimper|diagonal/i,          'pliers-cutters'],
  [/snip/i,                                           'snips'],
  [/utility knife|box cutter|retractable knife/i,     'utility-knives'],
  [/hex key|allen key|allen wrench/i,                 'hex-keys'],
  [/nut driver/i,                                     'nut-drivers'],
  [/chisel|punch/i,                                   'chisels-punches'],
  [/pex|press tool/i,                                 'pex-plumbing'],
  [/drywall/i,                                        'drywall-tools'],
  [/tape measure|measuring tape/i,                    'tape-measures'],
  [/laser level/i,                                    'laser-levels'],
  [/level/i,                                          'levels'],
  [/measuring/i,                                      'measuring'],
  [/tool box|toolbox|chest|rolling cabinet/i,         'tool-boxes'],
  [/tool bag|work belt|tool belt|backpack|pouch/i,    'bags-belts'],
  [/battery|charger|fuel pack/i,                      'batteries-chargers'],
  [/vacuum|vac\b/i,                                   'vacuums-cleaning'],
  [/flashlight|work light|spotlight|lantern|area light/i, 'lighting'],
  [/lawn mower|grass cutter/i,                        'lawn-mowers'],
  [/string trimmer|weed trimmer|line trimmer/i,       'string-trimmers'],
  [/hedge trimmer/i,                                  'hedge-trimmers'],
  [/blower|leaf blower/i,                             'outdoor-accessories'],
  [/glove/i,                                          'gloves'],
  [/jacket|vest|hi.vis|high.vis/i,                    'workwear'],
  [/excavator/i,                                      'excavators'],
  [/track loader|skid steer/i,                        'skid-steers'],
  [/telehandler|telescopic handler/i,                 'telescopic-handlers'],
  [/compact tractor|sub.compact tractor/i,            'compact-tractors'],
  [/tractor/i,                                        'compact-tractors'],
  [/backhoe/i,                                        'excavators'],
  [/wheel loader|track loader/i,                      'compact-loaders'],
  [/grinding wheel|cutting wheel|flap disc/i,         'grinding-wheels'],
  [/oscillating blade/i,                              'oscillating-blades'],
  [/air tool|pneumatic/i,                             'air-tools'],
  // Spanish keywords (Makita LATAM catalog)
  [/matraca/i,                                         'ratchets'],
  [/desbrozadora|desmalezadora/i,                      'string-trimmers'],
  [/podadora de seto|podadora de arbustos/i,           'hedge-trimmers'],
  [/cortadora de c\u00e9sped|podadora de c\u00e9sped|cortadora de pasto/i, 'lawn-mowers'],
  [/sierra de cadena|motosierra/i,                     'saws'],
  [/sierra circular/i,                                 'circular-saws'],
  [/sierra caladora/i,                                 'jig-saws'],
  [/sierra reciproca|sierra sabre/i,                   'reciprocating-saws'],
  [/lijadora/i,                                        'sanders'],
  [/amoladora/i,                                       'grinders'],
  [/taladro/i,                                         'drills-drivers'],
  [/atornillador de impacto/i,                         'impact-drivers'],
  [/llave de impacto/i,                                'impact-wrenches'],
  [/martillo rotativo|martillo demoledor/i,            'rotary-hammers'],
  [/aspiradora|sopladora|aspirador/i,                  'vacuums-cleaning'],
  [/cargador|bateria|bater\u00eda/i,                  'batteries-chargers'],
  [/linterna|luz de trabajo|l\u00e1mpara/i,           'lighting'],
  [/kit combo|kit de herramientas/i,                   'combo-kits'],
  [/brocas?\b|broca/i,                                 'drill-bits'],
  [/hojas? de sierra|hoja para sierra/i,               'saw-blades'],
  [/disco de corte|disco de esmeril|disco abrasivo/i,  'grinding-wheels'],
  [/banda de lija|disco de lija/i,                     'sanding-sheets'],
  [/guantes/i,                                         'gloves'],
  [/buril|buriles/i,                                   'drill-bits'],
  // Specific product types not covered above
  [/riding mower|gas mower|push mower|lawn tractor/i,  'lawn-mowers'],
  [/shear.*shrub|shrub.*shear|hedge shear/i,           'hedge-trimmers'],
  [/bit kit|screw driving kit|bit set|screwdriving/i,  'drill-bits'],
  [/inspection camera|borescope|scope camera/i,        'measuring'],
  [/cut.?off tool|cutoff tool/i,                       'grinders'],
  [/diamond blade|turbo blade|segmented blade/i,       'saw-blades'],
  [/pick.up tool|telescoping magnet|flex.*magnet/i,    'hand-tools'],
  [/visor|face shield/i,                               'safety-ppe'],
  [/earplug|hearing protection|ear muff/i,             'safety-ppe'],
  [/lanyard|tethering|fall arrest/i,                   'safety-lanyards'],
  [/clamp\b|c.clamp|spring clamp|bar clamp/i,          'hand-tools'],
  [/organizer|deep pro|parts tray/i,                   'storage'],
  [/bench plane|block plane|plane blade|hand plane/i,  'hand-tools'],
  [/shirt|t.shirt|long sleeve|performance shirt/i,     'workwear'],
  [/wheelbarrow|carretilla/i,                          'outdoor-accessories'],
  [/extension cable|cable extension/i,                 'accessories'],
  [/spray gun|paint sprayer/i,                         'power-tools'],
  [/heat gun/i,                                        'power-tools'],
  // Taps & dies (MacTools Metric Tap M3-0.50 etc.)
  [/\btap\b|plug.style tap|taper tap|bottoming tap|thread tap/i, 'taps-dies'],
  [/\bdie\b|thread die|round die|hexagon die/i,        'taps-dies'],
  // Rotary / multi-tool
  [/rotary tool|dremel|multi.?tool/i,                  'power-tools'],
  // Outdoor — edger, fan, sprayer
  [/edger|lawn edger|string edger/i,                   'outdoor-accessories'],
  [/jobsite fan|work fan|cordless fan/i,               'accessories'],
  // Storage — boxes, suitcases, cases
  [/suitcase|tool case|carrying case|rolling box|medium box|storage box/i, 'storage'],
  // Safety
  [/hard hat|safety helmet|bump cap/i,                 'safety-ppe'],
  // Spanish specialty (Makita)
  [/altavoz|bocina|parlante/i,                         'accessories'],
  [/cobija|manta|heated blanket|calefacci/i,           'accessories'],
  [/power head|couple shaft|shaft engine/i,            'power-tools'],
  [/hose\b|garden hose/i,                              'outdoor-accessories'],
  [/earphone|headphone|earbud/i,                       'accessories'],
  [/chemical sprayer|backpack sprayer/i,               'outdoor-accessories'],
  [/bushing\b|connector\b|wire lug/i,                  'accessories'],
  // Home appliances (Black+Decker) — map to accessories as best fit
  [/food processor|blender|mixer\b|juicer/i,           'accessories'],
  [/heater|space heater|fan heater/i,                  'accessories'],
  [/coffee|toaster|iron\b|air conditioner|air purifier/i, 'accessories'],
  // MacTools specialties — drive tools (R.B.R.T., extensions, hex/torx drives)
  [/\bR\.B\.R\.T\b|r\.b\.r\.t/i,                      'ratchets'],
  [/\b(3\/8|1\/4|1\/2)"\s*drive\b/i,                  'wrenches-sockets'],
  [/torx key|star key|spline key/i,                    'hex-keys'],
  [/hex drive|hex bit|torx bit|star bit|spline bit/i,  'drill-bits'],
  [/screw extractor|easy out|bolt extractor/i,         'hand-tools'],
  [/extension bar|wobble extension|flex extension/i,   'wrenches-sockets'],
  [/cooling system|pressure tester|radiator test/i,    'measuring'],
  [/workstation|tool cart|utility cart|drawer cart|roller cabinet|top chest|side cabinet/i, 'tool-boxes'],
  [/macsimizer|tech.*series.*drawer|drawer.*workstation/i, 'tool-boxes'],
  [/neon green|neon orange|neon blue|neon red/i,       'accessories'],
];

function titleToSlug(title) {
  if (!title) return null;
  for (const [pattern, slug] of TITLE_RULES) {
    if (pattern.test(title)) return slug;
  }
  return null;
}

// Unified category detection per product
function detectCategorySlug(product) {
  // 1. Direct category field match
  const raw = (product.category || '').trim();
  if (raw) {
    const s = rawToSlug(raw);
    if (s) return s;
  }

  // 2. Title-based fallback
  const title = product.title || product.name || '';
  return titleToSlug(title);
}

// ── 3. CATALOG FILES ──────────────────────────────────────────────────────────
const CATALOGS = [
  { slug: 'blackdecker', file: 'blackdecker/data/bd-catalog.json' },
  { slug: 'bobcat',      file: 'bobcat/data/bobcat-catalog.json' },
  { slug: 'casece',      file: 'casece/data/casece-catalog.json' },
  { slug: 'craftsman',   file: 'craftsman/data/craftsman-catalog.json' },
  { slug: 'dewalt',      file: 'dewalt/data/dewalt-catalog.json' },
  { slug: 'johndeere',   file: 'johndeere/data/johndeere-catalog.json' },
  { slug: 'mactools',    file: 'mactools/data/mactools-catalog.json' },
  { slug: 'makita',      file: 'makita/data/makita-catalog.json' },
  { slug: 'milwaukee',   file: 'milwaukee/data/milwaukee-catalog.json' },
  { slug: 'newholland',  file: 'newholland/data/newholland-catalog.json' },
  { slug: 'skil',        file: 'skil/data/skil-catalog.json' },
  { slug: 'stanley',     file: 'stanley/data/stanley-catalog.json' },
];

// ── 4. HELPERS ────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function chunks(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ── 5. UPSERT TAXONOMY ────────────────────────────────────────────────────────
async function upsertTaxonomy() {
  console.log('\n── Upserting category taxonomy…');

  // First pass: top-level (no parent)
  const topLevel = TAXONOMY.filter(c => !c.parent);
  for (const cat of topLevel) {
    if (!DRY_RUN) {
      const { error } = await supabase
        .from('categories')
        .upsert({ name: cat.name, slug: cat.slug, parent_id: null }, { onConflict: 'slug' });
      if (error) console.error(`  ERR ${cat.slug}: ${error.message}`);
    }
  }
  console.log(`  Inserted/updated ${topLevel.length} top-level categories`);

  // Fetch all slugs → ids
  const { data: existing } = await supabase.from('categories').select('id, slug');
  const slugToId = {};
  for (const r of (existing || [])) slugToId[r.slug] = r.id;

  // Second pass: children
  const children = TAXONOMY.filter(c => c.parent);
  for (const cat of children) {
    const parentId = slugToId[cat.parent] || null;
    if (!DRY_RUN) {
      const { error } = await supabase
        .from('categories')
        .upsert({ name: cat.name, slug: cat.slug, parent_id: parentId }, { onConflict: 'slug' });
      if (error) console.error(`  ERR ${cat.slug}: ${error.message}`);
    }
  }
  console.log(`  Inserted/updated ${children.length} sub-categories`);

  // Refresh id map
  const { data: all } = await supabase.from('categories').select('id, slug');
  const map = {};
  for (const r of (all || [])) map[r.slug] = r.id;
  return map;
}

// ── 6. ASSIGN CATEGORIES TO PRODUCTS ─────────────────────────────────────────
async function assignCategories(slugToId) {
  console.log('\n── Assigning categories to products…\n');

  let totalUpdated = 0;
  let totalUnmapped = 0;

  for (const { slug: brandSlug, file } of CATALOGS) {
    const filePath = join(__dirname, file);
    if (!existsSync(filePath)) { console.warn(`  ⚠ Missing: ${file}`); continue; }

    const raw = JSON.parse(readFileSync(filePath, 'utf8'));
    const items = Array.isArray(raw) ? raw : raw.products ?? raw.items ?? [];

    // Build SKU → categoryId map AND name → categoryId map (for brands with no SKU)
    const skuToCatId = {};
    const nameToCatId = {}; // normalized title → catId
    const unmappedCats = new Set();

    for (const p of items) {
      const sku = (p.sku || p.model || p.id || '').trim().toUpperCase();
      const catSlug = detectCategorySlug(p);
      const catId = catSlug && slugToId[catSlug] ? slugToId[catSlug] : null;

      if (catId) {
        if (sku) skuToCatId[sku] = catId;
        // Also index by normalized title for name-based fallback
        const title = (p.title || p.name || '').trim().toLowerCase();
        if (title) nameToCatId[title] = catId;
      } else {
        unmappedCats.add(p.category || '(empty)');
      }
    }

    const mappedCount = Object.keys(skuToCatId).length || Object.keys(nameToCatId).length;
    const unmappedCount = items.length - Object.keys(nameToCatId).length;
    totalUnmapped += Math.max(0, unmappedCount);

    console.log(`  ${brandSlug}: ${Object.keys(nameToCatId).length} mapped, ${Math.max(0, unmappedCount)} unmapped`);
    if (unmappedCats.size > 0 && unmappedCats.size <= 10) {
      console.log(`    Unmapped: ${[...unmappedCats].join(', ')}`);
    }

    if (DRY_RUN || Object.keys(nameToCatId).length === 0) continue;

    // Batch update in DB: fetch products by brand, match model or name, update category_id
    const { data: brandRow } = await supabase
      .from('brands').select('id').eq('slug', brandSlug).single();
    if (!brandRow) { console.warn(`  Brand not found: ${brandSlug}`); continue; }

    // Process in pages of 1000
    let page = 0;
    const PAGE_SIZE = 1000;
    while (true) {
      const { data: prods, error } = await supabase
        .from('products')
        .select('id, model, name')
        .eq('brand_id', brandRow.id)
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (error || !prods || prods.length === 0) break;

      // Group by category_id — try model first, then normalized name
      const byCat = {};
      for (const prod of prods) {
        const modelUp = (prod.model || '').toUpperCase();
        const nameNorm = (prod.name || '').trim().toLowerCase();
        const catId = skuToCatId[modelUp] || nameToCatId[nameNorm];
        if (catId) {
          if (!byCat[catId]) byCat[catId] = [];
          byCat[catId].push(prod.id);
        }
      }

      // Batch update each group
      for (const [catId, ids] of Object.entries(byCat)) {
        for (const batch of chunks(ids, 500)) {
          const { error: updErr } = await supabase
            .from('products')
            .update({ category_id: catId })
            .in('id', batch);
          if (updErr) console.error(`    Update error: ${updErr.message}`);
          else totalUpdated += batch.length;
        }
      }

      if (prods.length < PAGE_SIZE) break;
      page++;
    }
  }

  return { totalUpdated, totalUnmapped };
}

// ── 7. MAIN ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nBULLOBUILD — Category Assignment`);
  console.log(`Proyecto: ${SUPABASE_URL}`);
  if (DRY_RUN) console.log('MODO DRY-RUN\n');

  const slugToId = await upsertTaxonomy();
  console.log(`  Total categories in DB: ${Object.keys(slugToId).length}`);

  const { totalUpdated, totalUnmapped } = await assignCategories(slugToId);

  console.log('\n════════════════════════════════');
  console.log(`Productos actualizados: ${totalUpdated}`);
  console.log(`Sin categoría mapeada:  ${totalUnmapped}`);
  console.log('════════════════════════════════\n');
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
