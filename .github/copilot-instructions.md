# React TypeScript Dashboard - Copilot Instructions

## Project Overview
This is a React TypeScript dashboard application with:
- Left sidebar navigation
- Two prediction pages that fetch data from API endpoints
- POST requests to http://127.0.0.1:8000/predict and http://127.0.0.1:8000/predict2
- Dynamic data display in tables
- Error handling and loading states

## Development Guidelines
- Use TypeScript for all components
- Follow React functional component patterns
- Maintain responsive design principles
- Handle API errors gracefully
- Use CSS modules or styled components for styling

## API Integration
- All requests use POST method with JSON headers
- Empty JSON body {} for both endpoints
- Proper error handling for network failures
- Loading states during API calls

## Key Components
- `Dashboard.tsx`: Main layout with sidebar and routing
- `HomePrediction1.tsx`: First prediction page
- `HomePrediction2.tsx`: Second prediction page
- Shared styling in `PredictionComponent.css`