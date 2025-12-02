// screens/DMRDashboard.js
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const DMRDashboard = ({   }) => {
  const navigation=useNavigation()
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Month End Reports</Text>
      <Text style={styles.subHeader}>Submit your monthly reports</Text>
      
      <ScrollView style={styles.scrollView}>
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('MonthlySaleReport')}
        >
          <Text style={styles.cardTitle}>MFS REPORT</Text>
          <Text style={styles.cardDescription}>
            A. Position as on end of the month
          
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('StockReport')}
        >
          <Text style={styles.cardTitle}>Stock Report</Text>
          <Text style={styles.cardDescription}>
            Stock in Godown details at end of the month
           
        
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 400,
    
    textAlign: 'center',
    marginTop: 20,
     
    color: 'red',
  },
  subHeader: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2196F3',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});

export default DMRDashboard;