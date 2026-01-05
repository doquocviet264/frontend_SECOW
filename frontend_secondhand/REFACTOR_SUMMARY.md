# Tóm tắt Refactor MVVM

## Giải thích cách chia lại kiến trúc

### Nguyên tắc MVVM được áp dụng:

1. **Model Layer** (`models/`):
   - Chỉ chứa data structures (types/interfaces)
   - Chứa các hàm mapping từ API response sang domain model
   - Không có business logic, không có UI code

2. **ViewModel Layer** (`viewmodels/`):
   - Chứa toàn bộ business logic
   - Quản lý state (useState, useReducer)
   - Xử lý các actions (toggle, update, delete, etc.)
   - Tính toán các giá trị computed (subtotal, total, etc.)
   - Gọi Services để tương tác với API
   - Expose state và actions cho View thông qua custom hook

3. **View Layer** (`index.tsx`):
   - Chỉ render UI components
   - Bind dữ liệu từ ViewModel
   - Gọi actions từ ViewModel khi user tương tác
   - Không có business logic, không gọi trực tiếp API

4. **Services Layer** (`services/`):
   - Đã có sẵn, chỉ xử lý API calls
   - Được gọi bởi ViewModel, không được gọi trực tiếp từ View

## Danh sách File/Folder sau khi Refactor

### Cart Page
```
pages/Cart/
├── models/
│   └── CartModel.ts                    # ✨ MỚI: Data structures + mapping
├── viewmodels/
│   └── CartViewModel.ts                # ✨ MỚI: Business logic + state
├── index.tsx                            # ♻️ REFACTORED: Chỉ UI, bind với ViewModel
├── types.ts                             # ♻️ UPDATED: Re-export từ models
└── components/                          # ✅ GIỮ NGUYÊN
    ├── CartHeader.tsx
    ├── CartItemRow.tsx
    ├── CartSelectBar.tsx
    ├── OrderSummary.tsx
    ├── Recommendations.tsx
    └── SellerGroup.tsx
```

### Checkout Page
```
pages/Checkout/
├── models/
│   └── CheckoutModel.ts                 # ✨ MỚI: Data structures + mapping
├── viewmodels/
│   └── CheckoutViewModel.ts             # ✨ MỚI: Business logic + state
├── index.tsx                            # ♻️ REFACTORED: Chỉ UI, bind với ViewModel
├── types.ts                             # ♻️ UPDATED: Re-export từ models
└── components/                          # ✅ GIỮ NGUYÊN
    ├── AddressCard.tsx
    ├── AddressSection.tsx
    ├── CheckoutItemRow.tsx
    ├── NewAddressModal.tsx
    ├── OrderSummary.tsx
    ├── PaymentMethodSection.tsx
    ├── ProductsSection.tsx
    └── SellerBlock.tsx
```

## Code hoàn chỉnh cho từng phần

### 1. Model - CartModel.ts

```typescript
/**
 * Cart Model - Data structures only
 * Mapping từ API response sang domain model
 */
export type CartItem = {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  stock: number;
  quantity: number;
  checked: boolean;
  // ... other fields
};

export type SellerCartGroup = {
  id: string;
  name: string;
  checked: boolean;
  items: CartItem[];
};

// Mapping function
export function mapApiCartItemToModel(dto: CartItemDto): CartItem {
  return {
    id: dto.id,
    title: dto.product?.title || "Sản phẩm",
    imageUrl: dto.product?.image || "",
    price: dto.product?.price || 0,
    stock: dto.product?.stock || 0,
    quantity: dto.quantity || 1,
    checked: false,
  };
}
```

### 2. ViewModel - CartViewModel.ts

