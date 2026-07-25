export function formatNumberByLang(num?: number | string, lang: string = 'en'): string {
  if (num === undefined || num === null) return '';
  const str = String(num);
  if (lang === 'bn') {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
  }
  if (lang === 'hi') {
    const hiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return str.replace(/[0-9]/g, (d) => hiDigits[Number(d)]);
  }
  return str;
}

export const LABELS: Record<string, Record<string, string>> = {
  en: {
    off: '% OFF',
    moreInfo: 'More Info',
    buyNow: 'Buy Now',
    addToCart: 'Add to Cart',
    outOfStock: 'Out of Stock',
    inStock: 'In Stock',
    price: 'Price',
    originalPrice: 'MRP',
    discount: 'Discount',
    specifications: 'Specifications',
    description: 'Description',
    customerReviews: 'Customer Reviews',
    writeReview: 'Write a Review',
    relatedProducts: 'Related Products',
    home: 'Home',
    products: 'Products',
    variants: 'Variants',
    chooseVariant: 'Choose Variant',
    enterPincode: 'Enter pin code',
    check: 'Check',
    availableOffers: 'Available Offers',
    ratingsAndReviews: 'Ratings & Reviews',
    support24x7: '24x7 Support',
    easyReturn: 'Easy Return',
    original100: '100% Original',
    makeInIndia: 'Make In India',
    addedToCart: 'Added to cart',
    removedFromCart: 'Item removed from cart',
    basedOn: 'Based on',
    reviewsCount: 'reviews',
    pleaseLoginToReview: 'Please log in to write a review.',
    alreadyReviewed: 'You have already reviewed this product.',
    noReviewsYet: 'No reviews yet. Be the first to review this product!',
    loadMoreReviews: 'Load More Reviews',
    certifiedBuyer: 'Certified Buyer',
    report: 'Report',
    proceedToCheckout: 'Proceed to Checkout',
    showMore: 'Show More',
    showLess: 'Show Less'
  },
  bn: {
    off: '% ছাড়',
    moreInfo: 'আরও তথ্য',
    buyNow: 'এখুনি কিনুন',
    addToCart: 'কার্টে যোগ করুন',
    outOfStock: 'স্টক শেষ',
    inStock: 'স্টক আছে',
    price: 'মূল্য',
    originalPrice: 'এমআরপি',
    discount: 'ছাড়',
    specifications: 'বৈশিষ্ট্যসমূহ',
    description: 'বিবরণ',
    customerReviews: 'ক্রেতাদের মতামত',
    writeReview: 'মতামত লিখুন',
    relatedProducts: 'সম্পর্কিত পণ্য',
    home: 'হোম',
    products: 'পণ্যসমূহ',
    variants: 'ভ্যারিয়েন্ট',
    chooseVariant: 'ভ্যারিয়েন্ট বেছে নিন',
    enterPincode: 'পিন কোড লিখুন',
    check: 'চেক করুন',
    availableOffers: 'বিদ্যমান অফার',
    ratingsAndReviews: 'রেটিং ও রিভিও',
    support24x7: '২৪x৭ সাপোর্ট',
    easyReturn: 'সহজ রিটার্ন',
    original100: '১০০% আসল',
    makeInIndia: 'মেক ইন ইন্ডিয়া',
    addedToCart: 'কার্টে যোগ করা হয়েছে',
    removedFromCart: 'কার্ট থেকে আইটেম সরানো হয়েছে',
    basedOn: 'ভিত্তিতে',
    reviewsCount: 'রিভিউ',
    pleaseLoginToReview: 'একটি রিভিউ লিখতে লগ ইন করুন।',
    alreadyReviewed: 'আপনি ইতিমধ্যে এই পণ্যের রিভিউ দিয়েছেন।',
    noReviewsYet: 'এখনও কোনো রিভিউ নেই। প্রথম রিভিউ দিন!',
    loadMoreReviews: 'আরও রিভিউ লোড করুন',
    certifiedBuyer: 'প্রমাণিত ক্রেতা',
    report: 'রিপোর্ট',
    proceedToCheckout: 'চেকআউট করুন',
    showMore: 'আরও দেখুন',
    showLess: 'কম দেখুন'
  },
  hi: {
    off: '% छूट',
    moreInfo: 'अधिक जानकारी',
    buyNow: 'अभी खरीदें',
    addToCart: 'कार्ट में जोड़ें',
    outOfStock: 'आउट ऑफ स्टॉक',
    inStock: 'स्टॉक में है',
    price: 'मूल्य',
    originalPrice: 'एमआरपी',
    discount: 'छूट',
    specifications: 'विशेषताएं',
    description: 'विवरण',
    customerReviews: 'ग्राहक समीक्षाएं',
    writeReview: 'समीक्षा लिखें',
    relatedProducts: 'संबंधित उत्पाद',
    home: 'होम',
    products: 'उत्पाद',
    variants: 'वेरिएंट',
    chooseVariant: 'वेरिएंट चुनें',
    enterPincode: 'पिन कोड दर्ज करें',
    check: 'चेक करें',
    availableOffers: 'उपलब्ध ऑफ़र',
    ratingsAndReviews: 'रेटिंग और समीक्षा',
    support24x7: '24x7 सपोर्ट',
    easyReturn: 'आसान वापसी',
    original100: '100% मूल',
    makeInIndia: 'मेक इन इंडिया',
    addedToCart: 'कार्ट में जोड़ा गया',
    removedFromCart: 'आइटम कार्ट से हटा दिया गया',
    basedOn: 'के आधार पर',
    reviewsCount: 'समीक्षाएं',
    pleaseLoginToReview: 'समीक्षा लिखने के लिए कृपया लॉग इन करें।',
    alreadyReviewed: 'आप पहले ही इस उत्पाद की समीक्षा कर चुके हैं।',
    noReviewsYet: 'अभी तक कोई समीक्षा नहीं। समीक्षा करने वाले पहले व्यक्ति बनें!',
    loadMoreReviews: 'और समीक्षाएं लोड करें',
    certifiedBuyer: 'प्रमाणित खरीदार',
    report: 'रिपोर्ट',
    proceedToCheckout: 'चेकआउट के लिए आगे बढ़ें',
    showMore: 'और दिखाएं',
    showLess: 'कम दिखाएं'
  }
};

