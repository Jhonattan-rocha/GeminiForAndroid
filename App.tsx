import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ActivityIndicator,
  Text,
  Alert,
  Button,
} from 'react-native';
import { WebView } from 'react-native-webview';

const GEMINI_URL = 'https://gemini.google.com/';

// Lista mais completa de domínios do Google permitidos
const ALLOWED_DOMAINS = [
  'gemini.google.com',
  'accounts.google.com',
  'myaccount.google.com',
  'content.googleapis.com',
  'ssl.gstatic.com',
  'www.gstatic.com',
  'apis.google.com',
  'storage.googleapis.com',
  'lh1.googleusercontent.com',
  'lh2.googleusercontent.com',
  'lh3.googleusercontent.com',
  'lh4.googleusercontent.com',
  'lh5.googleusercontent.com',
  'lh6.googleusercontent.com',
  '*.googleusercontent.com', // Engloba vários subdomínios de user content
  '*.youtube.com',
  '*.googlevideo.com', // Necessário para vídeos incorporados do YouTube
  // Adicione outros domínios do Google conforme necessário, após testar o fluxo de login
];

const App = () => {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleNavigationStateChange = (navState) => {
    const { url } = navState;

    // Verifica se o domínio da URL atual está na lista de permitidos
    const isAllowedDomain = ALLOWED_DOMAINS.some((domain) =>
      url.includes(domain)
    );

    if (!isAllowedDomain && url !== 'about:blank') {
      // Se não for um domínio permitido, impede o carregamento e volta para a URL do Gemini
      webViewRef.current.stopLoading();
      setError(true);

      // Caso a página atual seja diferente da inicial, volta para a inicial
      if (!url.startsWith(GEMINI_URL))
          webViewRef.current.goBack();

      Alert.alert(
        'Navegação Restrita',
        'Este aplicativo só pode navegar no site do Gemini e em serviços relacionados do Google.'
      );

    } else {
      setError(false);
    }
  };

  const handleReload = () => {
    setError(false);
    setLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    setError(true);
    setLoading(false);

    Alert.alert(
      'Erro de carregamento',
      'Ocorreu um problema ao carregar a página. Verifique sua conexão com a internet.',
      [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
  };

  const onReceivedSslError = (event) => {
    const { url, error } = event.nativeEvent;

    console.warn('SSL Error: ', error, ' for URL: ', url);

    Alert.alert(
      'Erro de Segurança',
      `Ocorreu um erro de SSL ao tentar acessar ${url}. Detalhes: ${error}`,
      [
        {
          text: 'OK',
          onPress: () => {
            console.log('SSL error acknowledged');
            setError(true);
            setLoading(false);
          },
        },
      ]
    );
  };

  useEffect(() => {
    setLoading(true);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.activityIndicator}
        />
      )}

      {error && <ErrorPage handleReload={handleReload} loading={loading} />}

      {!error && (
        <WebView
          ref={webViewRef}
          style={styles.webView}
          source={{ uri: GEMINI_URL }}
          onNavigationStateChange={handleNavigationStateChange}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          onLoadEnd={() => setLoading(false)}
          onError={handleError}
          onReceivedHttpError={onReceivedSslError}
        />
      )}
    </SafeAreaView>
  );
};

const ErrorPage = ({ handleReload, loading }) => {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Erro ao carregar a página.</Text>
      <Button title="Tentar Novamente" onPress={handleReload} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  activityIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  errorContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 10,
    color: 'red',
  },
});

export default App;
