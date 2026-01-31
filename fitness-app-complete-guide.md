# AI Fitness & Nutrition Coach - Kapsamlı Geliştirme Talimatı (Claude Code İçin)

## İÇİNDEKİLER
1. [Proje Özeti](#proje-özeti)
2. [Teknoloji Kararları](#teknoloji-kararları)
3. [Mimari Kararlar](#mimari-kararlar)
4. [Veritabanı Tasarımı](#veritabanı-tasarımı)
5. [API Entegrasyonları](#api-entegrasyonları)
6. [Özellik Detayları](#özellik-detayları)
7. [Proje Yapısı](#proje-yapısı)
8. [Geliştirme Aşamaları](#geliştirme-aşamaları)
9. [Test Stratejisi](#test-stratejisi)
10. [Deploy Planı](#deploy-planı)

---

## PROJE ÖZETİ

### Ürün Tanımı
Bu uygulama, kullanıcılara kişiselleştirilmiş beslenme takibi ve antrenman planı sunan yapay zeka destekli bir fitness koçudur. İki ana özelliği birleştiren all-in-one bir çözümdür:

1. **Beslenme Takibi**
   - Barkod tarayarak besin ekleme
   - Besin arama ve manuel ekleme
   - Fotoğraftan kalori/makro tahmini (AI destekli)
   - Günlük/haftalık/aylık kalori ve makro takibi

2. **Antrenman Yönetimi**
   - Kişiye özel antrenman planı oluşturma
   - Antrenman takibi
   - İlerleme raporları

### Gelir Modeli
- **7 günlük ücretsiz deneme** (kredi kartı gerekli)
- **Basic Plan:** $14.99/ay veya $79.99/yıl
- **Pro Plan:** $24.99/ay veya $149/yıl

### Pro Özellikler
- Haftalık plan revizyonu (beslenme + antrenman)
- AI koç sohbeti + proaktif mesajlar
- Gelişmiş analizler (7/30/90 günlük trendler)
- Öncelikli destek ve erken erişim
- Sınırsız fotoğraf analizi (Basic'te günde 3)

---

## TEKNOLOJİ KARARLARI

### Ana Teknoloji Yığını

#### **Backend: Supabase (ÖNERİLEN)**

**NEDEN SUPABASE?**

✅ **PostgreSQL veritabanı** - Güçlü, ilişkisel, ölçeklenebilir
✅ **Otomatik API oluşturma** - Manuel endpoint yazmaya gerek yok
✅ **Gerçek zamanlı subscriptions** - Canlı veri güncellemeleri
✅ **Kimlik doğrulama sistemi** - Email, sosyal medya login hazır
✅ **Dosya depolama** - Yemek fotoğrafları için S3-uyumlu storage
✅ **Edge Functions** - Serverless fonksiyonlar (API entegrasyonları için)
✅ **Row Level Security** - Kullanıcı verisi güvenliği otomatik
✅ **Ücretsiz başlangıç** - 500MB veritabanı, 1GB dosya depolama
✅ **Kolay ölçeklendirme** - Büyüdükçe otomatik upgrade

**ALTERNATİF OLSAYDI:**
- Firebase (NoSQL, pahalı)
- Node.js + PostgreSQL + AWS S3 (çok kompleks, çok setup)
- Parse Server (eski teknoloji)

**KARAR: Supabase kullanılacak**

#### **Mobil: Expo (React Native)**

**NEDEN EXPO?**

✅ **Tek kod, iki platform** - iOS ve Android
✅ **Hızlı geliştirme** - Hot reload, kolay debug
✅ **Kamera/Barkod desteği** - Expo Camera + Barcode Scanner
✅ **Push notification** - Expo Notifications (kolay setup)
✅ **OTA updates** - App store onayı beklemeden güncelleme
✅ **Managed workflow** - Kompleks native kod gerekmez

**KARAR: Expo kullanılacak**

#### **AI/ML Servisleri**

1. **OpenAI GPT-4 Vision** - Yemek fotoğrafı analizi
2. **Google ML Kit** - Barkod tarama (device-side, ücretsiz)

---

## MİMARİ KARARLAR

### Genel Mimari

```
┌─────────────────────────────────────────────────────────┐
│                    EXPO MOBILE APP                       │
│  (React Native - iOS & Android)                         │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Beslenme   │  │  Antrenman   │  │   AI Koç     │ │
│  │    Takibi    │  │    Planı     │  │   Sohbet     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │        Expo Camera & Barcode Scanner             │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────────────┘
                        │
                        │ HTTPS/REST API
                        │
┌───────────────────────▼──────────────────────────────────┐
│                    SUPABASE                              │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         PostgreSQL Database                        │ │
│  │  (users, meals, workouts, subscriptions, etc.)    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Storage (S3-compatible)                    │ │
│  │  (Meal photos, profile images)                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Edge Functions (Serverless)                │ │
│  │  - Meal photo analysis (OpenAI Vision)            │ │
│  │  - Workout plan generation                         │ │
│  │  - Nutrition API calls (USDA, OpenFoodFacts)      │ │
│  │  - Weekly plan revision (Pro)                      │ │
│  │  - Push notification scheduler                     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Auth (Email, Social Login)                 │ │
│  └────────────────────────────────────────────────────┘ │
└───────────────────────┬──────────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          │                           │
┌─────────▼─────────┐      ┌──────────▼──────────┐
│   External APIs   │      │   Payment/Analytics │
│                   │      │                     │
│ • OpenAI Vision   │      │ • RevenueCat        │
│ • USDA FoodData   │      │ • Firebase Analytics│
│ • OpenFoodFacts   │      │ • PostHog           │
│ • Google ML Kit   │      │ • FCM (Push)        │
└───────────────────┘      └─────────────────────┘
```

### Veri Akışı Örnekleri

#### 1. Yemek Fotoğrafı Analizi Akışı
```
1. Kullanıcı fotoğraf çeker (Expo Camera)
   ↓
2. Fotoğraf Supabase Storage'a upload edilir
   ↓
3. Supabase Edge Function tetiklenir
   ↓
4. Edge Function OpenAI Vision API'ye gönderir
   ↓
5. OpenAI JSON döner: [{item, grams, macros}]
   ↓
6. Kullanıcıya tahmin gösterilir (düzenlenebilir)
   ↓
7. Onay sonrası meal_items tablosuna kaydedilir
```

#### 2. Barkod Tarama Akışı
```
1. Kullanıcı barkod tarar (ML Kit - device-side)
   ↓
2. Barkod numarası Edge Function'a gönderilir
   ↓
3. Edge Function sırayla dener:
   - OpenFoodFacts API (önce cache kontrol)
   - USDA FoodData (yoksa)
   ↓
4. Besin bilgisi bulunursa cache'lenir
   ↓
5. Kullanıcıya porsiyon seçimi gösterilir
   ↓
6. Kaydedilir
```

---

## VERİTABANI TASARIMI

### Supabase PostgreSQL Şema

#### **users** (Supabase Auth entegrasyonu)
```sql
-- Supabase otomatik oluşturur, extend edilir
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **user_profiles**
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Demografik bilgiler
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height_cm INTEGER,
  
  -- Hedefler
  goal_type TEXT CHECK (goal_type IN ('lose_weight', 'maintain', 'gain_muscle', 'improve_fitness')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  
  -- Hesaplanan değerler
  target_calories INTEGER,
  target_protein_g INTEGER,
  target_carbs_g INTEGER,
  target_fat_g INTEGER,
  
  -- Tercihler
  timezone TEXT DEFAULT 'UTC',
  unit_system TEXT DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);
```

#### **weights**
```sql
CREATE TABLE weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  weight_kg DECIMAL(5,2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_weights_user_date ON weights(user_id, recorded_at DESC);
```

#### **meals**
```sql
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_time TIMESTAMPTZ NOT NULL,
  
  -- Toplam değerler (hesaplanmış)
  total_calories INTEGER DEFAULT 0,
  total_protein_g DECIMAL(6,2) DEFAULT 0,
  total_carbs_g DECIMAL(6,2) DEFAULT 0,
  total_fat_g DECIMAL(6,2) DEFAULT 0,
  
  notes TEXT,
  photo_url TEXT, -- Supabase Storage path
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meals_user_time ON meals(user_id, meal_time DESC);
```

#### **meal_items**
```sql
CREATE TABLE meal_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
  
  -- Besin bilgisi
  food_name TEXT NOT NULL,
  food_source TEXT CHECK (food_source IN ('usda', 'openfoodfacts', 'photo_ai', 'manual')),
  external_id TEXT, -- USDA fdcId veya barcode
  
  -- Porsiyon
  serving_size_g DECIMAL(8,2),
  serving_unit TEXT, -- 'g', 'ml', 'piece', 'cup'
  quantity DECIMAL(6,2) DEFAULT 1,
  
  -- Makrolar (portion için)
  calories INTEGER,
  protein_g DECIMAL(6,2),
  carbs_g DECIMAL(6,2),
  fat_g DECIMAL(6,2),
  
  -- AI tahmini mi?
  is_estimate BOOLEAN DEFAULT FALSE,
  confidence_score DECIMAL(3,2), -- 0.00-1.00
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meal_items_meal ON meal_items(meal_id);
```

#### **foods_cache**
```sql
CREATE TABLE foods_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  source TEXT CHECK (source IN ('usda', 'openfoodfacts')),
  external_id TEXT NOT NULL, -- fdcId or barcode
  
  food_name TEXT NOT NULL,
  brand_name TEXT,
  
  -- Per 100g values
  calories_per_100g INTEGER,
  protein_per_100g DECIMAL(6,2),
  carbs_per_100g DECIMAL(6,2),
  fat_per_100g DECIMAL(6,2),
  
  -- Extra data (JSON)
  raw_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(source, external_id)
);

CREATE INDEX idx_foods_cache_lookup ON foods_cache(source, external_id);
```

#### **workouts**
```sql
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  plan_id UUID REFERENCES workout_plans(id),
  
  scheduled_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  
  workout_type TEXT, -- 'strength', 'cardio', 'flexibility', 'rest'
  duration_minutes INTEGER,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workouts_user_date ON workouts(user_id, scheduled_date DESC);
```

#### **workout_plans**
```sql
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  plan_name TEXT NOT NULL,
  goal TEXT,
  
  -- AI tarafından oluşturuldu mu?
  is_ai_generated BOOLEAN DEFAULT TRUE,
  
  -- Haftalık plan (JSON array)
  weekly_schedule JSONB, -- [{day: 1, type: 'strength', exercises: [...]}]
  
  active_from DATE,
  active_until DATE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workout_plans_user_active ON workout_plans(user_id, is_active);
```

#### **exercises**
```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  
  exercise_name TEXT NOT NULL,
  sets INTEGER,
  reps INTEGER,
  weight_kg DECIMAL(6,2),
  duration_seconds INTEGER, -- for cardio
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **subscriptions**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- RevenueCat verisi
  subscription_tier TEXT CHECK (subscription_tier IN ('free_trial', 'basic', 'pro')),
  
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  is_active BOOLEAN DEFAULT FALSE,
  is_trial BOOLEAN DEFAULT FALSE,
  
  -- RevenueCat subscriber ID
  revenuecat_subscriber_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);
```

#### **coach_messages**
```sql
CREATE TABLE coach_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  message_type TEXT CHECK (message_type IN ('user', 'assistant')),
  content TEXT NOT NULL,
  
  -- Proaktif mesaj mı?
  is_proactive BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coach_messages_user_time ON coach_messages(user_id, created_at DESC);
```

#### **notification_preferences**
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Yemek hatırlatmaları
  breakfast_time TIME,
  lunch_time TIME,
  dinner_time TIME,
  snack_time TIME,
  
  -- Antrenman hatırlatması
  workout_reminder_time TIME,
  
  -- Haftalık check-in
  weekly_checkin_day INTEGER, -- 0=Sunday, 6=Saturday
  weekly_checkin_time TIME,
  
  -- Push token (Expo)
  expo_push_token TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);
```

#### **analytics_events**
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  
  event_name TEXT NOT NULL,
  event_properties JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user ON analytics_events(user_id, created_at DESC);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name, created_at DESC);
```

### Row Level Security (RLS) Kuralları

Supabase'de her tablo için otomatik güvenlik:

```sql
-- Örnek: meals tablosu
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meals"
  ON meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
  ON meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
  ON meals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
  ON meals FOR DELETE
  USING (auth.uid() = user_id);
```

**ÖNEMLİ:** Tüm user_id içeren tablolar için benzer RLS kuralları uygulanacak.

---

## API ENTEGRASYONLARI

### 1. USDA FoodData Central

**Ne için kullanılıyor?**
- Genel besin arama ("tavuk göğsü", "pirinç")
- AI fotoğraf analizinden gelen ürünleri eşleştirme

**Endpoint:**
```
GET https://api.nal.usda.gov/fdc/v1/foods/search
```

**Parametreler:**
```
?query=chicken breast
&pageSize=25
&api_key=YOUR_KEY
```

**Dönen veri örneği:**
```json
{
  "foods": [
    {
      "fdcId": 171477,
      "description": "Chicken, broilers or fryers, breast, meat only, cooked, roasted",
      "foodNutrients": [
        {"nutrientId": 1008, "nutrientName": "Energy", "value": 165},
        {"nutrientId": 1003, "nutrientName": "Protein", "value": 31.02},
        {"nutrientId": 1005, "nutrientName": "Carbohydrate, by difference", "value": 0},
        {"nutrientId": 1004, "nutrientName": "Total lipid (fat)", "value": 3.57}
      ]
    }
  ]
}
```

**Supabase Edge Function:**
```typescript
// supabase/functions/nutrition-search/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { query } = await req.json()
  
  const response = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?query=${query}&api_key=${Deno.env.get('USDA_API_KEY')}`
  )
  
  const data = await response.json()
  
  // Normalize edilmiş format döndür
  const normalized = data.foods.map(food => ({
    id: food.fdcId,
    name: food.description,
    source: 'usda',
    caloriesPer100g: getNutrient(food, 1008),
    proteinPer100g: getNutrient(food, 1003),
    carbsPer100g: getNutrient(food, 1005),
    fatPer100g: getNutrient(food, 1004)
  }))
  
  return new Response(JSON.stringify(normalized), {
    headers: { "Content-Type": "application/json" }
  })
})
```

### 2. Open Food Facts

**Ne için kullanılıyor?**
- Barkod ile paketli ürün arama

**Endpoint:**
```
GET https://world.openfoodfacts.org/api/v2/product/{barcode}
```

**Örnek:**
```
GET https://world.openfoodfacts.org/api/v2/product/3017620422003
```

**Dönen veri:**
```json
{
  "product": {
    "product_name": "Nutella",
    "brands": "Ferrero",
    "nutriments": {
      "energy-kcal_100g": 539,
      "proteins_100g": 6.3,
      "carbohydrates_100g": 57.5,
      "fat_100g": 30.9
    },
    "serving_size": "15 g"
  }
}
```

**Supabase Edge Function:**
```typescript
// supabase/functions/barcode-lookup/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { barcode } = await req.json()
  
  // Önce cache kontrol
  const { data: cached } = await supabase
    .from('foods_cache')
    .select('*')
    .eq('source', 'openfoodfacts')
    .eq('external_id', barcode)
    .single()
  
  if (cached) {
    return new Response(JSON.stringify(cached))
  }
  
  // Cache'de yoksa API'ye git
  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
  )
  
  const data = await response.json()
  
  if (data.status === 0) {
    return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 })
  }
  
  // Normalize ve cache'le
  const product = {
    source: 'openfoodfacts',
    external_id: barcode,
    food_name: data.product.product_name,
    brand_name: data.product.brands,
    calories_per_100g: data.product.nutriments['energy-kcal_100g'],
    protein_per_100g: data.product.nutriments.proteins_100g,
    carbs_per_100g: data.product.nutriments.carbohydrates_100g,
    fat_per_100g: data.product.nutriments.fat_100g,
    raw_data: data.product
  }
  
  await supabase.from('foods_cache').insert(product)
  
  return new Response(JSON.stringify(product))
})
```

### 3. OpenAI Vision (Meal Photo Analysis)

**Ne için kullanılıyor?**
- Yemek fotoğrafından besin tahmini
- Text input'tan besin parsing ("2 yumurta ve tost yedim")

**Endpoint:**
```
POST https://api.openai.com/v1/chat/completions
```

**Prompt Stratejisi:**
```typescript
const prompt = `Analyze this meal photo. Return JSON with this exact structure:
{
  "items": [
    {
      "name": "food item name",
      "estimated_grams": number,
      "macros": {
        "calories": number,
        "protein_g": number,
        "carbs_g": number,
        "fat_g": number
      },
      "confidence": 0.0-1.0
    }
  ],
  "totals": {
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number
  },
  "note": "brief explanation"
}

Be conservative with portions. If uncertain, give a lower estimate.`
```

**Supabase Edge Function:**
```typescript
// supabase/functions/analyze-meal-photo/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { imageUrl, hint } = await req.json()
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt + (hint ? `\n\nUser hint: ${hint}` : '') },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    })
  })
  
  const data = await response.json()
  const result = JSON.parse(data.choices[0].message.content)
  
  // Her item için USDA'dan match bul (opsiyonel)
  for (const item of result.items) {
    const usdaMatch = await findUSDAMatch(item.name)
    if (usdaMatch) {
      item.usda_id = usdaMatch.fdcId
    }
  }
  
  return new Response(JSON.stringify(result))
})
```

**Maliyet Kontrolü:**
- Image hash ile cache (aynı fotoğrafı tekrar analiz etme)
- Basic plan: 3 fotoğraf/gün limiti
- Pro plan: 10 fotoğraf/gün
- Kullanıcıya açıkça "TAHMİN" olduğunu belirt

### 4. Google ML Kit Barcode Scanner

**Ne için kullanılıyor?**
- Cihaz içi barkod tarama (API çağrısı yok, ücretsiz)

**Expo entegrasyonu:**
```javascript
import { BarCodeScanner } from 'expo-barcode-scanner';

