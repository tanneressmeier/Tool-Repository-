# Specifications Maintenance Guide

> **Last Updated:** 2025-11-17
## Purpose

This guide explains how to keep specification documents synchronized with code changes. Well-maintained specifications ensure that:

- New developers can onboard quickly
- Code reviews reference accurate documentation
- Features are implemented according to design
- Technical debt is visible and tracked
- API contracts are clear and stable

## When to Update Specifications

### ✅ Always Update When:

1. **Adding a new feature**
   - Update `02-FEATURES.md` with feature description and workflows
   - Add new data types to `04-DATA-MODELS.md` if applicable
   - Document new service functions in `06-API-REFERENCE.md`

2. **Modifying existing features**
   - Update relevant sections in `02-FEATURES.md`
   - Update examples to reflect new behavior

3. **Changing data models**
   - Update type definitions in `04-DATA-MODELS.md`
   - Update related API signatures in `06-API-REFERENCE.md`
   - Update examples throughout docs

4. **Refactoring architecture**
   - Update `03-TECHNICAL-ARCHITECTURE.md` with new patterns
   - Update component hierarchy if changed
   - Document new design decisions

5. **Adding/changing AI features**
   - Update `05-AI-INTEGRATION.md` with new prompts/models
   - Document new AI capabilities in feature docs

6. **Deprecating features**
   - Mark features as deprecated in specs
   - Add migration notes
   - Keep documentation until feature is fully removed

### ❌ No Update Needed When:

- Fixing bugs (unless behavior changes)
- Refactoring code without changing behavior
- Updating dependencies (unless API changes)
- Styling/UI tweaks that don't affect functionality
- Performance optimizations (unless user-visible)

## Update Workflow

### Step 1: Identify Affected Documents

**Decision Tree:**

```
Code Change Made
    │
    ├─> New Feature?
    │   └─> Update: 02-FEATURES.md, possibly 04-DATA-MODELS.md, 06-API-REFERENCE.md
    │
    ├─> New Data Type?
    │   └─> Update: 04-DATA-MODELS.md, 06-API-REFERENCE.md
    │
    ├─> New AI Feature?
    │   └─> Update: 05-AI-INTEGRATION.md, 02-FEATURES.md
    │
    ├─> Architecture Change?
    │   └─> Update: 03-TECHNICAL-ARCHITECTURE.md
    │
    ├─> API Change?
    │   └─> Update: 06-API-REFERENCE.md
    │
    └─> Scope Change?
        └─> Update: 01-PROJECT-OVERVIEW.md
```

### Step 2: Update Document Content

#### A. Update "Last Updated" Date
```markdown
> **Last Updated:** 2025-11-17  ← Change this!
```

#### B. Update Affected Sections
- Locate relevant section using Table of Contents
- Update text to reflect changes
- Update code examples
- Update diagrams if applicable

#### C. Add Changelog Entry (Optional)
For major changes, add to bottom of document:
```markdown
## Changelog

### 2025-11-17
- Added "Smart Export" feature documentation
- Updated data model for ExportConfig interface
- Added new API: generateSmartExport()
```

### Step 3: Update Cross-References

**Check for broken links:**
```bash
# Search for references to changed sections
grep -r "Section Name" specs/
```

**Update links in other documents:**
- If section renamed, update all internal links
- If section removed, remove or redirect links

### Step 4: Validate Examples

**Ensure code examples still work:**
1. Copy code example from spec
2. Verify it compiles (TypeScript)
3. Verify it matches actual implementation
4. Update if needed

### Step 5: Review & Commit

**Pre-commit checklist:**
- [ ] All affected documents identified and updated
- [ ] "Last Updated" dates refreshed
- [ ] Code examples validated
- [ ] Cross-references checked
- [ ] No broken links
- [ ] No outdated screenshots/diagrams

**Commit message format:**
```
docs: update specifications for [feature name]
- Updated 02-FEATURES.md with Smart Export feature
- Added ExportConfig type to 04-DATA-MODELS.md
- Documented generateSmartExport() in 06-API-REFERENCE.md
```

## Document-Specific Guidelines

### 01-PROJECT-OVERVIEW.md

**Update when:**
- Project vision/purpose changes
- Problem statement evolves
- Target audience shifts
- Scope changes (features added/removed from roadmap)
- Success metrics change

**Sections to maintain:**
- Problem Statement (keep current)
- Solution Overview (sync with features)
- Scope (in/out of scope)
- Success Metrics (track over time)

---

### 02-FEATURES.md

**Update when:**
- New feature added
- Feature behavior modified
- User workflow changes
- Feature deprecated/removed

**How to add a new feature:**

1. **Copy template:**
```markdown
## [Feature Number]. [Feature Name]

**Location:** `path/to/component.tsx`

### Purpose
Brief description of what this feature does.

### Capabilities

#### [Capability 1]
...

### User Workflows

#### Workflow: [Workflow Name]
1. Step 1
2. Step 2
...
```

2. **Add to Feature Map** (top of document)
3. **Update Feature Dependencies** (bottom of document)
4. **Update TOC** (Table of Contents)

