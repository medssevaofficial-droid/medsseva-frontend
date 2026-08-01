import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenWrapper from '../../src/components/ScreenWrapper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import { COLORS, TYPOGRAPHY } from '../../src/theme/theme';
import { showSuccess } from '../../src/store/toastStore';
import { RootState } from '../../src/store';
import { addToCart } from '../../src/store/slices/cartSlice';
import { PremiumBottomSheet } from '../../src/components/PremiumBottomSheet';
import { testService } from '../../src/services/testService';

export default function TestDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPrepSheetOpen, setPrepSheetOpen] = useState(false);
  const [isFaqSheetOpen, setFaqSheetOpen] = useState(false);

const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartCount = cartItems.length;
  const cartItem = cartItems.find(i => i.id === (id as string) && i.itemType === 'test');
  const cartQty = cartItem?.quantity ?? 0;

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const data = await testService.getTestById(id as string);
        setTest(data);
      } catch (error) {
        console.error('Failed to load test details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerAll]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!test) {
    return (
      <View style={[styles.container, styles.centerAll]}>
        <Text style={TYPOGRAPHY.body}>Test not found.</Text>
      </View>
    );
  }

  const discountPercent = Math.round(((test.price - test.discountedPrice) / test.price) * 100);

const filteredPrep = test.preparationGuidelines ?? [];
const handleAddToCart = () => {
    if (cartItem) {
      showSuccess('This test is already in your cart.', { title: 'Already in Cart' });
      return;
    }
    dispatch(addToCart({
      id: test.id,
      itemType: 'test',
      name: test.name,
      price: test.price,
      discountedPrice: test.discountedPrice,
      homeCollection: test.homeCollection,
      quantity: 1,
    }));
    showSuccess(`${test.name} has been added to your cart.`, { title: '✓ Added to Cart' });
  };

  const handleBookNow = () => {
    dispatch(addToCart({
      id: test.id,
      itemType: 'test',
      name: test.name,
      price: test.price,
      discountedPrice: test.discountedPrice,
      homeCollection: test.homeCollection,
      quantity: 1,
    }));
    router.push('/checkout/cart');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Test Details</Text>
         <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/checkout/cart')}>
            <MaterialCommunityIcons name="cart-outline" size={24} color={COLORS.textLight} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScreenWrapper
        backgroundColor="#F8FAFC"
        contentContainerStyle={styles.scrollContent}
        bottomButton={
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cartSecondaryButton} onPress={handleAddToCart}>
              <MaterialCommunityIcons name="cart-plus" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.cartSecondaryButtonText}>
                {cartQty > 0 ? `Add to Cart (${cartQty})` : 'Add to Cart'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bookPrimaryButton} onPress={handleBookNow}>
              <Text style={styles.bookPrimaryButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={styles.mainCard}>
          <View style={styles.badgeRow}>
            {test.homeCollection && (
              <View style={styles.badge}>
                <MaterialCommunityIcons name="home-plus-outline" size={14} color={COLORS.success} />
                <Text style={styles.badgeText}> Home Collection</Text>
              </View>
            )}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {typeof test.category === 'object' ? test.category.name : test.category}
              </Text>
            </View>
          </View>

          <Text style={styles.testName}>{test.name}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.offerPrice}>₹{test.discountedPrice}</Text>
            <Text style={styles.mrpPrice}>₹{test.price}</Text>
            <View style={styles.discountTag}>
              <Text style={styles.discountTagText}>{discountPercent}% OFF</Text>
            </View>
          </View>

          <Text style={styles.descriptionLabel}>Why is it required?</Text>
          <Text style={styles.description}>{test.whyRequired || test.description}</Text>

          <View style={styles.divider} />

          <View style={styles.indicatorsGrid}>
            <View style={styles.indicatorBox}>
              <MaterialCommunityIcons name="food-apple-outline" size={20} color={COLORS.primary} />
              <Text style={styles.indicatorLabel}>Fasting</Text>
              <Text style={styles.indicatorValue}>{test.fastingRequired ? 'Required' : 'No'}</Text>
            </View>
            <View style={styles.indicatorBox}>
              <MaterialCommunityIcons name="clock-fast" size={20} color={COLORS.primary} />
              <Text style={styles.indicatorLabel}>Report TAT</Text>
              <Text style={styles.indicatorValue}>{test.reportTime}</Text>
            </View>
            <View style={styles.indicatorBox}>
              <MaterialCommunityIcons name="test-tube" size={20} color={COLORS.primary} />
              <Text style={styles.indicatorLabel}>Parameters</Text>
              <Text style={styles.indicatorValue}>{test.parameters?.length ?? 0}</Text>
            </View>
          </View>
        </View>

        {test.parameters && test.parameters.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Parameters Included ({test.parameters.length})</Text>
            <Text style={styles.sectionSubtitle}>Specific metrics tested in this panel</Text>
            <View style={styles.parametersList}>
              {test.parameters.map((param: any, index: number) => (
                <View key={param.id || index} style={styles.parameterItem}>
                  <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.success} />
                  <Text style={styles.parameterText}>{param.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.actionListItem} onPress={() => setPrepSheetOpen(true)}>
            <View style={styles.actionListLeft}>
              <MaterialCommunityIcons name="information-outline" size={24} color={COLORS.primary} />
              <Text style={styles.actionListTitle}>Preparation Guidelines</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionListItem, { borderBottomWidth: 0, paddingBottom: 0 }]} onPress={() => setFaqSheetOpen(true)}>
            <View style={styles.actionListLeft}>
              <MaterialCommunityIcons name="frequently-asked-questions" size={24} color={COLORS.primary} />
              <Text style={styles.actionListTitle}>Frequently Asked Questions</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScreenWrapper>

      <PremiumBottomSheet visible={isPrepSheetOpen} onClose={() => setPrepSheetOpen(false)} height={580}>
        <View style={styles.sheetHeader}>
          <View style={styles.sheetTitleRow}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={22} color={COLORS.primary} />
            <Text style={styles.sheetTitle}>Preparation Instructions</Text>
          </View>
        </View>



        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetScrollContent}>
          {filteredPrep.length > 0 ? (
            <>
              <View style={[styles.prepFastingBadge, {
                borderColor: test.fastingRequired ? '#FDE68A' : '#A7F3D0',
                backgroundColor: test.fastingRequired ? '#FFFBEB' : '#ECFDF5',
              }]}>
                <MaterialCommunityIcons
                  name={test.fastingRequired ? 'food-off' : 'food-apple'}
                  size={20}
                  color={test.fastingRequired ? '#D97706' : COLORS.success}
                />
                <Text style={[styles.prepFastingText, { color: test.fastingRequired ? '#D97706' : COLORS.success }]}>
                  {test.fastingRequired ? 'Fasting Required' : 'No Fasting Required'}
                </Text>
              </View>
              {filteredPrep.map((g: any, index: number) => (
                <View key={g.id || index} style={styles.prepGuidelineCard}>
                  <View style={styles.prepGuidelineCardHeader}>
                    <View style={styles.prepGuidelineNumber}>
                      <Text style={styles.prepGuidelineNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.prepGuidelineTitle}>{g.title}</Text>
                  </View>
                  <Text style={styles.prepGuidelineDesc}>{g.description}</Text>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.prepEmptyContainer}>
              <View style={styles.prepEmptyIconWrap}>
                <MaterialCommunityIcons name="information-outline" size={36} color={COLORS.primary} />
              </View>
              <Text style={styles.prepStatusText}>No Instructions Available</Text>
              <Text style={styles.prepDetailsText}>
                No specific preparation instructions for this mode. Contact our support team for guidance.
              </Text>
            </View>
          )}
          <View style={{ height: 32 }} />
        </ScrollView>

        <View style={styles.sheetFooter}>
          <TouchableOpacity style={styles.gotItButton} onPress={() => setPrepSheetOpen(false)}>
            <Text style={styles.gotItText}>Got It</Text>
          </TouchableOpacity>
        </View>
      </PremiumBottomSheet>

      <PremiumBottomSheet visible={isFaqSheetOpen} onClose={() => setFaqSheetOpen(false)} height={580}>
        <View style={styles.sheetHeader}>
          <View style={styles.sheetTitleRow}>
            <MaterialCommunityIcons name="frequently-asked-questions" size={22} color={COLORS.primary} />
            <Text style={styles.sheetTitle}>Frequently Asked Questions</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetScrollContent}>
          {test.faqs && test.faqs.length > 0 ? (
            test.faqs.map((faq: any, index: number) => (
              <View key={faq.id || index} style={styles.faqCard}>
                <View style={styles.faqQuestionRow}>
                  <View style={styles.faqIndexBadge}>
                    <Text style={styles.faqIndexText}>Q{index + 1}</Text>
                  </View>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                </View>
                <View style={styles.faqAnswerWrap}>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.prepEmptyContainer}>
              <View style={styles.prepEmptyIconWrap}>
                <MaterialCommunityIcons name="frequently-asked-questions" size={36} color={COLORS.border} />
              </View>
              <Text style={styles.prepStatusText}>No FAQs Available</Text>
              <Text style={styles.prepDetailsText}>
                Contact our support team for any questions about this test.
              </Text>
            </View>
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      </PremiumBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerAll: { justifyContent: 'center', alignItems: 'center' },
  headerSafeArea: { backgroundColor: COLORS.primary },
  header: {
    paddingBottom: 20, paddingHorizontal: 20, paddingTop: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  backButton: { padding: 4 },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.textLight },
cartButton: { padding: 4, position: 'relative' },
  cartBadge: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: COLORS.danger,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  cartBadgeText: {
    color: COLORS.textLight,
    fontSize: 9,
    fontWeight: 'bold',
  },
  scrollContent: { padding: 16 },

  mainCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },

  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.successLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  badgeText: { ...TYPOGRAPHY.caption, color: COLORS.success, fontWeight: 'bold' },
  categoryBadge: { backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  categoryBadgeText: { ...TYPOGRAPHY.caption, color: COLORS.primary, fontWeight: 'bold', textTransform: 'uppercase' },

  testName: { ...TYPOGRAPHY.h1, color: COLORS.textDark, marginBottom: 12 },

  priceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  offerPrice: { ...TYPOGRAPHY.h1, color: COLORS.textDark, marginRight: 12 },
  mrpPrice: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textDecorationLine: 'line-through', marginRight: 12 },
  discountTag: { backgroundColor: COLORS.discountGreen, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discountTagText: { fontSize: 12, color: '#fff', fontWeight: 'bold' },

  descriptionLabel: { ...TYPOGRAPHY.subtitle, color: COLORS.textDark, fontWeight: '600', marginBottom: 8 },
  description: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, lineHeight: 22 },

  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 20 },

  indicatorsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  indicatorBox: { flex: 1, alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginHorizontal: 4 },
  indicatorLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 4 },
  indicatorValue: { ...TYPOGRAPHY.caption, color: COLORS.textDark, fontWeight: 'bold', marginTop: 2 },

  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.textDark, marginBottom: 4 },
  sectionSubtitle: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: 16 },

  parametersList: { marginTop: 8 },
  parameterItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  parameterText: { ...TYPOGRAPHY.body, color: COLORS.textDark, marginLeft: 12 },

  actionListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  actionListLeft: { flexDirection: 'row', alignItems: 'center' },
  actionListTitle: { ...TYPOGRAPHY.body, color: COLORS.textDark, fontWeight: '600', marginLeft: 16 },

  footerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cartSecondaryButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: COLORS.primary,
    paddingVertical: 16, borderRadius: 12, marginRight: 8,
  },
  cartSecondaryButtonText: { ...TYPOGRAPHY.subtitle, color: COLORS.primary, fontWeight: 'bold' },
  bookPrimaryButton: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, marginLeft: 8,
  },
  bookPrimaryButtonText: { ...TYPOGRAPHY.subtitle, color: '#FFFFFF', fontWeight: 'bold' },

  sheetHeader: {
    paddingBottom: 16, paddingHorizontal: 22,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9', marginBottom: 4,
  },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sheetTitle: { ...TYPOGRAPHY.h2, color: COLORS.textDark },
  sheetScrollContent: { paddingTop: 16, paddingBottom: 8 },
  sheetFooter: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },



  prepFastingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16,
    borderWidth: 1,
  },
  prepFastingText: { fontSize: 14, fontWeight: '700', flex: 1 },
  prepGuidelineCard: {
    backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  prepGuidelineCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  prepGuidelineNumber: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  prepGuidelineNumberText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  prepGuidelineTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, flex: 1 },
  prepGuidelineDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 21, paddingLeft: 42 },
  prepEmptyContainer: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
  prepEmptyIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  prepStatusText: { ...TYPOGRAPHY.h3, color: COLORS.textDark, marginBottom: 8, textAlign: 'center' },
  prepDetailsText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24 },
  gotItButton: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginBottom: 8 },
  gotItText: { ...TYPOGRAPHY.subtitle, color: COLORS.textLight, fontWeight: 'bold' },

  faqCard: {
    backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  faqQuestionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  faqIndexBadge: {
    backgroundColor: COLORS.primary, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0, marginTop: 1,
  },
  faqIndexText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  faqQuestion: { ...TYPOGRAPHY.subtitle, color: COLORS.textDark, fontWeight: '700', flex: 1, lineHeight: 22 },
  faqAnswerWrap: { paddingLeft: 44, paddingTop: 2 },
  faqAnswer: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, lineHeight: 23 },
});