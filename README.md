# DAOed Uniswap V2 SDK Core

⚒️ An SDK for building applications on top of DAOed Uniswap V2 Core

## Installation

Install the SDK from npm:

```bash
npm install @daoed-com/uniswap-v2-sdk-core
```

or with yarn:

```bash
yarn add @daoed-com/uniswap-v2-sdk-core
```

## Usage

```typescript
import { Token, Pair, Route } from '@daoed-com/uniswap-v2-sdk-core'

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
3. Update the version in `package.json` if needed
4. Publish to npm: `npm publish`

### Important Notes

- The `dist/` directory contains the built files for distribution
- Always run `npm run build` before publishing to ensure the latest built files are included
- The `prepublishOnly` script will automatically run the build before publishing
