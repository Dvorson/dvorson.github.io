---
title: "E-commerce Platform Architecture: Building Scalable Online Commerce Solutions"
description: "Complete guide to e-commerce platform architecture and development. Learn microservices patterns, payment processing, inventory management, and performance optimization for high-traffic online stores."
pubDate: 2024-12-25
author: "Anton Dvorson"
tags: ["E-commerce Architecture", "Microservices", "Payment Processing", "Online Commerce", "Scalable Systems", "Node.js", "React", "Enterprise Software"]
categories: ["E-commerce", "Software Architecture"]
heroImage: "/img/ecommerce-architecture.jpg"
---

# E-commerce Platform Architecture: Building Scalable Online Commerce Solutions

Building successful e-commerce platforms requires careful architectural planning to handle complex business logic, high traffic volumes, and stringent security requirements. Through my work on the KDI-HEAD e-commerce platform at EPAM Systems and the heavy equipment marketplace at FirstLine Software, I've developed proven approaches for creating scalable, maintainable commerce solutions.

## The E-commerce Architecture Challenge

Modern e-commerce platforms must balance numerous competing requirements:

- **High Availability**: 99.9%+ uptime during peak shopping periods
- **Performance**: Sub-second page loads even under heavy traffic
- **Security**: PCI DSS compliance and protection of customer data
- **Scalability**: Handle traffic spikes during sales events and seasonal peaks
- **Global Reach**: Multi-region deployment with localized experiences
- **Integration Complexity**: Connect with payment processors, inventory systems, shipping providers, and marketing tools

During my work on the KDI-HEAD platform, we successfully handled traffic spikes of 10x normal volume during promotional campaigns while maintaining consistent performance and zero downtime.

## Core E-commerce Architecture Patterns

### 1. Microservices-Based Commerce Architecture

Breaking e-commerce functionality into focused services enables independent scaling and development.

**Service Decomposition Strategy**
```typescript
// Core e-commerce services architecture
interface EcommerceService {
  name: string;
  responsibilities: string[];
  dependencies: string[];
  dataStore: string;
  scalingStrategy: 'horizontal' | 'vertical';
}

const ECOMMERCE_SERVICES: EcommerceService[] = [
  {
    name: 'Product Catalog Service',
    responsibilities: [
      'Product information management',
      'Category hierarchy',
      'Search and filtering',
      'Product recommendations'
    ],
    dependencies: ['Inventory Service', 'Pricing Service'],
    dataStore: 'Elasticsearch + PostgreSQL',
    scalingStrategy: 'horizontal'
  },
  {
    name: 'User Management Service',
    responsibilities: [
      'User registration and authentication',
      'Profile management',
      'Address book',
      'Preferences and wishlist'
    ],
    dependencies: ['Notification Service'],
    dataStore: 'PostgreSQL',
    scalingStrategy: 'horizontal'
  },
  {
    name: 'Shopping Cart Service',
    responsibilities: [
      'Cart state management',
      'Session handling',
      'Cart persistence',
      'Cart abandonment tracking'
    ],
    dependencies: ['Product Catalog Service', 'Pricing Service'],
    dataStore: 'Redis + PostgreSQL',
    scalingStrategy: 'horizontal'
  },
  {
    name: 'Order Management Service',
    responsibilities: [
      'Order creation and processing',
      'Order status tracking',
      'Order history',
      'Return and refund processing'
    ],
    dependencies: ['Payment Service', 'Inventory Service', 'Shipping Service'],
    dataStore: 'PostgreSQL',
    scalingStrategy: 'vertical'
  },
  {
    name: 'Payment Service',
    responsibilities: [
      'Payment processing',
      'Payment method management',
      'Transaction history',
      'Fraud detection integration'
    ],
    dependencies: ['User Management Service'],
    dataStore: 'PostgreSQL (encrypted)',
    scalingStrategy: 'vertical'
  },
  {
    name: 'Inventory Service',
    responsibilities: [
      'Stock level management',
      'Reservation handling',
      'Inventory tracking',
      'Supplier integration'
    ],
    dependencies: [],
    dataStore: 'PostgreSQL',
    scalingStrategy: 'horizontal'
  }
];
```

**Service Communication Patterns**
```typescript
// Event-driven communication between services
interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  eventData: any;
  timestamp: Date;
  version: number;
}

class EventBus {
  private handlers: Map<string, Function[]> = new Map();

  publish(event: DomainEvent): void {
    const handlers = this.handlers.get(event.eventType) || [];
    
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error handling event ${event.eventType}:`, error);
        // Implement dead letter queue for failed events
        this.sendToDeadLetterQueue(event, error);
      }
    });
  }

  subscribe(eventType: string, handler: Function): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  private sendToDeadLetterQueue(event: DomainEvent, error: Error): void {
    // Implementation for handling failed events
    console.log(`Sending event ${event.eventId} to dead letter queue due to error:`, error.message);
  }
}

// Example: Order processing with event sourcing
class OrderService {
  constructor(private eventBus: EventBus) {
    this.setupEventHandlers();
  }

  async createOrder(customerId: string, items: CartItem[]): Promise<Order> {
    // Validate inventory availability
    const inventoryValidation = await this.validateInventory(items);
    if (!inventoryValidation.valid) {
      throw new Error(`Insufficient inventory: ${inventoryValidation.message}`);
    }

    // Create order
    const order = new Order(customerId, items);
    
    // Publish order created event
    this.eventBus.publish({
      eventId: generateUuid(),
      eventType: 'OrderCreated',
      aggregateId: order.id,
      aggregateType: 'Order',
      eventData: order.toJSON(),
      timestamp: new Date(),
      version: 1
    });

    return order;
  }

  private setupEventHandlers(): void {
    this.eventBus.subscribe('PaymentProcessed', this.handlePaymentProcessed.bind(this));
    this.eventBus.subscribe('InventoryReserved', this.handleInventoryReserved.bind(this));
    this.eventBus.subscribe('ShippingLabelCreated', this.handleShippingLabelCreated.bind(this));
  }

