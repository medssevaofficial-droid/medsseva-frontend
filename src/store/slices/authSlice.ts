import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PartnerInfo {
  id: string;
  labName: string;
  approvalStatus: string;
  isAvailable: boolean;
  rating: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role?: string;
  uhid?: string;
  avatar?: string;
  healthScore?: number;
  dob?: string;
  altMobile?: string;
  fullAddress?: string;
  pincode?: string;
  city?: string;
  gender?: string;
  partner?: PartnerInfo;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isLoggingOut: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
 setLoggingOut: (state, action: PayloadAction<boolean>) => {
      state.isLoggingOut = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoggingOut = false;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, setLoggingOut, updateProfile } = authSlice.actions;

export default authSlice.reducer;
