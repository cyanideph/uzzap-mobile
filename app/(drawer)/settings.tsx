import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { getSettings, updateSettings } from '@/lib/supabase';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Picker } from '@react-native-picker/picker';
import { Database } from '@/types/supabase';

type OfflineDeliveryMethod = Database['public']['Enums']['offline_delivery_method'];

export default function SettingsScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Settings state
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(true);
  const [autoMessageDisplay, setAutoMessageDisplay] = useState(true);
  const [offlineDelivery, setOfflineDelivery] = useState<OfflineDeliveryMethod>('server');

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getSettings(user.id);
      setSettings(data);
      
      // Initialize state with loaded settings
      setTheme(data.theme || 'light');
      setNotifications(data.notifications !== false);
      setAutoMessageDisplay(data.auto_message_display !== false);
      setOfflineDelivery(data.offline_delivery || 'server');
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const updates = {
        theme,
        notifications,
        auto_message_display: autoMessageDisplay,
        offline_delivery: offlineDelivery,
      };
      
      await updateSettings(user.id, updates);
      setSettings({ ...settings, ...updates });
      
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#121212' : '#F7F7F7' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F7F7F7' }]}>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.section, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Appearance
          </Text>
          
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Theme
            </Text>
            <View style={[styles.pickerContainer, { backgroundColor: isDark ? '#333' : '#F0F0F0' }]}>
              <Picker
                selectedValue={theme}
                onValueChange={setTheme}
                style={[styles.picker, { color: isDark ? '#FFFFFF' : '#000000' }]}
                dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
              >
                <Picker.Item label="Light" value="light" />
                <Picker.Item label="Dark" value="dark" />
                <Picker.Item label="System Default" value="system" />
              </Picker>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Notifications
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Enable Notifications
              </Text>
              <Text style={styles.settingDescription}>
                Receive notifications for new messages
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notifications ? '#007AFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Auto Display Messages
              </Text>
              <Text style={styles.settingDescription}>
                Automatically display new messages when received
              </Text>
            </View>
            <Switch
              value={autoMessageDisplay}
              onValueChange={setAutoMessageDisplay}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={autoMessageDisplay ? '#007AFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Messaging
          </Text>
          
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Offline Delivery Method
            </Text>
            <View style={[styles.pickerContainer, { backgroundColor: isDark ? '#333' : '#F0F0F0' }]}>
              <Picker
                selectedValue={offlineDelivery}
                onValueChange={(value) => setOfflineDelivery(value as OfflineDeliveryMethod)}
                style={[styles.picker, { color: isDark ? '#FFFFFF' : '#000000' }]}
                dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
              >
                <Picker.Item label="Server" value="server" />
                <Picker.Item label="SMS" value="sms" />
                <Picker.Item label="Email" value="email" />
              </Picker>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSaveSettings}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#FFFFFF" style={styles.saveIcon} />
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginVertical: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabelContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  pickerContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    width: 150,
  },
  picker: {
    height: 40,
    width: 150,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 