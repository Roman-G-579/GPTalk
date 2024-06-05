import { PagesComponent } from './pages.component';
import { mount } from 'cypress/angular';

it('Should show App is running!', () => {
	mount(PagesComponent);
	cy.get('[data-cy=text]').should('have.text', 'Congratulations! Your app is running. 🎉');
});
