#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

function updateReadmeWithCommitHash() {
  try {
    // Get the latest commit hash
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    console.log(`Latest commit hash: ${commitHash}`);

    // Read the current README.md
    const readmePath = 'README.md';
    const readmeContent = fs.readFileSync(readmePath, 'utf8');

    // Define the new install commands with commit hash
    const newNpmInstall = `npm install git+https://github.com/DAOed/daoed-uniswap-v2-sdk.git#${commitHash}`;
    const newYarnInstall = `yarn add git+https://github.com/DAOed/daoed-uniswap-v2-sdk.git#${commitHash}`;

    // Replace the install commands in the README
    const updatedContent = readmeContent
      .replace(
        /npm install git\+https:\/\/github\.com\/DAOed\/daoed-uniswap-v2-sdk\.git(#[a-f0-9]+)?/g,
        newNpmInstall
      )
      .replace(
        /yarn add git\+https:\/\/github\.com\/DAOed\/daoed-uniswap-v2-sdk\.git(#[a-f0-9]+)?/g,
        newYarnInstall
      );

    // Write the updated content back to README.md
    fs.writeFileSync(readmePath, updatedContent);
    console.log('README.md updated with latest commit hash');

    // Stage the README.md file
    execSync('git add README.md', { stdio: 'inherit' });
    console.log('README.md staged for commit');

    // Commit the changes
    const commitMessage = `chore: update install commands with commit hash ${commitHash.substring(0, 7)}`;
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    console.log('Changes committed');

    // Push the changes
    execSync('git push', { stdio: 'inherit' });
    console.log('Changes pushed to remote repository');

  } catch (error) {
    console.error('Error updating README:', error.message);
    process.exit(1);
  }
}

updateReadmeWithCommitHash();