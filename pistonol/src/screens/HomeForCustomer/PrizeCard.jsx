import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  endDirectionTheme,
  startDirectionTheme,
  themeColor,
} from '../../locale/Locale';

const {width} = Dimensions.get('window');

const PrizeCard = ({
  user,
  lastScannedAt,
  lastTransferedAt,
  amount = '12,000',
}) => {
  const shineAnim = useRef(new Animated.Value(-width)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useEffect(() => {
    // Shine animation loop
    Animated.loop(
      Animated.timing(shineAnim, {
        toValue: width,
        duration: 2500,
        useNativeDriver: true,
      }),
    ).start();

    // Arrow bounce animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: 6,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.card}>
      {/* Top Headers */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Last Transfer</Text>
        <Text style={styles.header}>🕒 Last Scanned</Text>
      </View>

      {/* Date and Wallet */}
      <View style={styles.dateRow}>
        <Text style={styles.dateText}>
          {lastTransferedAt ? lastTransferedAt : 'Not Transfer Yet'}
        </Text>
        <Text style={styles.dateText}>
          {lastScannedAt ? lastScannedAt : 'Not Scanned Yet'}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Highlight Amount */}
      <View style={styles.earningRow}>
        <Text style={styles.amount}> 🎁 Wallet: ₹{amount}</Text>
      </View>

      {/* Transaction + Claim Button */}
      <LinearGradient
        colors={themeColor}
        start={endDirectionTheme}
        end={startDirectionTheme}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Wallet', {user})}
          style={styles.button}>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>View Transactions</Text>
            <Text style={styles.buttonText}>• Claim Now</Text>
            <Animated.View style={{transform: [{translateX: arrowAnim}]}}>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </Animated.View>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {/* Info Note */}
      <View style={styles.infoBox}>
        <FontAwesome name="info-circle" size={14} color="#555" />
        <Text style={styles.infoText}>
          Use <Text style={{fontWeight: 'bold'}}>Pistonol</Text> Product to earn
          extra coupons!
        </Text>
      </View>

      {/* Shine animation overlay */}
      <Animated.View
        style={[
          styles.shine,
          {
            transform: [{translateX: shineAnim}],
          },
        ]}
      />
    </View>
  );
};

export default PrizeCard;

const styles = StyleSheet.create({
  card: {
    margin: 5,
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 4,
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 8,
    gap: 5,
    alignItems: 'center',
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateText: {
    color: '#666',
    fontSize: 14,
  },
  infoText: {
    color: '#666',
    fontSize: 12,
  },
  divider: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginVertical: 12,
  },
  earningRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  button: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    backgroundColor: 'transparent',
    fontWeight: '600',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '40%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    transform: [{rotate: '15deg'}],
  },
});
