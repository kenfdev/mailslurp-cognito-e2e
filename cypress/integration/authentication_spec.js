/// <reference types="Cypress" />

const MailSlurp = require('mailslurp-client').default;

// test the authentication flow using Cypress test runner
describe('user signup and signin', () => {
  let username;
  let emailAddress;
  let mailSlurp;

  const password = '!234Abcd';

  before('create a random email inbox to sign-up with', done => {
    const apiKey = Cypress.env('apiKey');

    mailSlurp = new MailSlurp({ apiKey });
    // create a new email inbox that returns an id and an address
    mailSlurp.createInbox().then(
      ({ id, emailAddress: address }) => {
        username = id;
        emailAddress = address;
        done();
      },
      err => {
        // log or inspect an error here if necessary
        throw err;
      }
    );
  });

  it('allows signup with generated inbox and username', () => {
    cy.visit('http://localhost:8080');
    // use the username and email address we got
    // from MailSlurp to sign a user up by filling out
    // the sign-up form
    cy.get('[data-test=sign-in-create-account-link]').click();
    cy.get('input[placeholder=Username]').type(username);
    cy.get('input[type=email]').type(emailAddress);
    cy.get('input[type=password]').type(password);
    cy.get('[data-test=sign-up-create-account-button]').click();
  });

  it(
    'sends a verification code which can be ' +
      'received by user, extracted, and submitted',
    () => {
      let verificationCode;
      // use cypress's async api
      cy.then(() => {
        // check the users inbox and hold the
        // connection until one email is present
        // wait 90s at most
        return mailSlurp
          .getEmails(username, { minCount: 1, retryTimeout: 90000 })
          .then(([latestEmailPreview]) => latestEmailPreview)
          .then(latestEmailPreview => mailSlurp.getEmail(latestEmailPreview.id))
          .then(latestEmail => {
            // regex match for the confirmation code
            // within the email body
            const r = /\s(\d{6})/g;
            // extract the verification code
            verificationCode = r.exec(latestEmail.body)[1];
          });
      });
      // submit the code we extracted from the email
      cy.get('[data-test=confirm-sign-up-confirmation-code-input]').then(
        input => {
          cy.wrap(input).type(verificationCode);
        }
      );
      cy.get('[data-test=confirm-sign-up-confirm-button]').click();
    }
  );

  it('successfully verifies a user and allows that user to login', () => {
    cy.get('[data-test=username-input]').type(username);
    cy.get('[data-test=sign-in-password-input]').type(password);
    cy.get('[data-test=sign-in-sign-in-button]').click();
    cy.get('[data-test=logged-in-header]').should(
      'have.text',
      'You are Logged In!'
    );
  });
});
