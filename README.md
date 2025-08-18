# SilleFront

SilleFront is a modern, cross-platform React Native application built with Expo, designed to deliver a seamless fragrance discovery and subscription experience. The project features a robust survey system, personalized recommendations, a flexible cart, and a subscription model, all wrapped in a beautiful, responsive UI. This README provides an overview for recruiters and contributors.

## Table of Contents
- [SilleFront](#sillefront)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Backend](#backend)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
  - [Scripts](#scripts)
  - [Testing](#testing)

## Features
- **User Authentication**: Secure sign up, login, and session management.
- **Survey Flow**: Interactive onboarding survey to personalize fragrance recommendations.
- **AI-Powered Recommendations**: Suggests perfumes based on user preferences and survey results.
- **Subscription Tiers**: Multiple subscription levels (basic, medium, pro) with flexible management.
- **Cart & Manual Box**: Add perfumes to cart or build a custom box.
- **Order & Purchase History**: View past orders and track status.
- **Ratings & Reviews**: Rate perfumes and view community feedback.
- **Responsive Design**: Optimized for mobile and web with Expo Router and MUI.
- **Modern UI**: Custom fonts, icons, and illustrations for a premium look.

## Backend

The backend for this frontend is available at: [silleback](https://github.com/felipemedlev/silleback.git)

## Tech Stack
- **Framework**: React Native (Expo)
- **Navigation**: Expo Router
- **UI**: MUI, @emotion, custom SVG assets
- **State Management**: React Context API
- **API**: RESTful endpoints (see `src/services/api.ts`)
- **Testing**: Jest, @testing-library/react-native
- **Type Checking**: TypeScript

## Project Structure
```
app/                # Main app screens and navigation
  (auth)/           # Auth screens (login, signup)
  (tabs)/           # Main tab navigation (profile, cart, ratings, search)
  landing/          # Landing page
  survey/           # Survey flow
  components/       # Shared UI components
assets/             # Fonts and images
context/            # React Context providers
src/services/       # API and business logic
src/context/        # Additional context (e.g., Auth)
types/              # TypeScript types
```

## Getting Started
1. **Clone the repository**
   ```sh
   git clone https://github.com/felipemedlev/sillefront.git
   cd sillefront
   ```
2. **Install dependencies**
   ```sh
   npm install
   ```
3. **Start the development server**
   ```sh
   npm start
   ```
   Or for specific platforms:
   ```sh
   npm run android   # Android
   npm run ios       # iOS
   npm run web       # Web
   ```
4. **Environment Variables**
   - Configure any required environment variables in `insert-variables.cmd` or `.env` as needed.

## Scripts
- `npm start` — Start Expo development server
- `npm run android` — Run on Android device/emulator
- `npm run ios` — Run on iOS simulator
- `npm run web` — Run in web browser
- `npm test` — Run tests with Jest
- `npm run lint` — Lint codebase

## Testing
- Unit and integration tests are written with Jest and @testing-library/react-native.
- To run tests:
  ```sh
  npm test
  ```

---
_This project is a showcase of modern React Native/Expo development, with a focus on clean code, modular architecture, and a delightful user experience._
