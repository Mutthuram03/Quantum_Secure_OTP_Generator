from datetime import datetime, timedelta
import logging
from ..models.otp_model import OTPModel
from ..utils.crypto_utils import generate_random_entropy, generate_otp_value, hash_otp, verify_otp_hash, generate_session_id

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OTPService:
    @staticmethod
    def request_otp(user_id, entropy_override=None):
        """Generates a new OTP, hashes it, stores it, and returns it (for simulation)"""
        try:
            timestamp = datetime.now().timestamp()
            entropy = entropy_override if entropy_override else generate_random_entropy()
            
            otp = generate_otp_value(user_id, entropy, timestamp)
            otp_hash = hash_otp(otp)
            
            created_at = datetime.now()
            expires_at = datetime.now() + timedelta(seconds=60)
            session_id = generate_session_id()
            
            # Store only hashed OTP
            OTPModel.create_otp_record(user_id, otp_hash, created_at, expires_at, session_id)
            
            logger.info(f"OTP requested successfully for user: {user_id}")
            
            # Note: Returning plain OTP here for simulation purposes as per requirements.
            # In a real system, this would be sent via SMS/Email and NOT returned in the API response.
            return {
                "success": True,
                "message": "OTP generated successfully",
                "otp": otp,  # Simulation only
                "timestamp": timestamp,
                "session_id": session_id,
                "expires_in": 60
            }
        except Exception as e:
            logger.error(f"Error generating OTP for user {user_id}: {str(e)}")
            return {
                "success": False,
                "error": "Failed to generate OTP"
            }

    @staticmethod
    def verify_otp(user_id, otp, attack_simulated=False):
        """Verifies the provided OTP against the latest stored OTP for the user"""
        try:
            record = OTPModel.get_latest_otp_for_user(user_id)
            
            if not record:
                logger.warning(f"Verification failed: No OTP found for user {user_id}")
                return {"success": False, "error": "No OTP requested for this user"}
                
            record_id = record['id']
            stored_hash = record['otp_hash']
            expires_at = record['expires_at']
            status = record['status']
            attempts = record['attempts']
            
            # Check attack simulation (Quantum State Collapse)
            if attack_simulated:
                logger.warning(f"Verification failed: Quantum state collapse intercepted for user {user_id}")
                return {"success": False, "error": "Interception detected! OTP invalidated."}
            
            # Check unused status
            if status == 'used':
                logger.warning(f"Verification failed: OTP already used for user {user_id}")
                return {"success": False, "error": "OTP has already been used"}
            
            # Check attempts
            if attempts >= 3:
                logger.warning(f"Verification failed: Max attempts reached for user {user_id}")
                return {"success": False, "error": "Maximum verification attempts reached. Please request a new OTP."}
                
            # Check expiry
            if isinstance(expires_at, str):
                try:
                    expires_at = datetime.fromisoformat(expires_at)
                except ValueError:
                    expires_at = datetime.strptime(expires_at, '%Y-%m-%d %H:%M:%S.%f')
            
            if datetime.now() > expires_at:
                logger.warning(f"Verification failed: OTP expired for user {user_id}")
                return {"success": False, "error": "OTP has expired"}
                
            # Compare hash
            if not verify_otp_hash(otp, stored_hash):
                OTPModel.increment_attempts(record_id)
                logger.warning(f"Verification failed: Invalid OTP for user {user_id}")
                return {"success": False, "error": "Invalid OTP"}
                
            # Valid OTP
            OTPModel.mark_as_used(record_id)
            logger.info(f"OTP verified successfully for user: {user_id}")
            return {"success": True, "message": "OTP verified successfully"}
            
        except Exception as e:
            logger.error(f"Error verifying OTP for user {user_id}: {str(e)}")
            return {"success": False, "error": "Internal server error during verification"}
