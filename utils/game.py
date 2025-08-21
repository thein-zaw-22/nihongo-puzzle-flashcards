import random
from typing import Any, Dict, Optional

from data import PUZZLES


class PuzzleGame:
    """Encapsulates puzzle quiz game state backed by Flask session."""

    def __init__(self, session: Dict[str, Any]):
        self.session = session
        if 'puzzle_state' not in session:
            self.reset_game()
        elif self.get_current_puzzle() is None:
            self.reset_game()

    def reset_game(self) -> None:
        """Initialize or reset the game state."""
        all_puzzles = list(range(len(PUZZLES)))
        random.shuffle(all_puzzles)

        self.session['puzzle_state'] = {
            'all_puzzles': all_puzzles,
            'current_index': 0,
            'completed_puzzles': [],
            'incorrect_puzzles': [],
            'answered': False,
            'selected_choice': None,
            'last_result': None,
            'is_new_correct': False,
            'review_mode': False,
            'review_completed': [],
        }
        self.session.modified = True

    def _set_next_puzzle(self) -> bool:
        """Move to next puzzle if available."""
        state = self.session['puzzle_state']
        total_in_run = len(state['all_puzzles'])
        if state['current_index'] < total_in_run - 1:
            state['current_index'] += 1
            state['answered'] = False
            state['selected_choice'] = None
            state['last_result'] = None
            state['is_new_correct'] = False
            self.session.modified = True
            return True
        return False

    def get_current_puzzle_index(self) -> int:
        """Get the index of the current puzzle in PUZZLES."""
        state = self.session['puzzle_state']
        return state['all_puzzles'][state['current_index']]

    def check_answer(self, choice: int | str) -> bool:
        """Process user's answer choice.

        Returns True if the choice was processed (i.e., not already answered).
        """
        state = self.session['puzzle_state']
        if state['answered']:
            return False

        choice_int = int(choice)
        current_puzzle = self.get_current_puzzle()
        is_correct = (choice_int == current_puzzle['answer'])

        state['answered'] = True
        state['selected_choice'] = choice_int
        state['last_result'] = is_correct
        state['is_new_correct'] = is_correct

        current_puzzle_index = self.get_current_puzzle_index()
        # Ensure backward-compatible presence of new keys for older sessions
        if 'incorrect_puzzles' not in state:
            state['incorrect_puzzles'] = []
        if 'review_completed' not in state:
            state['review_completed'] = []

        if state.get('review_mode'):
            # Track per-review completion and clean up incorrects when answered correctly
            if is_correct and current_puzzle_index not in state['review_completed']:
                state['review_completed'].append(current_puzzle_index)
            if is_correct and current_puzzle_index in state['incorrect_puzzles']:
                state['incorrect_puzzles'] = [i for i in state['incorrect_puzzles'] if i != current_puzzle_index]
        else:
            # Normal mode completion/incorrect tracking
            if is_correct and current_puzzle_index not in state['completed_puzzles']:
                state['completed_puzzles'].append(current_puzzle_index)
            if not is_correct and current_puzzle_index not in state['incorrect_puzzles']:
                state['incorrect_puzzles'].append(current_puzzle_index)

        self.session.modified = True
        return True

    def try_again(self) -> None:
        """Reset current puzzle attempt state."""
        state = self.session['puzzle_state']
        state['answered'] = False
        state['selected_choice'] = None
        state['last_result'] = None
        state['is_new_correct'] = False
        self.session.modified = True

    def get_current_puzzle(self) -> Optional[Dict[str, Any]]:
        """Get current puzzle data dict or None if not initialized."""
        if 'puzzle_state' not in self.session:
            return None

        state = self.session['puzzle_state']
        if 'current_index' not in state or 'all_puzzles' not in state:
            return None

        current_index = self.get_current_puzzle_index()
        return PUZZLES[current_index]

    def get_game_state(self) -> Dict[str, Any]:
        """Return a template-ready game state snapshot."""
        state = self.session['puzzle_state']
        current_puzzle = self.get_current_puzzle()

        if current_puzzle is None:
            self.reset_game()
            state = self.session['puzzle_state']
            current_puzzle = self.get_current_puzzle()

        review_mode = state.get('review_mode', False)
        if review_mode:
            completed_count = len(state.get('review_completed', []))
            total_puzzles = len(state['all_puzzles'])
        else:
            completed_count = len(state['completed_puzzles'])
            total_puzzles = len(PUZZLES)
        current_position = state['current_index'] + 1  # 1-based

        is_last_puzzle = current_position == total_puzzles
        all_completed = completed_count == total_puzzles

        return {
            'puzzle': current_puzzle,
            'answered': state['answered'],
            'selected_choice': state['selected_choice'],
            'result': state['last_result'],
            'is_new_correct': state['is_new_correct'],
            'has_next_puzzle': not is_last_puzzle,
            'is_last_puzzle': is_last_puzzle,
            'progress': {
                'current': completed_count,
                'total': total_puzzles,
                'position': current_position,
                'percent': (completed_count / total_puzzles * 100) if total_puzzles > 0 else 0,
            },
            'all_completed': all_completed,
            'review_mode': review_mode,
            'incorrect_count': len(state.get('incorrect_puzzles', [])),
        }

    # Review mode controls
    def enter_review_mode(self) -> bool:
        """Start a review session for incorrectly answered puzzles.

        Returns True if review started, False if nothing to review.
        """
        state = self.session['puzzle_state']
        incorrect = list(state.get('incorrect_puzzles', []))
        if not incorrect:
            return False
        order = incorrect[:]
        random.shuffle(order)
        state['all_puzzles'] = order
        state['current_index'] = 0
        state['review_completed'] = []
        state['answered'] = False
        state['selected_choice'] = None
        state['last_result'] = None
        state['is_new_correct'] = False
        state['review_mode'] = True
        self.session.modified = True
        return True

    def exit_review_mode(self) -> None:
        """Exit review mode and reset to a fresh full game order."""
        self.reset_game()
