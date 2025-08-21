import importlib
import sys
from data import PUZZLES


def import_fresh_app():
    if 'app' in sys.modules:
        del sys.modules['app']
    return importlib.import_module('app')


def _current_puzzle_state(sess):
    state = sess['puzzle_state']
    idx = state['all_puzzles'][state['current_index']]
    return idx, PUZZLES[idx]


def test_quiz_correct_answer_flow():
    mod = import_fresh_app()
    client = mod.app.test_client()

    # Initialize game
    client.get('/puzzle')
    with client.session_transaction() as sess:
        idx, puzzle = _current_puzzle_state(sess)
        correct = puzzle['answer']

    # Answer correctly
    r = client.post('/puzzle', data={'choice': str(correct)}, follow_redirects=True)
    assert r.status_code == 200
    body = r.get_data(as_text=True)
    assert 'Correct' in body
    assert 'Completed:' in body


def test_quiz_incorrect_then_try_again():
    mod = import_fresh_app()
    client = mod.app.test_client()

    client.get('/puzzle')
    with client.session_transaction() as sess:
        _, puzzle = _current_puzzle_state(sess)
        correct = puzzle['answer']
        # choose a wrong option (0..3)
        wrong = (correct + 1) % len(puzzle['choices'])

    r = client.post('/puzzle', data={'choice': str(wrong)}, follow_redirects=True)
    assert r.status_code == 200
    assert 'Incorrect' in r.get_data(as_text=True)

    # Try again should clear answered state (no result message shown)
    r2 = client.post('/puzzle', data={'tryagain': '1'}, follow_redirects=True)
    assert r2.status_code == 200
    assert 'Incorrect' not in r2.get_data(as_text=True)


def test_quiz_next_advances_position():
    mod = import_fresh_app()
    client = mod.app.test_client()

    r = client.get('/puzzle')
    assert r.status_code == 200
    # First, answer correctly to reveal Next (unless last); then advance
    with client.session_transaction() as sess:
        _, puzzle = _current_puzzle_state(sess)
        correct = puzzle['answer']
    client.post('/puzzle', data={'choice': str(correct)})
    r2 = client.post('/puzzle', data={'next': '1'}, follow_redirects=True)
    assert r2.status_code == 200
    assert 'Question ' in r2.get_data(as_text=True)


def test_flashcard_navigation_next():
    mod = import_fresh_app()
    client = mod.app.test_client()

    # Start at first card
    r1 = client.get('/flashcard')
    assert r1.status_code == 200
    assert 'Card 1 of' in r1.get_data(as_text=True)

    # Move to second card
    r2 = client.post('/flashcard', data={'next': '1'}, follow_redirects=True)
    assert r2.status_code == 200
    assert 'Card 2 of' in r2.get_data(as_text=True)

