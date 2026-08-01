import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../src/theme/theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { addToCart } from '../src/store/slices/cartSlice';
import { showSuccess } from '../src/store/toastStore';

import { PremiumTestCard } from '../src/components/PremiumTestCard';
import { PremiumPackageCard } from '../src/components/PremiumPackageCard';
import { PremiumBottomSheet } from '../src/components/PremiumBottomSheet';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../src/services/api';

export default function SearchScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isCartMode = mode === 'cart';

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartItemIds = useMemo(
    () => new Set(cartItems.filter(i => i.itemType === 'test').map(i => i.id)),
    [cartItems]
  );

  const [localAddedIds, setLocalAddedIds] = useState<Set<string>>(() =>
    new Set(cartItems.filter(i => i.itemType === 'test').map(i => i.id))
  );

  const { data: tests = [] } = useQuery({
    queryKey: ['tests'],
    queryFn: apiService.getAllTests,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: apiService.getAllCategories,
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: apiService.getAllPackages,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);

  const [filterTestType, setFilterTestType] = useState<'all' | 'packages' | 'profiles'>('all');
  const [filterCollection, setFilterCollection] = useState<'all' | 'home' | 'lab'>('all');

  const [tempFilterTestType, setTempFilterTestType] = useState<'all' | 'packages' | 'profiles'>('all');
  const [tempFilterCollection, setTempFilterCollection] = useState<'all' | 'home' | 'lab'>('all');

  const allItems = useMemo(() => {
    const testItems = tests.map((t: any) => ({ ...t, searchItemType: 'test' }));
    if (isCartMode) return testItems;
    return [
      ...testItems,
      ...packages.map((p: any) => ({ ...p, searchItemType: 'package' })),
    ];
  }, [tests, packages, isCartMode]);

  const filteredResults = useMemo(() => allItems.filter((item: any) => {
    const nameMatches = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatches = ('description' in item && typeof item.description === 'string')
      ? item.description.toLowerCase().includes(searchQuery.toLowerCase())
      : false;
    const categoryName = typeof item.category === 'object' ? item.category?.name : item.category;
    const categoryMatches = categoryName ? categoryName.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const matchesQuery = nameMatches || descMatches || categoryMatches;

    const catId = item.categoryId;
    const matchesCategory = selectedCategory === 'all' ? true : catId === selectedCategory;

    let matchesType = true;
    if (!isCartMode) {
      if (filterTestType === 'packages') {
        matchesType = item.searchItemType === 'package';
      } else if (filterTestType === 'profiles') {
        matchesType = item.searchItemType === 'test' && (
          item.name.toLowerCase().includes('profile') ||
          item.name.toLowerCase().includes('package') ||
          item.name.toLowerCase().includes('care')
        );
      }
    }

    let matchesCollection = true;
    if (filterCollection === 'home') {
      matchesCollection = item.homeCollection === true;
    }

    return matchesQuery && matchesCategory && matchesType && matchesCollection;
  }), [allItems, searchQuery, selectedCategory, filterTestType, filterCollection, isCartMode]);

  const handleAddToCart = (test: any) => {
    const alreadyIn = localAddedIds.has(test.id);
    if (alreadyIn) {
      showSuccess('This test is already in your cart.', { title: 'Already in Cart' });
      return;
    }
    dispatch(addToCart({
      id: test.id,
      itemType: 'test',
      name: test.name,
      price: test.price,
      discountedPrice: test.discountedPrice,
      homeCollection: test.homeCollection ?? true,
      quantity: 1,
    }));
    setLocalAddedIds(prev => new Set(prev).add(test.id));
    showSuccess(`${test.name} has been added to your cart.`, { title: '✓ Added to Cart' });
  };

  const renderCategoryChips = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
      <TouchableOpacity
        style={[styles.chip, selectedCategory === 'all' && styles.activeChip]}
        onPress={() => setSelectedCategory('all')}
      >
        <Text style={[styles.chipText, selectedCategory === 'all' && styles.activeChipText]}>All Tests</Text>
      </TouchableOpacity>
      {categories.map((cat: any) => (
        <TouchableOpacity
          key={cat.id}
          style={[styles.chip, selectedCategory === cat.id && styles.activeChip]}
          onPress={() => setSelectedCategory(cat.id)}
        >
          <Text style={[styles.chipText, selectedCategory === cat.id && styles.activeChipText]}>
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topHeaderBg}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isCartMode ? 'Add to Cart' : 'Browse Tests'}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={22} color={COLORS.textLight} style={{ opacity: 0.7 }} />
            <TextInput
              style={styles.searchText}
              placeholder='Search Tests...'
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            )}
          </View>
          {!isCartMode && (
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => {
                setTempFilterTestType(filterTestType);
                setTempFilterCollection(filterCollection);
                setFilterSheetOpen(true);
              }}
            >
              <MaterialCommunityIcons name="tune" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.chipsContainer}>
        {renderCategoryChips()}
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsCount}>{filteredResults.length} {isCartMode ? 'tests available' : 'items available'}</Text>
        <FlatList
          data={filteredResults}
          keyExtractor={(item) => `${item.id}-${item.searchItemType}`}
          renderItem={({ item }) => {
            if (item.searchItemType === 'package') {
              return (
                <PremiumPackageCard
                  packageData={item as any}
                  onPress={() => router.push(`/package/${item.id}`)}
                />
              );
            }
            return (
              <PremiumTestCard
                test={item as any}
                onPress={() => router.push(`/test/${item.id}`)}
                cartMode={isCartMode}
                isInCart={localAddedIds.has(item.id)}
                onAddToCart={() => handleAddToCart(item)}
              />
            );
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="flask-empty-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyText}>Try adjusting your search text or filter options.</Text>
            </View>
          }
        />
      </View>

      {!isCartMode && (
        <PremiumBottomSheet visible={isFilterSheetOpen} onClose={() => setFilterSheetOpen(false)}>
          <Text style={styles.sheetTitle}>Filter Options</Text>

          <Text style={styles.filterSectionTitle}>Test Type</Text>
          <View style={styles.filterRow}>
            {(['all', 'packages', 'profiles'] as const).map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.filterChip, tempFilterTestType === type && styles.filterChipActive]}
                onPress={() => setTempFilterTestType(type)}
              >
                <Text style={tempFilterTestType === type ? styles.filterChipTextActive : styles.filterChipText}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterSectionTitle}>Collection Method</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, tempFilterCollection === 'home' && styles.filterChipActive]}
              onPress={() => setTempFilterCollection('home')}
            >
              <MaterialCommunityIcons
                name="home-plus-outline"
                size={16}
                color={tempFilterCollection === 'home' ? COLORS.textLight : COLORS.textSecondary}
              />
              <Text style={[tempFilterCollection === 'home' ? styles.filterChipTextActive : styles.filterChipText, { marginLeft: 4 }]}>
                Home Visit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, tempFilterCollection === 'lab' && styles.filterChipActive]}
              onPress={() => setTempFilterCollection('lab')}
            >
              <MaterialCommunityIcons
                name="hospital-building"
                size={16}
                color={tempFilterCollection === 'lab' ? COLORS.textLight : COLORS.textSecondary}
              />
              <Text style={[tempFilterCollection === 'lab' ? styles.filterChipTextActive : styles.filterChipText, { marginLeft: 4 }]}>
                Lab Visit
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.applyFilterBtn}
            onPress={() => {
              setFilterTestType(tempFilterTestType);
              setFilterCollection(tempFilterCollection);
              setFilterSheetOpen(false);
            }}
          >
            <Text style={styles.applyFilterText}>Apply Filters</Text>
          </TouchableOpacity>
        </PremiumBottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeaderBg: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textLight,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: 12,
  },
  searchText: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
    marginLeft: 8,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipsContainer: {
    paddingVertical: 16,
  },
  chipScroll: {
    paddingHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: COLORS.surface,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeChipText: {
    color: COLORS.textLight,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  sheetTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textDark,
    marginBottom: 24,
  },
  filterSectionTitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textDark,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 10,
    marginBottom: 10,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textDark,
  },
  filterChipTextActive: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
  applyFilterBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
  applyFilterText: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
});