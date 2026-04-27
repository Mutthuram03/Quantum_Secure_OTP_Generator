import hashlib
import time
import secrets
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Session state simulation
current_session = {
    "key": None,
    "last_otp": None,
    "last_timestamp": None,
    "attack_simulated": False
}

def get_totp_timestamp():
    return int(time.time() / 30)

@app.route('/generate-key', methods=['GET'])
def generate_key():
    logs = ["Initializing entropy pool...", "Sampling quantum-random bits..."]
    binary_key = "".join(secrets.choice("01") for _ in range(64))
    current_session["key"] = binary_key
    current_session["attack_simulated"] = False
    logs.append(f"Key generated: {binary_key[:8]}...")
    logs.append("Quantum Key Generated Securely")
    return jsonify({"key": binary_key, "logs": logs, "security_level": "High"})

@app.route('/generate-otp', methods=['GET'])
def generate_otp():
    if not current_session["key"]:
        return jsonify({"error": "Key not generated"}), 400
    
    time.sleep(2)  # Artificial delay for visualization
    timestamp = get_totp_timestamp()
    logs = [
        "Starting OTP generation...",
        f"Retrieving secret key: {current_session['key'][:8]}...",
        f"Current 30s window timestamp: {timestamp}",
        "Concatenating key + timestamp...",
        "Applying SHA-256 hashing algorithm..."
    ]
    
    data = f"{current_session['key']}{timestamp}".encode()
    hash_hex = hashlib.sha256(data).hexdigest()
    logs.append(f"Hash produced: {hash_hex[:16]}...")
    
    otp = str(int(hash_hex, 16))[-6:]
    current_session["last_otp"] = otp
    current_session["last_timestamp"] = timestamp
    
    logs.append(f"Extracting last 6 digits: {otp}")
    logs.append("OTP created and ready for verification")
    
    return jsonify({"otp": otp, "logs": logs, "timestamp": timestamp})

@app.route('/simulate-attack', methods=['POST'])
def simulate_attack():
    if not current_session["key"]:
        return jsonify({"error": "No key to attack"}), 400
    
    current_session["attack_simulated"] = True
    # Slightly modify the key
    key_list = list(current_session["key"])
    key_list[0] = "1" if key_list[0] == "0" else "0"
    current_session["key"] = "".join(key_list)
    
    return jsonify({
        "message": "Key intercepted and altered!",
        "logs": ["ALERT: Quantum state collapse detected!", "Key integrity compromised by interception."],
        "security_level": "Low"
    })

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    user_otp = request.json.get('otp')
    if not user_otp:
        return jsonify({"error": "OTP required"}), 400
    
    current_time = get_totp_timestamp()
    logs = [
        "Received OTP for verification...",
        "Regenerating local OTP for comparison...",
        f"Using current key state: {current_session['key'][:8]}...",
        f"Current window: {current_time}"
    ]
    
    data = f"{current_session['key']}{current_time}".encode()
    hash_hex = hashlib.sha256(data).hexdigest()
    expected_otp = str(int(hash_hex, 16))[-6:]
    
    success = (user_otp == expected_otp)
    
    if success:
        logs.append("Comparison: MATCH SUCCESSFUL")
        logs.append("Access Granted")
    else:
        logs.append(f"Comparison: MISMATCH (Expected {expected_otp}, got {user_otp})")
        logs.append("Access Denied")
        
    return jsonify({
        "success": success,
        "logs": logs,
        "attack_detected": current_session["attack_simulated"]
    })

if __name__ == '__main__':
    app.run(port=5000)
