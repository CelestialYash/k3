"""End-to-end verification tests for GeoStratum Intelligence prototype."""
import io
from fastapi.testclient import TestClient
from app.main import app


def run_tests():
    with TestClient(app) as client:
        # 1. Health
        r = client.get("/api/v1/health")
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "operational"

        # 2. Login as Admin & Viewer
        r_admin = client.post("/api/v1/auth/login", json={"email": "admin@cmpdi.cil.in", "password": "Admin@1234"})
        assert r_admin.status_code == 200, r_admin.text
        admin_token = r_admin.json()["access_token"]
        admin_hdr = {"Authorization": f"Bearer {admin_token}"}

        r_viewer = client.post("/api/v1/auth/login", json={"email": "viewer@cmpdi.cil.in", "password": "Viewer@1234"})
        assert r_viewer.status_code == 200, r_viewer.text
        viewer_token = r_viewer.json()["access_token"]
        viewer_hdr = {"Authorization": f"Bearer {viewer_token}"}

        # 3. Authorization boundaries
        # Admin sees 3 seeded docs (including 1 Restricted), Viewer sees only 2 Internal docs
        docs_admin = client.get("/api/v1/documents", headers=admin_hdr).json()
        docs_viewer = client.get("/api/v1/documents", headers=viewer_hdr).json()
        assert len(docs_admin) >= 3, f"Expected >=3 docs for admin, got {len(docs_admin)}"
        assert len(docs_viewer) < len(docs_admin), "Viewer should not see Restricted documents!"

        # Viewer denied upload, AI assistant, users, audit
        assert client.get("/api/v1/users", headers=viewer_hdr).status_code == 403
        assert client.get("/api/v1/audit", headers=viewer_hdr).status_code == 403
        assert client.post("/api/v1/assistant/ask", headers=viewer_hdr, json={"question": "test"}).status_code == 403

        # 4. Dashboard & Conflicts
        dash = client.get("/api/v1/analytics/dashboard", headers=admin_hdr)
        assert dash.status_code == 200
        assert dash.json()["total_documents"] >= 3
        assert dash.json()["open_conflicts"] >= 1, "Expected conflict detected between 2021 & 2024 Gevra reports"

        # 5. Search & AI Assistant
        srch = client.get("/api/v1/search?q=Gevra", headers=admin_hdr)
        assert srch.status_code == 200 and srch.json()["count"] >= 1

        ai_ok = client.post("/api/v1/assistant/ask", headers=admin_hdr, json={"question": "What are the proved coal reserves of Gevra OCP?"})
        assert ai_ok.status_code == 200
        assert len(ai_ok.json()["citations"]) >= 1

        ai_none = client.post("/api/v1/assistant/ask", headers=admin_hdr, json={"question": "What is the price of mars rover titanium?"})
        assert ai_none.status_code == 200
        assert ai_none.json()["evidence_sufficient"] is False
        assert "cannot verify" in ai_none.json()["answer"].lower()

        # 6. Report generation
        rep = client.post("/api/v1/reports/generate", headers=admin_hdr, json={"title": "Test Summary", "report_type": "summary", "format": "pdf"})
        assert rep.status_code == 201, rep.text
        rep_id = rep.json()["id"]
        dl = client.get(f"/api/v1/reports/{rep_id}/download", headers=admin_hdr)
        assert dl.status_code == 200 and len(dl.content) > 500

        # 7. Audit logs recorded
        aud = client.get("/api/v1/audit", headers=admin_hdr)
        assert aud.status_code == 200 and len(aud.json()) >= 3

        print("ALL E2E VERIFICATION CHECKS PASSED!")


if __name__ == "__main__":
    run_tests()
