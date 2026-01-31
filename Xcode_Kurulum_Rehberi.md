# Xcode'da Projeyi Çalıştırma Rehberi

Bilgisayarındaki sistem Ruby sürümü eski olduğu için özel bir yöntemle CocoaPods kurulumunu tamamladık.
Artık **pod install** yapmak için aşağıdaki özel komutu kullanman gerekiyor.

## 1. Hazırlık: Doğru Klasöre Git
Terminalde şu komutu yapıştır ve Enter'a bas:
```bash
cd "/Users/ocal/Desktop/spor uygulamasi/fitness-app/apps/mobile/ios"
```

## 2. Pod Yükleme (Özel Komut)
Normal `pod install` yerine, senin bilgisayarına özel şu komutu kullanmalısın.
Kopyala ve yapıştır:

```bash
/Users/ocal/.gem/ruby/2.6.0/bin/pod install
```

*   İşlem başlayacak ve biraz sürecektir.
*   En sonda yeşil renkte **"Pod installation complete!"** yazısını görmelisin.

> **İpucu:** Gelecekte tekrar lazım olursa, bu uzun komutu kullanman gerekecek çünkü sistemine "pod" komutu genel olarak eklenemedi.

## 3. Projeyi Xcode'da Açma
1.  Finder'da `fitness-app/apps/mobile/ios` klasörüne git.
2.  **`mobile.xcworkspace`** dosyasına çift tıkla (Beyaz ikon).
    > ⚠️ Mavi ikonlu (.xcodeproj) dosyayı AÇMA.

## 4. Başlatma
1.  Xcode'da sol üstten simülatör seç.
2.  `Cmd + R` ile çalıştır.
