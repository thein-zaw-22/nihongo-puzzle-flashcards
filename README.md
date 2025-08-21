# Japanese Learning – Flask App

A small, self‑contained Flask app for learning Japanese with two modes:
- Puzzle Quiz: multiple‑choice questions with progress tracking.
- Flashcards: flip cards and navigate with keyboard controls.

## Quick Start

```bash
# 1) Create and activate a virtualenv
python3 -m venv .venv
source .venv/bin/activate

# 2) Install dependencies
pip install -r requirements.txt

# 3) (Optional) Configure secret key for sessions
export FLASK_SECRET_KEY='your-strong-secret'

# 4) Run the app (choose one)
python app.py
# or
export FLASK_APP=app.py FLASK_DEBUG=1 && flask run
```

App runs at http://127.0.0.1:5000/

## Features
- Clean UI with `templates/` and `static/style.css`
- Persistent quiz/flashcard state via Flask session
- Confetti animation on correct quiz answers
- Keyboard navigation on flashcards (←/→ to move, Space/Enter to flip)

## Project Structure
```
.
├── app.py            # Flask routes and game logic
├── data.py           # Quiz and flashcard datasets
├── templates/        # Jinja2 templates (menu, quiz, flashcards, nav)
├── static/           # CSS and assets
├── requirements.txt  # Python dependencies
└── AGENTS.md         # Contributor guidelines
```

## Usage
- Menu: visit `/` and choose Puzzle or Flashcards.
- Quiz: pick an answer → see feedback → Next or Try Again. Progress shows position and completion.
- Flashcards: click to flip; use arrow keys to navigate; Reset on last card.
- Content: edit questions/cards in `data.py`.

## Development
- Style: follow PEP 8 (4‑space indent); see `AGENTS.md` for conventions and PR guidance.
- Secrets: `app.py` reads `FLASK_SECRET_KEY` from the environment; if not set, it falls back to a dev‑only value. Always set a strong secret for any non‑local run.

## Testing
This repo ships minimal tests for routes and flows. Run locally:
```bash
pip install pytest
pytest -q
```
Tests live in `tests/` and follow `test_*.py` naming.

## Continuous Integration
- GitHub Actions runs `pytest` on pushes and PRs across Python 3.11/3.12.
- Workflow: `.github/workflows/python-tests.yml`

## Troubleshooting
- Template not found: ensure you run from the repo root.
- Port in use: set a different port, e.g., `flask run -p 5050`.

## License
See `LICENSE` for details.
