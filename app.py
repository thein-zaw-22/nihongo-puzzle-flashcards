
from flask import Flask, render_template, request, session, redirect, url_for
import random

app = Flask(__name__)
app.secret_key = 'demo-secret-key'  # For session management

# Import puzzle data from data.py
from data import PUZZLES, FLASHCARDS

def get_next_puzzle(current_id=None):
    """Get the next puzzle, avoiding repetition if possible."""
    available_puzzles = [p for p in PUZZLES if p['id'] != current_id]
    if not available_puzzles:  # If we've somehow used all puzzles
        return random.choice(PUZZLES)
    return random.choice(available_puzzles)

# Demo data for flashcards
FLASHCARDS = [
    {'front': '猫', 'back': 'Cat (neko)'},
    {'front': '犬', 'back': 'Dog (inu)'},
    {'front': '魚', 'back': 'Fish (sakana)'},
    {'front': '鳥', 'back': 'Bird (tori)'},
    {'front': '花', 'back': 'Flower (hana)'},
    {'front': '月', 'back': 'Moon (tsuki)'},
    {'front': '太陽', 'back': 'Sun (taiyou)'},
    {'front': '雨', 'back': 'Rain (ame)'},
    {'front': '山', 'back': 'Mountain (yama)'},
    {'front': '川', 'back': 'River (kawa)'}
]

@app.route('/')
def index():
    return render_template('menu.html')

def init_puzzle_session():
    """Initialize or reset the puzzle session with proper state management"""
    # Create a new shuffled deck of puzzles
    session['remaining_puzzles'] = [p['id'] for p in PUZZLES]
    random.shuffle(session['remaining_puzzles'])
    session['completed_puzzles'] = []
    session['current_puzzle_id'] = session['remaining_puzzles'].pop()
    session['answered'] = False
    session['selected_choice'] = None
    session['result'] = None

class PuzzleGame:
    def __init__(self, session):
        self.session = session
        if 'puzzle_state' not in session:
            self.reset_game()
        elif self.get_current_puzzle() is None:
            self.reset_game()

    def reset_game(self):
        """Initialize or reset the game state"""
        # Create list of all puzzle indices
        all_puzzles = list(range(len(PUZZLES)))
        random.shuffle(all_puzzles)
        
        self.session['puzzle_state'] = {
            'all_puzzles': all_puzzles,  # Keep track of full puzzle order
            'current_index': 0,  # Track current position in all_puzzles
            'completed_puzzles': [],  # Track completed puzzle indices
            'answered': False,
            'selected_choice': None,
            'last_result': None,
            'is_new_correct': False
        }
        self.session.modified = True

    def _set_next_puzzle(self):
        """Move to next puzzle if available"""
        state = self.session['puzzle_state']
        if state['current_index'] < len(PUZZLES) - 1:
            state['current_index'] += 1
            state['answered'] = False
            state['selected_choice'] = None
            state['last_result'] = None
            state['is_new_correct'] = False
            self.session.modified = True
            return True
        return False

    def get_current_puzzle_index(self):
        """Get the index of the current puzzle"""
        state = self.session['puzzle_state']
        return state['all_puzzles'][state['current_index']]

    def check_answer(self, choice):
        """Process user's answer choice"""
        state = self.session['puzzle_state']
        if state['answered']:
            return False

        choice = int(choice)
        current_puzzle = self.get_current_puzzle()
        is_correct = (choice == current_puzzle['answer'])
        
        state['answered'] = True
        state['selected_choice'] = choice
        state['last_result'] = is_correct
        state['is_new_correct'] = is_correct

        current_puzzle_index = self.get_current_puzzle_index()
        if is_correct and current_puzzle_index not in state['completed_puzzles']:
            state['completed_puzzles'].append(current_puzzle_index)
        
        self.session.modified = True
        return True

    def try_again(self):
        """Reset current puzzle attempt"""
        state = self.session['puzzle_state']
        state['answered'] = False
        state['selected_choice'] = None
        state['last_result'] = None
        state['is_new_correct'] = False
        self.session.modified = True

    def get_current_puzzle(self):
        """Get current puzzle data"""
        if 'puzzle_state' not in self.session:
            return None
            
        state = self.session['puzzle_state']
        if 'current_index' not in state or 'all_puzzles' not in state:
            return None
            
        current_index = self.get_current_puzzle_index()
        return PUZZLES[current_index]

    def get_game_state(self):
        """Get complete game state for template"""
        state = self.session['puzzle_state']
        current_puzzle = self.get_current_puzzle()
        
        if current_puzzle is None:
            self.reset_game()
            state = self.session['puzzle_state']
            current_puzzle = self.get_current_puzzle()
        
        # Calculate progress
        completed_count = len(state['completed_puzzles'])
        total_puzzles = len(PUZZLES)
        current_position = state['current_index'] + 1  # 1-based position
        
        # Check if we're on the last puzzle
        is_last_puzzle = current_position == total_puzzles
        # Check if all puzzles are completed
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
                'percent': (completed_count / total_puzzles * 100) if total_puzzles > 0 else 0
            },
            'all_completed': all_completed
        }

@app.route('/puzzle', methods=['GET', 'POST'])
def puzzle():
    game = PuzzleGame(session)
    
    if request.method == 'POST':
        if request.form.get('reset'):
            game.reset_game()
        elif request.form.get('choice') is not None and not game.get_game_state()['answered']:
            game.check_answer(request.form['choice'])
        elif request.form.get('next'):
            if not game._set_next_puzzle():
                game.reset_game()
        elif request.form.get('tryagain'):
            game.try_again()
        return redirect(url_for('puzzle'))

    return render_template('index.html', **game.get_game_state())

@app.route('/flashcard', methods=['GET', 'POST'])
def flashcard():
    if request.method == 'POST':
        if request.form.get('next') and session.get('card_index', 0) < len(FLASHCARDS) - 1:
            session['card_index'] = session.get('card_index', 0) + 1
        elif request.form.get('prev') and session.get('card_index', 0) > 0:
            session['card_index'] = session.get('card_index', 0) - 1
        elif request.form.get('reset'):
            session['card_index'] = 0
        return redirect(url_for('flashcard'))

    if 'card_index' not in session:
        session['card_index'] = 0

    current_card = FLASHCARDS[session['card_index']]
    return render_template('flashcard.html',
                         card=current_card,
                         current_index=session['card_index'],
                         total_cards=len(FLASHCARDS))

if __name__ == '__main__':
    app.run(debug=True)