  private async handlePaymentProcessed(event: DomainEvent): Promise<void> {
    const { orderId, paymentStatus } = event.eventData;
    
    if (paymentStatus === 'success') {
      await this.updateOrderStatus(orderId, 'payment_confirmed');
      
      // Trigger fulfillment process
      this.eventBus.publish({
        eventId: generateUuid(),
        eventType: 'OrderReadyForFulfillment',
        aggregateId: orderId,
        aggregateType: 'Order',
        eventData: { orderId },
        timestamp: new Date(),
        version: 1
      });
    }
  }
}
```

### 2. Product Catalog and Search Architecture

E-commerce platforms require sophisticated search and browsing capabilities.

**Elasticsearch-Based Product Search**
```typescript
interface ProductDocument {
  id: string;
  name: string;
  description: string;
  category: {
    id: string;
    name: string;
    hierarchy: string[];
  };
  attributes: Record<string, any>;
  pricing: {
    basePrice: number;
    salePrice?: number;
    currency: string;
  };
  inventory: {
    inStock: boolean;
    quantity: number;
    reservedQuantity: number;
  };
  images: {
    thumbnail: string;
    gallery: string[];
  };
  seo: {
    slug: string;
    metaTitle: string;
    metaDescription: string;
  };
  searchableText: string;
  tags: string[];
  brand: string;
  ratings: {
    average: number;
    count: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

class ProductSearchService {
  constructor(private elasticsearchClient: any) {}

  async searchProducts(query: SearchQuery): Promise<SearchResults> {
    const searchBody = this.buildSearchQuery(query);
    
    try {
      const response = await this.elasticsearchClient.search({
        index: 'products',
        body: searchBody
      });

      return this.transformSearchResults(response, query);
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Search service unavailable');
    }
  }

  private buildSearchQuery(query: SearchQuery): any {
    const searchBody: any = {
      query: {
        bool: {
          must: [],
          should: [],
          filter: []
        }
      },
      aggs: this.buildAggregations(),
      sort: this.buildSortCriteria(query.sort),
      from: (query.page - 1) * query.limit,
      size: query.limit
    };

    // Text search
    if (query.text) {
      searchBody.query.bool.must.push({
        multi_match: {
          query: query.text,
          fields: [
            'name^3',
            'description^2',
            'searchableText',
            'tags^2',
            'brand^2'
          ],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      });
    }

    // Category filter
    if (query.categoryId) {
      searchBody.query.bool.filter.push({
        term: { 'category.id': query.categoryId }
      });
    }

    // Price range filter
    if (query.priceRange) {
      searchBody.query.bool.filter.push({
        range: {
          'pricing.basePrice': {
            gte: query.priceRange.min,
            lte: query.priceRange.max
          }
        }
      });
    }

    // In stock filter
    if (query.inStockOnly) {
      searchBody.query.bool.filter.push({
        term: { 'inventory.inStock': true }
      });
    }

    // Brand filter
    if (query.brands && query.brands.length > 0) {
      searchBody.query.bool.filter.push({
        terms: { 'brand': query.brands }
      });
    }

    return searchBody;
  }

  private buildAggregations(): any {
    return {
      categories: {
        terms: {
          field: 'category.id',
          size: 20
        },
        aggs: {
          category_name: {
            terms: {
              field: 'category.name'
            }
          }
        }
      },
      brands: {
        terms: {
          field: 'brand',
          size: 20
        }
      },
      price_ranges: {
        range: {
          field: 'pricing.basePrice',
          ranges: [
            { key: 'under_25', to: 25 },
            { key: '25_to_50', from: 25, to: 50 },
            { key: '50_to_100', from: 50, to: 100 },
            { key: '100_to_250', from: 100, to: 250 },
            { key: 'over_250', from: 250 }
          ]
        }
      },
      availability: {
        terms: {
          field: 'inventory.inStock'
        }
      }
    };
  }
}
```

**Product Recommendation Engine**
```typescript
interface RecommendationEngine {
  getPersonalizedRecommendations(userId: string, context: RecommendationContext): Promise<Product[]>;
  getSimilarProducts(productId: string, limit: number): Promise<Product[]>;
  getTrendingProducts(categoryId?: string, limit?: number): Promise<Product[]>;
  getFrequentlyBoughtTogether(productId: string): Promise<Product[]>;
}

class MLRecommendationEngine implements RecommendationEngine {
  constructor(
    private userBehaviorService: UserBehaviorService,
    private productService: ProductService,
    private mlModel: MLModelService
  ) {}

  async getPersonalizedRecommendations(
    userId: string, 
    context: RecommendationContext
  ): Promise<Product[]> {
    // Get user behavior data
    const userProfile = await this.userBehaviorService.getUserProfile(userId);
    const recentInteractions = await this.userBehaviorService.getRecentInteractions(userId, 30);
    
    // Prepare features for ML model
    const features = this.buildUserFeatures(userProfile, recentInteractions, context);
    
    // Get recommendations from ML model
    const recommendedProductIds = await this.mlModel.predict('product_recommendations', features);
    
    // Fetch product details
    const products = await this.productService.getProductsByIds(recommendedProductIds);
    
    // Apply business rules and filters
    return this.applyBusinessRules(products, userProfile);
  }

  async getSimilarProducts(productId: string, limit: number = 5): Promise<Product[]> {
    const targetProduct = await this.productService.getProduct(productId);
    
    // Use content-based similarity (category, attributes, price range)
    const contentSimilarity = await this.findContentSimilarProducts(targetProduct, limit * 2);
    
    // Use collaborative filtering (users who viewed this also viewed)
    const collaborativeSimilarity = await this.findCollaborativeSimilarProducts(productId, limit * 2);
    
    // Combine and rank results
    const combinedResults = this.combineRecommendations(
      contentSimilarity,
      collaborativeSimilarity,
      0.6, // content weight
      0.4  // collaborative weight
    );
    
    return combinedResults.slice(0, limit);
  }

  private buildUserFeatures(
    userProfile: UserProfile,
    interactions: UserInteraction[],
    context: RecommendationContext
  ): any {
    return {
      user_demographics: {
        age_group: userProfile.ageGroup,
        location: userProfile.location,
        gender: userProfile.gender
      },
      browsing_behavior: {
        preferred_categories: this.extractPreferredCategories(interactions),
        price_sensitivity: this.calculatePriceSensitivity(interactions),
        brand_preferences: this.extractBrandPreferences(interactions),
        seasonal_patterns: this.extractSeasonalPatterns(interactions)
      },
      current_context: {
        time_of_day: context.timeOfDay,
        device_type: context.deviceType,
        session_duration: context.sessionDuration,
        current_cart_value: context.currentCartValue
      },
      purchase_history: {
        total_orders: userProfile.totalOrders,
        average_order_value: userProfile.averageOrderValue,
        purchase_frequency: userProfile.purchaseFrequency,
        last_purchase_days_ago: userProfile.daysSinceLastPurchase
      }
    };
  }
}
```

### 3. Shopping Cart and Session Management

Cart functionality requires careful state management and persistence strategies.

**Redis-Based Cart Implementation**
```typescript
interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  addedAt: Date;
  customizations?: Record<string, any>;
}

interface ShoppingCart {
  cartId: string;
  userId?: string;
  sessionId: string;
  items: CartItem[];
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    discounts: number;
    total: number;
  };
  appliedCoupons: string[];
  shippingAddress?: Address;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

class CartService {
  constructor(
    private redisClient: any,
    private productService: ProductService,
    private pricingService: PricingService
  ) {}

  async getCart(cartId: string): Promise<ShoppingCart | null> {
    try {
      const cartData = await this.redisClient.get(`cart:${cartId}`);
      if (!cartData) return null;

      const cart = JSON.parse(cartData);
      
      // Validate cart hasn't expired
      if (new Date(cart.expiresAt) < new Date()) {
        await this.deleteCart(cartId);
        return null;
      }

      // Refresh product prices and availability
      return await this.refreshCartData(cart);
    } catch (error) {
      console.error('Error getting cart:', error);
      return null;
    }
  }

  async addItem(cartId: string, item: Omit<CartItem, 'addedAt'>): Promise<ShoppingCart> {
    const cart = await this.getCart(cartId) || await this.createCart(cartId);
    
    // Validate product availability
    const product = await this.productService.getProduct(item.productId);
    if (!product || !product.inventory.inStock) {
      throw new Error('Product is not available');
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      cartItem => cartItem.productId === item.productId && cartItem.variantId === item.variantId
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      cart.items[existingItemIndex].quantity += item.quantity;
      cart.items[existingItemIndex].unitPrice = item.unitPrice; // Update with current price
    } else {
      // Add new item
      cart.items.push({
        ...item,
        addedAt: new Date()
      });
    }

    // Recalculate totals
    await this.calculateTotals(cart);
    
    // Save cart
    await this.saveCart(cart);
    
    return cart;
  }

  async removeItem(cartId: string, productId: string, variantId?: string): Promise<ShoppingCart> {
    const cart = await this.getCart(cartId);
    if (!cart) throw new Error('Cart not found');

    cart.items = cart.items.filter(
      item => !(item.productId === productId && item.variantId === variantId)
    );

    await this.calculateTotals(cart);
    await this.saveCart(cart);
    
    return cart;
  }

  async updateQuantity(cartId: string, productId: string, quantity: number, variantId?: string): Promise<ShoppingCart> {
    const cart = await this.getCart(cartId);
    if (!cart) throw new Error('Cart not found');

    const itemIndex = cart.items.findIndex(
      item => item.productId === productId && item.variantId === variantId
    );

    if (itemIndex === -1) throw new Error('Item not found in cart');

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Validate availability
      const product = await this.productService.getProduct(productId);
      if (quantity > product.inventory.quantity) {
        throw new Error(`Only ${product.inventory.quantity} items available`);
      }

      cart.items[itemIndex].quantity = quantity;
    }

    await this.calculateTotals(cart);
    await this.saveCart(cart);
    
    return cart;
  }

  private async calculateTotals(cart: ShoppingCart): Promise<void> {
    let subtotal = 0;

    // Calculate subtotal
    for (const item of cart.items) {
      subtotal += item.quantity * item.unitPrice;
    }

    // Apply discounts
    const discounts = await this.pricingService.calculateDiscounts(cart);
    
    // Calculate tax
    const tax = await this.pricingService.calculateTax(cart, subtotal - discounts);
    
    // Calculate shipping
    const shipping = await this.pricingService.calculateShipping(cart);

    cart.totals = {
      subtotal,
      tax,
      shipping,
      discounts,
      total: subtotal - discounts + tax + shipping
    };
  }

  private async saveCart(cart: ShoppingCart): Promise<void> {
    cart.updatedAt = new Date();
    
    // Set expiration time (30 days for logged in users, 7 days for anonymous)
    const expirationDays = cart.userId ? 30 : 7;
    cart.expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);

    await this.redisClient.setex(
      `cart:${cart.cartId}`,
      expirationDays * 24 * 60 * 60, // TTL in seconds
      JSON.stringify(cart)
    );

    // Also maintain user cart mapping
    if (cart.userId) {
      await this.redisClient.setex(
        `user_cart:${cart.userId}`,
        expirationDays * 24 * 60 * 60,
        cart.cartId
      );
    }
  }

