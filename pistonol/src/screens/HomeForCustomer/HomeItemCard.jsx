import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/FontAwesome5';
import Icon3 from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {color} from '../../locale/Locale';

 

const HomeItemCard = ({setScanVisible, setScanTab}) => {
  const navigation = useNavigation();
  const leftCards = [
    {
      id: 1,
      title: 'Manual Entry',
      icon: <Icon name="edit" size={30} color={color} />,
    },
    {
      id: 2,
      title: 'Terms & Conditions',
      navigateTo: 'Terms',
      icon: <Icon name="description" size={30} color={color} />,
    },
 
    {
      id: 4,
      navigateTo: 'ProductListingScreen',
      title: 'Suggest ',
      icon: <Icon3 name="droplet" size={30} color={color} />,
    },
   {
      id: 3,
      navigateTo: 'Support',
      title: 'Support',
      icon: <Icon2 name="headset" size={30} color={color} />,
    },


  ];

  const rightCard = {
    id: 5,
    title: 'Learning Academy',
    icon: <Icon name="school" size={40} color={color} />,
    description: 'Enhance your knowledge with our courses',
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.leftContainer}>
        {leftCards.map(card => (
          <TouchableOpacity
            key={card.id}
            style={styles.card}
            onPress={() => {
              if (card.id === 1) {
                setScanTab('Code');
                setScanVisible(true);
              } else {
                navigation.navigate(card.navigateTo);
              }
            }}>
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>{card.icon}</View>
              <Text style={styles.cardTitle}>{card.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.rightContainer}>
        <TouchableOpacity style={[styles.rightCard]}>
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, styles.rightIconContainer]}>
              {rightCard.icon}
            </View>
            <Text style={[styles.cardTitle, styles.rightCardTitle]}>
              {rightCard.title}
            </Text>
            <Text style={styles.rightCardDescription}>
              {rightCard.description}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
  },
  leftContainer: {
    width: '60%',
    height: 250,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rightContainer: {
    width: '40%',
    paddingLeft: 8,
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: 'blue',
    borderRadius: 12,
    marginBottom: 8,
    padding: 16,
    borderColor: 'white',
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'white',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.95,
    shadowRadius: 5.84,
    elevation: 5,
  },
  rightCard: {
    width: '100%',
    height: 255,
    backgroundColor: 'red',
    borderRadius: 12,
    padding: 16,
    borderColor: 'white',
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.55,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: 'rgba(74, 140, 255, 0.1)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  rightIconContainer: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: color,
    textAlign: 'center',
  },
  rightCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: color,
  },
  rightCardDescription: {
    fontSize: 12,
    color: color,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

export default HomeItemCard;
