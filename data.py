"""
Data sets for Japanese learning puzzles and flashcards
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

# Flashcard data: each card is a tuple of (front_text, back_text)
FLASHCARDS = [
    ("私 (わたし)", "I/me"),
    ("ありがとう", "Thank you"),
    ("猫 (ねこ)", "Cat"),
    ("おはよう", "Good morning"),
    ("水 (みず)", "Water"),
    ("犬 (いぬ)", "Dog"),
    ("本 (ほん)", "Book"),
    ("日本 (にほん)", "Japan"),
    ("食べる (たべる)", "To eat"),
    ("飲む (のむ)", "To drink")
]
