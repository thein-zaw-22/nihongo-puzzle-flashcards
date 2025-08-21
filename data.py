"""
Data sets for Japanese learning puzzles and flashcards.

FLASHCARDS are normalized as dicts with 'front' and 'back' keys to
match template usage and keep structure consistent across the app.
"""

# Puzzle data with proper structure matching app.py
PUZZLES = [
    {
        'id': 1,
        'question': "What is the meaning of '水' (mizu)?",
        'choices': ['Fire', 'Water', 'Tree', 'Mountain'],
        'answer': 1
    },
    {
        'id': 2,
        'question': "What is the hiragana for 'neko' (cat)?",
        'choices': ['ねこ', 'いぬ', 'さる', 'とり'],
        'answer': 0
    },
    {
        'id': 3,
        'question': "Which kanji means 'tree'?",
        'choices': ['山', '水', '木', '火'],
        'answer': 2
    },
    {
        'id': 4,
        'question': "What is the romaji for 'ありがとう'?",
        'choices': ['arigatou', 'konnichiwa', 'sayonara', 'ohayou'],
        'answer': 0
    },
    {
        'id': 5,
        'question': "What is the meaning of '火' (hi)?",
        'choices': ['Water', 'Tree', 'Fire', 'Earth'],
        'answer': 2
    }
]

# Flashcard data: each card is a dict with front/back text
FLASHCARDS = [
    {"front": "私 (わたし)", "back": "I/me"},
    {"front": "ありがとう", "back": "Thank you"},
    {"front": "猫 (ねこ)", "back": "Cat"},
    {"front": "おはよう", "back": "Good morning"},
    {"front": "水 (みず)", "back": "Water"},
    {"front": "犬 (いぬ)", "back": "Dog"},
    {"front": "本 (ほん)", "back": "Book"},
    {"front": "日本 (にほん)", "back": "Japan"},
    {"front": "食べる (たべる)", "back": "To eat"},
    {"front": "飲む (のむ)", "back": "To drink"}
]
