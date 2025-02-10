import Module from '../__module';
import * as _ from '../utils';

/**
 * Single entry point for Block mutation events
 */
export default class ModificationsObserver extends Module {
  /**
   * Flag shows onChange event is disabled
   */
  private disabled = false;

  /**
   * Used to prevent several mutation callback execution
   *
   * @type {Function}
   */
  private mutationDebouncer = _.debounce(() => {
    this.updateNativeInputs();

    if (_.isFunction(this.config.onChange)) {
      this.config.onChange(this.Editor.API.methods);
    }
  }, ModificationsObserver.DebounceTimer);

  /**
   * Array of native inputs in Blocks.
   * Changes in native inputs are not handled by modification observer, so we need to set change event listeners on them
   */
  private nativeInputs: HTMLElement[] = [];

  /**
   * Clear timeout and set null to mutationDebouncer property
   */
  public destroy(): void {
    this.mutationDebouncer = null;
    if (this.observer) {
      this.observer.disconnect();
    }
    this.observer = null;
    this.nativeInputs.forEach((input) => this.listeners.off(input, 'input', this.mutationDebouncer));
    this.mutationDebouncer = null;
  }

  /**
   * Set read-only state
   *
   * @param {boolean} readOnlyEnabled - read only flag value
   */
  public toggleReadOnly(readOnlyEnabled: boolean): void {
    if (readOnlyEnabled) {
      this.disableModule();
    } else {
      this.enableModule();
    }
  }

  /**
   * Allows to disable observer,
   * for example when Editor wants to stealthy mutate DOM
   */
  public disable(): void {
    this.disabled = true;
  }

  /**
   * Enables mutation handling
   * Should be called after .disable()
   */
  public enable(): void {
    this.disabled = false;
  }

  /**
   * Disables onChange event
   */
  public disable(): void {
    this.disabled = true;
  }

  /**
   * Call onChange event passed to Editor.js configuration
   *
   * @param event - some of our custom change events
   */
  public onChange(event: CustomEvent): void {
    if (this.disabled || !_.isFunction(this.config.onChange)) {
      return;
    }

    /**
     * We divide two Mutation types:
     * 1) mutations that concerns client changes: settings changes, symbol added, deletion, insertions and so on
     * 2) functional changes. On each client actions we set functional identifiers to interact with user
     */
    let contentMutated = false;

    mutationList.forEach((mutation) => {
      switch (mutation.type) {
        case 'childList':
        case 'characterData':
          contentMutated = true;
          break;
        case 'attributes':
          /**
           * Changes on Element.ce-block usually is functional
           */
          if (!(mutation.target as Element).classList.contains(Block.CSS.wrapper)) {
            contentMutated = true;
          }
          break;
      }
    });

    /** call once */
    if (contentMutated) {
      this.mutationDebouncer();
    }
  }

  /**
   * Gets native inputs and set oninput event handler
   */
  private updateNativeInputs(): void {
    if (this.nativeInputs) {
      this.nativeInputs.forEach((input) => {
        this.listeners.off(input, 'input');
      });
    }

    this.nativeInputs = Array.from(this.Editor.UI.nodes.redactor.querySelectorAll('textarea, input, select'));

    this.nativeInputs.forEach((input) => this.listeners.on(input, 'input', this.mutationDebouncer));
  }

  /**
   * Sets observer and enables it
   */
  private enableModule(): void {
    /**
     * wait till Browser render Editor's Blocks
     */
    window.setTimeout(() => {
      this.setObserver();
      this.updateNativeInputs();
      this.enable();
    }, 1000);
  }

  /**
   * Disables observer
   */
  private disableModule(): void {
    this.disable();
  }
}
