@echo off
echo Starting GeoStratum Intelligence Prototype...
start "GeoStratum Backend" cmd /k "cd /d %~dp0backend && .venv\Scripts\uvicorn.exe app.main:app --reload --port 8000"
start "GeoStratum Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
echo Backend running at http://localhost:8000 (API docs at /docs)
echo Frontend running at http://localhost:5173
