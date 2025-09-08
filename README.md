# DAOed Uniswap V2 SDK Core

⚒️ An SDK for building applications on top of DAOed Uniswap V2 Core

## Installation

Install the SDK directly from GitHub:

```bash
npm install git+https://github.com/DAOed/daoed-uniswap-v2-sdk.git#182d8c22bc42c4fa1774fd15abf70cbc4243532f
```

or with yarn:

```bash
yarn add git+https://github.com/DAOed/daoed-uniswap-v2-sdk.git#182d8c22bc42c4fa1774fd15abf70cbc4243532f
```

## Usage

```typescript
import { Token, Pair, Route } from '@daoed/uniswap-v2-sdk-core'

// Create token instances
const token0 = new Token(1, '0x...', 18, 'TOKEN0', 'Token 0')
const token1 = new Token(1, '0x...', 18, 'TOKEN1', 'Token 1')

// Create pair and route
const pair = new Pair(token0Amount, token1Amount)
const route = new Route([pair], token0)
```

## Development

### Building the SDK

Before committing changes, run the build command to generate the latest distribution files:

```bash
npm run build
```

or

```bash
npx tsdx build
```

This will generate the compiled JavaScript files in the `dist/` directory.

### Publishing Process

1. Make your changes to the source code in `src/`
2. Run the build command: `npm run build`
3. Commit both source changes and built files to the repository
4. Push to GitHub
5. The SDK can then be installed directly from GitHub using the installation commands above

### Important Notes

- The `dist/` directory is **included** in version control and should be committed
- Always run `npm run build` before committing to ensure the latest built files are included
- The `prepare` script will automatically run the build when someone installs from GitHub
