import os

from flask import jsonify

from app import create_app

app = create_app()


@app.get('/')
def health_check():
    return jsonify({"status": "Quantum Secure OTP Backend Running"})


def _has_route(path: str) -> bool:
    return any(rule.rule == path for rule in app.url_map.iter_rules())


def _register_fallback_routes() -> None:
    # Keep an example OTP endpoint available even if blueprint registration changes.
    if not _has_route('/generate-otp'):
        def fallback_generate_otp():
            return jsonify({"otp": "123456", "message": "Dummy OTP response"})

        app.add_url_rule('/generate-otp', 'fallback_generate_otp', fallback_generate_otp, methods=['GET'])


_register_fallback_routes()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
