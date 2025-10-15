import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente modal de confirmación reutilizable
 * Diseño con liquid glass para confirmar acciones críticas
 */
@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css'
})
export class ConfirmModalComponent {
  /**
   * Título del modal
   */
  @Input() title: string = '¿Confirmar acción?';

  /**
   * Mensaje descriptivo
   */
  @Input() message: string = '¿Está seguro que desea continuar?';

  /**
   * Texto del botón de confirmación
   */
  @Input() confirmText: string = 'Confirmar';

  /**
   * Texto del botón de cancelación
   */
  @Input() cancelText: string = 'Cancelar';

  /**
   * Tipo de modal (info, warning, danger)
   */
  @Input() type: 'info' | 'warning' | 'danger' = 'warning';

  /**
   * Estado de visibilidad del modal
   */
  @Input() isOpen: boolean = false;

  /**
   * Evento emitido cuando se confirma
   */
  @Output() confirmed = new EventEmitter<void>();

  /**
   * Evento emitido cuando se cancela
   */
  @Output() cancelled = new EventEmitter<void>();

  /**
   * Confirma la acción y cierra el modal
   */
  confirm(): void {
    this.confirmed.emit();
    this.close();
  }

  /**
   * Cancela la acción y cierra el modal
   */
  cancel(): void {
    this.cancelled.emit();
    this.close();
  }

  /**
   * Cierra el modal
   */
  close(): void {
    this.isOpen = false;
  }

  /**
   * Previene el cierre del modal al hacer click en el contenido
   */
  onContentClick(event: Event): void {
    event.stopPropagation();
  }
}
