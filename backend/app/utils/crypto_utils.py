import hashlib
import secrets
import time
import uuid

def generate_random_entropy():
    """Generates high entropy randomness"""
    return secrets.token_hex(32)

def generate_otp_value(user_id, entropy, timestamp):
    """Creates a 6-digit OTP using user_id, high entropy string, and timestamp"""
    data = f"{user_id}{entropy}{timestamp}".encode()
    hash_hex = hashlib.sha256(data).hexdigest()
    # Convert hex to int and take last 6 digits
    otp = str(int(hash_hex, 16))[-6:]
    return otp.zfill(6)

def hash_otp(otp):
    """Hashes the OTP for storage"""
    return hashlib.sha256(otp.encode()).hexdigest()

def verify_otp_hash(otp, hashed_otp):
    """Verifies an OTP against a hash"""
    return hash_otp(otp) == hashed_otp

def generate_session_id():
    """Generates a unique session ID"""
    return str(uuid.uuid4())