  private async refreshCartData(cart: ShoppingCart): Promise<ShoppingCart> {
    // Update product prices and check availability
    const updatedItems: CartItem[] = [];
    
    for (const item of cart.items) {
      const product = await this.productService.getProduct(item.productId);
      
      if (product && product.inventory.inStock) {
        // Update price if it has changed
        const currentPrice = await this.pricingService.getProductPrice(
          item.productId,
          cart.userId,
          item.variantId
        );
        
        updatedItems.push({
          ...item,
          unitPrice: currentPrice
        });
      }
      // Skip items that are no longer available
    }

    cart.items = updatedItems;
    await this.calculateTotals(cart);
    
    return cart;
  }
}
```

### 4. Payment Processing Architecture

Secure and reliable payment processing is critical for e-commerce success.

**Multi-Provider Payment Gateway**
```typescript
interface PaymentProvider {
  name: string;
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
  capturePayment(transactionId: string, amount: number): Promise<PaymentResult>;
  refundPayment(transactionId: string, amount?: number): Promise<PaymentResult>;
  validateWebhook(payload: any, signature: string): boolean;
}

interface PaymentRequest {
  amount: number;
  currency: string;
  paymentMethod: {
    type: 'card' | 'digital_wallet' | 'bank_transfer';
    token: string;
    billingAddress?: Address;
  };
  customer: {
    id: string;
    email: string;
    name: string;
  };
  order: {
    id: string;
    description: string;
    items: Array<{ name: string; quantity: number; amount: number }>;
  };
  metadata: Record<string, any>;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  amount: number;
  fees?: number;
  errorCode?: string;
  errorMessage?: string;
  providerResponse?: any;
}

class StripePaymentProvider implements PaymentProvider {
  name = 'stripe';
  
