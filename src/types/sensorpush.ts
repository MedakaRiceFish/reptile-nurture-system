
export interface SensorPushCredentials {
  email: string;
  password: string;
}

export interface SensorPushAuthResponse {
  authorization: string;
  expires: string;
}

export interface SensorPushTokens {
  accesstoken: string;
  refreshtoken: string;
}

export interface SensorPushSensor {
  id: string;
  name: string;
  deviceId: string;
  address: string;
  rssi: number;
  battery: number;
  active: boolean;
  alerts: boolean;
}

export interface SensorPushSample {
  id: string;
  observation: string;
  humidity: number;
  temperature: number;
  pressure?: number;
  barometer?: number;
  dewpoint: number;
  vpd?: number;
}

export interface SensorPushSamplesResponse {
  status: string;
  total: number;
  limit: number;
  sensors: Record<string, SensorPushSample[]>;
}

export interface SensorPushSensorsResponse {
  status: string;
  total: number;
  sensors: Record<string, SensorPushSensor>;
}

// Database token structure
export interface SensorPushDBTokens {
  auth_token: string;
  access_token: string;
  refresh_token: string;
  access_expires: string;
  refresh_expires: string;
}
