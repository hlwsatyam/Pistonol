import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Text, Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {themeColor} from '../../locale/Locale';
import ThemeWithBg from '../../Skeleton/ThemeWithBg';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
useFocusEffect(
    React.useCallback(() => {
      const fetchUser = async () => {
        try {
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  };

  const handleEditProfile = () => {
    navigation.navigate('ProfileEdit', {user});
  };

  // Profile sections configuration
  const profileSections = [
    {
      title: 'Personal Information',
      icon: 'account-circle',
      items: [
        user?.username && {
          icon: 'account',
          label: 'Username',
          value: user.username,
        },
        user?.email && {icon: 'email', label: 'Email', value: user.email},
        user?.mobile && {
          icon: 'phone',
          label: 'Mobile',
          value: `+91 ${user.mobile}`,
        },
        user?.district && {
          icon: 'map-marker',
          label: 'District',
          value: user.district,
        },
        user?.state && {icon: 'earth', label: 'State', value: user.state},
        user?.pincode && {icon: 'pin', label: 'Pincode', value: user.pincode},
        user?.role && {icon: 'account-key', label: 'Role', value: user.role},
        user?.wallet !== undefined && {
          icon: 'wallet',
          label: 'Wallet Balance',
          value: `₹${user.wallet}`,
        },
      ].filter(Boolean),
    },

    {
      title: 'Support',
      icon: 'help-circle',
      items: [
        {icon: 'headset', label: 'Contact Support', action: 'Support'},
        {icon: 'file-document', label: 'Terms & Conditions', action: 'Terms'},
        {
          icon: 'shield-check',
          label: 'Privacy Policy',
          action: 'PrivacyPolicy',
        },
      ],
    },
  ];

  if (loading) {
    return (
      <ThemeWithBg>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={themeColor[0]} />
          <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
      </ThemeWithBg>
    );
  }

  return (
    <ThemeWithBg>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Header */}
        <LinearGradient
          colors={themeColor}
          style={styles.profileHeader}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}>
          <TouchableOpacity onPress={handleEditProfile}>
            {user?.photo?.url ? (
              <Image
                source={{uri: user.photo.url}}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Icon name="account" size={50} color="white" />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.userName}>{user?.username || 'User'}</Text>
          {user?.mobile && (
            <Text style={styles.userMobile}>+91 {user.mobile}</Text>
          )}

          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}>
            <Icon name="pencil" size={18} color={themeColor[0]} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Profile Sections */}
        <View style={styles.sectionsContainer}>
          {profileSections.map(
            (section, sectionIndex) =>
              section.items.length > 0 && (
                <Card key={sectionIndex} style={styles.sectionCard}>
                  <Card.Content>
                    <View style={styles.sectionHeader}>
                      <Icon
                        name={section.icon}
                        size={24}
                        color={themeColor[0]}
                        style={styles.sectionIcon}
                      />
                      <Text style={styles.sectionTitle}>{section.title}</Text>
                    </View>

                    {section.items.map((item, itemIndex) => (
                      <TouchableOpacity
                        key={itemIndex}
                        style={[
                          styles.sectionItem,
                          itemIndex === section.items.length - 1 && {
                            borderBottomWidth: 0,
                          },
                        ]}
                        onPress={() =>
                          item.action && navigation.navigate(item.action)
                        }>
                        <View style={styles.itemContent}>
                          <Icon
                            name={item.icon}
                            size={20}
                            color="#666"
                            style={styles.itemIcon}
                          />
                          <Text style={styles.itemLabel}>{item.label}</Text>
                        </View>
                        <View style={styles.itemValueContainer}>
                          {item.value ? (
                            <Text style={styles.itemValue}>{item.value}</Text>
                          ) : (
                            <Icon name="chevron-right" size={20} color="#999" />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </Card.Content>
                </Card>
              ),
          )}

          {/* Logout Button */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}>
                <Icon name="logout" size={20} color="#e74c3c" />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </ThemeWithBg>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: themeColor[0],
    marginTop: 10,
  },
  profileHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
    marginBottom: 10,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userMobile: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 15,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  editButtonText: {
    color: themeColor[0],
    fontWeight: 'bold',
    marginLeft: 5,
  },
  sectionsContainer: {
    paddingHorizontal: 15,
  },
  sectionCard: {
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10,
  },
  sectionIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: 15,
  },
  itemLabel: {
    fontSize: 16,
    color: '#333',
  },
  itemValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  logoutText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
