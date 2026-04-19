from flask import Flask, request, jsonify
from flask_cors import CORS
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from twilio.rest import Client
import time
import os
from secrets import randbelow

app = Flask(__name__)
CORS(app)

# Twilio Configuration
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', '').strip()
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', '').strip()
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER', '').strip()
DEFAULT_TARGET_PHONE = os.getenv('DEFAULT_TARGET_PHONE', '').strip()
TWILIO_ENABLED = os.getenv('TWILIO_ENABLED', 'true').strip().lower() in {'1', 'true', 'yes', 'on'}

otp_store = {}

def send_sms(to_phone, otp):
    """
    Sends an SMS using Twilio.
    """
    # ALWAYS print to console for debugging/demo purposes
    print(f"\n[DEBUG] Generated OTP: {otp} (Use this if SMS fails)\n")

    try:
        if not TWILIO_ENABLED:
            return False, "SMS disabled (TWILIO_ENABLED=false)."
        if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_PHONE_NUMBER:
            return False, "Missing Twilio environment variables."
        if not to_phone:
            return False, "No destination phone provided."

        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        message = client.messages.create(
            body=f"Your Quantum OTP is: {otp}",
            from_=TWILIO_PHONE_NUMBER,
            to=to_phone
        )
        print(f"[Twilio] Message Sent! SID: {message.sid}")
        return True, "SMS Sent Successfully"
    except Exception as e:
        error_msg = str(e)
        print(f"[Twilio Error] {error_msg}")
        
        # User-friendly error for trial accounts
        if "unverified" in error_msg.lower():
            return False, f"Twilio Trial Error: {to_phone} is not verified."
        if "geo" in error_msg.lower():
            return False, f"Twilio Geo Error: SMS to region not enabled."
        
        return False, f"Twilio Error: {error_msg}"

def generate_quantum_random_number():
    try:
        # Create 6 qubits as requested
        qc = QuantumCircuit(6)
        # Apply Hadamard gate to all qubits to create superposition
        qc.h(range(6))
        # Measure all qubits
        qc.measure_all()

        # Execute on Aer simulator
        simulator = AerSimulator()
        result = simulator.run(qc, shots=1, memory=True).result()
        memory = result.get_memory()[0]

        # Convert binary string to integer
        random_int = int(memory, 2)
        return random_int, memory
    except Exception:
        # Fallback keeps OTP service running if quantum backend is unavailable.
        random_int = randbelow(64)
        return random_int, format(random_int, '06b')

@app.route('/generate-otp', methods=['POST'])
def generate_otp():
    try:
        data = request.get_json(silent=True) or {}
        # Use provided phone, or default target, or 'Unknown'
        phone = str(data.get('phone', '')).strip()
        if not phone:
            phone = DEFAULT_TARGET_PHONE
            
        random_int, binary_val = generate_quantum_random_number()
        
        # Format as 6-digit OTP (padding with zeros if necessary)
        # Note: 6 qubits max value is 63, so this will be like 000045
        otp = f"{random_int:06d}"
        
        otp_store['current'] = {
            "otp": otp,
            "created_at": time.time(),
            "attempts": 0
        }
        
        # Send SMS via Twilio
        success, sms_message = send_sms(phone, otp)
        
        full_message = f"OTP sent to {phone}" if success else f"SMS Failed: {sms_message}"
        
        return jsonify({
            "otp": otp,
            "binary": binary_val,
            "message": full_message,
            "sms_success": success
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json(silent=True) or {}
    user_otp = str(data.get('otp', '')).strip()

    if not user_otp:
        return jsonify({"status": "invalid", "message": "OTP is required"})
    
    if 'current' not in otp_store:
        return jsonify({"status": "invalid", "message": "No OTP generated"})
    
    record = otp_store['current']
    
    # Check expiry
    if time.time() - record['created_at'] > 60:
        return jsonify({"status": "expired", "message": "OTP Expired"})
    
    # Check max attempts
    if record['attempts'] >= 3:
        return jsonify({"status": "blocked", "message": "Too many failed attempts"})
    
    if user_otp == record['otp']:
        del otp_store['current']
        return jsonify({"status": "success", "message": "Verification Successful"})
    
    record['attempts'] += 1
    return jsonify({
        "status": "invalid", 
        "message": f"Invalid OTP. {3 - record['attempts']} attempts left"
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)