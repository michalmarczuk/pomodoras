import { defineConfig } from 'cypress'

export default defineConfig({
  
  e2e: {
    baseUrl: "http://localhost:4200",
    supportFile: "cypress/support/index.ts",
  },
  
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.ts'
  }
  
})