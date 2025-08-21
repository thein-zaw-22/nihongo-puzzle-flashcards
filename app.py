
from flask import Flask, render_template, request, session, redirect, url_for
import os

from data import PUZZLES, FLASHCARDS
from utils.game import PuzzleGame

app = Flask(__name__)
# Secret key: read from environment for non-dev usage, fallback for dev
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev-insecure-secret-key')

@app.route('/')
def index():
    return render_template('menu.html')

@app.route('/puzzle', methods=['GET', 'POST'])
def puzzle():
    game = PuzzleGame(session)
    
    if request.method == 'POST':
        if request.form.get('reset'):
            game.reset_game()
        elif request.form.get('choice') is not None and not game.get_game_state()['answered']:
            game.check_answer(request.form['choice'])
        elif request.form.get('review'):
            game.enter_review_mode()
        elif request.form.get('exit_review'):
            game.exit_review_mode()
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
        # Toggle shuffle mode
        if request.form.get('shuffle_toggle'):
            shuffle = bool(session.get('card_shuffle', False))
            new_state = not shuffle
            session['card_shuffle'] = new_state
            if new_state:
                order = list(range(len(FLASHCARDS)))
                import random as _r
                _r.shuffle(order)
                session['card_order'] = order
            else:
                session.pop('card_order', None)
            session['card_index'] = 0
            return redirect(url_for('flashcard'))
        # Reshuffle order when already in shuffle mode
        if request.form.get('reshuffle') and session.get('card_shuffle'):
            order = list(range(len(FLASHCARDS)))
            import random as _r
            _r.shuffle(order)
            session['card_order'] = order
            session['card_index'] = 0
            return redirect(url_for('flashcard'))

        if request.form.get('next') and session.get('card_index', 0) < len(FLASHCARDS) - 1:
            session['card_index'] = session.get('card_index', 0) + 1
        elif request.form.get('prev') and session.get('card_index', 0) > 0:
            session['card_index'] = session.get('card_index', 0) - 1
        elif request.form.get('reset'):
            session['card_index'] = 0
        return redirect(url_for('flashcard'))

    if 'card_index' not in session:
        session['card_index'] = 0
    if 'card_shuffle' not in session:
        session['card_shuffle'] = False

    # Resolve current card depending on shuffle mode
    if session.get('card_shuffle') and session.get('card_order'):
        idx = session['card_order'][session['card_index']]
    else:
        idx = session['card_index']
    current_card = FLASHCARDS[idx]
    return render_template('flashcard.html',
                         card=current_card,
                         current_index=session['card_index'],
                         total_cards=len(FLASHCARDS),
                         shuffle=session.get('card_shuffle', False))

if __name__ == '__main__':
    app.run(debug=True)
