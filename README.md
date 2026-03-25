# Quantum Secure OTP Generator

*A Simulation of Quantum-Based Secure OTP Generation*

## Project Overview

The Quantum Secure OTP Generator is an advanced authentication system that leverages quantum-inspired cryptographic principles to generate highly secure and unpredictable One-Time Passwords (OTPs).

Unlike traditional OTP systems that rely on classical algorithms, this project introduces quantum randomness and secure key distribution concepts to enhance security and reliability in authentication systems.

## Key Features

* Quantum-inspired OTP generation
* True randomness simulation using QRNG concepts
* Enhanced security against cyber attacks
* Time-based OTP expiry
* Prevention of OTP reuse
* Secure OTP verification system

## Problem Statement

Traditional OTP systems:

* Are vulnerable to brute force attacks
* Can be intercepted via man-in-the-middle attacks
* Depend on network and device security
* Are susceptible to phishing and social engineering

## Proposed Solution

This system introduces:

* Quantum Random Number Generation (QRNG) for unpredictability
* Quantum Key Distribution (QKD) concepts for secure transmission
* OTPs that are non-predictable and non-duplicable

## Core Concepts

* Quantum Randomness
* Quantum Key Distribution (QKD)
* One-Time Password Authentication
* Cryptographic Security

## System Architecture

### Workflow

1. User requests OTP
2. Quantum random number is generated (simulated)
3. OTP is created
4. OTP is sent to the user
5. User enters OTP
6. Server verifies OTP

## Modules

### User Module

* Request OTP
* Enter OTP for verification

### OTP Generator Module

* Generates OTP using quantum-inspired randomness

### Authentication Module

* Validates OTP

### Security Module

* Prevents OTP reuse
* Handles time-based expiry

## Literature Basis

This project is inspired by research in:

* Quantum Random Number Generators (QRNG)
* Quantum Key Distribution (QKD)
* Quantum-secure authentication systems
* IBM Qiskit-based randomness generation

## Advantages

* Higher security than traditional OTP systems
* True randomness ensures unpredictability
* Resistant to advanced cyber attacks
* Improves authentication reliability

## Challenges

* Limited availability of real quantum hardware
* Complexity in integrating quantum systems
* Simulation constraints

## Future Scope

* Integration with real quantum hardware using Qiskit
* Application in banking systems
* Use in defense and high-security authentication

## Tech Stack (Extendable)

* Python / C / JavaScript
* Qiskit (for simulation)
* Web technologies for frontend

## How to Run

```bash
git clone https://github.com/Mutthuram03/Quantum-Secure-OTP-Generator.git
cd Quantum-Secure-OTP-Generator
python main.py
```

## Why This Project Matters

This project bridges classical cybersecurity systems with emerging quantum technologies, providing a forward-looking solution for secure authentication.

## Author
Mutthuram S R
