import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { RootState } from '../../src/store';
import { removeFromCart, updateQuantity } from '../../src/store/slices/cartSlice';
import { setCollectionMode } from '../../src/store/slices/bookingSlice';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../src/theme/theme';
import { PremiumBottomSheet } from '../../src/components/PremiumBottomSheet';
import { PremiumScratchModal } from '../../src/components/PremiumScratchModal';
import { LinearGradient } from 'expo-linear-gradient';

export default function CartScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const cart = useSelector((state: RootState) => state.cart);

  const [visitMode, setVisitMode] = useState<'home' | 'center'>('home');
  
  const [isCouponSheetOpen, setCouponSheetOpen] = useState(false);
  const [isScratchOpen, setScratchOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, val: number } | null>(null);

  // Dynamic offsets
  const hasHomeCollection = cart.items.some(i => i.homeCollection);
  const appliedCollectionCharge = (visitMode === 'home' && hasHomeCollection) ? cart.homeCollectionCharge : 0;
  const collectionChargeDifference = (visitMode === 'center' && hasHomeCollection) ? cart.homeCollectionCharge : 0;
  
  // Final Calculation factoring Collection Charge + Reward Discount!
  const couponDiscount = appliedCoupon ? appliedCoupon.val : 0;
  const baseFinal = cart.finalAmount - collectionChargeDifference;
  const calculatedFinalAmount = Math.max(0, baseFinal - couponDiscount);

  if (cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContent}>
          <MaterialCommunityIcons name="cart-off" size={80} color={COLORS.border} />
          <Text style={styles.emptyTitle}>Cart is Empty</Text>
          <Text style={styles.emptyDesc}>Add some tests to your cart to proceed with booking.</Text>
          <TouchableOpacity style={styles.addTestBtn} onPress={() => router.push('/search')}>
            <Text style={styles.addTestBtnText}>Browse Tests</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart ({cart.items.length})</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Visit Mode Dual Toggle */}
        <View style={styles.visitSelector}>
          <TouchableOpacity 
            style={[styles.visitBtn, visitMode === 'home' && styles.visitBtnActive]}
            onPress={() => setVisitMode('home')}
          >
            <MaterialCommunityIcons name="home-circle-outline" size={20} color={visitMode === 'home' ? '#FFF' : COLORS.primary} />
            <Text style={[styles.visitBtnText, visitMode === 'home' && styles.visitBtnTextActive]}>Home Collection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.visitBtn, visitMode === 'center' && styles.visitBtnActive]}
            onPress={() => setVisitMode('center')}
          >
            <MaterialCommunityIcons name="office-building" size={18} color={visitMode === 'center' ? '#FFF' : COLORS.primary} />
            <Text style={[styles.visitBtnText, visitMode === 'center' && styles.visitBtnTextActive]}>Lab Walk-in</Text>
          </TouchableOpacity>
        </View>

