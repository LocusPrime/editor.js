// eslint-disable-next-line spaced-comment, @typescript-eslint/triple-slash-reference
/// <reference path="../support/index.d.ts" />

describe('Editor basic initialization', () => {
  describe('Zero-config initialization', () => {
    /**
     * In this test suite we use zero (omitted) configuration
     */
    const editorConfig = {};

    beforeEach(function () {
      cy.createEditor(editorConfig).as('editorInstance');
    });

    afterEach(function () {
      if (this.editorInstance) {
        this.editorInstance.destroy();
      }
    });

    it('should create a visible UI', () => {
      /**
       * Assert if created instance is visible or not.
       */
      cy.get('[data-cy=editorjs]')
        .get('div.codex-editor')
        .should('be.visible');
    });
  });
});
