n I# Contributing to AR Map Explorer

We love your input! We want to make contributing to AR Map Explorer as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Quick Start for Contributors

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/ar-map-explorer.git
   cd ar-map-explorer
   ```
3. **Run the setup script**:
   ```bash
   ./setup.sh
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
5. **Make your changes** and test them
6. **Submit a pull request**

## 🐛 Bug Reports

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/your-username/ar-map-explorer/issues/new).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## 💡 Feature Requests

We welcome feature requests! Please:

1. **Check existing issues** to avoid duplicates
2. **Describe the feature** clearly
3. **Explain the use case** and why it would be valuable
4. **Consider the scope** - start with smaller, focused features

## 🛠️ Development Process

We use GitHub flow, so all code changes happen through pull requests:

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## 📝 Code Style

### Backend (Python)

```bash
# Format code
black app/
flake8 app/

# Run tests
pytest
```

### Frontend (TypeScript/React Native)

```bash
# Lint code
npm run lint

# Run tests
npm test
```

## 🧪 Testing

### Backend Testing

```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

### Frontend Testing

```bash
cd frontend
npm test
```

### Manual Testing

1. **Start both servers**:
   ```bash
   ./start-backend.sh    # Terminal 1
   ./start-frontend.sh   # Terminal 2
   ```
2. **Test on mobile device** with Expo Go
3. **Verify core features**:
   - User registration/login
   - Camera functionality
   - AR content creation
   - Map exploration

## 📋 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Update the README.md** with details of changes if applicable
4. **Follow the code style** guidelines
5. **Write clear commit messages**

### Commit Message Format

```
type: brief description

Longer description if needed

- List specific changes
- Include any breaking changes
- Reference issues: Closes #123
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests
- `chore`: Updating build tasks, package manager configs, etc.

## 🔄 Development Workflow

### For New Features

1. **Create an issue** describing the feature
2. **Wait for approval** from maintainers
3. **Fork and create branch**: `feature/issue-number-description`
4. **Implement the feature**
5. **Add tests and documentation**
6. **Submit pull request**

### For Bug Fixes

1. **Create an issue** describing the bug (if not exists)
2. **Fork and create branch**: `fix/issue-number-description`
3. **Fix the bug**
4. **Add regression tests**
5. **Submit pull request**

## 🏗️ Architecture Guidelines

### Backend (FastAPI)

- **Follow REST principles** for API design
- **Use Pydantic schemas** for request/response validation
- **Implement proper error handling** with meaningful messages
- **Add database migrations** for schema changes
- **Write unit tests** for business logic

### Frontend (React Native)

- **Use TypeScript** for type safety
- **Follow React hooks patterns**
- **Implement proper error boundaries**
- **Use consistent styling** with React Native Paper
- **Add proper loading states**

## 📚 Documentation

- **Update README.md** for new features
- **Add inline code comments** for complex logic
- **Update API documentation** for backend changes
- **Include usage examples** where helpful

## 🤝 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## 📞 Getting Help

- **Documentation**: Check the README.md first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community Discord (link in README)

## 🎯 Good First Issues

Looking for good first contributions? Look for issues labeled:

- `good first issue` - Perfect for newcomers
- `help wanted` - We need help with these
- `documentation` - Improve our docs
- `bug` - Fix reported bugs

## 🙏 Recognition

Contributors are recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page

Thank you for contributing to AR Map Explorer! 🚀✨
