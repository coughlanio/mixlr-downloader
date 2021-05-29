# mixlr-downloader

Download any Mixlr Showreel

## Setup

```bash
npm install
```

## Usage

```bash
➜  mixlr-downloader git:(main) ✗ node index.js --help                          
Usage: index [options]

Options:
  -u, --user <username>     mixlr username
  -o, --output <directory>  output directory
  -h, --help                display help for command
```

## Example

```bash
node index.js -u jeff-gerstmann -o $(pwd)/test
```