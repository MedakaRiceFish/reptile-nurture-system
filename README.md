
# Zoo Management System

## Project Overview

This is a comprehensive Zoo Management System designed to help zookeepers and staff manage animals, enclosures, environmental conditions, scheduling, and analytics. The system provides an intuitive interface for tracking animal health, monitoring enclosure conditions, scheduling tasks, and generating insights.

## Key Features

### Animals Management
- Complete animal database with detailed profiles
- Weight tracking with historical data and trend visualization
- Health records and observations
- Animal source/breeder information
- Animal-to-enclosure assignment system

### Enclosures Management
- Enclosure profiles with environmental parameters
- Real-time environmental monitoring (temperature, humidity, etc.)
- Maintenance scheduling and history tracking
- Equipment status monitoring

### Environmental Monitoring
- Sensor integration for critical parameters
- Historical data visualization via charts
- Alert system for out-of-range parameters
- Customizable ranges for different species requirements

### Task Scheduling
- Staff task assignment and scheduling
- Maintenance reminders and tracking
- Feeding schedules and special care requirements
- Calendar integration with notifications

### Analytics and Reporting
- Weight trend analysis for animal health
- Environmental parameter correlation analysis
- Maintenance efficiency metrics
- Custom report generation

### Notifications System
- Real-time alerts for critical conditions
- Scheduled reminders for routine tasks
- Escalation paths for unresolved issues
- Mobile-friendly notification delivery

## Technical Documentation

### Project Structure

The project follows a component-based architecture with React and TypeScript, organized as follows:

```
src/
├── components/
│   ├── ui/               # UI components from shadcn/ui and custom components
│   │   ├── dashboard/    # Specialized dashboard components
│   │   └── layout/       # Layout components (Header, SideNav, etc.)
├── hooks/                # Custom React hooks
├── integrations/         # External service integrations (Supabase)
├── lib/                  # Utility functions and helpers
└── pages/                # Page components for each route
```

### Routes

The application includes the following routes:

- `/` - Dashboard with overview statistics
- `/landing` - Public landing page
- `/login` - User authentication
- `/signup` - New user registration
- `/enclosures` - List of all enclosures
- `/enclosure/:id` - Detailed view of specific enclosure with environmental data
- `/animals` - List of all animals
- `/animal/:id` - Detailed animal record with weight history
- `/analytics` - Data visualization and reports
- `/schedule` - Task scheduling and calendar
- `/notifications` - System notifications and alerts
- `/alerts` - Critical alerts requiring attention
- `/settings` - System configuration and documentation

### Data Models

#### Animal
```typescript
interface Animal {
  id: number;
  name: string;
  species: string;
  age: string; // Often stored as descriptive text (e.g., "2 years")
  enclosureId: number;
  imageUrl?: string;
  weight: number; // Current weight in grams
  sex: 'Male' | 'Female' | 'Unknown';
  acquisitionDate?: string;
  breederSource?: string;
}
```

#### Weight Record
```typescript
interface WeightRecord {
  date: string; // ISO date string
  weight: number; // Weight in grams
}
```

#### Enclosure
```typescript
interface Enclosure {
  id: number;
  name: string;
  type: string;
  capacity: number;
  currentAnimals: number;
  status: 'Active' | 'Maintenance' | 'Inactive';
  lastCleaned?: string; // ISO date string
}
```

#### Environmental Data
```typescript
interface EnvironmentalData {
  enclosureId: number;
  timestamp: string;
  temperature: number;
  humidity: number;
  lightLevel: number;
  waterQuality?: number;
  airflow?: number;
}
```

#### Maintenance Record
```typescript
interface MaintenanceRecord {
  id: number;
  enclosureId: number;
  date: string;
  type: string;
  performedBy: string;
  notes?: string;
}
```

### Key Components

#### UI Components
- `AnimalCard` - Displays animal summary information
- `AnimalList` - Renders a filterable list of animals
- `AnimalWeightChart` - Visualizes weight history over time
- `EnclosureList` - Shows all enclosures with status indicators
- `SensorChart` - Displays environmental parameter charts
- `WeightHistoryList` - Tabular view of weight measurements
- `EnvironmentCard` - Shows enclosure environmental conditions
- `MainLayout` - Standard page layout with navigation

#### Specialized Pages
- `AnimalRecord` - Complete animal profile and history
- `Environment` - Enclosure environmental monitoring and control
- `Analytics` - Data visualization and reporting tools

### Technologies Used

- **Frontend Framework**: React with TypeScript
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State Management**: React Query (TanStack Query)
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Building/Bundling**: Vite

### Backend Integration

The application is designed to connect with Supabase for:
- Authentication and user management
- Database for all application data
- Storage for images and documents
- Realtime subscriptions for live updates

## Future Development Roadmap

- Mobile application for on-the-go monitoring
- Advanced analytics with predictive capabilities
- Medical record integration
- Dietary management system
- Breeding program tracking
- Public exhibit information portal
- Staff management and scheduling

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open the application at: `http://localhost:8080`

## API Documentation

The system is designed to work with a RESTful API providing the following endpoints:

### Animals
- `GET /animals` - Retrieve all animals
- `GET /animals/:id` - Get specific animal details
- `POST /animals` - Create new animal record
- `PUT /animals/:id` - Update animal information
- `DELETE /animals/:id` - Remove animal record
- `GET /animals/:id/weight-history` - Get weight history for animal

### Enclosures
- `GET /enclosures` - List all enclosures
- `GET /enclosures/:id` - Get enclosure details
- `GET /enclosures/:id/environmental-data` - Get environmental readings
- `GET /enclosures/:id/maintenance-history` - Get maintenance records
- `POST /enclosures/:id/maintenance` - Record maintenance event

The current implementation uses mock data for development purposes, with plans to integrate a full backend API.
