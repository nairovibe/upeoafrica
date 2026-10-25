/**
 * Delay for one item in a revealed grid or list, in seconds.
 *
 * Each `Reveal` triggers on its own scroll position, so a flat `index * step`
 * would leave cards far down the page sitting still for a beat *after* they are
 * already on screen. Staggering across a row and then restarting keeps the
 * cascade readable at the top of a grid without ever feeling laggy lower down.
 *
 * Pass the widest column count the grid reaches (`1` for a stacked list, where
 * every item should reveal the moment it arrives.
 *
 * Deliberately kept out of `Reveal.tsx`: that module is `"use client"`, and a
 * plain function exported from a client module cannot be *called* by a server
 * component, only rendered. Most of the sections that stagger are server
 * components.
 */
export function stagger(index: number, columns = 3, step = 0.06) {
  return (index % Math.max(1, columns)) * step;
}
