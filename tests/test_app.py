import os
import sys
import importlib


def import_fresh_app():
    """Import the app module fresh, honoring current env vars."""
    if 'app' in sys.modules:
        del sys.modules['app']
    return importlib.import_module('app')


def test_routes_return_200():
    mod = import_fresh_app()
    client = mod.app.test_client()

    for path in ['/', '/puzzle', '/flashcard']:
        resp = client.get(path)
        assert resp.status_code == 200, f"{path} should return 200"


def test_secret_key_from_env(monkeypatch):
    monkeypatch.setenv('FLASK_SECRET_KEY', 'test-secret')
    mod = import_fresh_app()
    assert mod.app.secret_key == 'test-secret'