{visitMode === 'center' && (
          <View style={[styles.centersSection, { paddingHorizontal: 0 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryLight + '15', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.primaryLight + '40' }}>
              <MaterialCommunityIcons name="information-outline" size={20} color={COLORS.primary} />
              <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.primary, flex: 1, marginLeft: 10, lineHeight: 18 }}>
                You'll select your preferred lab branch on the next screen.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.cartItemsHeader}>
          <Text style={styles.sectionSubhead}>Tests Added ({cart.items.length})</Text>
        </View>

        {cart.items.map(item => (
          <View key={item.id} style={styles.cartCard}>
            <View style={styles.cartCardLeft}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDesc}>
                {item.homeCollection ? 'Home Collection Available' : 'Lab Visit Required'}
              </Text>
              <View style={styles.priceRow}>
                <Text style={styles.discountedPrice}>₹{item.discountedPrice}</Text>
                <Text style={styles.originalPrice}>₹{item.price}</Text>
              </View>
            </View>
            <View style={styles.cartCardRight}>
              <TouchableOpacity onPress={() => dispatch(removeFromCart({ id: item.id, itemType: item.itemType }))} style={styles.removeBtn}>
                <MaterialCommunityIcons name="trash-can-outline" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addMoreBtn} onPress={() => router.push('/search')}>
          <MaterialCommunityIcons name="plus" size={20} color={COLORS.primary} />
          <Text style={styles.addMoreText}>Add More Tests</Text>
        </TouchableOpacity>

        {/* Coupon Apply Strip */}
        <View style={styles.couponStrip}>
          <TouchableOpacity 
            style={styles.couponLeft} 
            activeOpacity={0.7} 
            onPress={() => setCouponSheetOpen(true)}
          >
            <MaterialCommunityIcons name="ticket-percent-outline" size={24} color={COLORS.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.couponTitle}>
                {appliedCoupon ? `Coupon: ${appliedCoupon.code}` : 'Apply Coupons & Offers'}
              </Text>
              <Text style={styles.couponSub}>
                {appliedCoupon ? `You saved ₹${appliedCoupon.val} on this order!` : 'Try lucky scratch for up to ₹300 OFF'}
              </Text>
            </View>
          </TouchableOpacity>
          {appliedCoupon ? (
            <TouchableOpacity onPress={() => setAppliedCoupon(null)} style={styles.couponRemoveBtn}>
              <Text style={styles.removeCouponText}>Remove</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setCouponSheetOpen(true)}>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Bill Details */}
        <View style={styles.billContainer}>
          <Text style={styles.billTitle}>Bill Details</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{cart.totalPrice}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Discount</Text>
            <Text style={[styles.billValue, { color: COLORS.success }]}>- ₹{cart.totalDiscount}</Text>
          </View>
          {couponDiscount > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Coupon Reward</Text>
              <Text style={[styles.billValue, { color: COLORS.success }]}>- ₹{couponDiscount}</Text>
            </View>
          )}
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Home Collection Charge</Text>
            <Text style={styles.billValue}>
              ₹{appliedCollectionCharge}
            </Text>
          </View>
         <View style={styles.billRow}>
            <Text style={styles.billLabel}>Taxes (18% GST)</Text>
            <Text style={styles.billValue}>₹{Math.round((cart.totalPrice - cart.totalDiscount) * 0.18)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.billRow}>
            <Text style={styles.billTotalLabel}>To Pay</Text>
            <Text style={styles.billTotalValue}>₹{calculatedFinalAmount}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerTotalLabel}>Total Amount</Text>
          <Text style={styles.footerTotalAmount}>₹{calculatedFinalAmount}</Text>
        </View>
        <TouchableOpacity 
          style={styles.continueBtn} 
  onPress={() => {
            if (visitMode === 'center') {
              dispatch(setCollectionMode('lab'));
            } else {
              dispatch(setCollectionMode('home'));
            }
            router.push('/checkout/address');
          }}
        >
          <Text style={styles.continueBtnText}>Continue Booking</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      {/* Coupon Drawer */}
      <PremiumBottomSheet
        visible={isCouponSheetOpen}
        onClose={() => setCouponSheetOpen(false)}
      >
        <View style={styles.modalBody}>
          {/* Scratch Card Invite Widget */}
          <TouchableOpacity 
            style={styles.scratchInvite} 
            activeOpacity={0.9} 
            onPress={() => {
              setCouponSheetOpen(false);
              setTimeout(() => setScratchOpen(true), 300);
            }}
          >
            <LinearGradient colors={['#FEF3C7', '#FFFBEB']} style={styles.scratchInviteGrad}>
              <MaterialCommunityIcons name="gift" size={36} color="#F59E0B" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.inviteTitle}>✨ Lucky Scratch Card ✨</Text>
                <Text style={styles.inviteDesc}>Try your luck! Swipe to reveal a randomized cashback reward up to ₹300.</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#D97706" />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.modalHeading}>Available Promos</Text>
          
          {[
            { code: 'WELCOME150', val: 150, desc: 'Flat ₹150 OFF on your first booking' },
            { code: 'HEALTH50', val: 50, desc: 'Additional ₹50 wellness benefit' }
          ].map((coupon) => (
            <View key={coupon.code} style={styles.promoItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.promoCode}>{coupon.code}</Text>
                <Text style={styles.promoDesc}>{coupon.desc}</Text>
              </View>
              <TouchableOpacity 
                style={styles.promoApplyBtn} 
                onPress={() => {
                  setAppliedCoupon({ code: coupon.code, val: coupon.val });
                  setCouponSheetOpen(false);
                }}
              >
                <Text style={styles.promoApplyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </PremiumBottomSheet>

      {/* Dynamic Scratch Interaction Modal */}
      <PremiumScratchModal
        visible={isScratchOpen}
        onClose={() => setScratchOpen(false)}
        onApplyReward={(code, val) => {
          setAppliedCoupon({ code, val });
          Alert.alert("Reward Unlocked!", `Congratulations! You successfully scratched and applied ${code} to save ₹${val}!`);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textLight,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textDark,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  addTestBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 30,
  },
  addTestBtnText: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  cartCardLeft: {
    flex: 1,
  },
  itemName: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textDark,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountedPrice: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textDark,
    marginRight: 8,
  },
  originalPrice: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  cartCardRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 60,
  },
  removeBtn: {
    padding: 8,
    backgroundColor: COLORS.dangerLight,
    borderRadius: 8,
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 24,
  },
  addMoreText: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  billContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  billTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textDark,
    marginBottom: 16,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  billLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  billValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  billTotalLabel: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textDark,
    fontWeight: 'bold',
  },
  billTotalValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textDark,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flex: 1,
  },
  footerTotalLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  footerTotalAmount: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textDark,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
  },
  continueBtnText: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textLight,
    fontWeight: 'bold',
    marginRight: 8,
  },
  visitSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 5,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.soft,
  },
  visitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
  },
  visitBtnActive: {
    backgroundColor: COLORS.primary,
  },
  visitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 6,
  },
  visitBtnTextActive: {
    color: '#FFFFFF',
  },
  centersSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionSubhead: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  centersScroll: {
    flexDirection: 'row',
  },
  centerCard: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 14,
    marginRight: 12,
    ...SHADOWS.soft,
    shadowOpacity: 0.03,
  },
  centerCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  centerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  centerName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textDark,
    flex: 1,
  },
  centerDist: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 2,
  },
  centerAddr: {
    fontSize: 11,
    color: '#64748B',
  },
  centerTextActive: {
    color: '#FFFFFF',
  },
  cartItemsHeader: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  couponStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.soft,
    shadowOpacity: 0.04,
  },
  couponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  couponTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  couponSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  couponRemoveBtn: {
    padding: 6,
  },
  removeCouponText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.danger,
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  scratchInvite: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    ...SHADOWS.soft,
  },
  scratchInviteGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  inviteTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#92400E',
  },
  inviteDesc: {
    fontSize: 11,
    color: '#B45309',
    lineHeight: 15,
    marginTop: 2,
  },
  modalHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  promoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  promoCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  promoDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  promoApplyBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
  },
  promoApplyBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});
