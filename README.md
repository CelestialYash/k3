# AI-Powered Geological, Mining & Reporting Intelligence Platform

**Problem ID:** SIH26023 -- CMPDI / CIL\
**Project type:** Source-restricted document intelligence platform\
**Status:** Project blueprint / initial development scaffold

## 1. Overview

The AI-Powered Geological, Mining & Reporting Intelligence Platform is
designed to help authorized organizational employees upload, organize,
search, analyze, and retrieve geological and mining records.

The platform is intended to process digital and scanned documents,
extract useful information, and provide AI-assisted answers grounded in
authorized organizational records. Answers should include traceable
references to the source document and page. The system also aims to
identify low-confidence extractions and conflicting values, support
human verification, and generate structured reports.

> **Important:** This repository is a development project. Features
> described as planned are not considered implemented until their code,
> tests, and integrations are complete. Do not use this software with
> confidential organizational records until the hosting environment,
> data handling, security controls, and AI providers have been formally
> approved.

## 2. Project goals

-   Centralize authorized geological, mining, production, exploration,
    project, and historical records.
-   Process digital PDFs and scanned documents using text extraction and
    OCR.
-   Extract document metadata, tables, entities, figures, dates, and
    units.
-   Support keyword, metadata-filtered, and semantic search.
-   Answer questions using retrieved, authorized records only.
-   Display source documents, page numbers, and supporting evidence for
    factual answers.
-   Flag low-confidence extraction results and potentially conflicting
    figures.
-   Support human review and approval workflows.
-   Generate traceable summaries, tables, charts, and reports.
-   Provide role-based access control and audit logging.

## 3. Proposed technology stack

  -----------------------------------------------------------------------
  Layer                   Proposed technologies   Responsibility
  ----------------------- ----------------------- -----------------------
  Frontend                React, TypeScript, Vite User interface

  Styling                 Tailwind CSS            Responsive design
                                                  system

  Routing                 React Router            Client-side navigation

  Backend                 Python, FastAPI,        APIs and business logic
                          Pydantic                

  ORM and migrations      SQLAlchemy, Alembic     Database access and
                                                  schema changes

  Database                PostgreSQL              Users, documents,
                                                  metadata, records

  Vector search           pgvector                Embedding storage and
                                                  similarity search

  PDF processing          PyMuPDF, pdfplumber     Text and table
                                                  extraction

  OCR                     Tesseract OCR, OpenCV   Scanned-page
                                                  recognition and
                                                  preprocessing

  Data processing         pandas                  Tabular data processing

  AI                      Embedding model and     Retrieval and grounded
                          configurable LLM        answer generation
                          provider                

  Background jobs         Redis and worker        Asynchronous document
                          process                 processing

  File storage            Private S3-compatible   Original files and
                          object storage          derived assets

  Packaging               Docker, Docker Compose  Local and deployment
                                                  environments

  Testing                 pytest and frontend     Automated quality
                          test tooling            checks
  -----------------------------------------------------------------------

The final dependency versions and service choices should be pinned and
documented during implementation.

## 4. Core modules

1.  **Dashboard** --- repository activity, processing status, pending
    reviews, and key metrics.
2.  **Authentication and authorization** --- login, account management,
    roles, and permissions.
3.  **Document repository** --- upload, metadata, categories, version
    history, preview, and authorized download.
4.  **Document processing** --- file validation, PDF extraction, OCR,
    table extraction, and metadata extraction.
5.  **Knowledge base and search** --- document chunks, embeddings,
    full-text search, semantic search, and filters.
6.  **AI assistant** --- retrieval-augmented question answering using
    authorized evidence.
7.  **Evidence and verification** --- source citations, confidence
    review, conflict comparison, and human decisions.
8.  **Analytics and insights** --- document statistics, topic analysis,
    and verified-data visualizations.
9.  **Report generator** --- structured summaries and PDF, DOCX, or XLSX
    exports.
10. **Administration and audit logs** --- user management, permissions,
    and traceable activity records.

## 5. High-level document workflow

1.  An authorized user uploads a document.
2.  The backend validates the file and stores the original in private
    storage.
3.  A background job extracts digital text or runs OCR on scanned pages.
4.  The processing pipeline extracts tables, metadata, entities, and
    numerical values.