**How to deprecate a feature:**
```markdown
## 5. Old Feature (DEPRECATED)

> ⚠️ **Deprecated as of 2025-11-17**: Replaced by [New Feature](#new-feature).
> Will be removed in version 2.0.

### Migration Guide
1. Replace usage of `oldFunction()` with `newFunction()`
2. Update data models from `OldType` to `NewType`
```

---

### 03-TECHNICAL-ARCHITECTURE.md

**Update when:**
- Architecture pattern changes (e.g., add Redux)
- New technology/library added
- Routing changes
- State management changes
- Build/deployment process changes

**Key sections:**
- Technology Stack (keep versions current)
- Architecture Patterns (document new patterns)
- Component Structure (update hierarchy diagram)
- Data Flow (update flow diagrams)

**Diagram updates:**
Use ASCII diagrams (markdown-friendly):
```
┌─────────────┐
│   Component │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Service   │
└─────────────┘
```

---

### 04-DATA-MODELS.md

**Update when:**
- New interface/type added to `types.ts`
- Existing interface modified
- Field added/removed/renamed
- Validation rules change

**How to add a new type:**

1. **Copy template:**
```markdown
### [TypeName]

**Source:** `types.ts:[line numbers]`

Brief description of what this type represents.

\`\`\`typescript
export interface TypeName {
  field1: string;      // Description
  field2: number;      // Description
}
\`\`\`

**Field Details:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `field1` | string | **Yes** | ... | `"example"` |

**Example:**

\`\`\`typescript
const example: TypeName = {
  field1: "value",
  field2: 123
};
\`\`\`
```

2. **Update Relationship Diagram** if type has relationships
3. **Update Storage Schema** if type is persisted

**How to modify existing type:**
1. Update interface definition
2. Update Field Details table
3. Update examples
4. Mark deprecated fields with `(DEPRECATED)`
5. Add migration notes if breaking change

---

### 05-AI-INTEGRATION.md

**Update when:**
- New AI feature added
- AI model changed (e.g., flash → pro)
- Prompt modified
- New schema defined
- Rate limits change

**How to document new AI feature:**

1. **Add to AI-Powered Features table** (top)
2. **Create feature section:**
```markdown
### [Feature Number]. [AI Feature Name]

**Function:** `functionName(params): Promise<ReturnType>`

**Location:** `services/geminiService.ts:[lines]`

#### How It Works

**Input:** ...
**AI Processing:** ...
**Output:** ...

#### Prompt Strategy

\`\`\`typescript
const prompt = \`...\`;
\`\`\`

#### Configuration

\`\`\`typescript
{
  model: 'gemini-2.5-flash',
  temperature: 0.3
}
\`\`\`

#### Example

**Input:**
\`\`\`json
{ ... }
\`\`\`

**AI Output:**
\`\`\`json
{ ... }
\`\`\`
```

**Track prompt versions:**
If prompts change significantly, consider:
```markdown
#### Prompt Evolution

**v1 (2025-01-15):** Original prompt
**v2 (2025-03-20):** Added few-shot examples
**v3 (2025-06-10):** Refined for better accuracy
```

---

### 06-API-REFERENCE.md

**Update when:**
- New service function added
- Function signature changed
- Parameters added/removed
- Return type changed
- Error behavior changed

**How to document new API:**

```markdown
### functionName()

**Purpose:** One-line description

**Signature:**
\`\`\`typescript
function functionName(param1: Type1, param2: Type2): ReturnType
\`\`\`

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `param1` | Type1 | ... |

**Returns:** `ReturnType` - Description

**Example:**
\`\`\`typescript
const result = functionName(arg1, arg2);
console.log(result);
\`\`\`

**Errors:**
- Throws if ...

**Model Used:** (if AI function)
**Avg Response Time:** (if AI function)
```

**Deprecation format:**
```markdown
### oldFunction() (DEPRECATED)

> ⚠️ **Deprecated:** Use `newFunction()` instead.

**Migration:**
\`\`\`typescript
// Old:
const result = oldFunction(arg);

// New:
const result = newFunction({ arg });
\`\`\`
```

---

## Common Update Scenarios

### Scenario 1: Adding a New Component

**Steps:**
1. Update `03-TECHNICAL-ARCHITECTURE.md`:
   - Add to Component Hierarchy diagram
   - Document component's responsibility
2. Update `02-FEATURES.md` (if component enables new feature)
3. Update cross-references

**Example commit:**
```
docs: add AdvancedSearch component to architecture
- Updated component hierarchy in 03-TECHNICAL-ARCHITECTURE.md
- Added Advanced Search feature to 02-FEATURES.md
- Documented searchWithFilters() API in 06-API-REFERENCE.md
```

---

### Scenario 2: Modifying a Data Type

**Steps:**
1. Update `04-DATA-MODELS.md`:
   - Update interface definition
   - Update Field Details table
   - Update examples
   - Add migration notes if breaking
2. Update `06-API-REFERENCE.md` (if affects API signatures)
3. Update `02-FEATURES.md` (if affects user-visible behavior)

**Example:**
```markdown
### Tool (Updated 2025-11-17)

**Migration from v1:**
- `location: string` → `location: { building: string; shelf: string }`
- Update all Tool creation code to use new format
```

