import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import ThemeWithBg from '../../Skeleton/ThemeWithBg';
import {SafeAreaView} from 'react-native-safe-area-context';

const {width} = Dimensions.get('window');

// Reusable Notification Card Component
const NotificationCard = React.memo(({item, index, onPress}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.notificationCard,
        {
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}],
        },
      ]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.notificationContent}>
          <View
            style={[styles.notificationIcon, {backgroundColor: item.color}]}>
            <Icon name={item.icon} size={24} color="white" />
          </View>
          <View style={styles.notificationTextContainer}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationTime}>{item.time}</Text>
          </View>
          {item.unread && <View style={styles.unreadBadge} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const NotificationScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([
    
  ]);

  const handleBack = () => {
    navigation.goBack();
  };

  const markAsRead = id => {
    setNotifications(
      notifications.map(item =>
        item.id === id ? {...item, unread: false} : item,
      ),
    );
  };

  return (
    <ThemeWithBg>
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
       
        </View>

        {/* Notification Count */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {notifications.filter(n => n.unread).length} New Notifications
          </Text>
        </View>

        {/* Animated Notifications List */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {notifications.map((item, index) => (
            <NotificationCard
              key={item.id}
              item={item}
              index={index}
              onPress={() => markAsRead(item.id)}
            />
          ))}
        </ScrollView>

        {/* Floating Action Button */}
        <Animated.View style={styles.fab}>
          <TouchableOpacity style={styles.fabButton}>
            <Icon name="delete" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ThemeWithBg>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  countContainer: {
    padding: 10,
    backgroundColor: '#6200EE',
  },
  countText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollContainer: {
    padding: 15,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadBadge: {
    position: 'absolute',
    right: 15,
    top: 15,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5252',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#FF5252',
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationScreen;
