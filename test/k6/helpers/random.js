import faker from 'k6/x/faker';

export function generateRandomEmail() {
  return faker.person.email();
}

export function generateRandomUsername() {
  return faker.internet.username();
}
