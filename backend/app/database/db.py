import sqlite3
from flask import g

def get_db(app=None):
    if app is None:
        from flask import current_app as app
        
    if 'db' not in g:
        g.db = sqlite3.connect(
            app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row

    return g.db

def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()

def init_db(app):
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS otp_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                otp_hash TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                status TEXT NOT NULL DEFAULT 'unused',
                attempts INTEGER NOT NULL DEFAULT 0,
                session_id TEXT
            )
        ''')
        db.commit()
    app.teardown_appcontext(close_db)