  constructor(private stripeClient: any) {}

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripeClient.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency.toLowerCase(),
        payment_method: request.paymentMethod.token,
        customer: request.customer.id,
        description: request.order.description,
        metadata: {
          orderId: request.order.id,
          ...request.metadata
        },
        confirm: true,
        return_url: process.env.PAYMENT_RETURN_URL
      });

      return {
        success: paymentIntent.status === 'succeeded',
        transactionId: paymentIntent.id,
        status: this.mapStripeStatus(paymentIntent.status),
        amount: paymentIntent.amount / 100,
        fees: paymentIntent.application_fee_amount ? paymentIntent.application_fee_amount / 100 : 0,
        providerResponse: paymentIntent
      };
    } catch (error: any) {
      return {
        success: false,
        status: 'failed',
        amount: request.amount,
        errorCode: error.code,
        errorMessage: error.message
      };
    }
  }

  async capturePayment(transactionId: string, amount: number): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripeClient.paymentIntents.capture(transactionId, {
        amount_to_capture: Math.round(amount * 100)
      });

      return {
        success: true,
        transactionId: paymentIntent.id,
        status: this.mapStripeStatus(paymentIntent.status),
        amount: paymentIntent.amount_received / 100
      };
    } catch (error: any) {
      return {
        success: false,
        status: 'failed',
        amount,
        errorCode: error.code,
        errorMessage: error.message
      };
    }
  }

  validateWebhook(payload: any, signature: string): boolean {
    try {
      this.stripeClient.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  private mapStripeStatus(stripeStatus: string): PaymentResult['status'] {
    const statusMap: Record<string, PaymentResult['status']> = {
      'requires_payment_method': 'pending',
      'requires_confirmation': 'pending',
      'requires_action': 'pending',
      'processing': 'processing',
      'succeeded': 'succeeded',
      'canceled': 'cancelled'
    };
    
    return statusMap[stripeStatus] || 'failed';
  }
}

class PaymentOrchestrator {
  private providers: Map<string, PaymentProvider> = new Map();
  private routingRules: PaymentRoutingRule[] = [];

  constructor() {
    this.initializeProviders();
    this.loadRoutingRules();
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Select payment provider based on routing rules
    const provider = this.selectProvider(request);
    
    // Add fraud detection
    const fraudScore = await this.checkFraud(request);
    if (fraudScore > 0.8) {
      return {
        success: false,
        status: 'failed',
        amount: request.amount,
        errorCode: 'FRAUD_DETECTED',
        errorMessage: 'Transaction flagged for potential fraud'
      };
    }

    // Process payment with selected provider
    const result = await provider.processPayment(request);
    
    // Log transaction
    await this.logPaymentTransaction(request, result, provider.name);
    
    // Send analytics event
    await this.trackPaymentEvent(request, result);
    
    return result;
  }

  private selectProvider(request: PaymentRequest): PaymentProvider {
    // Apply routing rules to select best provider
    for (const rule of this.routingRules) {
      if (this.matchesRule(request, rule)) {
        const provider = this.providers.get(rule.providerId);
        if (provider) return provider;
      }
    }
    
    // Default to primary provider
    return this.providers.get('stripe')!;
  }

  private async checkFraud(request: PaymentRequest): Promise<number> {
    // Implement fraud detection logic
    // Check against known fraud patterns, velocity rules, etc.
    let riskScore = 0;

    // Example fraud checks
    if (request.amount > 1000) riskScore += 0.1;
    if (request.customer.email.includes('test')) riskScore += 0.2;
    
    // Check velocity (number of transactions from same customer/IP)
    const recentTransactions = await this.getRecentTransactions(request.customer.id, 24);
    if (recentTransactions > 5) riskScore += 0.3;

    return Math.min(riskScore, 1.0);
  }
}
```

### 5. Order Management and Fulfillment

Efficient order processing workflows are essential for customer satisfaction.

**Order State Machine**
```typescript
type OrderStatus = 
  | 'pending'
  | 'payment_pending'
  | 'payment_confirmed'
  | 'processing'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'returned';

interface OrderTransition {
  from: OrderStatus;
  to: OrderStatus;
  trigger: string;
  conditions?: string[];
  actions?: string[];
}

class OrderStateMachine {
  private transitions: OrderTransition[] = [
    {
      from: 'pending',
      to: 'payment_pending',
      trigger: 'initiate_payment',
      actions: ['reserve_inventory', 'create_payment_intent']
    },
    {
      from: 'payment_pending',
      to: 'payment_confirmed',
      trigger: 'payment_success',
      actions: ['confirm_inventory_reservation', 'send_confirmation_email']
    },
    {
      from: 'payment_confirmed',
      to: 'processing',
      trigger: 'start_fulfillment',
      actions: ['allocate_inventory', 'notify_warehouse']
    },
    {
      from: 'processing',
      to: 'ready_to_ship',
      trigger: 'items_picked',
      conditions: ['all_items_available'],
      actions: ['create_shipping_label', 'generate_packing_list']
    },
    {
      from: 'ready_to_ship',
      to: 'shipped',
      trigger: 'package_dispatched',
      actions: ['update_tracking_info', 'send_shipping_notification']
    },
    {
      from: 'shipped',
      to: 'delivered',
      trigger: 'delivery_confirmed',
      actions: ['update_delivery_date', 'send_delivery_notification', 'request_feedback']
    }
  ];

  canTransition(currentStatus: OrderStatus, trigger: string): boolean {
    return this.transitions.some(
      transition => transition.from === currentStatus && transition.trigger === trigger
    );
  }

  async executeTransition(order: Order, trigger: string): Promise<Order> {
    const transition = this.transitions.find(
      t => t.from === order.status && t.trigger === trigger
    );

    if (!transition) {
      throw new Error(`Invalid transition: ${order.status} -> ${trigger}`);
    }

    // Check conditions
    if (transition.conditions) {
      for (const condition of transition.conditions) {
        const conditionMet = await this.checkCondition(order, condition);
        if (!conditionMet) {
          throw new Error(`Condition not met: ${condition}`);
        }
      }
    }

    // Execute actions
    if (transition.actions) {
      for (const action of transition.actions) {
        await this.executeAction(order, action);
      }
    }

    // Update order status
    order.status = transition.to;
    order.statusHistory.push({
      status: transition.to,
      timestamp: new Date(),
      trigger,
      notes: `Transitioned from ${transition.from} to ${transition.to}`
    });

    return order;
  }

  private async checkCondition(order: Order, condition: string): Promise<boolean> {
    switch (condition) {
      case 'all_items_available':
        return await this.verifyInventoryAvailability(order);
      case 'payment_confirmed':
        return order.payment?.status === 'succeeded';
      default:
        return true;
    }
  }

  private async executeAction(order: Order, action: string): Promise<void> {
    switch (action) {
      case 'reserve_inventory':
        await this.reserveInventory(order);
        break;
      case 'send_confirmation_email':
        await this.sendOrderConfirmationEmail(order);
        break;
      case 'notify_warehouse':
        await this.notifyWarehouse(order);
        break;
      case 'create_shipping_label':
        await this.createShippingLabel(order);
        break;
      case 'send_shipping_notification':
        await this.sendShippingNotification(order);
        break;
      // Add more actions as needed
    }
  }
}
```

## Performance Optimization Strategies

### 1. Caching Architecture

Multi-layered caching improves response times and reduces database load.

**Comprehensive Caching Strategy**
```typescript
interface CacheLayer {
  name: string;
  ttl: number;
  storage: 'memory' | 'redis' | 'cdn';
  keyPattern: string;
}

class EcommerceCacheManager {
  private cacheConfig: CacheLayer[] = [
    {
      name: 'product_details',
      ttl: 3600, // 1 hour
      storage: 'redis',
      keyPattern: 'product:{productId}'
    },
    {
      name: 'category_tree',
      ttl: 7200, // 2 hours
      storage: 'redis',
      keyPattern: 'categories:tree'
    },
    {
      name: 'search_results',
      ttl: 900, // 15 minutes
      storage: 'redis',
      keyPattern: 'search:{hash}'
    },
    {
      name: 'user_session',
      ttl: 1800, // 30 minutes
      storage: 'redis',
      keyPattern: 'session:{sessionId}'
    },
    {
      name: 'static_content',
      ttl: 86400, // 24 hours
      storage: 'cdn',
      keyPattern: 'static:{path}'
    }
  ];

  async getProduct(productId: string): Promise<Product | null> {
    const cacheKey = `product:${productId}`;
    
    // Try cache first
    let product = await this.getFromCache(cacheKey);
    if (product) {
      return product;
    }

    // Fetch from database
    product = await this.productRepository.findById(productId);
    if (product) {
      // Cache for future requests
      await this.setCache(cacheKey, product, 3600);
    }

    return product;
  }

  async invalidateProductCache(productId: string): Promise<void> {
    const keys = [
      `product:${productId}`,
      `product:${productId}:*`, // Wildcard for variant-specific caches
    ];

    await Promise.all(keys.map(key => this.deleteFromCache(key)));
    
    // Also invalidate related caches
    await this.invalidateSearchCache();
    await this.invalidateCategoryCache();
  }

  async warmupCache(): Promise<void> {
    // Pre-populate cache with frequently accessed data
    console.log('Starting cache warmup...');

    // Warm up top products
    const topProducts = await this.getTopSellingProducts(100);
    await Promise.all(
      topProducts.map(product => 
        this.setCache(`product:${product.id}`, product, 3600)
      )
    );

    // Warm up category tree
    const categoryTree = await this.buildCategoryTree();
    await this.setCache('categories:tree', categoryTree, 7200);

    // Warm up popular search terms
    const popularSearches = await this.getPopularSearchTerms(50);
    await Promise.all(
      popularSearches.map(async (term) => {
        const results = await this.searchService.search(term);
        const cacheKey = `search:${this.hashSearchTerm(term)}`;
        await this.setCache(cacheKey, results, 900);
      })
    );

    console.log('Cache warmup completed');
  }
}
```

### 2. Database Optimization

Optimize database queries and structure for e-commerce workloads.

**Database Schema Optimization**
```sql
-- Optimized product table with proper indexing
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category_id UUID NOT NULL,
    brand_id UUID,
    base_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    inventory_quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    seo_title VARCHAR(255),
    seo_description TEXT,
    search_keywords TEXT,
    rating_average DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for product search and filtering
CREATE INDEX idx_products_category_active ON products(category_id, is_active);
CREATE INDEX idx_products_brand_active ON products(brand_id, is_active);
CREATE INDEX idx_products_price_range ON products(base_price) WHERE is_active = true;
CREATE INDEX idx_products_inventory ON products(inventory_quantity) WHERE is_active = true;
CREATE INDEX idx_products_rating ON products(rating_average DESC) WHERE is_active = true;
CREATE INDEX idx_products_created_at ON products(created_at DESC) WHERE is_active = true;

-- Full-text search index
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', 
    coalesce(name, '') || ' ' || 
    coalesce(description, '') || ' ' || 
    coalesce(search_keywords, '')
));

