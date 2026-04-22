# Contributing to FocusFlow

Thank you for considering contributing to FocusFlow! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue tracker to avoid duplicates. When you create a bug report, include as many details as possible:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs. actual behavior
- Screenshots if applicable
- Your environment (OS, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- A clear and descriptive title
- Detailed explanation of the proposed functionality
- Any possible implementation details
- Why this enhancement would be useful to most users

### Pull Requests

1. Fork the repository
1. Create a new branch  

   ```bash
   git checkout -b feature/amazing-feature
   ```

1. Make your changes
1. Run tests if available
1. Commit your changes  

   ```bash
   git commit -m "Add some amazing feature"
   ```

1. Push to the branch  

   ```bash
   git push origin feature/amazing-feature
   ```

1. Open a Pull Request

## Development Setup

1. Clone the repository  

   ```bash
   git clone https://github.com/username/FocusFlow.git
   cd FocusFlow
   ```

1. Install dependencies  

   ```bash
   npm install
   ```

1. Start the development server  

   ```bash
   npm run dev
   ```

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### JavaScript Styleguide

- Use 2 spaces for indentation
- Use semicolons
- Prefer `const` over `let`, and `let` over `var`
- Use template literals instead of string concatenation
- Use destructuring when possible
- Use meaningful variable and function names

### CSS Styleguide

- Use 2 spaces for indentation
- Use kebab-case for class names
- Group related properties together
- Add comments for complex selectors or rules

## Additional Notes

### Issue and Pull Request Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements or additions to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed

## Thank You

Your contributions to open source, large or small, make projects like this possible. Thank you for taking the time to contribute.
