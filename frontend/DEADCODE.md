# Dead Code Analysis with Knip

This project uses [Knip](https://github.com/webpro/knip) to find dead code, unused dependencies, and other code quality issues.

## Available Scripts

### Basic Analysis

```bash
npm run deadcode
```

Runs Knip with the default configuration to find:

- Unused files
- Unused dependencies
- Unused exports
- Unused types

### Strict Analysis

```bash
npm run deadcode:strict
```

Runs Knip in strict mode, treating all issues as errors.

### JSON Output

```bash
npm run deadcode:json
```

Outputs results in JSON format for programmatic processing.

### Summary Report

```bash
npm run deadcode:summary
```

Provides a compact summary of findings.

## Configuration

The Knip configuration is in `knip.json` and includes:

- **Entry points**: `src/main.tsx` (the main application entry)
- **Project files**: All TypeScript/TSX files in `src/`
- **Ignored files**: UI component library files
- **Rules**: Warning level for most checks to avoid false positives

## Understanding the Results

### Unused Files

Files that are not imported or referenced anywhere in the codebase.

### Unused Dependencies

NPM packages that are installed but not used in the code.

### Unused Exports

Exported functions, variables, or types that are not imported anywhere.

### Unused Types

TypeScript interfaces and types that are defined but not used.

## Common False Positives

Some components may appear unused because:

- They are imported dynamically
- They are used in conditional rendering
- They are part of a component library that's used elsewhere

## Cleaning Up Dead Code

1. **Review unused files**: Check if they're actually needed
2. **Remove unused dependencies**: Run `npm uninstall <package-name>`
3. **Clean up unused exports**: Remove or use the exported items
4. **Update types**: Remove unused TypeScript interfaces

## Integration with CI/CD

You can add dead code analysis to your CI pipeline:

```yaml
- name: Check for dead code
  run: npm run deadcode:strict
```

This will fail the build if any dead code is found.
