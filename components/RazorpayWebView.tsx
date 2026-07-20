import React from 'react';
import { Modal, SafeAreaView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';

export interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}

interface RazorpayWebViewProps {
  isVisible: boolean;
  options: RazorpayOptions;
  onSuccess: (data: any) => void;
  onFailed: (data: any) => void;
  onClose: () => void;
}

export const RazorpayWebView: React.FC<RazorpayWebViewProps> = ({
  isVisible,
  options,
  onSuccess,
  onFailed,
  onClose,
}) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Razorpay Checkout</title>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background-color: #f8fafc; font-family: sans-serif; }
        .loader { border: 4px solid #f3f3f3; border-top: 4px solid #006D6F; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="loader"></div>
      <script>
        window.onload = function() {
          const options = ${JSON.stringify(options)};
          options.handler = function(response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SUCCESS', data: response }));
          };
          options.modal = {
            ondismiss: function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DISMISS' }));
            }
          };
          
          const rzp = new Razorpay(options);
          rzp.on('payment.failed', function (response){
             window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FAILED', data: response }));
          });
          rzp.open();
        }
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const parsed = JSON.parse(event.nativeEvent.data);
      if (parsed.type === 'SUCCESS') {
        onSuccess(parsed.data);
      } else if (parsed.type === 'FAILED') {
        onFailed(parsed.data);
      } else if (parsed.type === 'DISMISS') {
        onClose();
      }
    } catch (error) {
      console.error('Error parsing WebView message', error);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <WebView
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          style={styles.webview}
          javaScriptEnabled={true}
        />
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Cancel Payment</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  closeButton: {
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  closeText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