-- Optimized order table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status order_status_enum NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_status VARCHAR(50),
    payment_provider VARCHAR(50),
    payment_transaction_id VARCHAR(255),
    shipping_address JSONB,
    billing_address JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for order queries
CREATE INDEX idx_orders_customer_created ON orders(customer_id, created_at DESC);
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_payment_status ON orders(payment_status) WHERE payment_status IS NOT NULL;

-- Partitioning for large order tables (optional, for high-volume stores)
CREATE TABLE orders_2024 PARTITION OF orders 
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

**Query Optimization Examples**
```typescript
class OptimizedProductRepository {
  async getProductsWithFilters(filters: ProductFilters): Promise<{ products: Product[]; total: number }> {
    // Build optimized query with proper indexing
    let query = this.queryBuilder('products')
      .select([
        'products.*',
        'categories.name as category_name',
        'brands.name as brand_name'
      ])
      .leftJoin('categories', 'categories.id', 'products.category_id')
      .leftJoin('brands', 'brands.id', 'products.brand_id')
      .where('products.is_active', true);

    // Apply filters with index-friendly conditions
    if (filters.categoryId) {
      query = query.where('products.category_id', filters.categoryId);
    }

    if (filters.brandIds?.length) {
      query = query.whereIn('products.brand_id', filters.brandIds);
    }

    if (filters.priceRange) {
      query = query
        .where('products.base_price', '>=', filters.priceRange.min)
        .where('products.base_price', '<=', filters.priceRange.max);
    }

    if (filters.inStockOnly) {
      query = query.where('products.inventory_quantity', '>', 0);
    }

    if (filters.searchTerm) {
      // Use full-text search for better performance
      query = query.whereRaw(
        `to_tsvector('english', 
          coalesce(products.name, '') || ' ' || 
          coalesce(products.description, '') || ' ' || 
          coalesce(products.search_keywords, '')
        ) @@ plainto_tsquery('english', ?)`,
        [filters.searchTerm]
      );
    }

    // Apply sorting with index support
    switch (filters.sortBy) {
      case 'price_asc':
        query = query.orderBy('products.base_price', 'asc');
        break;
      case 'price_desc':
        query = query.orderBy('products.base_price', 'desc');
        break;
      case 'rating':
        query = query.orderBy('products.rating_average', 'desc');
        break;
      case 'newest':
        query = query.orderBy('products.created_at', 'desc');
        break;
      default:
        query = query.orderBy('products.created_at', 'desc');
    }

    // Get total count for pagination (use separate optimized query)
    const countQuery = query.clone().clearSelect().count('* as total');
    const [{ total }] = await countQuery;

    // Apply pagination
    const products = await query
      .limit(filters.limit || 20)
      .offset((filters.page - 1) * (filters.limit || 20));

    return { products, total: parseInt(total as string) };
  }

  async getOrderHistory(customerId: string, page: number = 1, limit: number = 10): Promise<Order[]> {
    // Optimized query using customer index
    return await this.queryBuilder('orders')
      .select([
        'orders.*',
        this.raw('COUNT(order_items.id) as item_count')
      ])
      .leftJoin('order_items', 'order_items.order_id', 'orders.id')
      .where('orders.customer_id', customerId)
      .groupBy('orders.id')
      .orderBy('orders.created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);
  }
}
```

## Security Implementation

### 1. Data Protection and Compliance

Implement comprehensive security measures for customer data protection.

