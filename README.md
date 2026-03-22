# 🌟 NeuraMed

NeuraMed is an intelligent, full-stack healthcare platform designed to modernize family medicine management, prescription tracking, and social impact through verifiable NGO medicine donations. 

Powered by **Next.js**, **MongoDB**, **Google Cloud Vision (OCR)**, and **AI services**, NeuraMed bridges the gap between personal healthcare organization and community welfare.

## ✨ Key Features

### 🏥 Personal & Family Health Management
- **Smart Medicine Inventory**: Add, track, and manage expiration dates and stock for all your medicines.
- **Dynamic Family Profiles**: Keep track of medications for your entire family, assign dedicated caretakers, and dynamically filter the medicine inventory per family member.
- **Intake Logs & History**: Automatically track when family members take, miss, or refuse their scheduled medicines, providing a comprehensive timeline of patient adherence.

### 📸 AI & OCR Integrations
- **Smart Prescription Scanner**: Snap a picture of a full prescription and let the app automatically extract and inventory all prescribed medicines using Google Cloud Vision.
- **Medicine Strip Scanner**: Quickly scan individual medicine strips to parse names, manufacturing details, expiry dates, and MRPs.
- **AI Decision Engine**: Advanced duplicate detection, donation eligibility verification, and NGO demand matching powered by an external Python AI Service.

### 🤝 Social Impact (NGO Integrations)
- **Verified NGO Onboarding**: NGOs can register, upload verification documents (stored securely via Vercel Blob), and list their demanded medicines.
- **Smart Donation Matching**: Users with unused or excess medication can be intelligently matched with verified NGOs that specifically need those medicines, reducing medical waste.

### 🔐 Secure & Mobile-First
- **Robust Authentication**: Custom JWT implementation supporting seamless transitions between device types, featuring robust HTTP-only cookie and Bearer-token fallback mechanisms for strict mobile browsers.
- **Mobile-Responsive UI**: The entire interface (designed with Tailwind CSS) is strictly optimized for touch devices and seamless on-the-go usage.

## 🛠️ Technology Stack

**Frontend**
- Next.js (App Router)
- React 19
- Tailwind CSS v4
- Lucide React (Icons)

**Backend & Data**
- Next.js Serverless API Routes
- MongoDB (via Mongoose)
- Vercel Blob (for secure document storage)

**AI & Machine Learning**
- Google Cloud Vision API
- Google Generative AI (Gemini)
- Dedicated Python AI Backend Microservices

**Security**
- Custom JWT Authentication (`jose`)
- Password Hashing (`bcryptjs`)

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- MongoDB database
- Google Cloud Service Account (for Vision API)
- Vercel account (for Blob Storage)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AshmitAnand07/Medicare.git
   cd Medicare
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment variables by creating a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   
   # Note: For Google Cloud Vision, ensure your environment is configured for Google Application Credentials
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open https://medicare-one-delta.vercel.app/ with your browser to see the result.
(It is already Deployed )



Made by
-CORTEX
