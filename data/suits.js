export const suits = [
  {
    slug: "apex-one-piece",
    name: "Apex One-Piece",
    note: "Kangaroo leather, full perforation",
    description:
      "Our lightest one-piece. Kangaroo leather in the seat and sleeves, CE Level 2 armor at the shoulders, elbows, hips and knees, and full perforation from chest to thigh so the suit keeps working on the third stint.",
    details: ["Kangaroo leather chassis", "CE Level 2 armor, all four joints", "Full front and thigh perforation", "Race hump, aerodynamic collar", "Glove-compatible cuffs with YKK zips"],
    bg: "#e10600",
    fg: "#fff",
    base: "#000",
    accent: "#fff",
    trim: "#000",
  },
  {
    slug: "circuit-two-piece",
    name: "Circuit Two-Piece",
    note: "Cowhide, zip-together jacket and pants",
    description:
      "The two-piece that zips together into a full one-piece for track days, then separates for the ride home. 1.2 mm cowhide, pre-curved sleeves and a full 360 degree waist zip.",
    details: ["1.2 mm cowhide, dual stitched", "360 degree jacket-to-pants zip", "CE Level 2 shoulders and elbows", "Perforated chest panels", "Removable thermal liner"],
    bg: "#fff",
    fg: "#000",
    base: "#000",
    accent: "#e10600",
    trim: "#000",
  },
  {
    slug: "grid-textile",
    name: "Grid Textile",
    note: "Abrasion-resistant textile, removable liner",
    description:
      "A four-season textile suit for riders who commute on weekdays and hit the track on Sunday. Abrasion-resistant shell, vented panels, and a liner that comes out in one zip.",
    details: ["Abrasion-resistant textile shell", "Chest, arm and thigh vents", "Removable thermal liner", "CE Level 2 armor at shoulders and knees", "Reflective piping at the back"],
    bg: "#1a1a1a",
    fg: "#fff",
    base: "#e10600",
    accent: "#fff",
    trim: "#000",
  },
  {
    slug: "wet-lap",
    name: "Wet Lap",
    note: "Waterproof shell for damp track days",
    description:
      "Built for the session that starts in drizzle and ends in standing water. Fully taped seams, a sealed membrane shell, and a visor-adjacent collar that keeps the rain off your neck.",
    details: ["Waterproof membrane, taped seams", "Sealed zips with storm flaps", "Aquastop collar and cuffs", "CE Level 2 armor, all joints", "Drainage vents at the lower back"],
    bg: "#fff",
    fg: "#000",
    base: "#e10600",
    accent: "#000",
    trim: "#000",
  },
  {
    slug: "night-run",
    name: "Night Run",
    note: "Reflective panels for early and late rides",
    description:
      "Made for the ride home after the sun is gone. Reflective panels across the back, arms and calves light up in headlights while the rest of the suit stays matte black in daylight.",
    details: ["High-visibility reflective panels", "Matte black cowhide base", "CE Level 2 armor, all four joints", "Ventilated back and underarm panels", "Anti-slip seat panel"],
    bg: "#e10600",
    fg: "#fff",
    base: "#000",
    accent: "#000",
    trim: "#fff",
  },
];

export const getSuit = (slug) => suits.find((s) => s.slug === slug);
