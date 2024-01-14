export class EventManager<Type> {
  private callbacks: Set<(data: Type) => void> = new Set();

  on(callback: (data: Type) => void) {
    this.callbacks.add(callback);
  }
  off(callback: (data: Type) => void) {
    this.callbacks.delete(callback);
  }

  emit(data: Type) {
    this.callbacks.forEach((callback) => callback(data));
  }
}