function BarcodeScanner() {
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    // data = barcode string (EAN-13, UPC-A, etc.)
    lookupBarcode(data); // Supabase Edge Function'a gönder
  };

  return (
    <BarCodeScanner
      onBarCodeScanned={handleBarCodeScanned}
      style={StyleSheet.absoluteFillObject}
    />
  );
}
```

### 5. RevenueCat (Subscriptions)

**Ne için kullanılıyor?**
- iOS/Android in-app purchases yönetimi
- Abonelik durumu tracking
- Webhook ile backend senkronizasyonu

**Setup:**

1. **RevenueCat Dashboard:**
   - Proje oluştur
   - iOS/Android app store bilgilerini ekle
   - Products tanımla:
     - `basic_monthly` - $14.99/month
     - `basic_yearly` - $79.99/year
     - `pro_monthly` - $24.99/month
     - `pro_yearly` - $149/year

2. **Expo entegrasyonu:**
```javascript
import Purchases from 'react-native-purchases';

// App başlangıcında
await Purchases.configure({
  apiKey: Platform.select({
    ios: 'YOUR_IOS_KEY',
    android: 'YOUR_ANDROID_KEY'
  })
});

// Login sonrası
await Purchases.logIn(userId);

// Ürünleri getir
const offerings = await Purchases.getOfferings();

