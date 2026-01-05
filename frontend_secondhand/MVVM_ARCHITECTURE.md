# Kiến trúc MVVM - Tài liệu Refactor

## Tổng quan

Dự án đã được refactor theo mô hình **MVVM (Model-View-ViewModel)** để tách biệt rõ ràng giữa logic xử lý dữ liệu, business logic và UI.

## Cấu trúc MVVM

### 1. **Model** (`models/`)
- **Chức năng**: Chỉ chứa data structures (types/interfaces)
- **Nhiệm vụ**:
  - Định nghĩa cấu trúc dữ liệu domain
  - Mapping dữ liệu từ API/Database sang domain model
  - Không chứa logic xử lý UI
  - Không chứa business logic

**Ví dụ**: `pages/Cart/models/CartModel.ts`
```typescript
export type CartItem = { ... };
export function mapApiCartItemToModel(dto: CartItemDto): CartItem { ... }
```

### 2. **ViewModel** (`viewmodels/`)
- **Chức năng**: Chứa toàn bộ business logic và state management
- **Nhiệm vụ**:
  - Xử lý dữ liệu từ Model
  - Expose state cho View (observable/state/binding)
  - Xử lý các actions từ View
  - Gọi Services để tương tác với API
  - Không phụ thuộc vào View cụ thể

**Ví dụ**: `pages/Cart/viewmodels/CartViewModel.ts`
```typescript
export function useCartViewModel() {
  // State management
  // Business logic
  // Actions
  return { state, actions, computed };
}
```

### 3. **View** (`views/` hoặc `index.tsx`)
- **Chức năng**: Chỉ xử lý UI và binding dữ liệu
- **Nhiệm vụ**:
  - Render UI components
  - Bind data từ ViewModel
  - Gọi actions từ ViewModel
  - Không chứa business logic
  - Không gọi trực tiếp API/Database

**Ví dụ**: `pages/Cart/index.tsx`
```typescript
export default function CartPage() {
  const viewModel = useCartViewModel();
  return <div>{/* UI only */}</div>;
}
```

### 4. **Services** (`services/`)
- **Chức năng**: Xử lý API calls và database interactions
- **Nhiệm vụ**:
  - Gọi API endpoints
  - Xử lý request/response
  - Không chứa business logic
  - Được gọi bởi ViewModel

## Cấu trúc Folder sau khi Refactor

```
pages/
├── Cart/
│   ├── models/
│   │   └── CartModel.ts          # Data structures + mapping functions
│   ├── viewmodels/
│   │   └── CartViewModel.ts      # Business logic + state management
│   ├── views/ (hoặc index.tsx)
│   │   └── CartView.tsx          # UI only
│   ├── components/               # UI components (giữ nguyên)
│   └── types.ts                  # Re-export từ models (backward compatibility)
│
├── Checkout/
│   ├── models/
│   │   └── CheckoutModel.ts
│   ├── viewmodels/
│   │   └── CheckoutViewModel.ts
│   ├── index.tsx                 # View
│   ├── components/
│   └── types.ts
│
└── ...
```

## Các Pages đã được Refactor

### ✅ Cart Page
- **Model**: `CartModel.ts` - Định nghĩa CartItem, SellerCartGroup, mapping functions
- **ViewModel**: `CartViewModel.ts` - Quản lý state, toggle items, update quantity, delete items
- **View**: `index.tsx` - Chỉ render UI và bind với ViewModel

### ✅ Checkout Page
- **Model**: `CheckoutModel.ts` - Định nghĩa Address, CheckoutItem, SellerCheckoutGroup, mapping functions
- **ViewModel**: `CheckoutViewModel.ts` - Quản lý addresses, payment method, place order logic
- **View**: `index.tsx` - Chỉ render UI và bind với ViewModel

## Lợi ích của MVVM

1. **Tách biệt rõ ràng**: Logic và UI được tách biệt hoàn toàn
2. **Dễ test**: ViewModel có thể test độc lập không cần UI
3. **Dễ bảo trì**: Thay đổi logic không ảnh hưởng đến UI và ngược lại
4. **Tái sử dụng**: ViewModel có thể được sử dụng bởi nhiều Views khác nhau
5. **Dễ mở rộng**: Thêm tính năng mới chỉ cần thêm vào ViewModel

## Quy tắc Coding

### ✅ ĐÚNG
- View chỉ gọi ViewModel hooks
- ViewModel gọi Services để lấy dữ liệu
- Model chỉ chứa data structures và mapping functions
- Services chỉ xử lý API calls

### ❌ SAI
- View gọi trực tiếp API/Service
- View chứa business logic
- ViewModel chứa UI code
- Model chứa business logic

## Các Pages cần Refactor tiếp theo

Các pages sau đây vẫn còn logic trộn lẫn với UI, nên được refactor theo MVVM:

1. **Products Page** - Có filter logic và sorting logic trong View
2. **Profile Page** - Có form handling và validation logic
3. **OrderDetail Page** - Có order status management logic
4. **SellerDashboard Pages** - Có nhiều business logic trong Views
5. **AdminDashboard Pages** - Có approval và management logic

## Hướng dẫn Refactor cho Pages mới

1. **Tạo Model**: Định nghĩa data structures và mapping functions
2. **Tạo ViewModel**: Di chuyển toàn bộ business logic vào đây
3. **Refactor View**: Chỉ giữ lại UI code, bind với ViewModel
4. **Update imports**: Cập nhật các components để import từ models

## Ví dụ Refactor Pattern

### Trước (Logic trộn lẫn):
```typescript
// ❌ SAI
export default function CartPage() {
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    cartService.getCart().then(res => {
      // Logic xử lý dữ liệu
      setItems(res.data.items);
    });
  }, []);
  
  const handleDelete = async (id) => {
    await cartService.removeItem(id);
    // Logic refresh
  };
  
  return <div>{/* UI */}</div>;
}
```

### Sau (MVVM):
```typescript
// ✅ ĐÚNG
// Model: CartModel.ts
export type CartItem = { ... };
export function mapApiCartItemToModel(dto) { ... }

// ViewModel: CartViewModel.ts
export function useCartViewModel() {
  const [items, setItems] = useState([]);
  const loadCart = async () => { /* logic */ };
  const deleteItem = async (id) => { /* logic */ };
  return { items, loadCart, deleteItem };
}

// View: index.tsx
export default function CartPage() {
  const { items, deleteItem } = useCartViewModel();
  return <div>{/* UI only */}</div>;
}
```

## Kết luận

Kiến trúc MVVM giúp code trở nên:
- **Clean**: Dễ đọc, dễ hiểu
- **Maintainable**: Dễ bảo trì và sửa lỗi
- **Testable**: Dễ viết unit tests
- **Scalable**: Dễ mở rộng tính năng mới



