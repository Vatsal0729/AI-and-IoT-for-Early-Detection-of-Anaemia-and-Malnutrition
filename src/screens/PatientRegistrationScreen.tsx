import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, SegmentedButtons, Button, Card, HelperText, Divider, IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Patient } from '../types';
import { colors, spacing, typography, commonStyles, radius } from '../theme/theme';
import { savePatient } from '../storage/patientStore';

type Props = NativeStackScreenProps<RootStackParamList, 'PatientRegistration'>;

const generateId = () => 'PT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();

export default function PatientRegistrationScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [ageUnit, setAgeUnit] = useState<'months' | 'years'>('years');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [weight, setWeight] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [village, setVillage] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  const validate = () => {
    let valid = true;
    let newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }
    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      newErrors.age = 'Enter a valid age (0-120)';
      valid = false;
    }
    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum) || weightNum <= 0 || weightNum > 200) {
      newErrors.weight = 'Enter a valid weight (0.5-200 kg)';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setIsSaving(true);
      try {
        const patient: Patient = {
          id: generateId(),
          name: name.trim(),
          age: parseInt(age),
          ageUnit: ageUnit,
          gender: gender,
          weight: parseFloat(weight),
          guardianName: guardianName.trim() || undefined,
          village: village.trim() || undefined,
          createdAt: new Date().toISOString(),
        };

        // Persist patient to local storage immediately
        await savePatient(patient);

        // Navigate to AnemiaScan with the registered patient
        navigation.navigate('AnemiaScan', { patient });
      } catch (e) {
        Alert.alert('Error', 'Could not save patient data locally.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <SafeAreaView style={commonStyles.screen}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={commonStyles.rowBetween}>
            <View>
              <Text style={styles.headerTitle}>New Patient</Text>
              <Text style={styles.headerSubtitle}>Enter demographic details</Text>
            </View>
            <IconButton 
              icon="home" 
              iconColor={colors.primary} 
              size={28} 
              onPress={() => navigation.navigate('Home')}
            />
          </View>

          <Card style={styles.card}>
            <TextInput
              label="Patient Full Name *"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              error={!!errors.name}
              placeholder="e.g. Rajesh Sharma"
            />
            {errors.name && <HelperText type="error" visible={true}>{errors.name}</HelperText>}

            <View style={commonStyles.rowBetween}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <TextInput
                  label="Age *"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.age}
                  placeholder={ageUnit === 'months' ? 'e.g. 18' : 'e.g. 28'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <SegmentedButtons
                  value={ageUnit}
                  onValueChange={(val) => setAgeUnit(val as 'months' | 'years')}
                  buttons={[
                    { value: 'months', label: 'Months' },
                    { value: 'years', label: 'Years' },
                  ]}
                  style={styles.segmented}
                />
              </View>
            </View>
            {errors.age && <HelperText type="error" visible={true}>{errors.age}</HelperText>}

            <Text style={styles.label}>Gender *</Text>
            <SegmentedButtons
              value={gender}
              onValueChange={(val) => setGender(val as 'male' | 'female' | 'other')}
              buttons={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
              style={styles.segmented}
            />

            <TextInput
              label="Weight (kg) *"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              error={!!errors.weight}
              placeholder="e.g. 58.5"
            />
            {errors.weight && <HelperText type="error" visible={true}>{errors.weight}</HelperText>}

            <Divider style={commonStyles.divider} />

            <TextInput
              label="Guardian Name (Optional)"
              value={guardianName}
              onChangeText={setGuardianName}
              mode="outlined"
              style={styles.input}
              placeholder="e.g. Sunita Sharma (Mother)"
            />

            <TextInput
              label="Village / Ward / Location (Optional)"
              value={village}
              onChangeText={setVillage}
              mode="outlined"
              style={styles.input}
              placeholder="e.g. Rampur Sector 4"
            />
          </Card>

          <Button 
            mode="contained" 
            onPress={handleSubmit} 
            loading={isSaving}
            disabled={isSaving}
            style={styles.submitButton}
            labelStyle={typography.bodyBold}
            icon="arrow-right"
          >
            Save & Start Screening
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  card: {
    ...commonStyles.cardElevated,
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  label: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  segmented: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  submitButton: {
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
});
