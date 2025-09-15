import { ArtifactWithDistance } from './index';

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Camera: undefined;
  ArtifactDetail: { artifact: ArtifactWithDistance };
  ARViewer: { 
    artifact: ArtifactWithDistance;
    userLocation: {
      latitude: number;
      longitude: number;
    };
  };
};

export type TabParamList = {
  Map: undefined;
  Explore: undefined;
  Create: undefined;
  Profile: undefined;
};
