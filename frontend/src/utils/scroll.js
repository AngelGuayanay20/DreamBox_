export function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export const BASE = import.meta.env.BASE_URL;
