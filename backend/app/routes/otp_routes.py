import secrets
from flask import Blueprint, request, jsonify
from ..services.otp_service import OTPService
from ..models.otp_model import OTPModel

otp_bp = Blueprint('otp_bp', __name__)

# Global session state to support the visualizer UI
current_session = {
    "key": None,
    "attack_simulated": False,
    "latest_otp": None
}

@otp_bp.route('/generate-key', methods=['GET'])
def generate_key():
    logs = ["Initializing entropy pool...", "Sampling quantum-random bits..."]
    binary_key = "".join(secrets.choice("01") for _ in range(64))
    current_session["key"] = binary_key
    current_session["attack_simulated"] = False
    logs.append(f"Key generated: {binary_key[:8]}...")
    logs.append("Quantum Key Generated Securely")
    return jsonify({"key": binary_key, "logs": logs, "security_level": "High"})

@otp_bp.route('/simulate-attack', methods=['POST'])
def simulate_attack():
    if not current_session["key"]:
        return jsonify({"error": "No key to attack"}), 400
    
    current_session["attack_simulated"] = True
    key_list = list(current_session["key"])
    key_list[0] = "1" if key_list[0] == "0" else "0"
    current_session["key"] = "".join(key_list)
    
    return jsonify({
        "message": "Key intercepted and altered!",
        "logs": ["ALERT: Quantum state collapse detected!", "Key integrity compromised by interception."],
        "security_level": "Low"
    })

@otp_bp.route('/generate-otp', methods=['GET'])
def generate_otp():
    # Supports the frontend's visualizer by generating an OTP for 'demo_user'
    if not current_session["key"]:
        return jsonify({"error": "Key not generated"}), 400
        
    result = OTPService.request_otp('demo_user', entropy_override=current_session["key"])
    
    logs = [
        "Starting OTP generation...",
        f"Retrieving secret key: {current_session['key'][:8]}...",
        "Concatenating key + timestamp...",
        "Applying SHA-256 hashing algorithm...",
        f"Extracting last 6 digits: {result.get('otp')}",
        "OTP created and stored securely in DB"
    ]
    
    current_session["latest_otp"] = result.get('otp')
    
    return jsonify({
        "otp": result.get('otp'), 
        "logs": logs, 
        "timestamp": int(float(result.get('timestamp', 0))) if result.get('timestamp') else 0
    })

@otp_bp.route('/get-latest-otp', methods=['GET'])
def get_latest_otp():
    return jsonify({"otp": current_session["latest_otp"]})

@otp_bp.route('/request-otp', methods=['POST'])
def request_otp():
    data = request.get_json() or {}
    user_id = str(data.get('user_id', 'demo_user'))
    
    result = OTPService.request_otp(user_id)
    
    if result.get('success'):
        current_session["latest_otp"] = result.get('otp')
        return jsonify(result), 200
    else:
        return jsonify(result), 500

@otp_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json() or {}
    user_id = str(data.get('user_id', 'demo_user'))
    otp = str(data.get('otp'))
    
    # If frontend sends request without OTP in json (e.g., using old format), try to get from input
    if not otp or otp == 'None':
        return jsonify({"success": False, "error": "otp is required", "logs": ["OTP is required"]}), 400
        
    result = OTPService.verify_otp(user_id, otp, attack_simulated=current_session["attack_simulated"])
    
    logs = [
        "Received OTP for verification...",
        "Fetching securely hashed OTP from DB...",
        "Applying SHA-256 to input..."
    ]
    
    if result.get('success'):
        logs.append("Comparison: HASH MATCH SUCCESSFUL")
        logs.append("Access Granted")
    else:
        logs.append(f"Comparison: MISMATCH - {result.get('error')}")
        logs.append("Access Denied")
        
    response = result.copy()
    response["logs"] = logs
    
    status_code = 200
    if result.get('error') == "Internal server error during verification":
        status_code = 500
        
    return jsonify(response), status_code
