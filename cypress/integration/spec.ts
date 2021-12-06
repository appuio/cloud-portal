describe('Visit page', () => {
  it('Visits the initial project page', () => {
    cy.visit('/')
    cy.title().should('eq', 'APPUiO Cloud Portal')
  })
})