export const ATTRIBUTE_TRANSLATIONS: Record<string, Record<string, string>> = {
  bn: {
    'Color': 'রঙ',
    'Size': 'আকার',
    'Pack of': 'প্যাক',
    'Weight': 'ওজন',
    'Pot Size': 'টবের আকার',
    'Plant Height': 'গাছের উচ্চতা',
    'Sunlight Requirement': 'সূর্যালোকের প্রয়োজন',
    'Watering Needs': 'জলের প্রয়োজন',
    'Plant Type': 'গাছের প্রকার',
    'Season': 'ঋতু',
    'Flower Color': 'ফুলের রঙ',
    'Fruit Type': 'ফলের প্রকার',
    'Blooming Time': 'ফুল ফোটার সময়',
    'Fragrance': 'সুগন্ধ',
    'Soil Type': 'মাটির প্রকার',
    'Fertilizer Needs': 'সারের প্রয়োজন',
    'Toxicity': 'বিষাক্ততা',
    'Growth Rate': 'বৃদ্ধির হার',
    'Temperature Range': 'তাপমাত্রার সীমা'
  },
  hi: {
    'Color': 'रंग',
    'Size': 'आकार',
    'Pack of': 'पैक',
    'Weight': 'वजन',
    'Pot Size': 'गमले का आकार',
    'Plant Height': 'पौधे की ऊंचाई',
    'Sunlight Requirement': 'धूप की आवश्यकता',
    'Watering Needs': 'पानी की आवश्यकता',
    'Plant Type': 'पौधे का प्रकार',
    'Season': 'मौसम',
    'Flower Color': 'फूल का रंग',
    'Fruit Type': 'फल का प्रकार',
    'Blooming Time': 'खिलने का समय',
    'Fragrance': 'सुगंध',
    'Soil Type': 'मिट्टी का प्रकार',
    'Fertilizer Needs': 'उर्वरक की आवश्यकता',
    'Toxicity': 'विषाक्तता',
    'Growth Rate': 'विकास दर',
    'Temperature Range': 'तापमान सीमा'
  }
};

export function getLabels(lang: string = 'en') {
  return LABELS[lang] || LABELS.en;
}

export function translateAttribute(key: string, lang: string = 'en') {
  if (lang === 'en' || !ATTRIBUTE_TRANSLATIONS[lang]) return key;
  return ATTRIBUTE_TRANSLATIONS[lang][key] || key;
}
