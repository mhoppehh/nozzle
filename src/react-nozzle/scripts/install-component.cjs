// installAndExport.js
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const componentName = process.argv[2] // Change this to the specific component you want to install
const componentsDir = path.join(__dirname, '../src/components') // Adjust the path as needed
const indexFilePath = path.join(componentsDir, 'index.ts')

// Function to install the component
function installComponent() {
  console.log(`Installing ${componentName}...`)
  execSync(`npx shadcn@latest add ${componentName}`, { stdio: 'inherit' })
}

// Function to update the index.ts file
function updateIndexFile() {
  const componentFileName = componentName.split('/').pop() // Get the component name
  const exportStatement = `export * from './ui/${componentFileName}'\n`

  // Check if index.ts exists
  if (fs.existsSync(indexFilePath)) {
    // Append the export statement to the existing index.ts
    fs.appendFileSync(indexFilePath, exportStatement)
    console.log(`Added export for ${componentFileName} to index.ts`)
  } else {
    // Create index.ts and add the export statement
    fs.writeFileSync(indexFilePath, exportStatement)
    console.log(`Created index.ts and added export for ${componentFileName}`)
  }
}

// Main function to run the script
function main() {
  installComponent()
  updateIndexFile()
}

// Execute the main function
main()
