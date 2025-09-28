import {useEffect, useState, useRef} from 'react';
import {WebView} from 'react-native-webview';
import {getUniqueId} from 'react-native-device-info';
import { StyleSheet } from 'react-native';
import ThemeWithBg from '../../Skeleton/ThemeWithBg';

const TempLog = ({navigation}) => {
  const [deviceId, setDeviceId] = useState('');
  const webViewRef = useRef(null);

  const userInfo = {
    iss: 'phmail',
    aud: 'user',
    client_id: '11841599228911920156'
  };

  const URI = `https://auth.phone.email/log-in?client_id=${userInfo.client_id}&auth_type=4&device=${deviceId}`;

  // More comprehensive injection script
  const injectScript = `
    (function() {
      // Function to modify styles and content
      function modifyElements() {
        // Try to find buttons by common attributes
        const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"], .btn, .button');
        
        buttons.forEach(btn => {
          // Change button text if it contains certain words
          if (btn.innerText.toLowerCase().includes('sign in') || 
              btn.innerText.toLowerCase().includes('log in') ||
              btn.innerText.toLowerCase().includes('login')) {
            btn.innerText = 'Login';
          }
          
          // Apply styles
          btn.style.backgroundColor = 'red'!important;
          btn.style.color = 'white';
          btn.style.border = 'none';
          btn.style.borderRadius = '4px';
          btn.style.padding = '10px 15px';
          btn.style.fontSize = '16px';
          btn.style.cursor = 'pointer';
        });
        
        // Modify background
        document.body.style.backgroundColor = '#f5f5f5';
        
        // You can add more specific selectors if you know the page structure
        const containers = document.querySelectorAll('.auth-container, .login-box, .form-container');
        containers.forEach(el => {
          el.style.backgroundColor = 'white';
          el.style.borderRadius = '8px';
          el.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
          el.style.padding = '20px';
        });
      }
      
      // Run immediately
      modifyElements();
      
      // Set up mutation observer to handle dynamic content
      const observer = new MutationObserver(modifyElements);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
      });
      
      // Also run on interval as fallback
      setInterval(modifyElements, 1000);
    })();
  `;

  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await getUniqueId();
      setDeviceId(id);
    };
    fetchDeviceId();
  }, []);

  const phoneAuthJwt = event => {
    const encodedJWT = event.nativeEvent.data;
    navigation.navigate('Onboarding', {token: encodedJWT});
  };

  return (
    <ThemeWithBg>
      <WebView
        source={{uri: URI}}
        style={styles.webView}
        onMessage={phoneAuthJwt}
        ref={webViewRef}
        injectedJavaScript={injectScript}
        onLoadEnd={() => {
          // Reinject after page loads completely
          webViewRef.current.injectJavaScript(injectScript);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </ThemeWithBg>
  );
};

const styles = StyleSheet.create({
  webView: {
    flex: 1,
  },
});

export default TempLog;