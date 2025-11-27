# Project Hakikisha: Real-Time M-PESA Payment Gateway

![Deployment Status](https://img.shields.io/badge/Deployment-Live-success?style=for-the-badge&logo=vercel)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js_14_|_Redis_|_Tailwind-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

> **A full-stack Fintech prototype bridging the gap between web-based e-commerce and mobile money payments via the Safaricom Daraja API.**

---

## 📖 Overview

**Project Hakikisha** solves the issue of "blind payments" in the Kenyan mobile money ecosystem. Unlike standard Paybill instructions where merchants wait for an SMS, this application initiates a **STK Push (SIM Toolkit Push)** directly to the user's phone and listens for a **real-time server-side confirmation**.

It features a **"Kiosk Mode"** UI that auto-resets after successful transactions, making it ideal for self-service terminals in fast-paced retail environments.

## ✨ Key Features

* **⚡ Instant Payment Trigger:** Utilizes M-PESA Express (STK Push) to prompt PIN entry immediately.
* **🔄 Asynchronous Verification:** Decouples the frontend from the payment process using a server-side **Callback URL**.
* **📡 Real-Time Status Polling:** The frontend intelligently queries the backend state to detect payment completion without page reloads.
* **💾 Ephemeral State Management:** Leverages **Upstash Redis** (Serverless) to cache transaction statuses with automatic TTL (Time-To-Live).
* **🎨 Modern Kiosk UI:** Built with **Tailwind CSS**, featuring auto-reset logic and responsive feedback animations.

## 🛠️ Technical Architecture

The system follows an **Event-Driven Architecture**:

1.  **Initiation:** Client POSTs phone number → Next.js API → Safaricom Daraja Gateway.
2.  **Tracking:** System captures the unique `CheckoutRequestID` and returns it to the Client.
3.  **Polling:** Client begins polling the `/api/status` endpoint with the ID.
4.  **Callback (Webhook):** Safaricom processes the PIN and hits the `/api/callback` webhook asynchronously.
5.  **State Update:** Webhook updates **Redis** cache (`Status: PAID`).
6.  **Synchronization:** Client poll hits Redis, sees `PAID`, and triggers the Success UI.

## 🧰 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14** (App Router) | React framework for server-side rendering and API routes. |
| **Styling** | **Tailwind CSS** | Utility-first CSS framework for responsive design. |
| **Language** | **TypeScript** | For type safety and robust code quality. |
| **Database** | **Upstash Redis** | Serverless key-value store for high-speed transaction caching. |
| **Payment** | **Safaricom Daraja API** | M-PESA Express (STK Push) integration. |
| **Deployment** | **Vercel** | CI/CD pipeline and Serverless edge functions. |

## 🚀 Getting Started

Follow these instructions to run the project locally.

### Prerequisites
* Node.js 18+ installed.
* A Safaricom Developer Account (Sandbox).
* An Upstash Redis database (Free tier).

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_GITHUB_USERNAME/project-hakikisha.git](https://github.com/YOUR_GITHUB_USERNAME/project-hakikisha.git)
cd project-hakikisha

### 2. Install Dependencies
```bash
npm install

### 3. Environment Configuration

Create a .env.local file in the root directory. Do not commit this file.
```Code snippet
# Safaricom Daraja (Sandbox Credentials)
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919

# Database (Upstash Redis)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Application Config
# For local dev, use Ngrok URL. For production, use Vercel URL.
NEXT_PUBLIC_DOMAIN=[https://your-app-url.com](https://your-app-url.com)

### 4. Run Locally
```bash
npm run dev

###5. Callback Tunneling (Crucial)
Safaricom cannot reach localhost. You must tunnel your local server:

Install and run Ngrok: ngrok http 3000

Copy the HTTPS URL (e.g., https://random.ngrok-free.app).

### 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a Pull Request.

### 📄 License
Distributed under the MIT License. See LICENSE for more information.

Developer Note: This project is currently configured for the Safaricom Sandbox. To go live, credentials must be updated to Production keys and the Callback URL must be whitelisted.