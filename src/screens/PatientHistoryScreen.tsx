import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { Button, Card, Text, Surface, Divider, IconButton, Avatar } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, ScanSession } from '../types';
import { colors, spacing, typography, commonStyles, radius, getSeverityColor, getSeverityLabel, getMUACZoneColor, getMUACZoneLabel } from '../theme/theme';
import { getPatientSessions } from '../storage/patientStore';

type Props = NativeStackScreenProps<RootStackParamList, 'PatientHistory'>;

export default function PatientHistoryScreen({ route, navigation }: Props) {
  const { patient } = route.params;
  const [sessions, setSessions] = useState<ScanSession[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const userSessions = await getPatientSessions(patient.id);
      userSessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setSessions(userSessions);
    } catch (e) {
      console.error('Error fetching sessions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleNewScreening = () => {
    navigation.navigate('AnemiaScan', { patient });
  };

  const renderSession = ({ item }: { item: ScanSession }) => (
    <Card style={styles.sessionCard}>
      <Card.Content>
        <View style={commonStyles.rowBetween}>
          <Text style={typography.bodyBold}>
            {new Date(item.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
          <Surface style={styles.typeBadge}>
            <Text style={[typography.captionBold, { color: colors.primary }]}>{item.type.toUpperCase()}</Text>
          </Surface>
        </View>

        <Divider style={{ marginVertical: spacing.sm }} />

        {item.anemiaResult && (
          <View style={styles.resultRow}>
            <Text style={typography.body}>Hemoglobin (Hb):</Text>
            <Text style={[typography.bodyBold, { color: getSeverityColor(item.anemiaResult.severity) }]}>
              {item.anemiaResult.hbEstimate.value.toFixed(1)} g/dL ({getSeverityLabel(item.anemiaResult.severity).toUpperCase()})
            </Text>
          </View>
        )}

        {item.nutritionResult?.muac && (
          <View style={styles.resultRow}>
            <Text style={typography.body}>MUAC Circumference:</Text>
            <Text style={[typography.bodyBold, { color: item.nutritionResult.muacZone ? getMUACZoneColor(item.nutritionResult.muacZone) : colors.textPrimary }]}>
              {item.nutritionResult.muac.circumferenceCm.toFixed(1)} cm ({getMUACZoneLabel(item.nutritionResult.muacZone || 'green').toUpperCase()})
            </Text>
          </View>
        )}

        {item.nutritionResult?.emaciation && (
          <View style={styles.resultRow}>
            <Text style={typography.body}>Facial Preservation:</Text>
            <Text style={[typography.bodyBold, { color: colors.secondary }]}>
              {item.nutritionResult.emaciation.preservationScore.toFixed(0)}/100 ({item.nutritionResult.emaciation.classification.replace('_', ' ').toUpperCase()})
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={commonStyles.screen}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Top Bar with Home */}
            <View style={[commonStyles.rowBetween, { marginBottom: spacing.xs }]}>
              <Text style={typography.captionBold}>PATIENT ARCHIVE</Text>
              <IconButton 
                icon="home" 
                iconColor={colors.primary} 
                size={26} 
                onPress={() => navigation.navigate('Home')}
              />
            </View>

            {/* Patient Header */}
            <Surface style={styles.headerCard} elevation={1}>
              <Avatar.Text 
                size={50} 
                label={patient.name.substring(0, 2).toUpperCase()} 
                color={colors.textOnPrimary}
                style={{ backgroundColor: colors.primary }}
              />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={typography.h3}>{patient.name}</Text>
                <Text style={typography.body}>{patient.age} {patient.ageUnit} • {patient.gender.toUpperCase()} • {patient.weight} kg</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  ID: {patient.id} {patient.village ? `• ${patient.village}` : ''}
                </Text>
              </View>
            </Surface>

            {/* Trends Section if multiple scans exist */}
            {sessions.length > 1 && (
              <Card style={[commonStyles.card, { marginBottom: spacing.md, borderLeftWidth: 4, borderLeftColor: colors.secondary }]}>
                <Card.Content>
                  <Text style={typography.h4}>Historical Health Progression</Text>
                  
                  <View style={{ marginTop: spacing.xs }}>
                    <Text style={typography.captionBold}>Hemoglobin Track:</Text>
                    <Text style={[typography.bodyBold, { color: colors.primary }]}>
                      {sessions.filter(s => s.anemiaResult).map(s => `${s.anemiaResult?.hbEstimate.value.toFixed(1)} g/dL`).reverse().join(' → ')}
                    </Text>
                  </View>
                  
                  {sessions.some(s => s.nutritionResult?.muac) && (
                    <View style={{ marginTop: spacing.xs }}>
                      <Text style={typography.captionBold}>MUAC Growth Track:</Text>
                      <Text style={[typography.bodyBold, { color: colors.secondary }]}>
                        {sessions.filter(s => s.nutritionResult?.muac).map(s => `${s.nutritionResult?.muac?.circumferenceCm.toFixed(1)} cm`).reverse().join(' → ')}
                      </Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            )}

            <Text style={[typography.h4, { marginBottom: spacing.sm }]}>Recorded Screening Sessions ({sessions.length})</Text>
          </>
        }
        renderItem={renderSession}
        ListEmptyComponent={
          <View style={[commonStyles.center, { padding: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.md }]}>
            <Avatar.Icon size={52} icon="clipboard-text-outline" style={{ backgroundColor: colors.surfaceMuted }} color={colors.textSecondary}/>
            <Text style={[typography.h4, { marginTop: spacing.md }]}>No Scans Recorded Yet</Text>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
              Perform an anemia or malnutrition scan for this patient to build their medical timeline.
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      <View style={styles.fabContainer}>
        <Button 
          mode="contained" 
          onPress={handleNewScreening} 
          style={commonStyles.buttonPrimary}
          icon="plus"
        >
          Start New Screening
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.md,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sessionCard: {
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeBadge: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.round,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