5.  Extracted content is stored with its document ID and page-level
    provenance.
6.  The system chunks content and creates embeddings for search.
7.  A user searches or asks a question.
8.  The backend checks permissions before retrieving evidence.
9.  The AI generates an answer using retrieved evidence only.
10. The application validates citations and displays source references.
11. Low-confidence or conflicting values can be sent for human review.
12. Authorized users can generate reports from selected evidence.

## 6. Repository structure

The following is the intended structure. It may evolve as implementation
progresses.

``` text
geological-intelligence/
├── project-specification/
│   └── KKK26023.pdf
├── stitch-designs/
│   ├── DESIGN.md
│   ├── screens/
│   └── screenshots/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── workers/
│   │   └── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── infrastructure/
│   ├── docker-compose.yml
│   └── nginx/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── SECURITY.md
│   └── API_DOCUMENTATION.md
├── .env.example
├── .gitignore
└── README.md
```

## 7. Getting started

### Prerequisites

Install the following tools:

-   Git
-   Python 3.12 or another version selected by the project
-   Node.js LTS and npm
-   Docker Desktop
-   A code editor such as Visual Studio Code

Check the installations:

``` bash
git --version
python3 --version
node --version
npm --version
docker --version
```

### Clone the repository

``` bash
git clone <YOUR_REPOSITORY_URL>
cd geological-intelligence
```

Replace `<YOUR_REPOSITORY_URL>` with the actual Git repository URL.

### Backend setup

``` bash
cd backend

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
```

If `requirements.txt` has not yet been created, install dependencies
only after the backend dependency set has been selected and pinned.

Create a local environment file using `.env.example` as a reference.
Never commit real secrets.

Run the development server from the backend directory using the entry
point configured by the project. For example, if the application is
exposed as `app.main:app`:

``` bash
uvicorn app.main:app --reload
```

The API documentation is normally available at:

``` text
http://127.0.0.1:8000/docs
```

### Frontend setup

In a separate terminal:

``` bash
cd frontend
npm install
npm run dev
```

Use the local URL printed by Vite in the terminal.

### Database and supporting services

Use the project's Docker Compose configuration when it is available:

``` bash
docker compose -f infrastructure/docker-compose.yml up -d
```

Run database migrations using the project's configured Alembic setup:

``` bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

The exact service names, ports, environment variables, and migration
commands must match the checked-in configuration. Do not expose
PostgreSQL, Redis, or object storage publicly.

## 8. Environment configuration

Create a local `.env` file from `.env.example`. Typical configuration
categories include:

``` dotenv
APP_ENV=development
APP_SECRET_KEY=
DATABASE_URL=
REDIS_URL=

# Configure only an approved LLM provider.
LLM_PROVIDER=
LLM_API_KEY=
LLM_MODEL=

# Configure private object storage.
OBJECT_STORAGE_ENDPOINT=
OBJECT_STORAGE_BUCKET=
OBJECT_STORAGE_ACCESS_KEY=
OBJECT_STORAGE_SECRET_KEY=