---

### Scenario 3: Changing an AI Prompt

**Steps:**
1. Update `05-AI-INTEGRATION.md`:
   - Update prompt text in relevant section
   - Update examples if output format changed
   - Note reason for change
2. If behavior changes significantly, update `02-FEATURES.md`

**Tracking prompt performance:**
```markdown
#### Prompt Iteration Notes

**Current (v3):**
- Added few-shot examples for better accuracy
- Increased from 75% → 92% confidence on test set

**Previous (v2):**
- Simplified instructions
- Reduced from 85% → 75% (rolled back)

**Original (v1):**
- Initial implementation
- 85% accuracy
```

---

## Tools & Automation

### Automated Checks (Recommended)

**1. Check for outdated dates:**
```bash
# Find files not updated in last 90 days
find specs/ -name "*.md" -mtime +90
```

**2. Find broken internal links:**
```bash
# Basic check (can be enhanced)
grep -r "\[.*\](\./" specs/ | while read line; do
  # Check if referenced file exists
  # (implement link validation)
done
```

**3. Validate code examples:**
Create a script that extracts TypeScript code blocks and compiles them.

### Documentation Linting

**markdownlint** (optional):
```bash
npm install -g markdownlint-cli
markdownlint specs/**/*.md
```

**Common rules:**
- No trailing spaces
- Consistent heading styles
- Proper list formatting
- No duplicate headings

### Version Control

**Branch strategy:**
- Update specs in same branch as code changes
- Review specs in same PR as code
- Merge specs and code together

**Pre-merge checklist:**
- [ ] Specs updated in same branch
- [ ] All affected documents identified
- [ ] Examples validated
- [ ] Links checked
- [ ] "Last Updated" dates current

---

## Review Process

### Self-Review Checklist

Before submitting PR:

**Content:**
- [ ] All new features documented
- [ ] All changed features updated
- [ ] Examples are accurate
- [ ] Terminology is consistent

**Structure:**
- [ ] TOC updated (if sections added/removed)
- [ ] Headings follow hierarchy (H1 > H2 > H3)
- [ ] Code blocks have language specified

**Metadata:**
- [ ] "Last Updated" date refreshed
- [ ] Version number incremented (if major changes)
- [ ] Changelog added (if significant)

**Cross-References:**
- [ ] All internal links work
- [ ] References to other docs are accurate
- [ ] No broken anchors

### Peer Review Guidelines

**For reviewers:**

1. **Check accuracy:**
   - Do examples match actual code?
   - Are API signatures correct?
   - Is behavior described accurately?

2. **Check completeness:**
   - Are all aspects of change documented?
   - Are edge cases mentioned?
   - Are errors documented?

3. **Check clarity:**
   - Can a new developer understand this?
   - Are examples helpful?
   - Is terminology clear?

4. **Suggest improvements:**
   - Add diagrams if helpful
   - Add more examples
   - Clarify confusing sections

---

## Best Practices

### Writing Style

**DO:**
- ✅ Use clear, concise language
- ✅ Provide concrete examples
- ✅ Use consistent terminology
- ✅ Include code snippets
- ✅ Use tables for structured data
- ✅ Use diagrams for complex flows

**DON'T:**
- ❌ Use vague language ("maybe", "probably")
- ❌ Assume prior knowledge
- ❌ Skip examples for complex features
- ❌ Use inconsistent naming
- ❌ Leave TODOs in committed docs

### Code Examples

**Good example:**
```typescript
// ✅ Complete, runnable example
const tools = await processCsvInventory(csvText);
console.log(`Imported ${tools.length} tools`);

// Handle errors
try {
  await saveTools(tools);
} catch (error) {
  showError('Failed to save tools');
}
```

**Bad example:**
```typescript
// ❌ Incomplete, won't compile
const tools = processCsvInventory(); // Missing parameter
// Do something with tools
```

### Versioning Examples

**For major changes, show before/after:**

```typescript
// Before (v1.0):
function addTool(name: string, partNumber: string) { ... }

// After (v2.0):
interface AddToolParams {
  name: string;
  partNumber: string;
  category?: string;
}
function addTool(params: AddToolParams) { ... }
```

---

## Troubleshooting

### "Documentation is out of sync with code"

**Solution:**
1. Identify which spec files are outdated
2. Review recent commits to see what changed
3. Update specs to match current code
4. Add note: "Updated to reflect changes in [commit/PR]"

### "Don't know which spec file to update"

**Solution:**
Use the decision tree in Step 1 above, or:
1. Search specs for related content: `grep -r "feature name" specs/`
2. Check spec README for document overview
3. When in doubt, update multiple docs (better too much than too little)

### "Code example doesn't work"

**Solution:**
1. Copy code from specs to project
2. Try to compile/run it
3. Fix code in specs to match working version
4. Add imports if needed
5. Verify example is self-contained

---

## Questions?

If you're unsure how to update specs:
1. Check this guide
2. Look at previous spec commits for examples
3. Ask in team chat/Slack
4. Open a draft PR for feedback

---

**Remember:** Good documentation is part of the code. Keep specs updated with every change!