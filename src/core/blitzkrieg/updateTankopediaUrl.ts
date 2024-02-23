export function updateTankopediaUrl(id: number) {
  window.history.pushState(null, '', `/tools/tankopedia/${id}`);
}