# Configure frontend/backend origins explicitly.
FRONTEND_ORIGIN=http://localhost:5173
BACKEND_ORIGIN=http://localhost:8000
```

These are illustrative variable names, not a guarantee that they match
the implementation. Keep `.env.example` synchronized with the actual
application settings.

Never place real credentials in source code, README files, screenshots,
Git history, or frontend environment variables.

## 9. Security principles

Security must be enforced by the backend and infrastructure, not merely
by the user interface.

-   Use secure password hashing such as Argon2id.
-   Enforce deny-by-default authorization.
-   Check document permissions on every read, preview, download, search,
    and AI retrieval request.
-   Apply authorization filters before retrieved content is sent to an
    LLM.
-   Store original documents in private storage.
-   Validate file extensions, MIME types, file signatures, and size
    limits.
-   Generate server-side storage names; do not trust uploaded filenames.
-   Scan uploads for malware using an approved scanning service.
-   Use parameterized database operations and validated inputs.
-   Configure CORS narrowly and use HTTPS in production.
-   Apply rate limits to login and sensitive endpoints.
-   Protect secrets using environment configuration or a secrets
    manager.
-   Keep audit records for security-sensitive operations.
-   Avoid logging passwords, tokens, or unnecessary document contents.
-   Encrypt backups and test restoration.
-   Treat document text as untrusted input to the AI system.
-   Do not let retrieved documents override system instructions or grant
    the model unrestricted tool access.
-   Review data residency, retention, deletion, and external AI-provider
    policies before handling organizational records.

A security checklist is not proof of security. Perform code review,
automated scanning, authorization tests, and security testing before
deployment.

## 10. AI reliability and evidence requirements

The AI assistant must:

-   Answer factual questions from retrieved, authorized repository
    evidence.
-   Say when the available evidence is insufficient.
-   Never invent document names, page numbers, quotations, or values.
-   Preserve the source document and page number for each cited passage.
-   Distinguish actual values from targets, estimates, and projections.
-   Surface relevant disagreements instead of silently choosing one
    value.
-   Treat model output as unverified until its evidence references are
    checked.

Different numerical values are not automatically conflicts. Compare
metric definitions, units, reporting periods, mine/entity,
actual-versus-target status, and document versions before flagging a
disagreement.

Evaluate the system against manually reviewed examples. Track OCR
quality, extraction accuracy, retrieval relevance, citation correctness,
and answer grounding.

## 11. Testing and quality checks

Run the checks appropriate to each changed module.

### Backend

``` bash
cd backend
source .venv/bin/activate
pytest
```

### Frontend

``` bash
cd frontend
npm run build
npm run lint
```

The exact commands depend on the scripts configured in `package.json`.

Testing should cover:

-   Unit tests for services and validation.
-   API integration tests.
-   Database migration tests.
-   File upload and processing tests.
-   OCR and extraction evaluation.
-   Search and retrieval evaluation.
-   Citation validation.
-   Role and document-permission boundaries.
-   AI prompt-injection resistance.
-   Report export tests.
-   Failure recovery and background-job retries.
-   Frontend accessibility and responsive behavior.

Do not mark a module complete solely because it starts successfully.

## 12. Development roadmap

  Phase   Deliverable
  ------- -------------------------------------------------------
  1       Project setup, frontend, backend, database connection
  2       Authentication, roles, and permissions
  3       Document repository and private storage
  4       OCR and structured extraction
  5       Knowledge base and hybrid search
  6       Source-restricted RAG assistant
  7       Evidence verification and conflict detection
  8       Report generation and analytics
  9       Administration and audit logs
  10      Security hardening, testing, and deployment

Implement and test each phase before proceeding to the next.

## 13. Project status

**Current status:** Initial project blueprint.

Update this section as development progresses:

-   [ ] Architecture reviewed
-   [ ] Frontend foundation implemented
-   [ ] Backend foundation implemented
-   [ ] Database configured
-   [ ] Authentication and authorization tested
-   [ ] Document repository implemented
-   [ ] OCR pipeline implemented
-   [ ] Extraction pipeline implemented
-   [ ] Hybrid search implemented
-   [ ] RAG assistant implemented and evaluated
-   [ ] Evidence verification implemented
-   [ ] Conflict detection implemented
-   [ ] Report generation implemented
-   [ ] Audit logging implemented
-   [ ] Security tests completed
-   [ ] Deployment and recovery procedures verified

See `PROJECT_STATUS.md` for detailed progress, test results, known
issues, and outstanding dependencies.

## 14. Contributing and Git workflow

-   Work on a feature branch rather than directly on the main branch.
-   Keep commits focused and descriptive.
-   Add tests for new functionality and bug fixes.
-   Run relevant checks before opening a pull request.
-   Never commit secrets, confidential documents, or generated private
    data.
-   Update documentation when APIs, configuration, or workflows change.

Example:

``` bash
git checkout -b feature/document-upload
git add .
git commit -m "feat: implement secure document upload"
```

## 15. Disclaimer

This platform is intended to support authorized employees with document
discovery, evidence review, and reporting. AI-generated output is
assistance, not an authoritative organizational determination. Official
decisions and reports must follow the organization's review and approval
procedures.

Before production use, obtain the necessary organizational approvals for
data access, infrastructure, security, retention, and AI-provider usage.
