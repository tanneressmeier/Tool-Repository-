# Tool Inventory System - Specifications

This directory contains the complete technical and functional specifications for the **Tool Inventory System**. These documents serve as the single source of truth for the application's design, architecture, features, and data models.

They are intended for developers, project managers, and quality assurance teams to understand how the system is designed and how it should behave.

## Documents

| Document | Description |
|---|---|
| **[01-PROJECT-OVERVIEW.md](./01-PROJECT-OVERVIEW.md)** | Provides a high-level introduction to the project, including its purpose, the problems it solves, its target audience, and its overall scope. |
| **[02-FEATURES.md](./02-FEATURES.md)** | Contains a detailed breakdown of every user-facing feature, including its capabilities, user workflows, and AI integration points. |
| **[03-TECHNICAL-ARCHITECTURE.md](./03-TECHNICAL-ARCHITECTURE.md)** | Describes the system's architecture, technology stack, component structure, data flow, state management, and other engineering patterns. |
| **[04-DATA-MODELS.md](./04-DATA-MODELS.md)** | Defines all the TypeScript interfaces and data structures used throughout the application, complete with field descriptions and examples. |
| **[05-AI-INTEGRATION.md](./05-AI-INTEGRATION.md)** | Details the integration with the Google Gemini AI, including API setup, models used, specific prompts, and schema definitions for structured output. |
| **[06-API-REFERENCE.md](./06-API-REFERENCE.md)** | Serves as the API documentation for the application's service layer, detailing the functions available in `geminiService.ts` and `dataService.ts`. |
| **[MAINTENANCE-GUIDE.md](./MAINTENANCE-GUIDE.md)** | A guide for developers explaining how and when to update these specification documents to keep them synchronized with the codebase. |

## How to Use These Documents

1.  **Onboarding:** New team members should start with the `01-PROJECT-OVERVIEW.md` to understand the project's goals, then proceed to `03-TECHNICAL-ARCHITECTURE.md` for a technical overview.
2.  **Feature Development:** Before starting a new feature, consult `02-FEATURES.md` to understand the requirements and user workflows.
3.  **Code Review:** Reference these documents during code reviews to ensure the implementation aligns with the intended design.
4.  **Maintenance:** When making changes, follow the `MAINTENANCE-GUIDE.md` to keep the documentation current.

These living documents are crucial for maintaining the quality and consistency of the application. Please ensure they are updated as part of your development workflow.
