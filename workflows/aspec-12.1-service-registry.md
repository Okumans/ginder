---
description: Document existing services registry for microservices architecture (Step 12.1)
arguments:
  send: true
---

# Service Registry Generator

Use this workflow after completing Step 12 (Architecture Summary) when working with **microservices architecture** that has existing services.

## Usage

```
/aspec-12.1-service-registry [input_files]
```

**Examples:**
- `/aspec-12.1-service-registry docs/12-architecture-summary.md`
- `/aspec-12.1-service-registry` (will look for docs/12-architecture-summary.md)

## Input

```text
$ARGUMENTS
```

If `$ARGUMENTS` contains file paths, read those files as input documents.
If empty, look for `docs/12-architecture-summary.md`.

**Aggregating from multiple services:**
```
/aspec-12.1-service-registry \
  docs/services/user-service/ \
  docs/services/order-service/ \
  docs/services/payment-service/
```

## Prerequisites

Ensure you have completed:
- Architecture Summary (Step 12)
- **Recommended:** Run `existing_project_analysis` workflows on each existing service and copy outputs to `docs/services/[service-name]/`

**Required files per service:**
- `service-summary.md` — service overview, tech stack, dependencies
- `api-openapi.yaml` — REST API contracts (if applicable)
- `api-asyncapi.yaml` — async/event contracts (if applicable)
- `api-grpc.yaml` — gRPC contracts (if applicable)
- **Minimum data set:** Run at least these workflows in each service repo before copying outputs:
  - `/01-generate-service-summary`
  - `/02-generate-domain-glossary-v2`
  - `/08-generate-architecture-diagram-v2`
  - `/11-generate-state-diagram-v2`
  - `/10-generate-sequence-diagram-v2`
  - `/04-generate-srs-v2`
- **Maximum accuracy:** Run the full `existing_project_analysis` suite (`/05-generate-openapi-spec`, `/06-generate-asyncapi-spec`, `/07-generate-grpc-spec`, `/09-generate-data-flow-diagram-v2`, `/12-generate-frontend-docs`, `/13-generate-ux-screen-flow`, etc.) for the richest registry data.

## When to Use

Use this workflow when:
- You have **existing services** in production
- Your system uses **multiple technology stacks** (e.g., Go, Ruby, TypeScript, Flutter)
- You need to design a **new service** that integrates with existing ones
- You want to document **service boundaries** and **API contracts**

## Prompt

```
You are a solutions architect. Document the existing services registry for a microservices architecture.

**Input Documents:**
- Architecture Summary (Step 12)
- Existing service documentation (if available)

**Output Requirements:**

1. **Service Registry Overview**
   List each service identified from the input documents and service summaries:
   | Service Name | Tech Stack | Status | Owner Team | Repository |
   |--------------|------------|--------|------------|------------|
   | [actual-service-name] | [actual language/framework] | [🟢 Production / 🟡 Staging / 🔵 Planned] | [actual team name] | [actual repository URL] |
   *(Add one row per service identified in the architecture summary or service summaries)*

2. **Service Details**

   For each service identified in the input documents, document:

   ### [actual-service-name]
   
   **Basic Info:**
   - **Technology Stack:** [actual language, framework, and version from service summary]
   - **Runtime:** [actual runtime environment from service summary]
   - **Database:** [actual database(s) used by this service]
   - **Message Queue:** [actual message queue used, or "N/A"]
   
   **API Contracts:**
   - **Protocol:** [actual protocol: REST / gRPC / GraphQL]
   - **Base URL:** [actual base URL from service summary]
   - **Auth:** [actual auth method from service summary]
   - **OpenAPI/Proto:** [actual spec file path, or "TBD" if not yet defined]
   
   **Key Endpoints/Methods:**
   List the actual endpoints or gRPC methods from the service summary:
   ```
   [HTTP_METHOD]  [actual/path]  - [actual description]
   ```
   
   **Events Published:**
   | Event Name | Schema | Description |
   |------------|--------|-------------|
   | [actual.event.name] | [actual schema format] | [actual description of when it's emitted] |
   *(Add one row per event published by this service, or "None" if not applicable)*
   
   **Events Consumed:**
   | Event Name | From Service | Handler |
   |------------|--------------|--------|
   | [actual.event.name] | [actual-source-service] | [actual handler name] |
   *(Add one row per event consumed by this service, or "None" if not applicable)*
   
   **Dependencies:**
   - Depends on: [list actual services this service calls, derived from service summary]
   - Depended by: [list actual services that call this service, derived from service summary]

3. **Service Dependency Graph**
   Generate a Mermaid diagram based on the actual services and their dependencies identified from the input documents. Include:
   - Client/frontend nodes (actual clients from the spec)
   - API gateway or entry point (actual gateway from the spec)
   - Each service node labeled with its actual name and tech stack
   - Data nodes (actual databases and message brokers per service)
   - Arrows showing actual service-to-service calls and data flows

   ```mermaid
   graph TB
       [ActualServiceA] --> [ActualServiceB]
   ```
   *(Replace with actual nodes and connections derived from the service summaries and architecture summary)*

4. **Technology Stack Matrix**

   | Service | Language | Framework | DB | Cache | Queue | Container |
   |---------|----------|-----------|-----|-------|-------|----------|
   | [actual-service-name] | [actual language + version] | [actual framework] | [actual DB or -] | [actual cache or -] | [actual queue or -] | [actual container runtime or -] |
   *(Add one row per service)*

5. **Shared Libraries & Contracts**

   | Library/Contract | Purpose | Used By |
   |------------------|---------|--------|
   | [actual file or package name] | [actual purpose] | [actual services that use it] |
   *(Add one row per shared contract or library identified, or "None" if not applicable)*

6. **Integration Patterns**
   Document the actual integration patterns from the architecture summary and service summaries:

   **Synchronous Communication:**
   - Internal: [actual protocol used between services]
   - External: [actual protocol used for client-facing APIs]
   
   **Asynchronous Communication:**
   - Event bus: [actual message broker, or "N/A"]
   - Event format: [actual event format, or "N/A"]
   - Schema registry: [actual schema registry, or "N/A"]
   
   **Service Discovery:**
   - Method: [actual service discovery mechanism]
   - Load balancing: [actual load balancing approach]

7. **New Service Checklist**

   When adding a new service, ensure:
   - [ ] Service registered in this document
   - [ ] API contract defined (OpenAPI/Proto)
   - [ ] Events documented (published/consumed)
   - [ ] Dependencies mapped
   - [ ] Tech stack justified
   - [ ] Repository created
   - [ ] CI/CD pipeline configured
   - [ ] Monitoring/alerting setup

**Guidelines:**
1. Keep this document as the single source of truth for service inventory
2. Update when services are added, modified, or deprecated
3. Include both production and planned services
4. Document breaking changes and migration paths
5. Link to detailed API documentation where available
```

## Output

Save the generated document as `docs/12.1-service-registry.md` in your project.

## Next Steps

After completing this step, proceed to:
- `/aspec-13-module-design` - Generate Internal Module Design (Step 13)

When running module design for microservices, reference this service registry:
```
/aspec-13-module-design --arch=microservices --service=new-service --stack=golang docs/12.1-service-registry.md
```