**PCI DSS Compliance Framework**
```typescript
interface SecurityConfig {
  encryption: {
    algorithm: string;
    keyRotationDays: number;
    atRestEncryption: boolean;
    inTransitEncryption: boolean;
  };
  accessControl: {
    mfaRequired: boolean;
    sessionTimeout: number;
    passwordPolicy: PasswordPolicy;
    roleBasedAccess: boolean;
  };
  auditing: {
    logAllAccess: boolean;
    retentionDays: number;
    realTimeMonitoring: boolean;
  };
  compliance: {
    pciDssLevel: 1 | 2 | 3 | 4;
    gdprCompliant: boolean;
    dataRetentionPolicy: DataRetentionPolicy;
  };
}

class SecurityManager {
  private config: SecurityConfig;
  
  constructor(config: SecurityConfig) {
    this.config = config;
  }

  // Encrypt sensitive data before storage
  async encryptSensitiveData(data: any, dataType: 'payment' | 'personal' | 'authentication'): Promise<string> {
    const key = await this.getEncryptionKey(dataType);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(this.config.encryption.algorithm, key);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Store IV with encrypted data
    return iv.toString('hex') + ':' + encrypted;
  }

  async decryptSensitiveData(encryptedData: string, dataType: 'payment' | 'personal' | 'authentication'): Promise<any> {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = await this.getEncryptionKey(dataType);
    
    const decipher = crypto.createDecipher(this.config.encryption.algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  // Audit logging for compliance
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const auditLog = {
      eventId: generateUuid(),
      timestamp: new Date(),
      eventType: event.type,
      userId: event.userId,
      sessionId: event.sessionId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      resource: event.resource,
      action: event.action,
      result: event.result,
      riskScore: event.riskScore,
      metadata: event.metadata
    };

    // Store in secure audit database
    await this.auditRepository.create(auditLog);

    // Real-time alerting for high-risk events
    if (event.riskScore > 8) {
      await this.alertingService.sendSecurityAlert(auditLog);
    }
  }

  // Data anonymization for GDPR compliance
  async anonymizeCustomerData(customerId: string): Promise<void> {
    const anonymizedData = {
      email: this.anonymizeEmail(),
      name: 'Anonymous User',
      phone: null,
      addresses: [],
      dateOfBirth: null,
      preferences: {}
    };

    // Update customer record with anonymized data
    await this.customerRepository.update(customerId, anonymizedData);
    
    // Anonymize related order data
    await this.anonymizeOrderData(customerId);
    
    // Log anonymization action
    await this.logSecurityEvent({
      type: 'data_anonymization',
      userId: customerId,
      action: 'anonymize_customer_data',
      result: 'success',
      riskScore: 0,
      metadata: { reason: 'gdpr_request' }
    });
  }

  private anonymizeEmail(): string {
    return `anonymous_${generateUuid().substring(0, 8)}@deleted.com`;
  }
}
```

### 2. Fraud Detection and Prevention

Implement real-time fraud detection to protect against malicious activities.

**Fraud Detection Engine**
```typescript
interface FraudRule {
  id: string;
  name: string;
  enabled: boolean;
  weight: number;
  conditions: FraudCondition[];
  action: 'allow' | 'review' | 'block';
}

interface FraudCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in_list';
  value: any;
}

interface FraudScore {
  totalScore: number;
  triggeredRules: string[];
  recommendation: 'approve' | 'review' | 'decline';
  reasons: string[];
}

class FraudDetectionEngine {
  private rules: FraudRule[] = [];
  private mlModel: MLFraudModel;

  constructor() {
    this.loadFraudRules();
    this.initializeMLModel();
  }

  async analyzeTransaction(transaction: TransactionData): Promise<FraudScore> {
    // Rule-based fraud detection
    const ruleScore = await this.evaluateRules(transaction);
    
    // Machine learning fraud detection
    const mlScore = await this.evaluateMLModel(transaction);
    
    // Velocity checks
    const velocityScore = await this.checkVelocity(transaction);
    
    // Device fingerprinting
    const deviceScore = await this.analyzeDevice(transaction);
    
    // Combine scores
    const totalScore = this.combineScores({
      rules: ruleScore.score,
      ml: mlScore,
      velocity: velocityScore,
      device: deviceScore
    });

    return {
      totalScore,
      triggeredRules: ruleScore.triggeredRules,
      recommendation: this.getRecommendation(totalScore),
      reasons: this.buildReasonsList(ruleScore, mlScore, velocityScore, deviceScore)
    };
  }

  private async evaluateRules(transaction: TransactionData): Promise<{ score: number; triggeredRules: string[] }> {
    let totalScore = 0;
    const triggeredRules: string[] = [];

    for (const rule of this.rules.filter(r => r.enabled)) {
      if (await this.evaluateRule(rule, transaction)) {
        totalScore += rule.weight;
        triggeredRules.push(rule.id);
      }
    }

    return { score: totalScore, triggeredRules };
  }

  private async evaluateRule(rule: FraudRule, transaction: TransactionData): Promise<boolean> {
    for (const condition of rule.conditions) {
      if (!this.evaluateCondition(condition, transaction)) {
        return false;
      }
    }
    return true;
  }

  private evaluateCondition(condition: FraudCondition, transaction: TransactionData): boolean {
    const fieldValue = this.getFieldValue(transaction, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'greater_than':
        return fieldValue > condition.value;
      case 'less_than':
        return fieldValue < condition.value;
      case 'contains':
        return String(fieldValue).includes(condition.value);
      case 'in_list':
        return condition.value.includes(fieldValue);
      default:
        return false;
    }
  }

  private async checkVelocity(transaction: TransactionData): Promise<number> {
    let velocityScore = 0;

    // Check transaction frequency per customer
    const customerTransactions = await this.getRecentTransactions(
      transaction.customerId, 
      24 // last 24 hours
    );
    
    if (customerTransactions.length > 10) {
      velocityScore += 30;
    } else if (customerTransactions.length > 5) {
      velocityScore += 15;
    }

    // Check transaction amount velocity
    const totalAmount = customerTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    if (totalAmount > 5000) {
      velocityScore += 25;
    }

    // Check failed payment attempts
    const failedAttempts = await this.getFailedPaymentAttempts(
      transaction.customerId,
      6 // last 6 hours
    );
    
    if (failedAttempts > 3) {
      velocityScore += 40;
    }

    return Math.min(velocityScore, 100);
  }

  private async analyzeDevice(transaction: TransactionData): Promise<number> {
    let deviceScore = 0;
    const deviceFingerprint = transaction.deviceFingerprint;

    // Check if device is known
    const isKnownDevice = await this.isKnownDevice(
      transaction.customerId,
      deviceFingerprint
    );
    
    if (!isKnownDevice) {
      deviceScore += 20;
    }

    // Check device reputation
    const deviceReputation = await this.getDeviceReputation(deviceFingerprint);
    if (deviceReputation === 'bad') {
      deviceScore += 50;
    } else if (deviceReputation === 'suspicious') {
      deviceScore += 25;
    }

    // Check for device spoofing indicators
    if (this.detectDeviceSpoofing(deviceFingerprint)) {
      deviceScore += 30;
    }

    // Check IP geolocation vs billing address
    const ipLocation = await this.getIPLocation(transaction.ipAddress);
    const billingLocation = transaction.billingAddress;
    
    if (this.calculateDistance(ipLocation, billingLocation) > 1000) { // > 1000 km
      deviceScore += 15;
    }

    return Math.min(deviceScore, 100);
  }

  private getRecommendation(score: number): 'approve' | 'review' | 'decline' {
    if (score < 30) return 'approve';
    if (score < 70) return 'review';
    return 'decline';
  }
}
```

