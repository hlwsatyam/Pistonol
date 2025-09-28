import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { numberVarify } from '../../utils/auth';

 

function Onboarding({ navigation, route }) {
  const { token } = route.params;
  const theme = useTheme();
  
  // Fetch onboarding data using TanStack Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['onboarding', token],
    queryFn:() => numberVarify(token),
    retry: false,
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator animating={true} color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading onboarding data...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text variant="titleMedium" style={{ color: theme.colors.error }}>
          Error: {error.message}
        </Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={{ marginTop: 16 }}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {data?.steps.map((step) => (
        <View key={step.id} style={styles.stepContainer}>
          <Text variant="headlineSmall" style={styles.stepTitle}>
            {step.title}
          </Text>
          <Text variant="bodyMedium" style={styles.stepDescription}>
            {step.description}
          </Text>
        </View>
      ))}
      
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('Home')}
        style={styles.continueButton}
      >
        Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContainer: {
    marginBottom: 24,
  },
  stepTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  stepDescription: {
    color: '#666',
  },
  continueButton: {
    marginTop: 32,
  },
});

export default Onboarding;