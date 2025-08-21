"""
Ensure tests can import top-level modules like `data.py` regardless of
how pytest is invoked (from repo root or within the tests directory).
"""
import os
import sys

# Prepend the repository root to sys.path so `import data` works.
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

