import { Injectable, EventEmitter } from '@angular/core';
import { signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private history = signal<any[]>([]);
  private pointer = signal<number>(-1);

  // For components to subscribe to, triggered by this service.
  public undoTrigger = new EventEmitter<void>();
  public redoTrigger = new EventEmitter<void>();

  canUndo = computed(() => this.pointer() > 0);
  canRedo = computed(() => this.pointer() < this.history().length - 1);

  addState(state: any) {
    // This is a new state, so we clear the 'redo' history.
    const newHistory = this.history().slice(0, this.pointer() + 1);
    newHistory.push(JSON.parse(JSON.stringify(state))); // Deep copy
    this.history.set(newHistory);
    this.pointer.update(p => p + 1);
  }

  undo(): any | null {
    if (this.canUndo()) {
      this.pointer.update(p => p - 1);
      return JSON.parse(JSON.stringify(this.history()[this.pointer()]));
    }
    return null;
  }

  redo(): any | null {
    if (this.canRedo()) {
      this.pointer.update(p => p + 1);
      return JSON.parse(JSON.stringify(this.history()[this.pointer()]));
    }
    return null;
  }

  // To be called by UI elements (e.g., buttons in a toolbar)
  triggerUndo() {
    if (this.canUndo()) {
      this.undoTrigger.emit();
    }
  }

  triggerRedo() {
    if (this.canRedo()) {
      this.redoTrigger.emit();
    }
  }

  clear() {
    this.history.set([]);
    this.pointer.set(-1);
  }
}
