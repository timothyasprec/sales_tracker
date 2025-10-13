# Cursor IDE Guide

## Setting Up Cursor Rules

### Configuring User Rules
To ensure consistent development practices, set up these rules in Cursor:

1. **Access Settings**: Click the Settings gear icon in the top right corner
2. **Navigate to Rules**: Click on "Rules and Memories"
3. **Scroll to User Rules**: Find the User Rules section
4. **Apply these rules**:

```
1. Use BEM naming conventions for all CSS.

2. When you are directed to fix a bug or create a new feature, first explain the plan you plan to execute on before adding any code or creating any files, and ask for my approval of the plan before executing.

3. Make sure to only touch one file at a time when making updates and I will accept/reject changes before moving on to ensure we have mapped things correctly.

4. Always explain what you are doing / have done.

5. Follow the current project's file structure and style conventions.

6. Understand the project entry points: Backend (test-pilot-server) starts at app.js, Frontend (pilot-client) starts at main.jsx.
```

These rules ensure consistent code quality, proper workflow management, and clear communication during development.

## Working in Cursor IDE

### Getting the Most from Cursor's AI
- **Always have the parent folder open**: This gives the AI context of both frontend and backend
- **Use specific prompts**: Instead of "fix this," say "fix this CSS class to follow BEM naming conventions"
- **Reference files**: Say "in the file `controllers/userController.js`" to help the AI understand context
- **Ask for explanations**: Use prompts like "explain how this database query works"

### Common Cursor Commands
- **Command + Shift + P**: Open command palette
- **Command + P**: Quick file search
- **Command + /**: Comment/uncomment code
- **Command + D**: Select next occurrence of selected text
- **Command + Shift + L**: Select all occurrences of selected text

### Working with Multiple Projects
- **File Explorer**: Use the left sidebar to navigate between `test-pilot-server` and `pilot-client`
- **Terminal**: Use Cursor's built-in terminal (View → Terminal) or `Control + `` (backtick)
- **Split View**: Right-click a file tab → "Split Right" to view backend and frontend files side-by-side

## Cursor IDE Best Practices

### Code Generation Guidelines
- Review generated code for consistency with project standards
- Ensure generated code follows established patterns

### File Organization
- Follow existing project structure
- Use consistent naming conventions across files
- Group related functionality together

### AI Prompting Best Practices
- **Be specific with context**: "In the userController.js file, add error handling for the login function"
- **Reference the tech stack**: "Create a React component using our existing CSS/BEM structure"
- **Include file paths**: "Update the database query in queries/users.js to include pagination"
- **Ask for explanations**: "Explain how this postgres JOIN query works and what it is doing"

### Code Exploration Tips
- **Use semantic search**: Ask "How does user authentication work?" instead of searching for specific function names
- **Trace dependencies**: Ask Cursor to explain how components/modules connect
- **Understand data flow**: "Show me how data flows from the API endpoint to the React component"

### Database Development
- **Reference schema**: Ask Cursor to check existing database structure before suggesting changes
- **Query optimization**: Request explanations for complex PostgreSQL/pgvector queries
- **Migration awareness**: Always ask about database migration impacts before schema changes