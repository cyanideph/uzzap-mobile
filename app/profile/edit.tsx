import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useRegions } from '@/contexts/RegionsContext';
import { Button, TextInput } from '@/components/ui';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Buffer } from 'buffer';
import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';

const EditProfileScreen = () => {
  const { user, profile, updateProfile } = useAuth();
  const { regions, provinces, fetchRegions, fetchProvinces } = useRegions();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [displayName, setDisplayName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [regionId, setRegionId] = useState<string | null>(null);
  const [provinceId, setProvinceId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setMobileNumber(profile.mobile_number || '');
      setAvatarUrl(profile.avatar_url);
      setRegionId(profile.region_id);
      setProvinceId(profile.province_id);
    }
    
    fetchRegions();
  }, [profile]);

  useEffect(() => {
    if (regionId) {
      fetchProvinces(regionId);
    }
  }, [regionId]);

  const validateForm = () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return false;
    }
    if (!mobileNumber.trim()) {
      Alert.alert('Error', 'Mobile number is required');
      return false;
    }
    // Validate mobile number format
    if (!/^\+?[1-9]\d{1,14}$/.test(mobileNumber)) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setUploading(true);
      
      // Resize and compress the image
      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { width: 300, height: 300 } }],
        { format: SaveFormat.JPEG, compress: 0.7 }
      );
      
      const response = await fetch(manipResult.uri);
      const blob = await response.blob();
      const buffer = Buffer.from(await blob.arrayBuffer());
      
      const fileExt = uri.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, buffer, {
          contentType: `image/${fileExt}`,
        });
      
      if (uploadError) throw uploadError;
      
      const { data: publicURL } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      setAvatarUrl(publicURL.publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      
      const updates = {
        display_name: displayName,
        mobile_number: mobileNumber,
        avatar_url: avatarUrl,
        region_id: regionId,
        province_id: provinceId,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await updateProfile(updates);
      
      if (error) throw new Error(error);
      
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f7f7f7' }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack.Screen 
        options={{
          title: 'Edit Profile',
          headerShadowVisible: false,
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
          headerStyle: {
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarContainer}>
          {uploading ? (
            <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#333' : '#E1E1E1' }]}>
              <ActivityIndicator size="large" color={isDark ? "#FFFFFF" : "#0000ff"} />
            </View>
          ) : (
            <>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#333' : '#E1E1E1' }]}>
                  <Text style={[styles.avatarInitial, { color: isDark ? '#CCC' : '#555' }]}>
                    {displayName ? displayName[0].toUpperCase() : '?'}
                  </Text>
                </View>
              )}
            </>
          )}
          <TouchableOpacity style={styles.changeAvatarButton} onPress={pickImage}>
            <Text style={[styles.changeAvatarText, { color: isDark ? '#0A84FF' : '#007AFF' }]}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#333' }]}>Display Name</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your display name"
              autoCapitalize="words"
              containerStyle={{ backgroundColor: isDark ? '#333' : '#FFFFFF' }}
              inputStyle={{ color: isDark ? '#FFFFFF' : '#000000' }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#333' }]}>Mobile Number</Text>
            <TextInput
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="Enter your mobile number"
              keyboardType="phone-pad"
              autoCapitalize="none"
              containerStyle={{ backgroundColor: isDark ? '#333' : '#FFFFFF' }}
              inputStyle={{ color: isDark ? '#FFFFFF' : '#000000' }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#333' }]}>Region</Text>
            <View style={[styles.pickerContainer, { backgroundColor: isDark ? '#333' : '#FFFFFF', borderColor: isDark ? '#555' : '#DADADA' }]}>
              <Picker
                selectedValue={regionId}
                onValueChange={(itemValue) => {
                  setRegionId(itemValue);
                  setProvinceId(null);
                }}
                style={[styles.picker, { color: isDark ? '#FFFFFF' : '#000000' }]}
                dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
              >
                <Picker.Item label="Select Region" value={null} />
                {regions?.map((region) => (
                  <Picker.Item 
                    key={region.id} 
                    label={region.name} 
                    value={region.id} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          {regionId && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#333' }]}>Province</Text>
              <View style={[styles.pickerContainer, { backgroundColor: isDark ? '#333' : '#FFFFFF', borderColor: isDark ? '#555' : '#DADADA' }]}>
                <Picker
                  selectedValue={provinceId}
                  onValueChange={setProvinceId}
                  style={[styles.picker, { color: isDark ? '#FFFFFF' : '#000000' }]}
                  enabled={!!regionId}
                  dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
                >
                  <Picker.Item label="Select Province" value={null} />
                  {provinces && provinces[regionId]?.map((province) => (
                    <Picker.Item 
                      key={province.id} 
                      label={province.name} 
                      value={province.id} 
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          <Button 
            title={saving ? 'Saving...' : 'Save Profile'} 
            onPress={handleSave}
            disabled={saving}
            loading={saving}
            style={styles.saveButton}
            variant={isDark ? 'secondary' : 'primary'}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  changeAvatarButton: {
    marginTop: 12,
  },
  changeAvatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  saveButton: {
    marginTop: 10,
  },
});

export default EditProfileScreen; 