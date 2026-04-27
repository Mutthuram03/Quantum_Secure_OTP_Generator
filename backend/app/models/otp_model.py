from ..database.db import get_db

class OTPModel:
    @staticmethod
    def create_otp_record(user_id, otp_hash, created_at, expires_at, session_id):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            INSERT INTO otp_records (user_id, otp_hash, created_at, expires_at, status, attempts, session_id)
            VALUES (?, ?, ?, ?, 'unused', 0, ?)
        ''', (user_id, otp_hash, created_at, expires_at, session_id))
        db.commit()
        return cursor.lastrowid

    @staticmethod
    def get_latest_otp_for_user(user_id):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            SELECT * FROM otp_records
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        ''', (user_id,))
        return cursor.fetchone()

    @staticmethod
    def increment_attempts(record_id):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            UPDATE otp_records
            SET attempts = attempts + 1
            WHERE id = ?
        ''', (record_id,))
        db.commit()

    @staticmethod
    def mark_as_used(record_id):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            UPDATE otp_records
            SET status = 'used'
            WHERE id = ?
        ''', (record_id,))
        db.commit()
