// Suggest an emoji based on the item name. Best-effort keyword matching;
// runs client-side at create time and the result is stored on the row.

const FALLBACK = "📌";

// Order matters: more specific keywords first so they win over generic ones
// (e.g. "vacío" should match 🥩 before "vaso" wins on the substring).
const MAP: Array<[string[], string]> = [
  // --- Meat & grill ---
  [["asado", "carne", "vacio", "vacío", "bife", "costilla", "tira"], "🥩"],
  [["pollo", "ala"], "🍗"],
  [["chori", "chorizo", "salchi"], "🌭"],
  [["morcilla", "molleja", "achura"], "🍖"],
  [["pescado", "salmon", "atun"], "🐟"],
  [["hamburguesa", "burger"], "🍔"],
  [["pancho", "hot dog"], "🌭"],

  // --- Fire / grill kit ---
  [["leña", "lena"], "🪵"],
  [["carbon", "carbón"], "⬛️"],
  [["encendedor", "fosforos", "fósforos"], "🔥"],
  [["parrilla", "parrillero"], "🍳"],

  // --- Drinks ---
  [["vino"], "🍷"],
  [["champ", "espumante", "sidra"], "🍾"],
  [["cerveza", "birra", "porron"], "🍺"],
  [["fernet"], "🥃"],
  [["whisky", "vodka", "gin", "ron", "trago"], "🥃"],
  [["gaseosa", "coca", "sprite", "fanta", "pepsi"], "🥤"],
  [["jugo", "exprimido"], "🧃"],
  [["agua"], "💧"],
  [["mate", "yerba", "termo"], "🧉"],
  [["cafe", "café"], "☕"],
  [["te", "té"], "🍵"],
  [["leche"], "🥛"],
  [["hielo"], "🧊"],

  // --- Sides / salads / staples ---
  [["ensalada", "lechuga", "tomate", "rucula", "espinaca"], "🥗"],
  [["papa", "papas", "patatas", "fritas"], "🍟"],
  [["pan", "baguette"], "🍞"],
  [["queso"], "🧀"],
  [["fiambre", "jamon", "jamón", "salame"], "🥓"],
  [["huevo"], "🥚"],
  [["choclo", "maiz", "maíz"], "🌽"],
  [["aceitunas"], "🫒"],
  [["arroz"], "🍚"],
  [["fideos", "pasta", "tallarines"], "🍝"],
  [["pizza"], "🍕"],
  [["empanada"], "🥟"],
  [["sushi"], "🍣"],
  [["taco", "burrito"], "🌮"],
  [["picada"], "🧀"],

  // --- Sweets ---
  [["dulce", "postre", "tarta"], "🍰"],
  [["torta", "cumple"], "🎂"],
  [["helado"], "🍨"],
  [["chocolate", "alfajor"], "🍫"],
  [["fruta", "manzana"], "🍎"],
  [["banana"], "🍌"],
  [["sandia", "sandía"], "🍉"],
  [["uva"], "🍇"],
  [["facturas", "medialuna"], "🥐"],

  // --- Utensils / extras ---
  [["mantel"], "🧺"],
  [["plato"], "🍽️"],
  [["vaso", "copa"], "🥂"],
  [["cubierto", "tenedor", "cuchillo"], "🍴"],
  [["servilleta"], "🧻"],
  [["bolsa", "tacho", "basura"], "🗑️"],
  [["parlante", "musica", "música"], "🔊"],
  [["silla", "reposera", "mesa"], "🪑"],
  [["regalo"], "🎁"],
  [["camara", "cámara", "foto"], "📷"],
  [["repelente", "off"], "🦟"],
  [["protector solar", "bloqueador", "solar"], "🧴"],
  [["pelota"], "⚽"],
  [["sombrilla"], "⛱️"],
  [["sal"], "🧂"],
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function suggestEmoji(name: string): string {
  const n = normalize(name).trim();
  if (!n) return FALLBACK;

  for (const [keywords, emoji] of MAP) {
    for (const kw of keywords) {
      const k = normalize(kw);
      if (n === k || n.includes(k)) return emoji;
    }
  }
  return FALLBACK;
}
