export function pushTankopediaPath(id: number) {
  window.history.pushState(null, '', `/tools/tankopedia/${id}`);
}
