# 💪 GymFrek

A comprehensive, full-stack fitness and nutrition web application designed for both gym enthusiasts and health-conscious individuals. **GymFrek** calculates personalized workout plans, BMI, BMR, TDEE, macro nutrient breakdowns, and tracks your daily food, weight, and fitness progress.

---

## ✨ Features

- 🏋️ **Smart Workout Plan Generator**: Custom weekly schedules based on experience level (Beginner, Intermediate, Advanced), goals, and available equipment (Full Gym, Dumbbells, Bodyweight).
- 🥗 **Nutrition & Macro Planner**: Goal-specific calorie, protein, carbohydrate, fat, dietary fiber, and water targets.
- 🔍 **USDA Food Database Integration**: Search over 300,000+ foods with instant calorie & macronutrient scaling.
- 🍽️ **Meal Logging**: Track breakfast, lunch, dinner, and snacks with accurate nutrient breakdowns.
- 📊 **Progress & Weight Tracking**: Interactive weight progress charts powered by Recharts, BMI gauges, and milestone achievements.
- 👤 **Interactive Profile**: Body metric recalculation, password resets, and fitness goal adjustments.
- 🔒 **Firebase Authentication**: Seamless Google One-Tap/Popup and Email/Password sign-in.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication & Database**: [Firebase Auth](https://firebase.google.com/docs/auth) & [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Food Data**: [USDA FoodData Central API](https://fdc.nal.usda.gov/)

---

## 🚀 Getting Started

### 1. Clone the repository
`ash
git clone https://github.com/Kalpataru2001/GymFrek.git
cd GymFrek
`

### 2. Install dependencies
`ash
npm install
`

### 3. Setup Environment Variables
Create a .env.local file in the root directory (refer to .env.example):

`nv
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# USDA FoodData Central API Key (Optional)
NEXT_PUBLIC_USDA_API_KEY=DEMO_KEY
`

### 4. Run the development server
`ash
npm run dev
`

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 License
This project is open source and available under the MIT License.
