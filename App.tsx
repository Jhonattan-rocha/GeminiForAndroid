import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Text,
  Alert,
  TouchableOpacity,
  Button,
} from 'react-native';
import { WebView } from 'react-native-webview';

const App = () => {
  const [url, setUrl] = useState('https://gemini.google.com/app');
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [error, setError] = useState(false);

  const handleUrlChange = (text) => {
    setUrl(text);
  };

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);

    // Atualiza o input com a URL atual do WebView, se for diferente e não for um erro
    if (navState.url !== url && !error) {
      setUrl(navState.url);
    }
  };

  const handleReload = () => {
    setError(false); // Reseta o estado de erro
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleSubmit = () => {
    // Carrega a URL digitada no input quando o usuário pressionar Enter
    if (webViewRef.current) {
        // Força o reload para usar a nova URL
        setError(false); // Reseta o estado de erro antes de navegar
        webViewRef.current.reload();
        webViewRef.current.injectJavaScript(
            `window.location.href = '${url}';`
        );
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    setError(true);
    // Em alguns casos o navState não é atualizado em erros, então força o estado dos botões
    setCanGoBack(false);
    setCanGoForward(false);

    Alert.alert(
        'Erro de carregamento',
        'Ocorreu um problema ao carregar a página. Verifique sua conexão com a internet.',
        [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.button} onPress={() => webViewRef.current.goBack()} disabled={!canGoBack}>
          <Text style={styles.text}>{'<'}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={handleUrlChange}
          placeholder="Digite a URL aqui"
          autoCapitalize="none"
          keyboardType="url"
          onSubmitEditing={handleSubmit}
        />
        <TouchableOpacity style={styles.button} onPress={() => webViewRef.current.goForward()} disabled={!canGoForward}>
          <Text style={styles.text}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.activityIndicator}
        />
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Erro ao carregar a página.
          </Text>
          <Button title="Tentar Novamente" onPress={handleReload} />
        </View>
      )}

      {!error && ( // Só renderiza o WebView se não houver erro
        <WebView
          ref={webViewRef}
          style={styles.webView}
          source={{ uri: url }}
          onNavigationStateChange={handleNavigationStateChange}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={handleError}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  inputContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    width: '90%',
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    marginLeft: 10,
    marginRight: 10,
  },
  button: {
    width: 30,
    height: 30,
    backgroundColor: 'gray',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  text: {
    color: 'black',
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