// Satın alma
const { customerInfo } = await Purchases.purchasePackage(package);

// Entitlement kontrolü
const isProActive = customerInfo.entitlements.active['pro'] !== undefined;
```

3. **Webhook (Supabase Edge Function):**
```typescript
// supabase/functions/revenuecat-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const event = await req.json()
  
  // Signature doğrulama
  const signature = req.headers.get('Authorization')
  if (!verifySignature(signature, event)) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const { event: eventType, app_user_id, product_id, expiration_at_ms } = event
  
  if (eventType === 'INITIAL_PURCHASE' || eventType === 'RENEWAL') {
    await supabase.from('subscriptions').upsert({
      user_id: app_user_id,
      subscription_tier: product_id.includes('pro') ? 'pro' : 'basic',
      is_active: true,
      expires_at: new Date(expiration_at_ms),
      is_trial: event.is_trial_period
    })
  }
  
  if (eventType === 'CANCELLATION' || eventType === 'EXPIRATION') {
    await supabase.from('subscriptions').update({
      is_active: false
    }).eq('user_id', app_user_id)
  }
  
  return new Response('OK')
})
```

### 6. Firebase Cloud Messaging (Push Notifications)

**Ne için kullanılıyor?**
- Yemek hatırlatmaları
- Antrenman hatırlatmaları
- Haftalık check-in
- Proaktif AI koç mesajları (Pro)

**Setup:**

1. **Firebase Console:**
   - Proje oluştur
   - iOS APNS sertifikası yükle
   - Android FCM key al

2. **Expo Push Notifications:**
```javascript
import * as Notifications from 'expo-notifications';

