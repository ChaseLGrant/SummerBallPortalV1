export type UserRole = 'player' | 'coach' | 'program'

export interface Profile {
  id: string
  role: UserRole
  created_at: string
}

export interface PlayerProfile {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  school: string | null
  class_year: string | null
  positions: string[]
  bats: string | null
  throws: string | null
  height: string | null
  weight: number | null
  hometown: string | null
  availability_start: string | null
  availability_end: string | null
  open_to_travel: boolean
  metrics: {
    exit_velo?: number
    sixty_time?: number
    velo?: number
    [key: string]: number | undefined
  } | null
  bio: string | null
  video_links: string[]
  headshot_url: string | null
  coach_id: string | null
  coach_uploaded: boolean
  updated_at: string | null
}

export interface ProgramListing {
  id: string
  owner_id: string
  program_name: string
  league_name: string | null
  location_city: string | null
  location_state: string | null
  website: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  travel_type: string | null
  host_family: string | null
  league_fees: number | null
  fees_includes: string | null
  positions_needed: string[]
  roster_openings: number | null
  start_date: string | null
  end_date: string | null
  description: string | null
  logo_url: string | null
  created_at: string
  updated_at: string | null
}

export interface CoachProfile {
  id: string
  full_name: string
  college_name: string | null
  title: string | null
  phone: string | null
  updated_at: string | null
}

export const POSITIONS = [
  'P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH', 'UTIL',
] as const

export const CLASS_YEARS = [
  'Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad Transfer', 'JUCO',
] as const

export const BATS_OPTIONS = ['Right', 'Left', 'Switch'] as const
export const THROWS_OPTIONS = ['Right', 'Left'] as const

export const TRAVEL_TYPES = ['Local', 'Regional', 'National'] as const
export const HOST_FAMILY_OPTIONS = ['Yes', 'No', 'Partial'] as const

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
] as const