## Scalability and Performance

### 1. Microservices Scaling Strategies

Implement auto-scaling and load balancing for microservices architecture.

**Kubernetes Auto-scaling Configuration**
```yaml
# Horizontal Pod Autoscaler for product service
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: product-service-hpa
  namespace: ecommerce
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: product-service
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 15
      selectPolicy: Max
---
# Vertical Pod Autoscaler for order service (stateful)
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: order-service-vpa
  namespace: ecommerce
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: order-service
      maxAllowed:
        cpu: 2
        memory: 4Gi
      minAllowed:
        cpu: 100m
        memory: 256Mi
      controlledResources: ["cpu", "memory"]
```

### 2. Database Scaling Solutions

Implement read replicas and sharding for database scalability.

**Database Scaling Architecture**
```typescript
interface DatabaseConfig {
  primary: {
    host: string;
    port: number;
    database: string;
    maxConnections: number;
  };
  readReplicas: Array<{
    host: string;
    port: number;
    database: string;
    weight: number; // for load balancing
  }>;
  sharding: {
    enabled: boolean;
    shardKey: string;
    shards: Array<{
      id: string;
      range: { start: string; end: string };
      connection: DatabaseConnection;
    }>;
  };
}

class ScalableDatabaseManager {
  private primaryConnection: DatabaseConnection;
  private readReplicas: DatabaseConnection[];
  private shardConnections: Map<string, DatabaseConnection>;

  constructor(private config: DatabaseConfig) {
    this.initializeConnections();
  }

  async query(sql: string, params: any[], options: QueryOptions = {}): Promise<any> {
    const { readOnly = false, shardKey, consistencyLevel = 'eventual' } = options;

    if (readOnly && consistencyLevel === 'eventual') {
      // Use read replica for read-only queries
      const replica = this.selectReadReplica();
      return await replica.query(sql, params);
    }

    if (this.config.sharding.enabled && shardKey) {
      // Route to appropriate shard
      const shard = this.selectShard(shardKey);
      return await shard.query(sql, params);
    }

    // Use primary connection for writes and consistent reads
    return await this.primaryConnection.query(sql, params);
  }

  private selectReadReplica(): DatabaseConnection {
    // Weighted round-robin selection
    const totalWeight = this.readReplicas.reduce((sum, replica) => sum + replica.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const replica of this.readReplicas) {
      random -= replica.weight;
      if (random <= 0) {
        return replica;
      }
    }
    
    return this.readReplicas[0]; // fallback
  }

  private selectShard(shardKey: string): DatabaseConnection {
    const shardId = this.calculateShardId(shardKey);
    const connection = this.shardConnections.get(shardId);
    
    if (!connection) {
      throw new Error(`No connection found for shard: ${shardId}`);
    }
    
    return connection;
  }

  private calculateShardId(shardKey: string): string {
    // Use consistent hashing for shard selection
    const hash = this.hashFunction(shardKey);
    
    for (const shard of this.config.sharding.shards) {
      if (hash >= shard.range.start && hash <= shard.range.end) {
        return shard.id;
      }
    }
    
    throw new Error(`No shard found for key: ${shardKey}`);
  }

  // Connection health monitoring
  async healthCheck(): Promise<DatabaseHealth> {
    const health: DatabaseHealth = {
      primary: { healthy: false, latency: 0 },
      readReplicas: [],
      shards: []
    };

    // Check primary connection
    try {
      const start = Date.now();
      await this.primaryConnection.query('SELECT 1');
      health.primary = {
        healthy: true,
        latency: Date.now() - start
      };
    } catch (error) {
      console.error('Primary database health check failed:', error);
    }

    // Check read replicas
    for (const replica of this.readReplicas) {
      try {
        const start = Date.now();
        await replica.query('SELECT 1');
        health.readReplicas.push({
          host: replica.host,
          healthy: true,
          latency: Date.now() - start
        });
      } catch (error) {
        health.readReplicas.push({
          host: replica.host,
          healthy: false,
          latency: 0
        });
      }
    }

    return health;
  }
}
```

## Testing and Quality Assurance

### 1. Comprehensive Testing Strategy

Implement testing at all levels of the e-commerce platform.