// Permission iste
const { status } = await Notifications.requestPermissionsAsync();

// Token al
const token = (await Notifications.getExpoPushTokenAsync()).data;

// Supabase'e kaydet
await supabase
  .from('notification_preferences')
  .upsert({ user_id, expo_push_token: token });
```

3. **Notification Scheduler (Supabase Edge Function - Cron):**
```typescript
// supabase/functions/notification-scheduler/index.ts
// Deno cron ile her saat çalışır

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const now = new Date()
  const currentHour = now.getUTCHours()
  const currentMinute = now.getUTCMinutes()
  
  // Kullanıcıların bildirim tercihlerini getir
  const { data: users } = await supabase
    .from('notification_preferences')
    .select('user_id, breakfast_time, lunch_time, expo_push_token')
    .not('expo_push_token', 'is', null)
  
  for (const user of users) {
    // Timezone conversion ile karşılaştır
    // Eğer kullanıcının breakfast_time'ı şimdiyse
    if (shouldSendBreakfastReminder(user, currentHour, currentMinute)) {
      await sendPushNotification(user.expo_push_token, {
        title: '🍳 Kahvaltı Zamanı!',
        body: 'Günün ilk öğününü kaydetmeyi unutma'
      })
    }
  }
  
  return new Response('OK')
})

async function sendPushNotification(token, message) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: token,
      sound: 'default',
      ...message
    })
  })
}
```

---

## ÖZELLİK DETAYLARI

### 1. Onboarding Akışı

**Ekranlar:**

1. **Hoş Geldin**
   - App preview
   - "Başla" butonu

2. **Hedef Seçimi**
   - Kilo vermek
   - Kilo korumak
   - Kas yapmak
   - Fit kalmak

3. **Demografik Bilgiler**
   - Doğum tarihi
   - Cinsiyet
   - Boy
   - Kilo

4. **Aktivite Seviyesi**
   - Hareketsiz (ofis işi)
   - Az aktif (haftada 1-2 gün)
   - Orta (haftada 3-4 gün)
   - Çok aktif (haftada 5-6 gün)
   - Sporcu (günlük)

5. **Hedef Kalori Hesaplama**
   - BMR hesaplama (Mifflin-St Jeor)
   - TDEE hesaplama (activity factor)
   - Hedef ayarlama (deficit/surplus)
   - Makro dağılımı öneri

6. **Bildirim Tercihleri**
   - Yemek saatleri
   - Antrenman saati
   - Haftalık check-in günü

7. **Paywall (7 günlük deneme)**
   - Basic vs Pro karşılaştırma
   - "7 gün ücretsiz dene" butonu
   - Küçük print: "Deneme bitiminde otomatik ücretlendirilir"

**Hesaplama Formülleri:**

```javascript
// BMR (Basal Metabolic Rate)
function calculateBMR(weight_kg, height_cm, age, gender) {
  if (gender === 'male') {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
  } else {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
  }
}

// TDEE (Total Daily Energy Expenditure)
function calculateTDEE(bmr, activityLevel) {
  const factors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  }
  return bmr * factors[activityLevel]
}

// Target calories based on goal
function calculateTargetCalories(tdee, goalType) {
  if (goalType === 'lose_weight') return Math.round(tdee * 0.8) // -20%
  if (goalType === 'gain_muscle') return Math.round(tdee * 1.1) // +10%
  return Math.round(tdee) // maintain
}

// Macro split (örnek: 40/30/30)
function calculateMacros(targetCalories) {
  const proteinCals = targetCalories * 0.3
  const carbsCals = targetCalories * 0.4
  const fatCals = targetCalories * 0.3
  
  return {
    protein_g: Math.round(proteinCals / 4), // 4 cal/g
    carbs_g: Math.round(carbsCals / 4),
    fat_g: Math.round(fatCals / 9) // 9 cal/g
  }
}
```

### 2. Ana Ekran (Dashboard)

**Bileşenler:**

```
┌─────────────────────────────────────┐
│  👤 Profil       📊 İstatistik    ⚙️  │
├─────────────────────────────────────┤
│                                     │
│  Bugün - 31 Ocak 2026              │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Kalori: 1,450 / 1,800        │ │
│  │  ████████░░░░ 80%             │ │
│  │                               │ │
│  │  Protein: 85g / 135g          │ │
│  │  Karb: 150g / 180g            │ │
│  │  Yağ: 45g / 60g               │ │
│  └───────────────────────────────┘ │
│                                     │
│  🍳 Kahvaltı (08:30)      +         │
│  ─────────────────────────────────  │
│  2 yumurta                 180 kcal│
│  Tam buğday ekmeği         120 kcal│
│                                     │
│  🥗 Öğle (12:45)          +         │
│  ─────────────────────────────────  │
│  Tavuk salatası            350 kcal│
│                                     │
│  🍽️ Akşam                  +         │
│                                     │
│  🍎 Atıştırmalık            +         │
│                                     │
├─────────────────────────────────────┤
│  💪 Bugünün Antrenmanı              │
│  ─────────────────────────────────  │
│  Üst Vücut - Kuvvet                │
│  45 dakika                          │
│  [BAŞLA]                            │
├─────────────────────────────────────┤
│  📸 Fotoğrafla Ekle                 │
│  🔍 Arama                           │
│  📷 Barkod Tara                     │
└─────────────────────────────────────┘
```

**Özellikler:**
- Real-time progress bar
- Swipe to delete meal items
- Quick add buttons
- Günlük streak gösterge

### 3. Yemek Ekleme Akışı

#### A. Manuel Arama
```
1. "🔍 Arama" butonuna tıkla
   ↓
2. Besin adı yaz (örn: "tavuk göğsü")
   ↓
3. USDA sonuçları listele
   ↓
4. Seç → Porsiyon gir (gram/adet)
   ↓
5. Kaydet
```

#### B. Barkod Tarama
```
1. "📷 Barkod Tara" butonuna tıkla
   ↓
2. Kamera açılır (ML Kit)
   ↓
3. Barkod tanımlandı → OpenFoodFacts sorgusu
   ↓
4. Ürün bulundu → Porsiyon seç
   ↓
5. Kaydet
```

#### C. Fotoğraf Analizi (ÖNEMLİ)
```
1. "📸 Fotoğrafla Ekle" butonuna tıkla
   ↓
2. Fotoğraf çek veya galeriden seç
   ↓
3. [Opsiyonel] Hint yaz ("tavuk salata")
   ↓
