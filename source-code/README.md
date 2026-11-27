# GeoStratum Intelligence (Prototype)

**Problem ID:** SIH26023 — CMPDI / Coal India Limited  
**Platform:** AI-Powered Geological, Mining & Reporting Intelligence Platform

## Quick Start (Windows)

Double-click `start.bat` or run manually in two terminals:

### 1. Backend (FastAPI + SQLite)
```powershell
cd backend
.\.venv\Scripts\uvicorn.exe app.main:app --reload --port 8000
```
- Optional: set `$env:GEMINI_API_KEY="your-key"` before starting uvicorn to enable live Gemini synthesis in the AI Assistant. Without it, the AI Assistant performs real authorization-scoped retrieval and displays retrieved source excerpts honestly without fabricating answers.

### 2. Frontend (React + Vite + TypeScript)
```powershell
cd frontend
npm run dev
```
Open http://localhost:5173

## Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@cmpdi.cil.in` | `Admin@1234` |
| Researcher | `researcher@cmpdi.cil.in` | `Research@1234` |
| Analyst | `analyst@cmpdi.cil.in` | `Analyst@1234` |
| Viewer | `viewer@cmpdi.cil.in` | `Viewer@1234` |
