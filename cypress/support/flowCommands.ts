import { LoginPage } from "cypress/pages/loginPage";

Cypress.Commands.add('cleanUpDB', () => {
    cy.log('Cleaning up the database data');

    return cy.request(
      'POST',
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAY-o2Y6IHk258A-kHAY1dUJRWMh4B5dOY',
      {
          email: "john.connor@sky.net",
          password: "Doopa1234",
          returnSecureToken: true
      }).then(response => {
        cy.request(
          'PATCH',
          `https://pomodoras-4403d-default-rtdb.europe-west1.firebasedatabase.app/pomodoroTimer/-NBpy-izSOQYicV4i8uf.json?auth=${response.body.idToken}`,
          {
            timerCount: 20,
            pomodorosDone: 0,
            state: "stop"
          }
        )
      })
})

Cypress.Commands.add('login', () => {
    const loginPage: LoginPage = new LoginPage();
    loginPage.open();

    return cy.fixture('data.json').then((data) => {
      loginPage.login(data.user.email, data.user.password);
    });
})