4. "Analiz Et" → Loading (3-5 saniye)
   ↓
5. AI Sonuçları göster:
   ┌────────────────────────────────┐
   │ ⚠️  TAHMİN - Kontrol edin      │
   ├────────────────────────────────┤
   │ ✓ Izgara Tavuk (180g)          │
   │   Kalori: 297, P: 55g, C: 0g   │
   │   [0.5x] [1x] [1.5x] [2x]      │
   │                                │
   │ ✓ Marul (50g)                  │
   │   Kalori: 8, P: 0.5g, C: 1.5g  │
   │   [Sil] [Düzenle]              │
   │                                │
   │ [+ Manuel Ekle]                │
   ├────────────────────────────────┤
   │ Toplam: 520 kcal               │
   │ [KAYDET]                       │
   └────────────────────────────────┘
```

**Kullanıcı deneyimi kuralları:**
- ⚠️ "TAHMİN" labeli zorunlu
- Her item düzenlenebilir/silinebilir
- Porsiyon çarpanları: 0.5x, 1x, 1.5x, 2x
- Manuel item ekleyebilir
- Fotoğraf kaydedilir (ileride görmek için)

### 4. Antrenman Planı

**Plan Oluşturma (AI):**

```javascript
// Supabase Edge Function
async function generateWorkoutPlan(userId) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('goal_type, activity_level')
    .eq('user_id', userId)
    .single()
  
  const prompt = `Create a weekly workout plan for:
  - Goal: ${profile.goal_type}
  - Activity level: ${profile.activity_level}
  
  Return JSON:
  {
    "plan_name": "string",
    "weekly_schedule": [
      {
        "day": 1, // Monday
        "workout_type": "strength|cardio|flexibility|rest",
        "duration_minutes": number,
        "exercises": [
          {
            "name": "string",
            "sets": number,
            "reps": number,
            "notes": "string"
          }
        ]
      }
    ]
  }`
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  })
  
  const plan = JSON.parse(response.choices[0].message.content)
  
  await supabase.from('workout_plans').insert({
    user_id: userId,
    ...plan,
    is_active: true,
    active_from: new Date()
  })
}
```

**Plan Gösterimi:**
```
┌────────────────────────────────────┐
│  Bu Haftanın Planı                 │
├────────────────────────────────────┤
│  Pzt - Üst Vücut Kuvvet  ✓         │
│  Sal - Kardiyo           ✓         │
│  Çar - Dinlenme          -         │
│  Per - Alt Vücut                   │  ← Bugün
│  Cum - Kardiyo                     │
│  Cmt - Full Body                   │
│  Paz - Dinlenme                    │
├────────────────────────────────────┤
│  [📝 Planı Revize Et] (Pro)        │
└────────────────────────────────────┘
```

### 5. AI Koç Sohbet (Pro)

**Özellikler:**
- ChatGPT tarzı sohbet
- Kullanıcı geçmişini bilen (meals, workouts, weight trend)
- Proaktif mesajlar (haftada 1-2)

**Proaktif Mesaj Örnekleri:**
- "Son 3 gündür protein hedefinin altındasın. Öğün planını gözden geçirmek ister misin?"
- "Harika! Bu hafta 4/5 antrenmanı tamamladın 🎉"
- "Kilonda durgunluk var. Kalori hedefini ayarlamayı düşünelim mi?"

**Context Injection:**
```javascript
async function getChatContext(userId) {
  // Son 7 günün özeti
  const { data: meals } = await supabase
    .from('meals')
    .select('meal_time, total_calories, total_protein_g')
    .eq('user_id', userId)
    .gte('meal_time', sevenDaysAgo)
  
  const { data: workouts } = await supabase
    .from('workouts')
    .select('scheduled_date, completed_at, workout_type')
    .eq('user_id', userId)
    .gte('scheduled_date', sevenDaysAgo)
  
  const { data: weights } = await supabase
    .from('weights')
    .select('weight_kg, recorded_at')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(5)
  
  return {
    meals_summary: {
      avg_calories: average(meals.map(m => m.total_calories)),
      avg_protein: average(meals.map(m => m.total_protein_g)),
      days_logged: meals.length
    },
    workouts_summary: {
      completed: workouts.filter(w => w.completed_at).length,
      total_planned: workouts.length
    },
    weight_trend: weights
  }
}

