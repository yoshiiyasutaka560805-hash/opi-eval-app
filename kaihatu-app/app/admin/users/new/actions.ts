'use server'

import { supabase } from '@/lib/supabase'

interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  priority: number
}

interface ServiceUserData {
  name: string
  nameKana: string
  address: string
  phone: string
  photo?: string
  pickupLocation: string
  pickupLocationRainy?: string
  pickupTimeEarliest?: string
  parkingNotes?: string
  serviceNotes?: string
  wheelchairRequired: boolean
  serviceDays: string[]
  standardVehicle: string
  careLevel?: string
  familyNotificationPhone?: string
  emergencyContacts: EmergencyContact[]
  incompatibleUsers: string[]
}

export async function saveServiceUser(data: ServiceUserData) {
  try {
    // Convert frontend format to Supabase format
    const supabaseData = {
      name: data.name,
      name_kana: data.nameKana,
      address: data.address,
      phone: data.phone,
      family_phone: data.familyNotificationPhone || null,
      pickup_location: data.pickupLocation,
      pickup_location_rain: data.pickupLocationRainy || null,
      earliest_pickup_time: data.pickupTimeEarliest || null,
      parking_notes: data.parkingNotes || null,
      care_notes: data.serviceNotes || null,
      wheelchair: data.wheelchairRequired,
      weekdays: data.serviceDays,
      default_vehicle_id: data.standardVehicle || null,
      care_level: data.careLevel || null,
      is_active: true,
    }

    const { data: result, error } = await supabase
      .from('users')
      .insert([supabaseData])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Error saving service user:', error)
    return { success: false, error: String(error) }
  }
}

export async function getServiceUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .order('name_kana', { ascending: true })

    if (error) {
      console.error('Supabase select error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching service users:', error)
    return { success: false, error: String(error) }
  }
}


code .env.local

start notepad "C:\Users\hr\Desktop\kaihatu\opi-eval-app\.env.local"

npm run dev

