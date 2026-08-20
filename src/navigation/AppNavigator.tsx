import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IconButton } from 'react-native-paper';
import { RootStackParamList } from '../types';
import { colors } from '../theme/theme';

import HomeScreen from '../screens/HomeScreen';
import PatientRegistrationScreen from '../screens/PatientRegistrationScreen';
import AnemiaScanScreen from '../screens/AnemiaScanScreen';
import PPGCaptureScreen from '../screens/PPGCaptureScreen';
import EyeScanScreen from '../screens/EyeScanScreen';
import AnemiaResultScreen from '../screens/AnemiaResultScreen';
import NutritionScanScreen from '../screens/NutritionScanScreen';
import MUACCaptureScreen from '../screens/MUACCaptureScreen';
import FaceScanScreen from '../screens/FaceScanScreen';
import NutritionResultScreen from '../screens/NutritionResultScreen';
import HealthPassportScreen from '../screens/HealthPassportScreen';
import PatientHistoryScreen from '../screens/PatientHistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => (
          <IconButton
            icon="home"
            iconColor={colors.textOnPrimary}
            size={24}
            onPress={() => navigation.navigate('Home')}
          />
        ),
      })}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'HemoNutri AI', 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="PatientRegistration" 
        component={PatientRegistrationScreen} 
        options={{ title: 'Register Patient' }} 
      />
      <Stack.Screen 
        name="AnemiaScan" 
        component={AnemiaScanScreen} 
        options={{ title: 'Anemia Screening' }} 
      />
      <Stack.Screen 
        name="PPGCapture" 
        component={PPGCaptureScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="EyeScan" 
        component={EyeScanScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="AnemiaResult" 
        component={AnemiaResultScreen} 
        options={{ title: 'Anemia Results' }} 
      />
      <Stack.Screen 
        name="NutritionScan" 
        component={NutritionScanScreen} 
        options={{ title: 'Nutrition Screening' }} 
      />
      <Stack.Screen 
        name="MUACCapture" 
        component={MUACCaptureScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="FaceScan" 
        component={FaceScanScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="NutritionResult" 
        component={NutritionResultScreen} 
        options={{ title: 'Nutrition Results' }} 
      />
      <Stack.Screen 
        name="HealthPassport" 
        component={HealthPassportScreen} 
        options={{ title: 'Digital Health Passport' }} 
      />
      <Stack.Screen 
        name="PatientHistory" 
        component={PatientHistoryScreen} 
        options={{ title: 'Patient History & Trends' }} 
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