// Chat'te kullanım
const systemPrompt = `You are a fitness and nutrition coach. 

User's recent data:
${JSON.stringify(context, null, 2)}

Goal: ${userProfile.goal_type}
Target calories: ${userProfile.target_calories}

Be supportive, specific, and data-driven. Suggest actionable improvements.`
```

### 6. İlerleme & Analizler

**Basic Plan:**
- Günlük kalori/makro grafikleri (7 gün)
- Haftalık kilo takibi
- Antrenman tamamlanma oranı

**Pro Plan:**
- 7/30/90 günlük trendler
- Adherence score (hedeflere uyum %)
- Projeksiyon grafikleri (hedef tarihe ulaşma)
- Karşılaştırma (bu ay vs geçen ay)

**Örnek Adherence Hesaplama:**
```javascript
function calculateAdherence(userId, days = 7) {
  // Son 7 günde kaç gün hedef kalori ±10% içinde?
  const meals = getMeals(userId, days)
  const target = getUserProfile(userId).target_calories
  
  const withinRange = meals.filter(day => {
    const dayTotal = sum(day.meals.map(m => m.total_calories))
    return dayTotal >= target * 0.9 && dayTotal <= target * 1.1
  })
  
  return (withinRange.length / days) * 100 // %
}
```

---

## PROJE YAPISI

### Klasör Organizasyonu

```
fitness-app/
├── apps/
│   └── mobile/                    # Expo React Native
│       ├── src/
│       │   ├── screens/
│       │   │   ├── Onboarding/
│       │   │   │   ├── WelcomeScreen.tsx
│       │   │   │   ├── GoalScreen.tsx
│       │   │   │   ├── ProfileScreen.tsx
│       │   │   │   ├── ActivityScreen.tsx
│       │   │   │   └── PaywallScreen.tsx
│       │   │   ├── Dashboard/
│       │   │   │   ├── DashboardScreen.tsx
│       │   │   │   └── components/
│       │   │   ├── Meals/
│       │   │   │   ├── AddMealScreen.tsx
│       │   │   │   ├── MealSearchScreen.tsx
│       │   │   │   ├── BarcodeScannerScreen.tsx
│       │   │   │   ├── PhotoAnalysisScreen.tsx
│       │   │   │   └── components/
│       │   │   ├── Workouts/
│       │   │   │   ├── WorkoutPlanScreen.tsx
│       │   │   │   ├── WorkoutSessionScreen.tsx
│       │   │   │   └── components/
│       │   │   ├── Coach/
│       │   │   │   └── CoachChatScreen.tsx (Pro)
│       │   │   └── Analytics/
│       │   │       └── AnalyticsScreen.tsx
│       │   ├── navigation/
│       │   │   └── AppNavigator.tsx
│       │   ├── services/
│       │   │   ├── supabase.ts
│       │   │   ├── revenuecat.ts
│       │   │   └── notifications.ts
│       │   ├── hooks/
│       │   │   ├── useMeals.ts
│       │   │   ├── useWorkouts.ts
│       │   │   └── useSubscription.ts
│       │   ├── utils/
│       │   │   ├── calculations.ts
│       │   │   └── formatters.ts
│       │   └── types/
│       │       └── index.ts
│       ├── assets/
│       ├── app.json
│       ├── package.json
│       └── tsconfig.json
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── functions/
│   │   ├── nutrition-search/
│   │   │   └── index.ts
│   │   ├── barcode-lookup/
│   │   │   └── index.ts
│   │   ├── analyze-meal-photo/
│   │   │   └── index.ts
│   │   ├── generate-workout-plan/
│   │   │   └── index.ts
│   │   ├── coach-chat/
│   │   │   └── index.ts
│   │   ├── notification-scheduler/
│   │   │   └── index.ts
│   │   └── revenuecat-webhook/
│   │       └── index.ts
│   └── config.toml
│
├── shared/
│   ├── types/
│   │   └── database.types.ts (Supabase generated)
│   └── validation/
│       └── schemas.ts (Zod schemas)
│
├── .env.example
├── package.json
└── README.md
```

### Key Dependencies

**Mobile (package.json):**
```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "react": "18.2.0",
    "react-native": "0.73.0",
    
    "@supabase/supabase-js": "^2.39.0",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    
    "expo-camera": "~14.0.0",
    "expo-barcode-scanner": "~12.7.0",
    "expo-image-picker": "~14.7.0",
    "expo-notifications": "~0.27.0",
    
    "react-native-purchases": "^7.0.0",
    "react-native-chart-kit": "^6.12.0",
    
    "react-native-reanimated": "~3.6.0",
    "react-native-gesture-handler": "~2.14.0",
    
    "date-fns": "^3.0.0",
    "zustand": "^4.4.0"
  }
}
```

**Supabase Functions (import map):**
```json
{
  "imports": {
    "supabase": "https://esm.sh/@supabase/supabase-js@2",
    "openai": "https://esm.sh/openai@4"
  }
}
```

---

## GELİŞTİRME AŞAMALARI

### Faz 1: Temel Altyapı (1. Hafta)

**1.1 Supabase Setup**
- [ ] Supabase projesi oluştur
- [ ] Database schema migrate et (`001_initial_schema.sql`)
- [ ] RLS policies uygula
- [ ] Storage bucket oluştur (`meal-photos`)
- [ ] API keys al ve kaydet

**1.2 Expo Proje Oluştur**
- [ ] `npx create-expo-app fitness-app`
- [ ] TypeScript konfigürasyonu
- [ ] Navigation setup (React Navigation)
- [ ] Supabase client setup

**1.3 Kimlik Doğrulama**
- [ ] Supabase Auth entegrasyonu
- [ ] Login/Register ekranları
- [ ] Email verification flow
- [ ] Password reset

**Başarı Kriteri:** Kullanıcı kayıt olup login olabiliyor

### Faz 2: Onboarding & Profil (1. Hafta)

**2.1 Onboarding Ekranları**
- [ ] Welcome screen
- [ ] Goal selection
- [ ] Demographic info form
- [ ] Activity level selection
- [ ] Calculation & summary
- [ ] Notification preferences

**2.2 BMR/TDEE Hesaplamaları**
- [ ] `calculateBMR()` fonksiyonu
- [ ] `calculateTDEE()` fonksiyonu
- [ ] `calculateMacros()` fonksiyonu
- [ ] User profile DB'ye kaydet

**2.3 Paywall (RevenueCat)**
- [ ] RevenueCat account setup
- [ ] Products tanımla (Basic/Pro)
- [ ] SDK entegrasyonu
- [ ] Paywall UI
- [ ] Test mode ile deneme

**Başarı Kriteri:** Kullanıcı onboarding'i tamamlayıp hedef kalori/makro görüyor

### Faz 3: Beslenme Takibi - Core (2. Hafta)

**3.1 Dashboard**
- [ ] Ana ekran layout
- [ ] Progress bar (kalori/makro)
- [ ] Meal sections (breakfast/lunch/dinner/snack)
- [ ] Günlük özet

**3.2 Manuel Besin Arama (USDA)**
- [ ] Edge Function: `nutrition-search`
- [ ] Search UI
- [ ] Results list
- [ ] Portion input
- [ ] Save to meal

**3.3 Meal Items CRUD**
- [ ] Create meal item
- [ ] Edit portion
- [ ] Delete item
- [ ] Real-time totals güncelleme

**3.4 Foods Cache**
- [ ] Cache logic (Edge Function)
- [ ] Duplicate prevention

**Başarı Kriteri:** Kullanıcı besin arayıp ekleyebiliyor, toplam kalori güncellenşyor

### Faz 4: Barkod & Fotoğraf (2. Hafta)

**4.1 Barkod Tarama**
- [ ] Expo Barcode Scanner setup
- [ ] Camera permissions
- [ ] Scanner UI
- [ ] Edge Function: `barcode-lookup`
- [ ] OpenFoodFacts entegrasyonu
- [ ] Cache'leme

**4.2 Fotoğraf Analizi**
- [ ] Expo Image Picker
- [ ] Upload to Supabase Storage
- [ ] Edge Function: `analyze-meal-photo`
- [ ] OpenAI Vision entegrasyonu
- [ ] Results UI (editable items)
- [ ] Porsiyon çarpanları (0.5x, 1x, 1.5x, 2x)
- [ ] "TAHMİN" label

**4.3 Limit Kontrolü**
- [ ] Basic: 3 fotoğraf/gün
- [ ] Pro: 10 fotoğraf/gün
- [ ] Error handling

**Başarı Kriteri:** Kullanıcı barkod tarayıp eklcyebiliyor, fotoğraftan tahmin alıyor

### Faz 5: Antrenman Sistemi (1.5 Hafta)

**5.1 Plan Oluşturma (AI)**
- [ ] Edge Function: `generate-workout-plan`
- [ ] OpenAI GPT-4 entegrasyonu
- [ ] Weekly schedule JSON
- [ ] DB'ye kaydet

**5.2 Plan Gösterimi**
- [ ] Haftalık calendar view
- [ ] Günlük detaylar
- [ ] Exercises list

**5.3 Workout Tracking**
- [ ] Start workout session
- [ ] Exercise completion (sets/reps/weight)
- [ ] Save session
- [ ] Mark as completed

**5.4 Plan Revizyonu (Pro)**
- [ ] Revise request UI
- [ ] Edge Function: `revise-workout-plan`
- [ ] AI replanning logic

**Başarı Kriteri:** Kullanıcı AI plan alıyor, antrenman yapıp kaydediyor

### Faz 6: AI Koç (Pro) (1.5 Hafta)

**6.1 Chat Arayüzü**
- [ ] Chat screen UI
- [ ] Message list
- [ ] Input box
- [ ] Send button

**6.2 Chat Backend**
- [ ] Edge Function: `coach-chat`
- [ ] Context injection (meals, workouts, weight)
- [ ] OpenAI Chat Completions
- [ ] Message history

**6.3 Proaktif Mesajlar**
- [ ] Trigger logic (adherence düştüğünde, streak kırıldığında)
- [ ] Edge Function scheduler
- [ ] Push notification + chat message

**Başarı Kriteri:** Pro kullanıcı koçla sohbet edebiliyor, proaktif mesaj alıyor

### Faz 7: Bildirimler (1 Hafta)

**7.1 Push Setup**
- [ ] Firebase project
- [ ] Expo Notifications setup
- [ ] Permission request
- [ ] Token kaydetme

**7.2 Scheduler (Edge Function)**
- [ ] `notification-scheduler` (cron)
- [ ] Timezone conversion
- [ ] Meal reminders
- [ ] Workout reminders
- [ ] Weekly check-in

**7.3 Test**
- [ ] Test notifications
- [ ] Timing doğrulama

**Başarı Kriteri:** Kullanıcı öğün/antrenman zamanlarında bildirim alıyor

### Faz 8: Analytics & Raporlama (1 Hafta)

**8.1 Basic Analytics**
- [ ] 7 günlük kalori grafiği
- [ ] Haftalık kilo grafiği
- [ ] Antrenman completion rate

**8.2 Pro Analytics**
- [ ] 30/90 günlük trendler
- [ ] Adherence score
- [ ] Projection charts
- [ ] Month-over-month comparison

**8.3 Tracking Events**
- [ ] Firebase Analytics setup
- [ ] PostHog setup (opsiyonel)
- [ ] Key events:
  - `onboarding_completed`
  - `trial_started`
  - `subscribed`
  - `meal_logged` (method: manual/barcode/photo)
  - `workout_completed`

**Başarı Kriteri:** Kullanıcı progress'ini görüyor, Pro'da gelişmiş analizler var

### Faz 9: RevenueCat Webhook & Entitlements (3 Gün)

**9.1 Webhook**
- [ ] Edge Function: `revenuecat-webhook`
- [ ] Signature verification
- [ ] Event handling (purchase, renewal, cancellation)
- [ ] Subscriptions table update

**9.2 Entitlement Checks**
- [ ] `useSubscription()` hook
- [ ] Feature gating logic
- [ ] Paywall prompts (upgrade)

**9.3 Test**
- [ ] Sandbox purchases
- [ ] Webhook test events

**Başarı Kriteri:** Satın alma sonrası özellikler unlock oluyor

### Faz 10: Polish & Testing (1 Hafta)

**10.1 UI/UX İyileştirmeleri**
- [ ] Loading states
- [ ] Error messages
- [ ] Empty states
- [ ] Animations (Reanimated)

**10.2 Performans**
- [ ] Query optimization
- [ ] Image caching
- [ ] Lazy loading

**10.3 Test**
- [ ] Manuel test (iOS/Android)
- [ ] Edge cases
- [ ] Offline handling

**10.4 Beta Test**
- [ ] TestFlight (iOS)
- [ ] Google Play Internal Test (Android)
- [ ] Kullanıcı feedback

**Başarı Kriteri:** App stabil, hatasız, kullanıma hazır

---

## TEST STRATEJİSİ

### Unit Tests (Opsiyonel, zaman varsa)

**Test edilecek fonksiyonlar:**
- Calculation utils (`calculateBMR`, `calculateTDEE`, `calculateMacros`)
- Data formatters
- Validation schemas

**Araç:** Jest

```javascript
// Example: calculations.test.ts
describe('calculateBMR', () => {
  it('should calculate male BMR correctly', () => {
    const bmr = calculateBMR(80, 180, 30, 'male')
    expect(bmr).toBeCloseTo(1850, 0)
  })
})
```

### Integration Tests

**Test senaryoları:**
1. **Meal logging flow:**
   - Search food → Select → Set portion → Save
   - Verify meal_items created
   - Verify meal totals updated

2. **Photo analysis flow:**
   - Upload photo → Analyze → Edit → Save
   - Verify Storage upload
   - Verify OpenAI call
   - Verify items created

3. **Subscription flow:**
   - Purchase → Webhook → Entitlement update
   - Verify subscription active
   - Verify Pro features unlocked

### Manual Testing Checklist

**Onboarding:**
- [ ] Tüm ekranlar doğru sırayla gösteriliyor
- [ ] Hesaplamalar doğru
- [ ] Paywall skip edilemiyor

**Beslenme:**
- [ ] Manual search çalışıyor
- [ ] Barkod tarama doğru sonuç veriyor
- [ ] Fotoğraf analizi mantıklı tahminler yapıyor
- [ ] Toplam kalori/makrolar doğru

**Antrenman:**
- [ ] AI plan oluşturuluyor
- [ ] Plan takip edilebiliyor
- [ ] Completion kaydediliyor

**AI Koç (Pro):**
- [ ] Chat yanıt veriyor
- [ ] Context doğru (recent data)
- [ ] Proaktif mesajlar geliyor

**Bildirimler:**
- [ ] Doğru saatlerde geliyor
- [ ] Timezone doğru

**Subscriptions:**
- [ ] Free trial başlıyor
- [ ] Purchase çalışıyor
- [ ] Entitlements unlock oluyor
- [ ] Cancellation çalışıyor

**Analytics:**
- [ ] Basic grafikler doğru
- [ ] Pro grafikler Pro kullanıcıya açık

---

## DEPLOY PLANI

### Supabase Production

**1. Production Projesi:**
- Supabase dashboard'da "New Project"
- Region seç (yakın lokasyon)
- Plan seç (Free başlangıç, sonra Pro)

**2. Migration:**
```bash
supabase db push --linked
```

**3. Environment Variables:**
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
OPENAI_API_KEY=xxx
USDA_API_KEY=xxx
REVENUECAT_WEBHOOK_SECRET=xxx
```

