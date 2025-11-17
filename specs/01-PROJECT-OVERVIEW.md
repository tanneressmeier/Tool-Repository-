# Project Overview

> **Last Updated:** 2025-11-17

## Table of Contents
- [Introduction](#introduction)
- [Project Purpose](#project-purpose)
- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Key Capabilities](#key-capabilities)
- [Target Audience](#target-audience)
- [Project Scope](#project-scope)
- [Success Metrics](#success-metrics)

## Introduction

**Tool Inventory Checker** is an AI-powered web application designed specifically for aviation maintenance facilities to efficiently manage, track, and source specialized aviation tools and equipment. The system combines traditional inventory management with cutting-edge artificial intelligence to streamline tool procurement and maintenance planning workflows.

### Project Vision
Eliminate tool shortages and reduce maintenance downtime by providing intelligent, predictive tool management that anticipates needs before they become problems.

## Project Purpose

Aviation maintenance requires hundreds of specialized tools, many of which are:
- Expensive (often $1,000 - $50,000+ per tool)
- Require calibration tracking (e.g., torque wrenches, test equipment)
- Have specific manufacturer requirements
- Are critical path items (maintenance cannot proceed without them)

This application addresses the complex challenge of ensuring the right tools are available when needed, while minimizing capital tied up in excess inventory.

## Problem Statement

Aviation maintenance facilities face several critical challenges:

### 1. Tool Availability Crisis
- **Problem:** Technicians arrive at aircraft only to discover required specialized tools are unavailable
- **Impact:** Aircraft downtime, missed schedules, revenue loss
- **Example:** A $5,000/day Citation X grounded because a $12,000 avionics test set is missing

### 2. Inventory Visibility Gap
- **Problem:** No centralized view of what tools exist, where they are, or their calibration status
- **Impact:** Duplicate purchases, expired calibrations, lost tools
- **Example:** Facility unknowingly owns 3 identical torque wrenches, 2 are out of calibration

### 3. Planning Inefficiency
- **Problem:** Manually reviewing work orders and determining required tools is time-consuming and error-prone
- **Impact:** Last-minute tool procurement, rush shipping fees, planning delays
- **Example:** 2 hours spent cross-referencing maintenance manual tool lists against inventory

### 4. Sourcing Friction
- **Problem:** Finding vendors, pricing, and availability for specialized aviation tools requires significant research
- **Impact:** Procurement delays, non-optimal pricing, unknown rental alternatives
- **Example:** 30 minutes on Google trying to find who sells a specific Tronair jack adapter

### 5. Knowledge Dependency
- **Problem:** Tool requirements often rely on experienced technician knowledge
- **Impact:** Junior staff struggle, knowledge loss when experienced staff leave
- **Example:** Only one senior technician knows which tools are needed for Citation X 500-hour inspection

## Solution Overview

Tool Inventory Checker addresses these problems through five integrated capabilities:

### 1. **Centralized Inventory Management**
Single source of truth for all tools with calibration tracking, search, and categorization.

### 2. **AI-Powered Prediction**
Natural language job descriptions → predicted tool requirements (e.g., "500-hour inspection on Citation X" → complete tool list)

### 3. **Intelligent Comparison**
Automatic comparison of needed tools vs. available inventory with smart substitution suggestions when exact matches aren't available.

### 4. **Automated Sourcing**
AI discovers pricing, vendors, rental options, and availability for missing tools using Google Search integration.

### 5. **Integrated Tracking**
Organize tools by aircraft, maintenance events, and work orders with full historical tracking and reporting.

## Key Capabilities

### Core Features
1. **Master Inventory CRUD** - Full create, read, update, delete for tool database
2. **CSV Import** - AI-powered intelligent parsing of existing tool lists
3. **Predictive Tooling** - AI predicts tools needed for maintenance jobs
4. **Smart Comparison** - Identifies available, on-order, and shortage items
5. **Substitution AI** - Suggests alternative tools when exact matches missing
6. **Automated Sourcing** - Finds pricing and vendors via Google Search
7. **Purchase Tracking** - Manage tools on order and procurement pipeline
8. **Kit Management** - Create reusable tool sets for common jobs
9. **Aircraft Data Hub** - Organize by aircraft/work order with historical data
10. **Report Generation** - PDF reports with complete sourcing information

### AI Integration Points
- **Google Gemini 2.5 Flash** - Fast operations (CSV parsing, comparison, prediction, sourcing)
- **Google Gemini 2.5 Pro** - Complex analysis (maintenance task breakdown)
- **Google Search Grounding** - Real-time web data for pricing and availability

## Target Audience

### Primary Users

#### 1. **Tool Crib Supervisors**
- Manage master inventory
- Track calibrations
- Process tool requests

#### 2. **Maintenance Planners**
- Determine tool requirements for scheduled maintenance
- Generate tool lists from work orders
- Coordinate tool availability with scheduling

#### 3. **Procurement Specialists**
- Source missing tools
- Process purchase requisitions
- Track orders to completion

#### 4. **Maintenance Managers**
- Oversee tool availability
- Review reports
- Make purchasing decisions

### Secondary Users

#### 5. **Maintenance Technicians**
- Submit tool requests
- Review tool lists for upcoming jobs
- Report missing tools

#### 6. **Quality Assurance**
- Verify calibration compliance
- Audit tool inventory
- Review tool usage in work packages

## Project Scope

### In Scope (Current Version)

✅ Single-facility tool management
✅ Client-side data storage (localStorage)
✅ AI-powered tool prediction and sourcing
✅ CSV import/export
✅ Calibration tracking
✅ Purchase order tracking
✅ Report generation

### Out of Scope (Current Version)

❌ Multi-facility/enterprise deployment
❌ Real-time collaboration/multi-user
❌ Backend database integration
❌ Physical tool tracking (barcode/RFID)
❌ Integration with ERP/MRO systems
❌ Tool check-out/check-in workflow
❌ Mobile native applications
❌ Offline-first capabilities
❌ Vendor catalog integration
❌ Automated purchase order creation

### Future Roadmap Considerations

**Phase 2 (Potential)**
- Backend database (PostgreSQL/MongoDB)
- Multi-user authentication and permissions
- Real-time updates via WebSockets
- Mobile applications (React Native)
- Integration APIs for ERP systems

**Phase 3 (Potential)**
- IoT integration (barcode scanners, RFID)
- Tool reservation system
- Automated calibration reminders
- Vendor catalog direct integration
- Advanced analytics and insights

## Success Metrics

### Operational Metrics
- **Tool Availability Rate:** % of jobs where all required tools are available
- **Planning Time Reduction:** Hours saved per week in tool planning
- **Procurement Cycle Time:** Days from identification to tool availability
- **Calibration Compliance:** % of tools current on calibration

### User Satisfaction Metrics
- **AI Prediction Accuracy:** % of predicted tools actually needed
- **Substitution Acceptance:** % of AI substitution suggestions used
- **Time to Report:** Minutes to generate complete sourcing report
- **User Adoption:** % of maintenance events tracked in system

### Business Impact Metrics
- **Reduced AOG (Aircraft On Ground):** Incidents prevented due to tool availability
- **Cost Savings:** Avoided rush shipping, duplicate purchases
- **Capital Efficiency:** Inventory turnover rate
- **Knowledge Capture:** Reduced dependency on specific individuals

### Technical Metrics
- **AI Response Time:** Average latency for predictions and sourcing
- **Data Completeness:** % of tools with full metadata
- **System Uptime:** Application availability
- **Error Rate:** Failed AI requests or data operations

## Project Context

### Development Environment
- **Platform:** AI Studio (cloud-hosted)
- **Port:** 3000
- **Build Tool:** Vite (dev server + production builds)
- **Deployment:** Single-page application (SPA)

### Dependencies
- **Critical:** Google Gemini API (application non-functional without it)
- **Optional:** PDF generation library (reports degrade gracefully)

### Constraints
- **Data Storage:** Browser localStorage (5-10MB limit depending on browser)
- **AI Rate Limits:** Gemini API quotas apply
- **Search Grounding:** Requires Gemini grounded models (rate-limited to 1 req/60s)
- **Browser Requirements:** Modern browser with ES2020+ support

## Related Documents
- [Feature Specifications](./02-FEATURES.md)
- [Technical Architecture](./03-TECHNICAL-ARCHITECTURE.md)
- [AI Integration Details](./05-AI-INTEGRATION.md)

---

**Next Steps:** Review [02-FEATURES.md](./02-FEATURES.md) for detailed feature specifications and user workflows.