```typescript
/**
 * Cart ViewModel - Business logic và state management
 */
export function useCartViewModel() {
  const [groups, setGroups] = useState<SellerCartGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cartCount, refreshCart } = useCart();

  // Load cart từ API
  const loadCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await cartService.getCart();
      const apiItems = res?.data?.cart?.items || [];
      const mappedGroups = mapApiCartItemsToGroups(apiItems);
      setGroups(mappedGroups);
    } catch (err) {
      setError("Không thể tải giỏ hàng");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Business logic: Toggle all items
  const toggleAll = useCallback(() => {
    const nextChecked = !allChecked;
    const next = groups.map((g) => ({
      ...g,
      checked: nextChecked,
      items: g.items.map((it) => ({ ...it, checked: nextChecked })),
    }));
    setGroups(next);
  }, [groups, allChecked]);

  // Computed values
  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const totalCount = allItems.length;
  const subtotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    // State
    groups,
    isLoading,
    error,
    // Actions
    toggleAll,
    toggleSeller,
    toggleItem,
    incrementQuantity,
    decrementQuantity,
    deleteSelected,
    removeItem,
    // Computed
    totalCount,
    allChecked,
    selectedItems,
    subtotal,
    discount,
  };
}
```

### 3. View - index.tsx

```typescript
/**
 * Cart View - Chỉ xử lý UI và binding với ViewModel
 */
export default function CartPage() {
  const navigate = useNavigate();
  
  // Sử dụng ViewModel để lấy state và actions
  const {
    groups,
    totalCount,
    allChecked,
    selectedItems,
    subtotal,
    discount,
    toggleAll,
    toggleSeller,
    toggleItem,
    incrementQuantity,
    decrementQuantity,
    deleteSelected,
    removeItem,
  } = useCartViewModel();

  // Handler cho checkout - chỉ xử lý navigation
  const handleCheckout = () => {
    const selectedIds = selectedItems.map((i) => i.id);
    sessionStorage.setItem("checkoutSelectedItemIds", JSON.stringify(selectedIds));
    navigate("/checkout");
  };

  return (
    <PageLayout>
      <div>
        {/* UI Components */}
        <CartSelectBar 
          total={totalCount} 
          allChecked={allChecked} 
          onToggleAll={toggleAll} 
          onDeleteSelected={deleteSelected} 
        />
        
        {groups.map((g) => (
          <SellerGroup
            key={g.id}
            group={g}
            onToggleSeller={toggleSeller}
            onToggleItem={toggleItem}
            onInc={incrementQuantity}
            onDec={decrementQuantity}
            onRemove={removeItem}
          />
        ))}
        
        <OrderSummary
          subtotal={subtotal}
          discount={discount}
          onCheckout={handleCheckout}
        />
      </div>
    </PageLayout>
  );
}
```

## So sánh Trước và Sau

### ❌ TRƯỚC (Logic trộn lẫn):
- View chứa: useState, useEffect, API calls, business logic, UI rendering
- Khó test: Logic và UI gắn chặt với nhau
- Khó maintain: Thay đổi logic phải sửa View
- Code smell: Component quá dài, nhiều responsibilities

### ✅ SAU (MVVM):
- **Model**: Chỉ data structures và mapping
- **ViewModel**: Tất cả business logic và state management
- **View**: Chỉ UI rendering và binding
- Dễ test: ViewModel test độc lập
- Dễ maintain: Tách biệt rõ ràng từng layer
- Clean code: Mỗi file có một responsibility duy nhất

## Các Code Smells đã được sửa

1. ✅ **Logic trong View**: Đã di chuyển toàn bộ logic vào ViewModel
2. ✅ **ViewModel quá béo**: Chia nhỏ thành Model và ViewModel
3. ✅ **Coupling cao**: View không còn phụ thuộc trực tiếp vào Services
4. ✅ **Mixed concerns**: Tách biệt rõ ràng data, logic, và UI

## Kết quả

- ✅ **Cart Page**: Đã refactor hoàn chỉnh theo MVVM
- ✅ **Checkout Page**: Đã refactor hoàn chỉnh theo MVVM
- ✅ **Backward compatibility**: Components vẫn import từ `types.ts` (re-export từ models)
- ✅ **No breaking changes**: UI giữ nguyên, chỉ refactor logic
- ✅ **Clean architecture**: Code rõ ràng, dễ mở rộng, dễ bảo trì

## Next Steps

Các pages khác có thể refactor theo pattern tương tự:
- Products Page
- Profile Page
- OrderDetail Page
- SellerDashboard Pages
- AdminDashboard Pages