**4. Edge Functions Deploy:**
```bash
supabase functions deploy nutrition-search
supabase functions deploy barcode-lookup
supabase functions deploy analyze-meal-photo
supabase functions deploy generate-workout-plan
supabase functions deploy coach-chat
supabase functions deploy notification-scheduler
supabase functions deploy revenuecat-webhook
```

**5. Cron Jobs:**
```toml
# supabase/config.toml
[functions.notification-scheduler]
verify_jwt = false

[functions.notification-scheduler.cron]
schedule = "0 * * * *"  # Her saat başı
```

### Mobile App Deploy

**iOS:**

1. **Apple Developer Account** ($99/year)

2. **App Store Connect:**
   - App oluştur
   - Bundle ID: `com.yourcompany.fitnessapp`
   - Screenshots hazırla

3. **EAS Build:**
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

4. **TestFlight:**
   - Beta test
   - Feedback toplama

5. **Review Submission:**
   - App Store guidelines kontrol
   - Submit for review

**Android:**

1. **Google Play Console** ($25 one-time)

2. **App oluştur**

3. **EAS Build:**
```bash
eas build --platform android --profile production
eas submit --platform android
```

4. **Internal Testing:**
   - Test kullanıcıları davet et

5. **Production:**
   - Production'a yükselt
   - Release

