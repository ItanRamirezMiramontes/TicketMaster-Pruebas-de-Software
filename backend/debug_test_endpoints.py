import sys
from pathlib import Path
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path('.').resolve()))
from backend.app.main import app

client = TestClient(app)
paths = ['/events/musica', '/events/teatro', '/events/cine', '/venues/museo']
for p in paths:
    r = client.get(p)
    print(p, r.status_code)
    if r.status_code != 200:
        print(r.text)
