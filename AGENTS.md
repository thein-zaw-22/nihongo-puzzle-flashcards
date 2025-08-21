# Repository Guidelines

## Project Structure & Module Organization
- `app.py`: Flask application entrypoint and routes.
- `data.py`: Puzzle and flashcard datasets used by the app.
- `templates/`: Jinja2 templates (`menu.html`, `index.html`, `flashcard.html`, `nav.html`).
- `static/`: Frontend assets (e.g., `style.css`).
- `.github/`: GitHub configs and docs.
- `.vscode/`: Workspace settings/tasks.
- `requirements.txt`, `README.md`: Dependencies and setup instructions.

Keep modules small and focused. If adding features, prefer new helpers (e.g., `utils/`) or route modules over growing `app.py`.

## Build, Run & Development
- Create venv: `python3 -m venv .venv && source .venv/bin/activate`
- Install deps: `pip install -r requirements.txt`
- Run locally: `.venv/bin/python app.py` (serves at `http://127.0.0.1:5000/`).
- Alternative: `export FLASK_DEBUG=1; export FLASK_APP=app.py; flask run`

Use a feature branch for changes. Keep runs reproducible by updating `requirements.txt` if you add a dependency.

## Coding Style & Naming Conventions
- Indentation: 4 spaces. Follow PEP 8.
- Names: `snake_case` for functions/variables, `PascalCase` for classes, routes descriptive (e.g., `/flashcard`).
- Templates/assets: lowercase, hyphenated or simple words (e.g., `menu.html`, `style.css`).
- Keep Flask views thin; move logic into small functions/classes. Prefer pure functions for testability.

## Testing Guidelines
This repo has no test suite yet. If you add tests:
- Framework: `pytest`
- Location: `tests/`
- Naming: `test_*.py`
- Run: `pytest -q`

## Commit & Pull Request Guidelines
- Commits: Imperative mood, concise scope prefix when helpful (e.g., `app: add PuzzleGame progress state`).
- PRs: Include summary, rationale, how to run locally, linked issues (`Fixes #123`), and screenshots/GIFs for UI changes.
- Keep PRs small and focused; note any follow-ups.

## Security & Configuration Tips
- Do not commit secrets. The `app.secret_key` is for dev only; override via env (e.g., `export FLASK_SECRET_KEY=...`) in production.
- Keep `.venv/` and local files untracked; use `.gitignore`.