### RevenueCat Production

1. **iOS:**
   - App Store Connect'ten in-app purchase oluştur
   - RevenueCat'e ekle

2. **Android:**
   - Google Play Console'dan product oluştur
   - RevenueCat'e ekle

3. **Webhook URL:**
```
https://xxx.supabase.co/functions/v1/revenuecat-webhook
```

4. **Test:**
   - Sandbox purchases
   - Verify webhook çalışıyor

### Firebase (Push Notifications)

1. **Firebase Console:**
   - iOS APNS certificate upload
   - Android FCM key

2. **Expo Config:**
```json
{
  "expo": {
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

---

## EKSTRA TAVSİYELER

### Güvenlik

1. **API Keys:**
   - Asla client-side'da hardcode etme
   - Supabase Edge Functions'da environment variables kullan

2. **Row Level Security:**
   - Her tablo için RLS enable et
   - Kullanıcılar sadece kendi verilerine erişebilsin

3. **File Upload:**
   - Storage policy: sadece authenticated users
   - File size limit (5MB)
   - Allowed types: image/*

### Performans

1. **Query Optimization:**
   - Index'ler doğru ayarlı (user_id, date sütunları)
   - Select sadece gerekli kolonları

2. **Caching:**
   - Foods cache tablosu kullan
   - React Query ile client-side cache

3. **Image Optimization:**
   - Upload etmeden önce resize (max 1024x1024)
   - WebP format kullan

### Kullanıcı Deneyimi

1. **Loading States:**
   - Her async action'da spinner
   - Skeleton screens

2. **Error Handling:**
   - User-friendly mesajlar
   - Retry options
   - Fallback UI

3. **Offline Support (Future):**
   - Local SQLite cache
   - Sync when online

### Monitoring

1. **Error Tracking:**
   - Sentry entegrasyonu (opsiyonel)
   - Edge Function errors log

2. **Analytics:**
   - Daily active users
   - Retention rate
   - Feature usage
   - Conversion rate (free → paid)

3. **Performance:**
   - API response times
   - App load time
   - Crash rate

---

## ÖNCELİK VE ODAK

### MVP (Minimum Viable Product)

**Zorunlu Özellikler (Launch için gerekli):**
1. ✅ Onboarding + Hedef belirleme
2. ✅ Manuel besin arama & ekleme
3. ✅ Barkod tarama
4. ✅ Günlük kalori/makro takibi
5. ✅ Temel antrenman planı
6. ✅ Subscription (Basic/Pro)
7. ✅ Fotoğraf analizi (Pro teaser)

**İkinci Dalga (Post-launch):**
- AI Koç chat (Pro)
- Proaktif mesajlar
- Gelişmiş analytics
- Haftalık plan revizyonu

**Üçüncü Dalga (Future):**
- Sosyal özellikler (arkadaş ekleme)
- Recipe database
- Meal prep planning
- Wearable entegrasyonu (Apple Health, Google Fit)

### Bütçe Tahmini

**Geliştirme Araçları:**
- Supabase: $0-25/month (başlangıç)
- RevenueCat: Free (ilk $2.5k revenue'ye kadar)
- OpenAI API: ~$50-200/month (kullanım bazlı)
- USDA API: Free
- Firebase: Free (Spark plan)
- Expo EAS: Free (limited builds) veya $29/month

**Developer Accounts:**
- Apple Developer: $99/year
- Google Play: $25 one-time

**Toplam (ilk yıl):** ~$500-1000

---

## SONUÇ & BAŞLANGIÇ TALİMATI

### Claude Code'a Vereceğin İlk Prompt

```
Bu dökümanı oku ve AI Fitness & Nutrition Coach uygulamasını oluştur.

ÖNEMLİ TALİMATLAR:
1. Supabase kullan (backend & database)
2. Expo (React Native) kullan (mobile)
3. TypeScript kullan (tip güvenliği)
4. Faz 1'den başla: Temel altyapı
5. Her faz için ayrı branch oluştur
6. Her özellik için test et ve onay iste
7. .env.example dosyası oluştur (API keys için)
8. README.md yaz (setup instructions)

İlk adım: Supabase projesi setup ve database schema migration.
Hazır olunca başlayalım!
```

### Beklenen Çıktı

Claude Code şunları yapacak:
1. Proje klasör yapısını oluştur
2. Supabase migration SQL'leri yaz
3. Expo mobile app başlat
4. TypeScript konfigürasyonu
5. Temel navigation setup
6. Supabase client entegrasyonu
7. İlk ekranları oluştur (Login/Register)

**Sen sadece:**
- Supabase dashboard'dan proje URL ve API key al
- .env dosyasına yapıştır
- `npm install` ve `npm start`

---

## DESTEK & DOKÜMANTASYON

### Faydalı Linkler

**Supabase:**
- Docs: https://supabase.com/docs
- Edge Functions: https://supabase.com/docs/guides/functions
- Auth: https://supabase.com/docs/guides/auth
- Storage: https://supabase.com/docs/guides/storage

**Expo:**
- Docs: https://docs.expo.dev
- Camera: https://docs.expo.dev/versions/latest/sdk/camera/
- Barcode Scanner: https://docs.expo.dev/versions/latest/sdk/bar-code-scanner/
- Notifications: https://docs.expo.dev/versions/latest/sdk/notifications/

**RevenueCat:**
- Docs: https://www.revenuecat.com/docs
- React Native SDK: https://www.revenuecat.com/docs/getting-started/installation/reactnative

**OpenAI:**
- Vision API: https://platform.openai.com/docs/guides/vision
- Chat Completions: https://platform.openai.com/docs/guides/text-generation

**APIs:**
- USDA FoodData: https://fdc.nal.usda.gov/api-guide.html
- OpenFoodFacts: https://openfoodfacts.github.io/openfoodfacts-server/api/

---

## BİTİRMEK İÇİN

Bu doküman, Claude Code'un uygulamayı baştan sona yapması için gereken TÜM bilgileri içeriyor:

✅ Ne yapacak (özellikler)
✅ Nasıl yapacak (teknolojiler)
✅ Neden o teknoloji (karar gerekçeleri)
✅ Adım adım plan (fazlar)
✅ Veritabanı tasarımı
✅ API entegrasyonları
✅ Örnek kodlar
✅ Test stratejisi
✅ Deploy planı

**Sonraki adım:** Bu dosyayı Claude Code'a ver ve "Faz 1'i başlat" de!

İyi çalışmalar! 🚀
