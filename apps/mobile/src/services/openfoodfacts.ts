export const fetchProductByBarcode = async (barcode: string) => {
    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
        const data = await response.json()

        if (data.status === 1) {
            const p = data.product
            return {
                brand: p.brands,
                product_name: p.product_name,
                calories: p.nutriments['energy-kcal_100g'],
                protein: p.nutriments['proteins_100g'],
                carbs: p.nutriments['carbohydrates_100g'],
                fat: p.nutriments['fat_100g'],
                serving_size: p.serving_size
            }
        }
        return null
    } catch (error) {
        console.error("Barcode lookup error", error)
        return null
    }
}