**E2E Testing Framework**
```typescript
// tests/e2e/checkout-flow.test.ts
describe('E-commerce Checkout Flow', () => {
  let page: Page;
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should complete full checkout process', async () => {
    // 1. Browse products
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-grid"]');
    
    // Select a product
    await page.click('[data-testid="product-card"]:first-child');
    await page.waitForSelector('[data-testid="product-details"]');
    
    // 2. Add to cart
    await page.click('[data-testid="add-to-cart-btn"]');
    await page.waitForSelector('[data-testid="cart-notification"]');
    
    // Verify cart count updated
    const cartCount = await page.textContent('[data-testid="cart-count"]');
    expect(cartCount).toBe('1');
    
    // 3. Go to cart
    await page.click('[data-testid="cart-icon"]');
    await page.waitForSelector('[data-testid="cart-page"]');
    
    // Verify product in cart
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
    
    // 4. Proceed to checkout
    await page.click('[data-testid="checkout-btn"]');
    await page.waitForSelector('[data-testid="checkout-form"]');
    
    // 5. Fill shipping information
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="first-name-input"]', 'John');
    await page.fill('[data-testid="last-name-input"]', 'Doe');
    await page.fill('[data-testid="address-input"]', '123 Main St');
    await page.fill('[data-testid="city-input"]', 'New York');
    await page.selectOption('[data-testid="state-select"]', 'NY');
    await page.fill('[data-testid="zip-input"]', '10001');
    
    // Continue to payment
    await page.click('[data-testid="continue-to-payment-btn"]');
    await page.waitForSelector('[data-testid="payment-form"]');
    
    // 6. Fill payment information (test card)
    await page.fill('[data-testid="card-number-input"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry-input"]', '12/25');
    await page.fill('[data-testid="card-cvc-input"]', '123');
    await page.fill('[data-testid="card-name-input"]', 'John Doe');
    
    // 7. Place order
    await page.click('[data-testid="place-order-btn"]');
    
    // 8. Verify order confirmation
    await page.waitForSelector('[data-testid="order-confirmation"]', { timeout: 30000 });
    
    const orderNumber = await page.textContent('[data-testid="order-number"]');
    expect(orderNumber).toMatch(/^ORD-\d+$/);
    
    // Verify order details
    const orderTotal = await page.textContent('[data-testid="order-total"]');
    expect(orderTotal).toBeTruthy();
    
    // 9. Check order in account
    await page.click('[data-testid="view-order-btn"]');
    await page.waitForSelector('[data-testid="order-details"]');
    
    const orderStatus = await page.textContent('[data-testid="order-status"]');
    expect(orderStatus).toBe('Payment Confirmed');
  });

  it('should handle cart abandonment recovery', async () => {
    // Add product to cart
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('[data-testid="add-to-cart-btn"]');
    
    // Go to checkout but don't complete
    await page.click('[data-testid="cart-icon"]');
    await page.click('[data-testid="checkout-btn"]');
    await page.fill('[data-testid="email-input"]', 'abandoned@example.com');
    
    // Simulate leaving the page
    await page.goto('/');
    
    // Verify cart abandonment event was tracked
    const abandonmentEvents = await page.evaluate(() => {
      return window.analytics?.track?.getCalls?.() || [];
    });
    
    const cartAbandonmentEvent = abandonmentEvents.find(
      call => call.args[0] === 'Cart Abandoned'
    );
    
    expect(cartAbandonmentEvent).toBeTruthy();
  });

  it('should handle inventory updates during checkout', async () => {
    // Start checkout process
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child');
    
    // Get product ID for inventory manipulation
    const productId = await page.getAttribute('[data-testid="product-details"]', 'data-product-id');
    
    await page.click('[data-testid="add-to-cart-btn"]');
    await page.click('[data-testid="cart-icon"]');
    await page.click('[data-testid="checkout-btn"]');
    
    // Simulate inventory change via API
    await page.evaluate(async (id) => {
      await fetch(`/api/products/${id}/inventory`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 0 })
      });
    }, productId);
    
    // Try to complete checkout
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    // ... fill other fields
    await page.click('[data-testid="place-order-btn"]');
    
    // Should show inventory error
    await page.waitForSelector('[data-testid="inventory-error"]');
    const errorMessage = await page.textContent('[data-testid="inventory-error"]');
    expect(errorMessage).toContain('no longer available');
  });
});
```

### 2. Performance Testing

Implement load testing to validate platform performance under stress.

**Load Testing Configuration**
```typescript
// tests/performance/load-test.ts
import { check, sleep } from 'k6';
import http from 'k6/http';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Sustained load
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Sustained load
    { duration: '2m', target: 500 }, // Spike test
    { duration: '3m', target: 500 }, // Sustained spike
    { duration: '2m', target: 0 }    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
    checks: ['rate>0.95']             // 95% of checks pass
  }
};

export default function() {
  // Simulate user shopping journey
  
  // 1. Browse homepage
  let response = http.get('https://api.example.com/');
  check(response, {
    'homepage loads': (r) => r.status === 200,
    'homepage response time': (r) => r.timings.duration < 1000
  });
  
  sleep(1);
  
  // 2. Search for products
  response = http.get('https://api.example.com/api/products/search?q=laptop&page=1&limit=20');
  check(response, {
    'search works': (r) => r.status === 200,
    'search has results': (r) => JSON.parse(r.body).products.length > 0,
    'search response time': (r) => r.timings.duration < 500
  });
  
  const products = JSON.parse(response.body).products;
  const randomProduct = products[Math.floor(Math.random() * products.length)];
  
  sleep(2);
  
  // 3. View product details
  response = http.get(`https://api.example.com/api/products/${randomProduct.id}`);
  check(response, {
    'product details load': (r) => r.status === 200,
    'product details response time': (r) => r.timings.duration < 300
  });
  
  sleep(3);
  
  // 4. Add to cart
  const cartPayload = {
    productId: randomProduct.id,
    quantity: 1
  };
  
  response = http.post(
    'https://api.example.com/api/cart/items',
    JSON.stringify(cartPayload),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    }
  );
  
  check(response, {
    'add to cart works': (r) => r.status === 200,
    'add to cart response time': (r) => r.timings.duration < 200
  });
  
  sleep(1);
  
  // 5. View cart
  response = http.get('https://api.example.com/api/cart', {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` }
  });
  
  check(response, {
    'cart loads': (r) => r.status === 200,
    'cart has items': (r) => JSON.parse(r.body).items.length > 0,
    'cart response time': (r) => r.timings.duration < 200
  });
  
  sleep(5); // Simulate thinking time
}

function getAuthToken() {
  // In real test, this would handle authentication
  return 'test-token-' + Math.random().toString(36).substr(2, 9);
}

// Spike test scenario
export function spikeTest() {
  options.stages = [
    { duration: '1m', target: 100 },
    { duration: '30s', target: 1000 }, // Sudden spike
    { duration: '2m', target: 1000 },
    { duration: '30s', target: 100 },
    { duration: '1m', target: 0 }
  ];
}

// Stress test scenario  
export function stressTest() {
  options.stages = [
    { duration: '5m', target: 200 },
    { duration: '10m', target: 400 },
    { duration: '10m', target: 600 },
    { duration: '10m', target: 800 },
    { duration: '5m', target: 1000 },
    { duration: '10m', target: 0 }
  ];
}
```

## Conclusion

Building successful e-commerce platforms requires careful attention to architecture, performance, security, and user experience. The patterns and implementations outlined in this guide provide a foundation for creating scalable, maintainable commerce solutions that can handle enterprise-level traffic and complexity.

Key success factors for e-commerce platforms include:

- **Microservices Architecture**: Enables independent scaling and development of different platform components
- **Robust Payment Processing**: Secure, compliant payment handling with multiple provider support
- **Advanced Search and Discovery**: Sophisticated product search with personalized recommendations
- **Performance Optimization**: Multi-layered caching, database optimization, and CDN integration
- **Security and Compliance**: PCI DSS compliance, fraud detection, and data protection
- **Scalability Planning**: Auto-scaling infrastructure and database sharding strategies

Through my experience building e-commerce platforms across different industries and scales, I've learned that success comes from balancing business requirements with technical excellence, always keeping user experience at the center of architectural decisions.

The e-commerce landscape continues to evolve rapidly, with new technologies and customer expectations driving innovation. Platforms built with flexible, modular architectures are best positioned to adapt and grow with changing market demands.

---

**Keywords**: e-commerce platform architecture, microservices e-commerce, online store development, payment processing, e-commerce scalability, shopping cart implementation, product catalog architecture, e-commerce security