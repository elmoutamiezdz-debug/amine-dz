// =====================================
// نظام التخزين السحابي عبر GitHub Gist
// مجاني 100% وللأبد!
// =====================================

// ⚠️ هام: ضع معلومات GitHub الخاصة بك هنا
let GITHUB_TOKEN = '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';  // سنحصل عليه في الخطوة التالية
let GIST_ID = 'aaa0dd80cb04cba28abef09ac306a16e';            // سنحصل عليه في الخطوة التالية

const GIST_FILENAME = 'store-data.json';

// ===================
// وظائف التخزين
// ===================

async function showLoading(show = true) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

// قراءة البيانات من GitHub Gist
async function cloudRead() {
    try {
        showLoading(true);

        // تحقق من وجود التوكن والـ ID
        if (GITHUB_TOKEN === 'YOUR_GITHUB_TOKEN_HERE' || GIST_ID === 'YOUR_GIST_ID_HERE') {
            console.log('⚠️ يرجى إعداد GITHUB_TOKEN و GIST_ID أولاً');
            showLoading(false);
            
            // استخدم بيانات افتراضية
            return {
                products: [],
                orders: [],
                deliveryPrices: {}
            };
        }

        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            method: 'GET',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error(`خطأ: ${response.status}`);
        }

        const gist = await response.json();
        
        // تحقق من وجود الملف
        if (!gist.files[GIST_FILENAME]) {
            console.log('الملف غير موجود، سيتم إنشاؤه');
            const defaultData = {
                products: [],
                orders: [],
                deliveryPrices: {}
            };
            await cloudWrite(defaultData);
            showLoading(false);
            return defaultData;
        }

        const content = gist.files[GIST_FILENAME].content;
        const data = JSON.parse(content);
        
        showLoading(false);
        console.log('✅ تم تحميل البيانات بنجاح');
        return data;

    } catch (error) {
        console.error('خطأ في قراءة البيانات:', error);
        showLoading(false);
        
        // استخدام localStorage كنسخة احتياطية
        const backup = {
            products: JSON.parse(localStorage.getItem('products_backup') || '[]'),
            orders: JSON.parse(localStorage.getItem('orders_backup') || '[]'),
            deliveryPrices: JSON.parse(localStorage.getItem('delivery_backup') || '{}')
        };
        
        console.log('📦 تم استخدام النسخة الاحتياطية المحلية');
        return backup;
    }
}

// كتابة البيانات إلى GitHub Gist
async function cloudWrite(data) {
    try {
        showLoading(true);

        // حفظ نسخة احتياطية محلية دائماً
        localStorage.setItem('products_backup', JSON.stringify(data.products || []));
        localStorage.setItem('orders_backup', JSON.stringify(data.orders || []));
        localStorage.setItem('delivery_backup', JSON.stringify(data.deliveryPrices || {}));
        console.log('💾 تم حفظ نسخة احتياطية محلية');

        // تحقق من وجود التوكن والـ ID
        if (GITHUB_TOKEN === 'YOUR_GITHUB_TOKEN_HERE' || GIST_ID === 'YOUR_GIST_ID_HERE') {
            console.log('⚠️ لم يتم إعداد GitHub. البيانات محفوظة محلياً فقط');
            showLoading(false);
            return true;
        }

        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    [GIST_FILENAME]: {
                        content: JSON.stringify(data, null, 2)
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`خطأ: ${response.status}`);
        }

        showLoading(false);
        console.log('✅ تم حفظ البيانات في السحابة بنجاح');
        return true;

    } catch (error) {
        console.error('خطأ في حفظ البيانات:', error);
        showLoading(false);
        console.log('⚠️ البيانات محفوظة محلياً فقط');
        return false;
    }
}

// وظائف مساعدة لحفظ كل نوع بيانات
async function saveProducts(products) {
    const currentData = await cloudRead();
    currentData.products = products;
    return await cloudWrite(currentData);
}

async function saveOrders(orders) {
    const currentData = await cloudRead();
    currentData.orders = orders;
    return await cloudWrite(currentData);
}

async function saveDeliveryPrices(deliveryPrices) {
    const currentData = await cloudRead();
    currentData.deliveryPrices = deliveryPrices;
    return await cloudWrite(currentData);
}

async function loadProducts() {
    const data = await cloudRead();
    return data.products || [];
}

async function loadOrders() {
    const data = await cloudRead();
    return data.orders || [];
}

async function loadDeliveryPrices() {
    const data = await cloudRead();
    return data.deliveryPrices || {};
}

// ===================
// وظيفة الإعداد الأولي
// ===================
function setupGitHub(token, gistId) {
    GITHUB_TOKEN = token;
    GIST_ID = gistId;
    
    // حفظ في localStorage للمرات القادمة
    localStorage.setItem('github_token', token);
    localStorage.setItem('gist_id', gistId);
    
    console.log('✅ تم إعداد GitHub بنجاح!');
    console.log('🔄 أعد تحميل الصفحة لتطبيق التغييرات');
}

// تحميل المعلومات المحفوظة تلقائياً
(function() {
    const savedToken = localStorage.getItem('github_token');
    const savedGistId = localStorage.getItem('gist_id');
    
    if (savedToken && savedGistId) {
        GITHUB_TOKEN = savedToken;
        GIST_ID = savedGistId;
        console.log('✅ تم تحميل معلومات GitHub المحفوظة');
    }
})();

console.log('📡 نظام التخزين السحابي جاهز!');
console.log('💡 لإعداد GitHub، استخدم: setupGitHub("your_token", "your_gist_id")');
console.log('📖 راجع ملف SETUP-GUIDE.txt للتعليمات الكاملة');
