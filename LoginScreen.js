import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Switch,
  Alert,
} from 'react-native';
import axios from 'axios';
import qs from 'qs';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

let baseUrl = '';

const LoginScreen = ({ navigation }) => {
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isServiceProvider, setIsServiceProvider] = useState(false);

  const formatUrl = (inputUrl) => {
    let formattedUrl = inputUrl;
    if (!formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    if (!formattedUrl.endsWith(':1280/api/v3')) {
      if (formattedUrl.endsWith('/')) {
        formattedUrl = formattedUrl.slice(0, -1);
      }
      formattedUrl = formattedUrl.replace(/:1280\/api\/v3$/, '');
      formattedUrl = formattedUrl + ':1280/api/v3';
    }
    return formattedUrl;
  };

  const loginUser = async () => {
    baseUrl = formatUrl(url);
    const requestBody = qs.stringify({
      grant_type: 'password',
      username: username,
      password: password,
    });

    try {
      const response = await axios.post(`${baseUrl}/token`, 
        requestBody, 
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        const { access_token, refresh_token, expires_in } = response.data;
        const expirationTime = new Date().getTime() + expires_in * 1000;
        await AsyncStorage.setItem('baseUrl', baseUrl); // Store baseUrl
        await AsyncStorage.setItem('accessToken', access_token);
        await AsyncStorage.setItem('refreshToken', refresh_token);
        await AsyncStorage.setItem('expiresIn', expirationTime.toString());
        await logStoredItems();
        return true;
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request data:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      Alert.alert('Login failed', error.message);
      return false;
    }
  };

  const logStoredItems = async () => {
    try {
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const expiresIn = await AsyncStorage.getItem('expiresIn');
      console.log('Base URL:', baseUrl);
      console.log('Access Token:', accessToken);
      console.log('Refresh Token:', refreshToken);
      console.log('Expires In:', expiresIn);
    } catch (error) {
      console.error('Error retrieving stored items:', error);
    }
  };

  const handleLogin = async () => {
    if (username && password && url) {
      const loginSuccess = await loginUser();
      if (loginSuccess) {
        if (isServiceProvider) {
          navigation.replace('ServiceProviderDashboard');
        } else {
          navigation.replace('Dashboard');
        }
      }
    } else {
      Alert.alert('Please fill in all fields');
    }
  };

  const handleFindProvider = () => {
    Alert.alert('Find Provider Clicked');
  };

  return (
    <ImageBackground
      source={{ uri: 'https://example.com/background-image.jpg' }}
      style={styles.backgroundImage}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.form}>
            <Text style={styles.title}>Veeam Service Portal</Text>
            <TextInput
              style={styles.input}
              placeholder="URL"
              placeholderTextColor="#999"
              value={url}
              onChangeText={setUrl}
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Service Provider Mode</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isServiceProvider ? "#004D40" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => setIsServiceProvider(previousState => !previousState)}
                value={isServiceProvider}
              />
            </View>
            <TouchableOpacity onPress={handleFindProvider}>
              <Text style={styles.link}>Find a Veeam Cloud Service Provider</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
  },
  form: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    margin: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#004D40',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    fontSize: 16,
  },
  link: {
    color: '#004D40',
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#004D40',
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#004D40',
  },
});

export default LoginScreen;
