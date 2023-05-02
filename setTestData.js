const fs = require('fs')

const jsonFilePath = 'cypress/fixtures/data.json'
let rawFixturedata = fs.readFileSync(jsonFilePath)
let fixtureDataAsString = JSON.stringify(JSON.parse(rawFixturedata))

const placeholders = fixtureDataAsString.match(/<.*?>/g)

if (!placeholders) {
    console.log('No placeholders have been found')
    process.exit()
}

placeholders.forEach(placeholder => {
    const systemVariableName = placeholder.match(/<(.*)>/)[1]
    const systemVariableValue = process.env[systemVariableName]
    
    if (systemVariableValue) {
        fixtureDataAsString = fixtureDataAsString.replace(placeholder, systemVariableValue)
    }
})

fs.writeFileSync(jsonFilePath, fixtureDataAsString)
